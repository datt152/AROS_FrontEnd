export const PASSWORD_MIN_LENGTH = 6

export function validateNewPassword(newPassword: string, confirmPassword: string) {
  const errors: { newPassword?: string; confirmPassword?: string } = {}

  if (!newPassword) {
    errors.newPassword = 'Vui lòng nhập mật khẩu mới'
  } else if (newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Vui lòng nhập lại mật khẩu mới'
  } else if (newPassword && confirmPassword !== newPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
  }

  return errors
}
