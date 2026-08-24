import { useMutation } from '@tanstack/react-query'

import { register } from '../api/auth.api'
import type { RegisterPayload } from '../types/auth.types'

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  })
}
