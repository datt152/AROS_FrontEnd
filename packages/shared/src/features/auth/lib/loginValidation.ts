export type LoginFieldErrors = {
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LOGIN_PASSWORD_MIN_LENGTH = 6

export function validateLoginForm(email: string, password: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {}

  if (!email.trim()) {
    errors.email = 'Vui lòng nhập email'
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Vui lòng nhập email hợp lệ'
  }

  if (!password) {
    errors.password = 'Vui lòng nhập mật khẩu'
  } else if (password.length < LOGIN_PASSWORD_MIN_LENGTH) {
    errors.password = `Mật khẩu phải có ít nhất ${LOGIN_PASSWORD_MIN_LENGTH} ký tự`
  }

  return errors
}
