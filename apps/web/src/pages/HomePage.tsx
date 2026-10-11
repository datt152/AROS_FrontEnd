import { BookOpen, ClipboardCheck, GraduationCap, LineChart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '../routes/routes.config'

const highlights = [
  {
    icon: ClipboardCheck,
    title: 'Bài thi thông minh',
    body: 'Tạo, tổ chức và chấm bài kiểm tra mà không rời khỏi quy trình lớp học.',
  },
  {
    icon: BookOpen,
    title: 'Luyện tập hiệu quả',
    body: 'Cung cấp bộ luyện tập tập trung để sinh viên ôn tập trước kỳ thi.',
  },
  {
    icon: LineChart,
    title: 'Tiến độ rõ ràng',
    body: 'Xem kết quả, lịch sử và thông tin lớp ở một nơi — công cụ đơn giản, kết quả rõ ràng.',
  },
]

export function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <p className="rounded-full border border-blue-100 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-blue-600 shadow-sm">
        Không gian giáo dục
      </p>

      <h1 className="mt-6 max-w-3xl text-center text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
        Học thông minh hơn.
        <br />
        <span className="bg-linear-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
          Giảng dạy rõ ràng.
        </span>
      </h1>

      <p className="mt-5 max-w-2xl text-center text-sm leading-relaxed text-slate-600 sm:text-base">
        AROS là nền tảng tập trung cho sinh viên và giáo viên — bài thi, chấm OMR, luyện tập và tiến độ cùng một
        chỗ, không rườm rà.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={ROUTES.register}
          className="rounded-xl bg-linear-to-r from-blue-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-emerald-700"
        >
          Bắt đầu ngay
        </Link>
        <Link
          to={ROUTES.login}
          className="rounded-xl border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
        >
          Đăng nhập
        </Link>
      </div>

      <div className="mt-14 grid w-full gap-4 sm:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-sm shadow-blue-900/5 backdrop-blur-xl"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-emerald-600 text-white">
              <item.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 flex w-full items-center gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <p className="text-sm text-slate-600">
          Xây dựng cho lớp học cần cấu trúc — sinh viên làm bài thi, giáo viên tạo và chấm, mọi người thấy tiến độ
          rõ ràng.
        </p>
      </div>
    </div>
  )
}
