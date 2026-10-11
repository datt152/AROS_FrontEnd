import { useMutation } from '@tanstack/react-query'

import { register } from '@aros/shared/features/auth/api/auth.api'
import type { RegisterPayload } from '@aros/shared/features/auth/types/auth.types'

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  })
}
