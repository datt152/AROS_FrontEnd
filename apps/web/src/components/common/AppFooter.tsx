import { Link } from 'react-router-dom'

import { AROS_SYSTEM_EMAIL } from '../../constants/ui'
import { ROUTES } from '../../routes/routes.config'

export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200/80 bg-white/80 text-slate-600">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Logo AROS" className="h-8 w-8 shrink-0 object-contain" />
          <img src="/aros.png" alt="AROS" className="h-5   w-auto object-contain" />
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            Không gian làm việc tập trung cho sinh viên và giáo viên — bài thi, luyện tập và tiến độ ở một nơi.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Email:{' '}
            <a href={`mailto:${AROS_SYSTEM_EMAIL}`} className="transition hover:text-blue-600">
              {AROS_SYSTEM_EMAIL}
            </a>
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Sản phẩm</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to={ROUTES.home} className="transition hover:text-blue-600">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link to={ROUTES.login} className="transition hover:text-blue-600">
                Đăng nhập
              </Link>
            </li>
            <li>
              <Link to={ROUTES.register} className="transition hover:text-blue-600">
                Đăng ký
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Pháp lý</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to={ROUTES.privacy} className="transition hover:text-blue-600">
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link to={ROUTES.terms} className="transition hover:text-blue-600">
                Điều khoản dịch vụ
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200/80">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-400 sm:px-6">
          © {year} AROS. Xây dựng cho lớp học hiện đại.
        </p>
      </div>
    </footer>
  )
}
