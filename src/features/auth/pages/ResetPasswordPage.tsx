import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { getApiErrorMessage } from '../../../lib/apiError'
import { focusFirstFormError } from '../../../utils/focusFormError'
import { ROUTES } from '../../../routes/routes.config'
import { PasswordInput } from '../components/PasswordInput'
import { useResetPassword } from '../hooks/usePassword'
import { validateNewPassword } from '../lib/passwordValidation'

type FieldErrors = {
  newPassword?: string
  confirmPassword?: string
}

function isInvalidTokenMessage(message: string) {
  return /không hợp lệ hoặc đã hết hạn/i.test(message)
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const resetMutation = useResetPassword()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (resetMutation.isPending) return

    const nextErrors = validateNewPassword(newPassword, confirmPassword)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, ['newPassword', 'confirmPassword'])
      return
    }

    try {
      const message = await resetMutation.mutateAsync({ token, newPassword, confirmPassword })
      navigate(ROUTES.login, {
        replace: true,
        state: { notice: `${message} Vui lòng đăng nhập bằng mật khẩu mới.` },
      })
    } catch {
      // shown via resetMutation.error
    }
  }

  const apiError = resetMutation.error
    ? getApiErrorMessage(resetMutation.error, 'Không đặt lại được mật khẩu. Vui lòng thử lại.')
    : null
  const tokenInvalid = apiError ? isInvalidTokenMessage(apiError) : false

  return (
    <>
      <div className="mb-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <LockKeyhole className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Đặt lại mật khẩu</h2>
        <p className="mt-1.5 text-sm text-slate-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      </div>

      {!token ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã xác thực. Vui lòng mở lại liên kết trong email
            hoặc yêu cầu liên kết mới.
          </p>
          <Link
            to={ROUTES.forgotPassword}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Đến trang Quên mật khẩu
          </Link>
        </div>
      ) : (
        <form className="space-y-3.5" onSubmit={(event) => void handleSubmit(event)} noValidate>
          {apiError ? (
            <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              <p>{apiError}</p>
              {tokenInvalid ? (
                <Link
                  to={ROUTES.forgotPassword}
                  className="inline-flex font-medium text-red-700 underline underline-offset-2 hover:text-red-800"
                >
                  Xin liên kết mới
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
              Mật khẩu mới
            </label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
              value={newPassword}
              hasError={Boolean(errors.newPassword)}
              disabled={resetMutation.isPending}
              placeholder="Tối thiểu 6 ký tự"
              onChange={(event) => {
                setNewPassword(event.target.value)
                if (errors.newPassword) setErrors((current) => ({ ...current, newPassword: undefined }))
              }}
            />
            {errors.newPassword ? <p className="text-sm text-red-500">{errors.newPassword}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
              Xác nhận mật khẩu mới
            </label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              hasError={Boolean(errors.confirmPassword)}
              disabled={resetMutation.isPending}
              placeholder="Nhập lại mật khẩu mới"
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                if (errors.confirmPassword) setErrors((current) => ({ ...current, confirmPassword: undefined }))
              }}
            />
            {errors.confirmPassword ? <p className="text-sm text-red-500">{errors.confirmPassword}</p> : null}
          </div>

          <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
            {resetMutation.isPending ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
          </Button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link
          to={ROUTES.login}
          className="inline-flex items-center gap-1.5 font-medium text-blue-600 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Quay lại đăng nhập
        </Link>
      </p>
    </>
  )
}
