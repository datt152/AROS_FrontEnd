import { GraduationCap } from 'lucide-react'

import { RegisterForm } from '../components/RegisterForm'

export function RegisterPage() {
  return (
    <>
      <div className="mb-6 lg:hidden">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Nền tảng AROS</p>
            <p className="text-base font-semibold text-slate-900">Tạo tài khoản</p>
          </div>
        </div>
      </div>

      <div className="mb-5 hidden lg:block">
        <p className="text-sm font-medium text-blue-600">Bắt đầu ngay</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Tạo tài khoản</h2>
        <p className="mt-1.5 text-sm text-slate-500">Đăng ký tài khoản giáo viên để quản lý lớp và đề thi.</p>
      </div>

      <RegisterForm />
    </>
  )
}
