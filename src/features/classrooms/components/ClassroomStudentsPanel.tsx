import { FileSpreadsheet, Trash2, UserPlus, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Input } from '../../../components/ui/Input'
import { Spinner } from '../../../components/ui/Spinner'
import type {
  ClassroomItem,
  ClassroomStudent,
  EnrollStudentFormErrors,
} from '../types/classroom.types'

type ClassroomStudentsPanelProps = {
  classroom: ClassroomItem
  students: ClassroomStudent[]
  isLoadingStudents?: boolean
  studentsError?: string | null
  onRetryStudents?: () => void
  isEnrolling?: boolean
  enrollError?: string | null
  isRemoving?: boolean
  onClose: () => void
  onEnroll: (studentEmails: string[]) => void | Promise<void>
  onRemove: (student: ClassroomStudent) => void | Promise<void>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ClassroomStudentsPanel({
  classroom,
  students,
  isLoadingStudents = false,
  studentsError = null,
  onRetryStudents,
  isEnrolling = false,
  enrollError = null,
  isRemoving = false,
  onClose,
  onEnroll,
  onRemove,
}: ClassroomStudentsPanelProps) {
  const [studentEmailsText, setStudentEmailsText] = useState('')
  const [errors, setErrors] = useState<EnrollStudentFormErrors>({})
  const [removingStudent, setRemovingStudent] = useState<ClassroomStudent | null>(null)

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <button type="button" className="flex-1 cursor-default" aria-label="Close panel" onClick={onClose} />

      <aside className="flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Students</p>
            <h2 className="mt-1 truncate text-lg font-semibold text-slate-900" title={classroom.className}>
              {classroom.className}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{classroom.subjectName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="h-9" disabled title="Coming soon — backend not ready">
              <FileSpreadsheet className="h-3.5 w-3.5" strokeWidth={1.75} />
              Import Excel
            </Button>
            <Button variant="secondary" className="h-9" disabled title="Coming soon — backend not ready">
              <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Bulk create accounts
            </Button>
          </div>
          <p className="text-xs text-slate-400">
            Import Excel and bulk account creation are placeholders until the backend is ready.
          </p>

          <form className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4" onSubmit={handleEnroll}>
            <div>
              <p className="text-sm font-medium text-slate-800">Enroll students</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Enter student emails separated by commas (EnrollStudentRequest.studentEmails).
              </p>
            </div>
            {enrollError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{enrollError}</p>
            ) : null}
            <div className="space-y-1.5">
              <Input
                value={studentEmailsText}
                hasError={Boolean(errors.studentEmailsText)}
                placeholder="e.g. an@student.edu.vn, binh@student.edu.vn"
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
              {isEnrolling ? 'Enrolling...' : 'Add to class'}
            </Button>
          </form>

          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-800">
                Roster <span className="text-slate-400">({students.length})</span>
              </p>
            </div>

            {isLoadingStudents ? <Spinner label="Loading students..." className="py-8" /> : null}

            {studentsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-center">
                <p className="text-sm text-red-600">{studentsError}</p>
                {onRetryStudents ? (
                  <Button variant="secondary" className="mt-3 h-9" onClick={onRetryStudents}>
                    Try again
                  </Button>
                ) : null}
              </div>
            ) : null}

            {!isLoadingStudents && !studentsError && students.length === 0 ? (
              <EmptyState
                title="No students yet"
                description="Enroll students by email, or use Import Excel when available."
              />
            ) : null}

            {!isLoadingStudents && !studentsError && students.length > 0 ? (
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
                {students.map((student) => (
                  <li
                    key={student.id}
                    className="flex items-center justify-between gap-3 px-3 py-3 hover:bg-slate-50/70"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{student.fullName}</p>
                      <p className="truncate text-xs text-slate-500">
                        {[student.studentCode, student.email, student.phone].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="h-9 shrink-0 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={isRemoving}
                      onClick={() => setRemovingStudent(student)}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </aside>

      {removingStudent ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">Remove student?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Remove{' '}
              <span className="font-medium text-slate-900">{removingStudent.fullName}</span> from{' '}
              <span className="font-medium text-slate-900">{classroom.className}</span>?
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={isRemoving}
                onClick={() => setRemovingStudent(null)}
              >
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" disabled={isRemoving} onClick={() => void confirmRemove()}>
                {isRemoving ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
