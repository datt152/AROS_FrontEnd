import { useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { getApiErrorMessage } from '@aros/shared/api/apiError'
import { focusFirstFormError } from '../../../utils/focusFormError'
import { useChangePassword } from '../hooks/usePassword'
import { validateNewPassword } from '@aros/shared/features/auth/lib/passwordValidation'
import { PasswordInput } from './PasswordInput'

type FieldErrors = {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

const FIELD_ORDER = ['currentPassword', 'newPassword', 'confirmPassword'] as const

/** Lỗi BE trả về message chung → gắn vào đúng ô. */
function mapApiErrorToField(message: string): keyof FieldErrors | null {
  if (/phải khác/i.test(message)) return 'newPassword'
  if (/mật khẩu hiện tại/i.test(message)) return 'currentPassword'
  if (/xác nhận/i.test(message)) return 'confirmPassword'
  if (/mật khẩu mới|ít nhất/i.test(message)) return 'newPassword'
  return null
}

type ChangePasswordFormProps = {
  onClose: () => void
  onPendingChange?: (pending: boolean) => void
}

export function ChangePasswordForm({ onClose, onPendingChange }: ChangePasswordFormProps) {
  const changePassword = useChangePassword()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const pending = changePassword.isPending

  function clearFieldError(field: keyof FieldErrors) {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
    if (formError) setFormError(null)
    if (successMessage) setSuccessMessage(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const nextErrors: FieldErrors = {
      ...(currentPassword ? {} : { currentPassword: 'Vui lòng nhập mật khẩu hiện tại' }),
      ...validateNewPassword(newPassword, confirmPassword),
    }
    if (!nextErrors.newPassword && currentPassword && newPassword === currentPassword) {
      nextErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại'
    }

    setErrors(nextErrors)
    setFormError(null)
    setSuccessMessage(null)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, FIELD_ORDER)
      return
    }

    onPendingChange?.(true)
    try {
      const message = await changePassword.mutateAsync({ currentPassword, newPassword, confirmPassword })
      setSuccessMessage(message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không đổi được mật khẩu. Vui lòng thử lại.')
      const field = mapApiErrorToField(message)
      if (field) {
        setErrors({ [field]: message })
        focusFirstFormError({ [field]: message }, FIELD_ORDER)
      } else {
        setFormError(message)
      }
    } finally {
      onPendingChange?.(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
      {successMessage ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}
      {formError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="currentPassword" className="text-sm font-medium text-slate-700">
          Mật khẩu hiện tại
        </label>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          autoComplete="current-password"
          value={currentPassword}
          hasError={Boolean(errors.currentPassword)}
          disabled={pending}
          placeholder="Nhập mật khẩu hiện tại"
          onChange={(event) => {
            setCurrentPassword(event.target.value)
            clearFieldError('currentPassword')
          }}
        />
        {errors.currentPassword ? <p className="text-sm text-red-500">{errors.currentPassword}</p> : null}
      </div>

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
          disabled={pending}
          placeholder="Tối thiểu 6 ký tự"
          onChange={(event) => {
            setNewPassword(event.target.value)
            clearFieldError('newPassword')
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
          disabled={pending}
          placeholder="Nhập lại mật khẩu mới"
          onChange={(event) => {
            setConfirmPassword(event.target.value)
            clearFieldError('confirmPassword')
          }}
        />
        {errors.confirmPassword ? <p className="text-sm text-red-500">{errors.confirmPassword}</p> : null}
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="secondary" className="flex-1" disabled={pending} onClick={onClose}>
          Đóng
        </Button>
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? 'Đang lưu...' : 'Đổi mật khẩu'}
        </Button>
      </div>
    </form>
  )
}
