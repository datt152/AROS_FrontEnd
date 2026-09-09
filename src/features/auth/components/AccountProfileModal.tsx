import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Spinner } from '../../../components/ui/Spinner'
import { getApiErrorMessage } from '../../../lib/apiError'
import { focusFirstFormError } from '../../../utils/focusFormError'
import { useAuthSession } from '../hooks/useAuthSession'
import { useMe, useUpdateMe } from '../hooks/useMe'
import { RoleTag } from './RoleTag'

type AccountProfileModalProps = {
  onClose: () => void
}

const STUDENT_CODE_PATTERN = /^\d{8}$/

export function AccountProfileModal({ onClose }: AccountProfileModalProps) {
  const { role } = useAuthSession()
  const isStudent = role === 'student'
  const meQuery = useMe()
  const updateMe = useUpdateMe()

  const profile = meQuery.data
  const [fullName, setFullName] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; studentCode?: string }>({})

  useEffect(() => {
    if (!profile) return
    setFullName(profile.fullName)
    setStudentCode(profile.studentCode ?? '')
    setFieldErrors({})
    updateMe.reset()
  }, [profile?.id, profile?.fullName, profile?.studentCode])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!profile) return

    const nextErrors: { fullName?: string; studentCode?: string } = {}
    const name = fullName.trim()
    const code = studentCode.trim()

    if (!name) nextErrors.fullName = 'Vui lòng nhập họ tên'
    if (isStudent && code && !STUDENT_CODE_PATTERN.test(code)) {
      nextErrors.studentCode = 'Mã sinh viên phải gồm đúng 8 chữ số'
    }

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstFormError(nextErrors, ['fullName', 'studentCode'])
      return
    }

    try {
      if (isStudent && code) {
        await updateMe.mutateAsync({ fullName: name, studentCode: code })
      } else {
        await updateMe.mutateAsync({ fullName: name })
      }
      onClose()
    } catch {
      // shown via mutation.error
    }
  }

  const apiError = updateMe.error ? getApiErrorMessage(updateMe.error, 'Không thể cập nhật thông tin') : null
  const loadError = meQuery.isError
    ? getApiErrorMessage(meQuery.error, 'Không thể tải thông tin tài khoản')
    : null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Đóng" onClick={onClose} />
      <div className="relative z-10 max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Tài khoản</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Thông tin cá nhân</h2>
              {profile ? <RoleTag role={profile.role || role || ''} /> : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={updateMe.isPending}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {meQuery.isLoading ? <Spinner label="Đang tải..." className="py-8" /> : null}

        {loadError ? (
          <div className="space-y-3">
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{loadError}</p>
            <Button variant="secondary" className="w-full" onClick={() => void meQuery.refetch()}>
              Thử lại
            </Button>
          </div>
        ) : null}

        {profile && !meQuery.isLoading ? (
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
            {apiError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{apiError}</p>
            ) : null}

            <div className="space-y-1.5">
              <label htmlFor="accountEmail" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <Input id="accountEmail" value={profile.email} disabled readOnly />
              <p className="text-xs text-slate-500">Email không thể thay đổi.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                Họ tên
              </label>
              <Input
                id="fullName"
                name="fullName"
                value={fullName}
                hasError={Boolean(fieldErrors.fullName)}
                disabled={updateMe.isPending}
                placeholder="Nhập họ tên"
                onChange={(event) => {
                  setFullName(event.target.value)
                  if (fieldErrors.fullName) setFieldErrors((c) => ({ ...c, fullName: undefined }))
                }}
              />
              {fieldErrors.fullName ? <p className="text-sm text-red-500">{fieldErrors.fullName}</p> : null}
            </div>

            {isStudent ? (
              <div className="space-y-1.5">
                <label htmlFor="studentCode" className="text-sm font-medium text-slate-700">
                  Mã sinh viên (8 số)
                </label>
                <Input
                  id="studentCode"
                  name="studentCode"
                  inputMode="numeric"
                  maxLength={8}
                  value={studentCode}
                  hasError={Boolean(fieldErrors.studentCode)}
                  disabled={updateMe.isPending}
                  placeholder="Để trống nếu không đổi"
                  onChange={(event) => {
                    setStudentCode(event.target.value.replace(/\D/g, '').slice(0, 8))
                    if (fieldErrors.studentCode) setFieldErrors((c) => ({ ...c, studentCode: undefined }))
                  }}
                />
                {fieldErrors.studentCode ? (
                  <p className="text-sm text-red-500">{fieldErrors.studentCode}</p>
                ) : (
                  <p className="text-xs text-slate-500"></p>
                )}
              </div>
            ) : null}

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="secondary" className="flex-1" disabled={updateMe.isPending} onClick={onClose}>
                Đóng
              </Button>
              <Button type="submit" className="flex-1" disabled={updateMe.isPending}>
                {updateMe.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  )
}
