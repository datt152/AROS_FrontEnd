import { Download, FileSpreadsheet, Pencil, Trash2, UserPlus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Input } from '../../../components/ui/Input'
import { Spinner } from '../../../components/ui/Spinner'
import type {
  ClassroomItem,
  ClassroomStudent,
  CreateStudentAccountsResult,
  EnrollStudentFormErrors,
  StudentImportResult,
} from '../types/classroom.types'

type CreateAccountsMode = 'selected' | 'all'

type ClassroomStudentsPanelProps = {
  classroom: ClassroomItem
  students: ClassroomStudent[]
  isLoadingStudents?: boolean
  studentsError?: string | null
  onRetryStudents?: () => void
  isEnrolling?: boolean
  enrollError?: string | null
  isRemoving?: boolean
  isUpdatingStudentCode?: boolean
  updateStudentCodeError?: string | null
  isImporting?: boolean
  importError?: string | null
  importResult?: StudentImportResult | null
  isCreatingAccounts?: boolean
  createAccountsError?: string | null
  createAccountsResult?: CreateStudentAccountsResult | null
  onClose: () => void
  onEnroll: (studentEmails: string[]) => void | Promise<void>
  onRemove: (student: ClassroomStudent) => void | Promise<void>
  onUpdateStudentCode: (student: ClassroomStudent, studentCode: string) => void | Promise<void>
  onBeginEditStudentCode?: () => void
  onImportFile: (file: File) => void | Promise<void>
  onClearImportResult?: () => void
  onCreateAccounts: (studentIds?: number[]) => void | Promise<void>
  onClearCreateAccountsResult?: () => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STUDENT_CODE_PATTERN = /^\d{8}$/
const STUDENT_IMPORT_TEMPLATE_URL = '/templates/students-import.xlsx'

export function ClassroomStudentsPanel({
  classroom,
  students,
  isLoadingStudents = false,
  studentsError = null,
  onRetryStudents,
  isEnrolling = false,
  enrollError = null,
  isRemoving = false,
  isUpdatingStudentCode = false,
  updateStudentCodeError = null,
  isImporting = false,
  importError = null,
  importResult = null,
  isCreatingAccounts = false,
  createAccountsError = null,
  createAccountsResult = null,
  onClose,
  onEnroll,
  onRemove,
  onUpdateStudentCode,
  onBeginEditStudentCode,
  onImportFile,
  onClearImportResult,
  onCreateAccounts,
  onClearCreateAccountsResult,
}: ClassroomStudentsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [studentEmailsText, setStudentEmailsText] = useState('')
  const [errors, setErrors] = useState<EnrollStudentFormErrors>({})
  const [removingStudent, setRemovingStudent] = useState<ClassroomStudent | null>(null)
  const [editingStudent, setEditingStudent] = useState<ClassroomStudent | null>(null)
  const [editCode, setEditCode] = useState('')
  const [editCodeError, setEditCodeError] = useState<string | undefined>()
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [localImportError, setLocalImportError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [confirmCreate, setConfirmCreate] = useState<CreateAccountsMode | null>(null)

  const withoutAccount = useMemo(() => students.filter((s) => !s.hasAccount), [students])
  const withoutAccountIds = useMemo(() => new Set(withoutAccount.map((s) => s.id)), [withoutAccount])

  useEffect(() => {
    setSelectedIds((current) => {
      const next = new Set<number>()
      for (const id of current) {
        if (withoutAccountIds.has(id)) next.add(id)
      }
      return next
    })
  }, [withoutAccountIds])

  const selectedCount = selectedIds.size
  const canCreateSelected = selectedCount > 0
  const canCreateAll = withoutAccount.length > 0
  const confirmCount =
    confirmCreate === 'selected' ? selectedCount : confirmCreate === 'all' ? withoutAccount.length : 0

  async function handleEnroll(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: EnrollStudentFormErrors = {}
    const emails = studentEmailsText
      .split(/[\s,;]+/)
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean)

    if (emails.length === 0) {
      nextErrors.studentEmailsText = 'Danh sách email không được để trống'
      setErrors(nextErrors)
      return
    }

    for (const email of emails) {
      if (!EMAIL_PATTERN.test(email)) {
        nextErrors.studentEmailsText = `"${email}" không phải email hợp lệ`
        setErrors(nextErrors)
        return
      }
    }

    setErrors({})

    try {
      await onEnroll(emails)
      setStudentEmailsText('')
    } catch {
      // Error surfaced via enrollError prop from page
    }
  }

  async function confirmRemove() {
    if (!removingStudent) return

    try {
      await onRemove(removingStudent)
      setRemovingStudent(null)
    } catch {
      setRemovingStudent(null)
    }
  }

  function openEditCode(student: ClassroomStudent) {
    onBeginEditStudentCode?.()
    setEditingStudent(student)
    setEditCode(student.studentCode)
    setEditCodeError(undefined)
  }

  async function handleSaveStudentCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingStudent) return

    const value = editCode.trim()
    if (!STUDENT_CODE_PATTERN.test(value)) {
      setEditCodeError('Mã sinh viên phải gồm đúng 8 chữ số')
      return
    }

    setEditCodeError(undefined)

    try {
      await onUpdateStudentCode(editingStudent, value)
      setEditingStudent(null)
    } catch {
      // Error surfaced via updateStudentCodeError
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setSelectedFileName(null)
      setLocalImportError('Chỉ chấp nhận file .xlsx')
      onClearImportResult?.()
      return
    }

    setLocalImportError(null)
    setSelectedFileName(file.name)
    try {
      await onImportFile(file)
    } catch {
      // Error surfaced via importError
    }
  }

  function toggleSelect(studentId: number) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  function toggleSelectAllWithoutAccount() {
    if (selectedCount === withoutAccount.length) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(withoutAccount.map((s) => s.id)))
  }

  async function confirmCreateAccounts() {
    if (!confirmCreate) return
    const mode = confirmCreate
    setConfirmCreate(null)

    try {
      if (mode === 'selected') {
        await onCreateAccounts([...selectedIds])
        setSelectedIds(new Set())
      } else {
        await onCreateAccounts()
        setSelectedIds(new Set())
      }
    } catch {
      // Error surfaced via createAccountsError
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <button type="button" className="flex-1 cursor-default" aria-label="Đóng bảng" onClick={onClose} />

      <aside className="flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Sinh viên</p>
            <h2 className="mt-1 truncate text-lg font-semibold text-slate-900" title={classroom.className}>
              {classroom.className}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{classroom.subjectName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-4">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div>
              <p className="text-sm font-medium text-slate-800">Nhập Excel</p>
              <p className="mt-0.5 text-xs text-slate-500">
                File <span className="font-medium">.xlsx</span> — cột A email, B họ tên, C MSSV (tuỳ chọn, 8 số). Tối đa
                500 dòng.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={STUDENT_IMPORT_TEMPLATE_URL}
                download="mau-import-sinh-vien.xlsx"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                Tải mẫu
              </a>
              <Button
                variant="secondary"
                className="h-9"
                disabled={isImporting}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" strokeWidth={1.75} />
                {isImporting ? 'Đang import...' : 'Chọn file .xlsx'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(event) => void handleFileChange(event)}
              />
            </div>

            {selectedFileName ? (
              <p className="truncate text-xs text-slate-500">
                Đã chọn: <span className="font-medium text-slate-700">{selectedFileName}</span>
              </p>
            ) : null}

            {localImportError || importError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {localImportError || importError}
              </p>
            ) : null}

            {importResult ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">Kết quả import</p>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                    onClick={() => {
                      setSelectedFileName(null)
                      setLocalImportError(null)
                      onClearImportResult?.()
                    }}
                  >
                    Đóng
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <StatChip label="Tổng" value={importResult.total} />
                  <StatChip label="Thành công" value={importResult.success} tone="success" />
                  <StatChip label="Bỏ qua" value={importResult.skipped} tone="muted" />
                  <StatChip label="Lỗi" value={importResult.failed} tone="danger" />
                </div>

                {importResult.errors.length > 0 ? (
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    <p className="text-xs font-medium text-red-700">Chi tiết lỗi</p>
                    {importResult.errors.map((item) => (
                      <div
                        key={`err-${item.row}-${item.email}`}
                        className="rounded-lg border border-red-100 bg-red-50/80 px-2.5 py-2 text-xs text-red-800"
                      >
                        <p className="font-medium">
                          Dòng {item.row}
                          {item.email ? ` · ${item.email}` : ''}
                        </p>
                        <p className="mt-0.5 text-red-700">{item.message}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {importResult.successes.length > 0 ? (
                  <details className="text-xs text-slate-600">
                    <summary className="cursor-pointer font-medium text-slate-700">
                      Chi tiết thành công / bỏ qua ({importResult.successes.length})
                    </summary>
                    <ul className="mt-2 max-h-32 space-y-1.5 overflow-y-auto">
                      {importResult.successes.map((item) => (
                        <li
                          key={`ok-${item.row}-${item.email}`}
                          className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5"
                        >
                          Dòng {item.row}
                          {item.email ? ` · ${item.email}` : ''}: {item.message}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div>
              <p className="text-sm font-medium text-slate-800">Tạo tài khoản hàng loạt</p>
              <p className="mt-0.5 text-xs text-slate-500">
                BE tạo mật khẩu tạm và xếp hàng gửi email. Không cần MSSV. Email có thể vào spam.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="h-9"
                disabled={!canCreateSelected || isCreatingAccounts}
                onClick={() => setConfirmCreate('selected')}
              >
                <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                Tạo đã chọn ({selectedCount})
              </Button>
              <Button
                className="h-9"
                disabled={!canCreateAll || isCreatingAccounts}
                onClick={() => setConfirmCreate('all')}
              >
                <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                {isCreatingAccounts ? 'Đang tạo...' : `Tạo tất cả chưa có (${withoutAccount.length})`}
              </Button>
            </div>

            {createAccountsError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {createAccountsError}
              </p>
            ) : null}

            {createAccountsResult ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">Kết quả tạo tài khoản</p>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                    onClick={() => onClearCreateAccountsResult?.()}
                  >
                    Đóng
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                  <StatChip label="Tổng" value={createAccountsResult.total} />
                  <StatChip label="Đã tạo" value={createAccountsResult.created} tone="success" />
                  <StatChip label="Bỏ qua" value={createAccountsResult.skipped} tone="muted" />
                  <StatChip label="Lỗi" value={createAccountsResult.failed} tone="danger" />
                  <StatChip label="Mail xếp hàng" value={createAccountsResult.mailQueued} tone="info" />
                </div>

                {createAccountsResult.results.some((r) => r.status === 'FAILED') ? (
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    <p className="text-xs font-medium text-red-700">Chi tiết lỗi</p>
                    {createAccountsResult.results
                      .filter((r) => r.status === 'FAILED')
                      .map((item) => (
                        <div
                          key={`fail-${item.studentId}-${item.email}`}
                          className="rounded-lg border border-red-100 bg-red-50/80 px-2.5 py-2 text-xs text-red-800"
                        >
                          <p className="font-medium">
                            {item.fullName || '—'}
                            {item.email ? ` · ${item.email}` : ''}
                          </p>
                          <p className="mt-0.5 text-red-700">{item.message}</p>
                        </div>
                      ))}
                  </div>
                ) : null}

                {createAccountsResult.results.length > 0 ? (
                  <details className="text-xs text-slate-600">
                    <summary className="cursor-pointer font-medium text-slate-700">
                      Chi tiết tất cả ({createAccountsResult.results.length})
                    </summary>
                    <ul className="mt-2 max-h-36 space-y-1.5 overflow-y-auto">
                      {createAccountsResult.results.map((item) => (
                        <li
                          key={`res-${item.studentId}-${item.status}-${item.email}`}
                          className={`rounded-lg border px-2.5 py-1.5 ${
                            item.status === 'FAILED'
                              ? 'border-red-100 bg-red-50 text-red-800'
                              : item.status === 'CREATED'
                                ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
                                : 'border-slate-100 bg-slate-50'
                          }`}
                        >
                          <span className="font-medium">{item.status}</span>
                          {' · '}
                          {item.fullName || item.email || item.studentId}: {item.message}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            ) : null}
          </div>

          <form className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4" onSubmit={handleEnroll}>
            <div>
              <p className="text-sm font-medium text-slate-800">Ghi danh sinh viên</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Nhập email sinh viên, phân cách bằng dấu phẩy.
              </p>
            </div>
            {enrollError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{enrollError}</p>
            ) : null}
            <div className="space-y-1.5">
              <Input
                value={studentEmailsText}
                hasError={Boolean(errors.studentEmailsText)}
                placeholder="Vui lòng nhập email sinh viên"
                disabled={isEnrolling}
                onChange={(event) => {
                  setStudentEmailsText(event.target.value)
                  if (errors.studentEmailsText) setErrors({})
                }}
              />
              {errors.studentEmailsText ? (
                <p className="text-sm text-red-500">{errors.studentEmailsText}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={isEnrolling}>
              <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
              {isEnrolling ? 'Đang ghi danh...' : 'Thêm vào lớp'}
            </Button>
          </form>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-800">
                Danh sách <span className="text-slate-400">({students.length})</span>
              </p>
              {withoutAccount.length > 0 ? (
                <button
                  type="button"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  onClick={toggleSelectAllWithoutAccount}
                >
                  {selectedCount === withoutAccount.length
                    ? 'Bỏ chọn tất cả chưa có account'
                    : 'Chọn tất cả chưa có account'}
                </button>
              ) : null}
            </div>

            {isLoadingStudents ? <Spinner label="Đang tải sinh viên..." className="py-8" /> : null}

            {studentsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-center">
                <p className="text-sm text-red-600">{studentsError}</p>
                {onRetryStudents ? (
                  <Button variant="secondary" className="mt-3 h-9" onClick={onRetryStudents}>
                    Thử lại
                  </Button>
                ) : null}
              </div>
            ) : null}

            {!isLoadingStudents && !studentsError && students.length === 0 ? (
              <EmptyState
                title="Chưa có sinh viên nào"
                description="Ghi danh bằng email hoặc dùng Nhập Excel với file .xlsx."
              />
            ) : null}

            {!isLoadingStudents && !studentsError && students.length > 0 ? (
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
                {students.map((student) => {
                  const missing = student.missingStudentCode
                  const needsAccount = !student.hasAccount
                  return (
                    <li
                      key={student.id}
                      className={`flex items-start gap-2 px-3 py-3 ${
                        missing || needsAccount
                          ? 'border-l-4 border-l-amber-400 bg-amber-50/70'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 disabled:opacity-40"
                          checked={selectedIds.has(student.id)}
                          disabled={!needsAccount || isCreatingAccounts}
                          aria-label={`Chọn ${student.fullName}`}
                          onChange={() => toggleSelect(student.id)}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-slate-900">{student.fullName}</p>
                          {missing ? (
                            <span className="inline-flex rounded-lg border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              Thiếu MSSV
                            </span>
                          ) : null}
                          {needsAccount ? (
                            <span className="inline-flex rounded-lg border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800">
                              Chưa có account
                            </span>
                          ) : (
                            <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Đã có account
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-600">
                          MSSV:{' '}
                          <span className={missing ? 'font-medium text-amber-800' : 'font-medium text-slate-800'}>
                            {student.studentCode || 'Chưa có'}
                          </span>
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {[student.email, student.phone].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          className="h-9 px-3"
                          disabled={isUpdatingStudentCode}
                          onClick={() => openEditCode(student)}
                          title="Sửa mã sinh viên"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                          MSSV
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-9 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                          disabled={isRemoving}
                          onClick={() => setRemovingStudent(student)}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Gỡ bỏ
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </aside>

      {confirmCreate ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">Tạo tài khoản?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Tạo tài khoản và gửi email mật khẩu tạm cho{' '}
              <span className="font-medium text-slate-900">{confirmCount}</span> sinh viên?
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Email gửi bất đồng bộ — có thể vào spam. Không đợi gửi xong trong request này.
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={isCreatingAccounts}
                onClick={() => setConfirmCreate(null)}
              >
                Hủy
              </Button>
              <Button className="flex-1" disabled={isCreatingAccounts} onClick={() => void confirmCreateAccounts()}>
                {isCreatingAccounts ? 'Đang tạo...' : 'Xác nhận'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {removingStudent ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">Gỡ sinh viên?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Gỡ{' '}
              <span className="font-medium text-slate-900">{removingStudent.fullName}</span> khỏi{' '}
              <span className="font-medium text-slate-900">{classroom.className}</span>?
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={isRemoving}
                onClick={() => setRemovingStudent(null)}
              >
                Hủy
              </Button>
              <Button variant="danger" className="flex-1" disabled={isRemoving} onClick={() => void confirmRemove()}>
                {isRemoving ? 'Đang gỡ...' : 'Gỡ bỏ'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {editingStudent ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">Cập nhật mã sinh viên</h3>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">{editingStudent.fullName}</span>
              <span className="text-slate-400"> · </span>
              {editingStudent.email}
            </p>

            <form className="mt-4 space-y-3" onSubmit={(event) => void handleSaveStudentCode(event)}>
              {updateStudentCodeError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {updateStudentCodeError}
                </p>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor="editStudentCode" className="text-sm font-medium text-slate-700">
                  Mã sinh viên (8 số)
                </label>
                <Input
                  id="editStudentCode"
                  name="editStudentCode"
                  inputMode="numeric"
                  maxLength={8}
                  value={editCode}
                  hasError={Boolean(editCodeError)}
                  disabled={isUpdatingStudentCode}
                  placeholder="Ví dụ: 22520123"
                  onChange={(event) => {
                    setEditCode(event.target.value.replace(/\D/g, '').slice(0, 8))
                    if (editCodeError) setEditCodeError(undefined)
                  }}
                />
                {editCodeError ? <p className="text-sm text-red-500">{editCodeError}</p> : null}
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  disabled={isUpdatingStudentCode}
                  onClick={() => setEditingStudent(null)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="flex-1" disabled={isUpdatingStudentCode}>
                  {isUpdatingStudentCode ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function StatChip({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number
  tone?: 'default' | 'success' | 'danger' | 'muted' | 'info'
}) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : tone === 'danger'
        ? 'border-red-200 bg-red-50 text-red-800'
        : tone === 'muted'
          ? 'border-slate-200 bg-slate-50 text-slate-600'
          : tone === 'info'
            ? 'border-blue-200 bg-blue-50 text-blue-800'
            : 'border-slate-200 bg-white text-slate-800'

  return (
    <div className={`rounded-xl border px-2.5 py-2 ${toneClass}`}>
      <p className="text-[11px] uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-0.5 text-base font-semibold tabular-nums">{value}</p>
    </div>
  )
}
