import { Download, FileSpreadsheet, MailPlus, Pencil, Search, Trash2, UserPlus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Input } from '../../../components/ui/Input'
import { Spinner } from '../../../components/ui/Spinner'
import { buildStudentsImportXlsxFile } from '../lib/buildStudentsImportXlsx'
import type {
  ClassroomItem,
  ClassroomStudent,
  CreateStudentAccountsResult,
  StudentImportResult,
} from '../types/classroom.types'

type PanelTab = 'list' | 'add'
type AddMethod = 'manual' | 'excel'

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
  /** Ghi danh SV đã có tài khoản bằng email → POST .../students/enroll */
  onEnroll?: (studentEmails: string[]) => void | Promise<void>
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

type ManualFormErrors = {
  fullName?: string
  studentCode?: string
  email?: string
}

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

  const [tab, setTab] = useState<PanelTab>('list')
  const [addMethod, setAddMethod] = useState<AddMethod>('manual')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showCreateResult, setShowCreateResult] = useState(false)

  const [isImportResultOpen, setIsImportResultOpen] = useState(false)

  const [isEnrollOpen, setIsEnrollOpen] = useState(false)
  const [enrollEmail, setEnrollEmail] = useState('')
  const [enrollEmailError, setEnrollEmailError] = useState<string | undefined>()
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null)

  const [manualFullName, setManualFullName] = useState('')
  const [manualStudentCode, setManualStudentCode] = useState('')
  const [manualEmail, setManualEmail] = useState('')
  const [manualErrors, setManualErrors] = useState<ManualFormErrors>({})
  const [manualLocalError, setManualLocalError] = useState<string | null>(null)

  const [removingStudent, setRemovingStudent] = useState<ClassroomStudent | null>(null)
  const [editingStudent, setEditingStudent] = useState<ClassroomStudent | null>(null)
  const [editCode, setEditCode] = useState('')
  const [editCodeError, setEditCodeError] = useState<string | undefined>()
  const [studentSearch, setStudentSearch] = useState('')

  const withoutAccount = useMemo(() => students.filter((s) => !s.hasAccount), [students])
  const withoutAccountIds = useMemo(() => new Set(withoutAccount.map((s) => s.id)), [withoutAccount])

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) => {
      const name = s.fullName?.toLowerCase() ?? ''
      const email = s.email?.toLowerCase() ?? ''
      const code = s.studentCode?.toLowerCase() ?? ''
      return name.includes(q) || email.includes(q) || code.includes(q)
    })
  }, [students, studentSearch])

  useEffect(() => {
    setSelectedIds((current) => {
      const next = new Set<number>()
      for (const id of current) {
        if (withoutAccountIds.has(id)) next.add(id)
      }
      return next
    })
  }, [withoutAccountIds])

  useEffect(() => {
    if (importResult || importError) setIsImportResultOpen(true)
  }, [importResult, importError])

  useEffect(() => {
    if (createAccountsResult || createAccountsError) setShowCreateResult(true)
  }, [createAccountsResult, createAccountsError])

  function openCreateModal() {
    onClearCreateAccountsResult?.()
    setShowCreateResult(false)
    setSelectedIds(new Set(withoutAccount.map((s) => s.id)))
    setIsCreateModalOpen(true)
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false)
    setShowCreateResult(false)
    onClearCreateAccountsResult?.()
  }

  function openEnrollModal() {
    setEnrollEmail('')
    setEnrollEmailError(undefined)
    setEnrollSuccess(null)
    setIsEnrollOpen(true)
  }

  function closeEnrollModal() {
    if (isEnrolling) return
    setIsEnrollOpen(false)
    setEnrollEmail('')
    setEnrollEmailError(undefined)
  }

  async function handleEnrollSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!onEnroll) return

    const email = enrollEmail.trim().toLowerCase()
    if (!email) {
      setEnrollEmailError('Vui lòng nhập email')
      return
    }
    if (!EMAIL_PATTERN.test(email)) {
      setEnrollEmailError('Email không hợp lệ')
      return
    }

    setEnrollEmailError(undefined)
    setEnrollSuccess(null)
    try {
      await onEnroll([email])
      setEnrollSuccess(`Đã thêm ${email} vào lớp`)
      setEnrollEmail('')
      setIsEnrollOpen(false)
    } catch {
      // Error via enrollError from page
    }
  }

  function closeImportResultModal() {
    setIsImportResultOpen(false)
    setManualLocalError(null)
    onClearImportResult?.()
  }

  function toggleSelect(studentId: number) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === withoutAccount.length) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(withoutAccount.map((s) => s.id)))
  }

  async function handleCreateAccountsSubmit() {
    if (selectedIds.size === 0) return
    try {
      await onCreateAccounts([...selectedIds])
    } catch {
      // Error via createAccountsError
    }
  }

  async function handleManualSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: ManualFormErrors = {}
    const fullName = manualFullName.trim()
    const studentCode = manualStudentCode.trim()
    const email = manualEmail.trim().toLowerCase()

    if (!fullName) nextErrors.fullName = 'Vui lòng nhập họ tên'
    if (!studentCode) nextErrors.studentCode = 'Vui lòng nhập MSSV'
    else if (!STUDENT_CODE_PATTERN.test(studentCode)) nextErrors.studentCode = 'MSSV phải gồm đúng 8 chữ số'
    if (!email) nextErrors.email = 'Vui lòng nhập email'
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = 'Email không hợp lệ'

    setManualErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setManualLocalError(null)
    onClearImportResult?.()

    try {
      const file = buildStudentsImportXlsxFile([{ email, fullName, studentCode }], 'them-sinh-vien.xlsx')
      await onImportFile(file)
      setManualFullName('')
      setManualStudentCode('')
      setManualEmail('')
    } catch {
      // Error via importError
    }
  }

  async function handleExcelFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setManualLocalError('Chỉ chấp nhận file .xlsx')
      setIsImportResultOpen(true)
      onClearImportResult?.()
      return
    }

    setManualLocalError(null)
    onClearImportResult?.()
    try {
      await onImportFile(file)
    } catch {
      // Error via importError
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
      // via updateStudentCodeError
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

  const createdCount = createAccountsResult?.created ?? 0
  const createTotal = createAccountsResult?.total ?? 0
  const createFailures = createAccountsResult?.results.filter((r) => r.status === 'FAILED') ?? []

  const importSuccessCount = importResult?.success ?? 0
  const importTotal = importResult?.total ?? 0
  const importFailedCount = importResult?.failed ?? 0
  const importSkippedCount = importResult?.skipped ?? 0
  const importSuccessRows = importResult?.successes ?? []
  const importErrorRows = importResult?.errors ?? []

  function importRowLabel(item: { fullName?: string; email?: string; row?: number }) {
    const name = item.fullName?.trim()
    if (name) return name
    const email = item.email?.trim()
    if (email) return email
    if (item.row && item.row > 0) return `Dòng ${item.row}`
    return 'Sinh viên'
  }
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <button type="button" className="flex-1 cursor-default" aria-label="Đóng bảng" onClick={onClose} />

      <aside className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
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

        <div className="border-b border-slate-200 px-5">
          <div className="flex gap-1">
            <TabButton active={tab === 'list'} onClick={() => setTab('list')}>
              Danh sách sinh viên hiện tại
            </TabButton>
            <TabButton active={tab === 'add'} onClick={() => setTab('add')}>
              Thêm sinh viên
            </TabButton>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {tab === 'list' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-500">
                  {students.length} sinh viên
                  {withoutAccount.length > 0 ? (
                    <span className="text-slate-400"> · {withoutAccount.length} chưa có tài khoản</span>
                  ) : null}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    className="h-9"
                    disabled={!onEnroll || isEnrolling}
                    onClick={openEnrollModal}
                  >
                    <MailPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Thêm vào lớp
                  </Button>
                  <Button
                    className="h-9"
                    disabled={withoutAccount.length === 0 || isCreatingAccounts}
                    onClick={openCreateModal}
                  >
                    <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Tạo tài khoản
                  </Button>
                </div>
              </div>

              {enrollSuccess ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {enrollSuccess}
                </p>
              ) : null}

              {students.length > 0 ? (
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    strokeWidth={1.75}
                  />
                  <Input
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Tìm theo tên, MSSV hoặc email..."
                    className="pl-9"
                    aria-label="Tìm sinh viên"
                  />
                </div>
              ) : null}

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
                  description="Chuyển sang tab Thêm sinh viên để ghi danh thủ công hoặc bằng Excel."
                />
              ) : null}

              {!isLoadingStudents && !studentsError && students.length > 0 && filteredStudents.length === 0 ? (
                <EmptyState
                  title="Không tìm thấy sinh viên"
                  description="Thử từ khóa khác theo tên, MSSV hoặc email."
                />
              ) : null}

              {!isLoadingStudents && !studentsError && filteredStudents.length > 0 ? (
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
                  {filteredStudents.map((student) => {
                    const missing = student.missingStudentCode
                    const needsAccount = !student.hasAccount
                    return (
                      <li
                        key={student.id}
                        className={`flex items-start gap-3 px-3 py-3 ${
                          missing || needsAccount
                            ? 'border-l-4 border-l-amber-400 bg-amber-50/70'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-slate-900">{student.fullName}</p>
                            {missing ? (
                              <span className="inline-flex rounded-lg border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                Thiếu MSSV
                              </span>
                            ) : null}
                            {needsAccount ? (
                              <span className="inline-flex rounded-lg border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800">
                                Chưa có tài khoản
                              </span>
                            ) : (
                              <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                Đã có tài khoản
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            MSSV:{' '}
                            <span className={missing ? 'font-medium text-amber-800' : 'font-medium text-slate-800'}>
                              {student.studentCode || 'Chưa có'}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {[student.email, student.phone].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center justify-center gap-1.5">
                          <button
                            type="button"
                            title="Sửa MSSV"
                            aria-label="Sửa MSSV"
                            disabled={isUpdatingStudentCode}
                            onClick={() => openEditCode(student)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            title="Gỡ bỏ"
                            aria-label="Gỡ bỏ"
                            disabled={isRemoving}
                            onClick={() => setRemovingStudent(student)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setAddMethod('manual')}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    addMethod === 'manual'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Thêm thủ công
                </button>
                <button
                  type="button"
                  onClick={() => setAddMethod('excel')}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    addMethod === 'excel'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Thêm bằng Excel
                </button>
              </div>

              {addMethod === 'manual' ? (
                <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4" onSubmit={(e) => void handleManualSubmit(e)} noValidate>
                  <p className="text-xs text-slate-500">Họ tên, MSSV (8 số) và Email đều bắt buộc.</p>

                  <div className="space-y-1.5">
                    <label htmlFor="manualFullName" className="text-sm font-medium text-slate-700">
                      Họ tên sinh viên
                    </label>
                    <Input
                      id="manualFullName"
                      value={manualFullName}
                      hasError={Boolean(manualErrors.fullName)}
                      disabled={isImporting}
                      placeholder="Nguyễn Văn A"
                      onChange={(e) => {
                        setManualFullName(e.target.value)
                        if (manualErrors.fullName) setManualErrors((c) => ({ ...c, fullName: undefined }))
                      }}
                    />
                    {manualErrors.fullName ? <p className="text-sm text-red-500">{manualErrors.fullName}</p> : null}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="manualStudentCode" className="text-sm font-medium text-slate-700">
                      MSSV
                    </label>
                    <Input
                      id="manualStudentCode"
                      inputMode="numeric"
                      maxLength={8}
                      value={manualStudentCode}
                      hasError={Boolean(manualErrors.studentCode)}
                      disabled={isImporting}
                      placeholder="12345678"
                      onChange={(e) => {
                        setManualStudentCode(e.target.value.replace(/\D/g, '').slice(0, 8))
                        if (manualErrors.studentCode) setManualErrors((c) => ({ ...c, studentCode: undefined }))
                      }}
                    />
                    {manualErrors.studentCode ? (
                      <p className="text-sm text-red-500">{manualErrors.studentCode}</p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="manualEmail" className="text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <Input
                      id="manualEmail"
                      type="email"
                      value={manualEmail}
                      hasError={Boolean(manualErrors.email)}
                      disabled={isImporting}
                      placeholder="sv@uni.edu.vn"
                      onChange={(e) => {
                        setManualEmail(e.target.value)
                        if (manualErrors.email) setManualErrors((c) => ({ ...c, email: undefined }))
                      }}
                    />
                    {manualErrors.email ? <p className="text-sm text-red-500">{manualErrors.email}</p> : null}
                  </div>

                  <Button type="submit" className="w-full" disabled={isImporting}>
                    <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {isImporting ? 'Đang thêm...' : 'Thêm sinh viên'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-600">
                    File <span className="font-medium">.xlsx</span> — cột A email, B họ tên, C MSSV. Tối đa 500 dòng.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={STUDENT_IMPORT_TEMPLATE_URL}
                      download="mau-import-sinh-vien.xlsx"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Tải file mẫu
                    </a>
                    <Button
                      variant="secondary"
                      disabled={isImporting}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {isImporting ? 'Đang tải lên...' : 'Thêm bằng Excel'}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="hidden"
                      onChange={(e) => void handleExcelFileChange(e)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Create accounts modal */}
      {isCreateModalOpen ? (
        <ModalShell title="Tạo tài khoản hàng loạt" onClose={closeCreateModal} busy={isCreatingAccounts}>
          {showCreateResult && (createAccountsResult || createAccountsError) ? (
            <div className="space-y-3">
              {createAccountsError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {createAccountsError}
                </p>
              ) : null}

              {createAccountsResult ? (
                <>
                  <p className="text-sm text-slate-800">
                    Đã tạo thành công{' '}
                    <span className="font-semibold text-emerald-700">
                      {createdCount} / {createTotal}
                    </span>{' '}
                    tài khoản.
                  </p>
                  {createdCount > 0 || (createAccountsResult.mailQueued ?? 0) > 0 ? (
                    <p className="text-sm text-emerald-700">
                      Thông tin tài khoản đã được gửi về email của các sinh viên.
                    </p>
                  ) : null}
                  {createFailures.length > 0 ? (
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      <p className="text-xs font-medium text-red-700">Chi tiết lỗi</p>
                      {createFailures.map((item) => (
                        <p key={`fail-${item.studentId}-${item.email}`} className="text-sm text-red-600">
                          {item.fullName || item.email}: {item.message}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}

              <Button className="w-full" variant="secondary" onClick={closeCreateModal}>
                Đóng
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Chọn sinh viên chưa có tài khoản. Hệ thống sẽ tạo mật khẩu tạm và xếp hàng gửi email.
              </p>

              {withoutAccount.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                  Tất cả sinh viên trong lớp đã có tài khoản.
                </p>
              ) : (
                <>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      checked={selectedIds.size === withoutAccount.length && withoutAccount.length > 0}
                      onChange={toggleSelectAll}
                    />
                    Chọn tất cả ({withoutAccount.length})
                  </label>
                  <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
                    {withoutAccount.map((student) => (
                      <li key={student.id} className="flex items-start gap-3 px-3 py-2.5">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
                          checked={selectedIds.has(student.id)}
                          onChange={() => toggleSelect(student.id)}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{student.fullName}</p>
                          <p className="truncate text-xs text-slate-500">{student.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <Button
                className="w-full"
                disabled={selectedIds.size === 0 || isCreatingAccounts}
                onClick={() => void handleCreateAccountsSubmit()}
              >
                {isCreatingAccounts ? 'Đang tạo...' : `Tạo tài khoản (${selectedIds.size})`}
              </Button>
            </div>
          )}
        </ModalShell>
      ) : null}

      {/* Import / manual add result modal */}
      {isImportResultOpen ? (
        <ModalShell title="Kết quả import danh sách" onClose={closeImportResultModal} busy={isImporting}>
          <div className="space-y-3">
            {manualLocalError || importError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {manualLocalError || importError}
              </p>
            ) : null}

            {importResult ? (
              <>
                <div className="space-y-1 text-sm text-slate-800">
                  <p>
                    Thành công{' '}
                    <span className="font-semibold text-emerald-700">
                      {importSuccessCount}/{importTotal}
                    </span>
                    {importSkippedCount > 0 ? (
                      <>
                        , bỏ qua <span className="font-semibold text-slate-700">{importSkippedCount}</span>
                      </>
                    ) : null}
                    {importFailedCount > 0 ? (
                      <>
                        , lỗi <span className="font-semibold text-red-600">{importFailedCount}</span>
                      </>
                    ) : null}
                  </p>
                </div>

                {importSuccessRows.length > 0 ? (
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs font-medium text-slate-700">Chi tiết</p>
                    <ul className="space-y-1.5">
                      {importSuccessRows.map((item) => (
                        <li
                          key={`iok-${item.row}-${item.email}-${item.message}`}
                          className="text-sm text-slate-700"
                        >
                          <span className="font-medium text-slate-900">{importRowLabel(item)}</span>
                          {item.message ? `: ${item.message}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {importErrorRows.length > 0 ? (
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                    <p className="text-xs font-medium text-red-700">Lỗi</p>
                    <ul className="space-y-1.5">
                      {importErrorRows.map((item) => (
                        <li
                          key={`ierr-${item.row}-${item.email}-${item.message}`}
                          className="text-sm text-red-600"
                        >
                          {importRowLabel(item)}: {item.message || 'Không xác định'}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {importSuccessCount === 0 &&
                importSkippedCount === 0 &&
                importFailedCount === 0 &&
                importTotal > 0 ? (
                  <p className="text-sm text-slate-600">Không có dòng nào được xử lý.</p>
                ) : null}
              </>
            ) : null}

            {!importResult && !importError && !manualLocalError ? (
              <p className="text-sm text-slate-600">Không có dữ liệu kết quả.</p>
            ) : null}

            <Button className="w-full" variant="secondary" onClick={closeImportResultModal}>
              Đóng
            </Button>
          </div>
        </ModalShell>
      ) : null}

      {isEnrollOpen ? (
        <ModalShell title="Thêm sinh viên vào lớp" onClose={closeEnrollModal} busy={isEnrolling}>
          <form className="space-y-3" onSubmit={(e) => void handleEnrollSubmit(e)} noValidate>
            <p className="text-sm text-slate-600">
              Nhập email tài khoản sinh viên đã có trên hệ thống để ghi danh vào{' '}
              <span className="font-medium text-slate-900">{classroom.className}</span>.
            </p>
            {enrollError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {enrollError}
              </p>
            ) : null}
            <div className="space-y-1.5">
              <label htmlFor="enrollEmail" className="text-sm font-medium text-slate-700">
                Email sinh viên
              </label>
              <Input
                id="enrollEmail"
                type="email"
                autoFocus
                value={enrollEmail}
                hasError={Boolean(enrollEmailError)}
                disabled={isEnrolling}
                placeholder="sv@uni.edu.vn"
                onChange={(e) => {
                  setEnrollEmail(e.target.value)
                  if (enrollEmailError) setEnrollEmailError(undefined)
                }}
              />
              {enrollEmailError ? <p className="text-sm text-red-500">{enrollEmailError}</p> : null}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                disabled={isEnrolling}
                onClick={closeEnrollModal}
              >
                Hủy
              </Button>
              <Button type="submit" className="flex-1" disabled={isEnrolling || !onEnroll}>
                <MailPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                {isEnrolling ? 'Đang thêm...' : 'Thêm vào lớp'}
              </Button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {removingStudent ? (
        <ModalShell title="Gỡ sinh viên?" onClose={() => setRemovingStudent(null)} busy={isRemoving}>
          <p className="text-sm text-slate-600">
            Gỡ <span className="font-medium text-slate-900">{removingStudent.fullName}</span> khỏi{' '}
            <span className="font-medium text-slate-900">{classroom.className}</span>?
          </p>
          <div className="mt-5 flex gap-2">
            <Button variant="secondary" className="flex-1" disabled={isRemoving} onClick={() => setRemovingStudent(null)}>
              Hủy
            </Button>
            <Button variant="danger" className="flex-1" disabled={isRemoving} onClick={() => void confirmRemove()}>
              {isRemoving ? 'Đang gỡ...' : 'Gỡ bỏ'}
            </Button>
          </div>
        </ModalShell>
      ) : null}

      {editingStudent ? (
        <ModalShell title="Cập nhật mã sinh viên" onClose={() => setEditingStudent(null)} busy={isUpdatingStudentCode}>
          <p className="mb-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">{editingStudent.fullName}</span>
            <span className="text-slate-400"> · </span>
            {editingStudent.email}
          </p>
          <form className="space-y-3" onSubmit={(e) => void handleSaveStudentCode(e)}>
            {updateStudentCodeError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {updateStudentCodeError}
              </p>
            ) : null}
            <Input
              id="editStudentCode"
              inputMode="numeric"
              maxLength={8}
              value={editCode}
              hasError={Boolean(editCodeError)}
              disabled={isUpdatingStudentCode}
              placeholder="Ví dụ: 22520123"
              onChange={(e) => {
                setEditCode(e.target.value.replace(/\D/g, '').slice(0, 8))
                if (editCodeError) setEditCodeError(undefined)
              }}
            />
            {editCodeError ? <p className="text-sm text-red-500">{editCodeError}</p> : null}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" className="flex-1" disabled={isUpdatingStudentCode} onClick={() => setEditingStudent(null)}>
                Hủy
              </Button>
              <Button type="submit" className="flex-1" disabled={isUpdatingStudentCode}>
                {isUpdatingStudentCode ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 px-2 py-3 text-sm font-medium transition ${
        active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      {children}
      {active ? <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-blue-600" /> : null}
    </button>
  )
}

function ModalShell({
  title,
  onClose,
  busy,
  children,
}: {
  title: string
  onClose: () => void
  busy?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center bg-slate-900/45 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Đóng" onClick={onClose} disabled={busy} />
      <div className="relative z-10 max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
