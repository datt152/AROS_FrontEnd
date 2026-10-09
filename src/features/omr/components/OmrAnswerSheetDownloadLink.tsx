import { Download } from 'lucide-react'

/** File tĩnh trong public/templates — phiếu trả lời trắng để in cho sinh viên tô. */
export const OMR_ANSWER_SHEET_URL = '/templates/main.pdf'
const OMR_ANSWER_SHEET_FILENAME = 'phieu-tra-loi-omr.pdf'

export function OmrAnswerSheetDownloadLink({ className = '' }: { className?: string }) {
  return (
    <a
      href={OMR_ANSWER_SHEET_URL}
      download={OMR_ANSWER_SHEET_FILENAME}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 ${className}`}
    >
      <Download className="h-4 w-4" strokeWidth={1.75} />
      Tải phiếu trả lời OMR
    </a>
  )
}
