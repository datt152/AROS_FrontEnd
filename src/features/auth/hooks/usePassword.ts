import { useMutation } from '@tanstack/react-query'

import { forgotPassword, resetPassword } from '../api/auth.api'
import { changeMyPassword } from '../api/users.api'
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '../types/auth.types'

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
