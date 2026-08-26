import { EmptyState } from '../../../components/ui/EmptyState'

/** SV list — chưa có API “đề luyện tập của tôi”; take qua deep-link /student/practice/take/:id. */
export function StudentPracticeListPage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Luyện tập</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Bài luyện tập</h1>
        <p className="mt-1 text-sm text-slate-500">
          Khi backend có API đề giao cho sinh viên, danh sách sẽ hiện tại đây.
        </p>
      </div>

      <EmptyState
        title="Chưa có danh sách luyện tập"
        description="Tạm thời vào bài bằng đường dẫn /student/practice/take/{examId} sau khi giáo viên giao và mở bài."
      />
    </section>
  )
}
