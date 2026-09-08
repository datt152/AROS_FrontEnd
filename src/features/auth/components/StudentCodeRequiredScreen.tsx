import { useState } from 'react'
import { GraduationCap, LogOut } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { getApiErrorMessage } from '../../../lib/apiError'
import { focusFirstFormError } from '../../../utils/focusFormError'
import { useLogout } from '../hooks/useLogout'
import { useUpdateMyStudentCode } from '../hooks/useMe'

const STUDENT_CODE_PATTERN = /^\d{8}$/

export function StudentCodeRequiredScreen() {
  const updateStudentCode = useUpdateMyStudentCode()
  const logout = useLogout()

  const [studentCode, setStudentCode] = useState('')
  const [fieldError, setFieldError] = useState<string | undefined>()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const value = studentCode.trim()
    if (!STUDENT_CODE_PATTERN.test(value)) {
      setFieldError('Mã sinh viên phải gồm đúng 8 chữ số')
      focusFirstFormError({ studentCode: 'invalid' }, ['studentCode'])
      return
    }

    setFieldError(undefined)

    try {
      await updateStudentCode.mutateAsync({ studentCode: value })
    } catch {
      // Error shown via mutation.error
    }
  }

  const apiError = updateStudentCode.error
    ? getApiErrorMessage(updateStudentCode.error, 'Không thể lưu mã sinh viên')
    : null

  return (
    <div className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-linear-to-br from-slate-50 via-blue-50/70 to-emerald-50/50 px-4 py-8">
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-6 shadow-2xl shadow-blue-900/5 backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Hoàn tất hồ sơ</p>
            <h1 className="text-lg font-semibold text-slate-900">Nhập mã sinh viên</h1>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Tài khoản của bạn chưa có mã sinh viên. Vui lòng nhập mã gồm 8 chữ số để tiếp tục sử dụng hệ thống.
        </p>

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          {apiError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{apiError}</p>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="studentCode" className="text-sm font-medium text-slate-700">
              Mã sinh viên (8 số)
            </label>
            <Input
              id="studentCode"
              name="studentCode"
              inputMode="numeric"
              autoComplete="off"
              maxLength={8}
              placeholder="Ví dụ: 22520123"
              value={studentCode}
              hasError={Boolean(fieldError)}
              disabled={updateStudentCode.isPending}
              onChange={(event) => {
                const next = event.target.value.replace(/\D/g, '').slice(0, 8)
                setStudentCode(next)
                if (fieldError) setFieldError(undefined)
                if (updateStudentCode.error) updateStudentCode.reset()
              }}
            />
            {fieldError ? <p className="text-sm text-red-500">{fieldError}</p> : null}
          </div>

          <Button type="submit" className="w-full" disabled={updateStudentCode.isPending}>
            {updateStudentCode.isPending ? 'Đang lưu...' : 'Lưu và tiếp tục'}
          </Button>
        </form>

        <Button
          variant="ghost"
          className="mt-4 w-full"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
          {logout.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </Button>
      </div>
    </div>
  )
}
