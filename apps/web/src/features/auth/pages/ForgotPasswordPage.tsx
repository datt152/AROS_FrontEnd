import { ArrowLeft, KeyRound, MailCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { getApiErrorMessage } from '@aros/shared/api/apiError'
import { ROUTES } from '../../../routes/routes.config'
import { useForgotPassword } from '../hooks/usePassword'

const RESEND_COOLDOWN_SECONDS = 60
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordPage() {
  const forgotMutation = useForgotPassword()

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const remainingSeconds = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0
  const coolingDown = remainingSeconds > 0

  useEffect(() => {
    if (!cooldownUntil) return
    const timer = window.setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= cooldownUntil) {
        setCooldownUntil(null)
        window.clearInterval(timer)
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [cooldownUntil])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (coolingDown || forgotMutation.isPending) return

    const value = email.trim()
    if (!value) {
      setEmailError('Vui lòng nhập email')
      document.getElementById('forgotEmail')?.focus()
      return
    }
    if (!EMAIL_PATTERN.test(value)) {
      setEmailError('Vui lòng nhập email hợp lệ')
      document.getElementById('forgotEmail')?.focus()
      return
    }
    setEmailError(null)

    try {
      const message = await forgotMutation.mutateAsync({ email: value })
      setSuccessMessage(message)
      const start = Date.now()
      setNow(start)
      setCooldownUntil(start + RESEND_COOLDOWN_SECONDS * 1000)
    } catch {
      // shown via forgotMutation.error
    }
  }

  const apiError = forgotMutation.error
    ? getApiErrorMessage(forgotMutation.error, 'Không gửi được yêu cầu. Vui lòng thử lại.')
    : null

  return (
    <>
      <div className="mb-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <KeyRound className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Quên mật khẩu</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Nhập email tài khoản, hệ thống sẽ gửi liên kết đặt lại mật khẩu (hiệu lực 15 phút).
        </p>
      </div>

      <form className="space-y-3.5" onSubmit={(event) => void handleSubmit(event)} noValidate>
        {successMessage ? (
          <div className="flex gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <div className="space-y-1">
              <p>{successMessage}</p>
              <p className="text-xs text-emerald-700/90">
                Kiểm tra cả hộp thư rác. Gửi lại liên kết mới sẽ làm liên kết cũ hết hiệu lực.
              </p>
            </div>
          </div>
        ) : null}

        {apiError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{apiError}</p>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="forgotEmail" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <Input
            id="forgotEmail"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            hasError={Boolean(emailError)}
            disabled={forgotMutation.isPending}
            placeholder="Nhập email của bạn"
            onChange={(event) => {
              setEmail(event.target.value)
              if (emailError) setEmailError(null)
            }}
          />
          {emailError ? <p className="text-sm text-red-500">{emailError}</p> : null}
        </div>

        <Button type="submit" className="w-full" disabled={forgotMutation.isPending || coolingDown}>
          {forgotMutation.isPending
            ? 'Đang gửi...'
            : coolingDown
              ? `Gửi lại sau ${remainingSeconds}s`
              : successMessage
                ? 'Gửi lại liên kết'
                : 'Gửi liên kết đặt lại'}
        </Button>

        <p className="text-center text-sm text-slate-600">
          <Link
            to={ROUTES.login}
            className="inline-flex items-center gap-1.5 font-medium text-blue-600 transition hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </>
  )
}
