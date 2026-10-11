import { useMutation } from '@tanstack/react-query'

import { forgotPassword, resetPassword } from '@aros/shared/features/auth/api/auth.api'
import { changeMyPassword } from '@aros/shared/features/auth/api/users.api'
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '@aros/shared/features/auth/types/auth.types'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changeMyPassword(payload),
  })
}
