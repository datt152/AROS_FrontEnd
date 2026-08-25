import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spinner } from '../../../components/ui/Spinner'
import {
  Table,
  TableBody,
  TableCol,
  TableColGroup,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/Table'
import { ClassroomForm } from '../components/ClassroomForm'
import { ClassroomItem, ClassroomTableRow } from '../components/ClassroomItem'
import { ClassroomStudentsPanel } from '../components/ClassroomStudentsPanel'
import type {
  ClassroomFormValues,
  ClassroomItem as ClassroomItemType,
  ClassroomStudent,
  SubjectOption,
} from '../types/classroom.types'

type ModalMode = 'create' | 'edit' | null
type ListStatus = 'loading' | 'ready'

const MOCK_SUBJECTS: SubjectOption[] = [
  { id: 1, subjectName: 'Software Engineering' },
  { id: 2, subjectName: 'Database Systems' },
  { id: 3, subjectName: 'Web Development' },
]

const MOCK_CLASSROOMS: ClassroomItemType[] = [
  {
    id: 1,
    className: 'SE2025-CLC01',
    description: 'Morning class for Software Engineering majors',
    semester: '1',
    academicYear: '2025-2026',
    isActive: true,
    subjectId: 1,
    subjectName: 'Software Engineering',
  },
  {
    id: 2,
    className: 'DB2025-CQ02',
    description: 'Database practice group',
    semester: '1',
    academicYear: '2025-2026',
    isActive: true,
    subjectId: 2,
    subjectName: 'Database Systems',
  },
  {
    id: 3,
    className: 'WEB2024-CLC03',
    description: '',
    semester: '2',
    academicYear: '2024-2025',
    isActive: false,
    subjectId: 3,
    subjectName: 'Web Development',
  },
]

const MOCK_STUDENTS_BY_CLASS: Record<number, ClassroomStudent[]> = {
  1: [
    { id: 101, studentCode: 'SV001', fullName: 'Nguyen Van An', email: 'an.nguyen@student.edu.vn' },
    { id: 102, studentCode: 'SV002', fullName: 'Tran Thi Binh', email: 'binh.tran@student.edu.vn' },
    { id: 103, studentCode: 'SV003', fullName: 'Le Minh Cuong', email: 'cuong.le@student.edu.vn' },
  ],
  2: [
    { id: 201, studentCode: 'SV010', fullName: 'Pham Thu Dung', email: 'dung.pham@student.edu.vn' },
  ],
  3: [],
}

export function ClassroomListPage() {
  const [status, setStatus] = useState<ListStatus>('loading')
  const [classrooms, setClassrooms] = useState<ClassroomItemType[]>([])
  const [studentsByClass, setStudentsByClass] =
    useState<Record<number, ClassroomStudent[]>>(MOCK_STUDENTS_BY_CLASS)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingClassroom, setEditingClassroom] = useState<ClassroomItemType | null>(null)
  const [deletingClassroom, setDeletingClassroom] = useState<ClassroomItemType | null>(null)
  const [managingClassroom, setManagingClassroom] = useState<ClassroomItemType | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setClassrooms(MOCK_CLASSROOMS)
      setStatus('ready')
    }, 700)

    return () => window.clearTimeout(timer)
  }, [])

  function openCreate() {
    setFormError(null)
    setEditingClassroom(null)
    setModalMode('create')
  }

  function openEdit(classroom: ClassroomItemType) {
    setFormError(null)
    setEditingClassroom(classroom)
    setModalMode('edit')
  }

  function closeModal() {
    if (isFormSubmitting) return
    setModalMode(null)
    setEditingClassroom(null)
    setFormError(null)
  }

  function resolveSubjectName(subjectId: number) {
    return MOCK_SUBJECTS.find((subject) => subject.id === subjectId)?.subjectName ?? 'Unknown subject'
  }

  async function handleSubmit(values: ClassroomFormValues) {
    setFormError(null)
    setIsFormSubmitting(true)

    await new Promise((resolve) => window.setTimeout(resolve, 400))

    if (modalMode === 'create') {
      const nextId = classrooms.reduce((max, item) => Math.max(max, item.id), 0) + 1
      const created: ClassroomItemType = {
        id: nextId,
        ...values,
        subjectName: resolveSubjectName(values.subjectId),
      }
      setClassrooms((current) => [created, ...current])
      setStudentsByClass((current) => ({ ...current, [nextId]: [] }))
    }

    if (modalMode === 'edit' && editingClassroom) {
      setClassrooms((current) =>
        current.map((item) =>
          item.id === editingClassroom.id
            ? {
                ...item,
                ...values,
                subjectName: resolveSubjectName(values.subjectId),
              }
            : item,
        ),
      )
    }

    setIsFormSubmitting(false)
    setModalMode(null)
    setEditingClassroom(null)
  }

  function confirmDelete() {
    if (!deletingClassroom) return
    const id = deletingClassroom.id
    setClassrooms((current) => current.filter((item) => item.id !== id))
    setStudentsByClass((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
    if (managingClassroom?.id === id) setManagingClassroom(null)
    setDeletingClassroom(null)
  }

  function handleEnroll(studentEmails: string[]) {
    if (!managingClassroom) return

    setStudentsByClass((current) => {
      const existing = current[managingClassroom.id] ?? []
      const existingEmails = new Set(existing.map((student) => student.email.toLowerCase()))
      const nextIdBase = existing.reduce((max, student) => Math.max(max, student.id), 1000)

      const additions: ClassroomStudent[] = studentEmails
        .filter((email) => !existingEmails.has(email.toLowerCase()))
        .map((email, index) => {
          const localPart = email.split('@')[0] ?? 'student'
          return {
            id: nextIdBase + index + 1,
            studentCode: `SV${String(nextIdBase + index + 1).slice(-3)}`,
            fullName: localPart.replace(/[._-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
            email,
          }
        })

      return {
        ...current,
        [managingClassroom.id]: [...existing, ...additions],
      }
    })
  }

  function handleRemoveStudent(student: ClassroomStudent) {
    if (!managingClassroom) return
    setStudentsByClass((current) => ({
      ...current,
      [managingClassroom.id]: (current[managingClassroom.id] ?? []).filter((item) => item.id !== student.id),
    }))
  }

  const managingStudents = managingClassroom ? (studentsByClass[managingClassroom.id] ?? []) : []

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Classrooms</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Classroom management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create classes, assign subjects, and manage student enrollment.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add classroom
        </Button>
      </div>

      {status === 'loading' ? <Spinner label="Loading classrooms..." /> : null}

      {status === 'ready' && classrooms.length === 0 ? (
        <EmptyState
          title="No classrooms yet"
          description="Add your first classroom to start enrolling students."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add classroom
            </Button>
          }
        />
      ) : null}

      {status === 'ready' && classrooms.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100 md:hidden">
            {classrooms.map((classroom) => (
              <ClassroomItem
                key={classroom.id}
                classroom={classroom}
                onEdit={openEdit}
                onDelete={setDeletingClassroom}
                onManageStudents={setManagingClassroom}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableColGroup>
                <TableCol width="20%" />
                <TableCol width="15%" />
                <TableCol width="4.5rem" />
                <TableCol width="5.5rem" />
                <TableCol width="4.5rem" />
                <TableCol width="16.5rem" />
              </TableColGroup>
              <TableHeader>
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead>Class name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.map((classroom) => (
                  <ClassroomTableRow
                    key={classroom.id}
                    classroom={classroom}
                    onEdit={openEdit}
                    onDelete={setDeletingClassroom}
                    onManageStudents={setManagingClassroom}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                  {modalMode === 'create' ? 'Create' : 'Edit'}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {modalMode === 'create' ? 'Add classroom' : 'Edit classroom'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isFormSubmitting}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <ClassroomForm
              mode={modalMode}
              initialValues={editingClassroom ?? undefined}
              subjectOptions={MOCK_SUBJECTS}
              isSubmitting={isFormSubmitting}
              submitError={formError}
              onSubmit={handleSubmit}
              onCancel={closeModal}
            />
          </div>
        </div>
      ) : null}

      {deletingClassroom ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">Delete classroom?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This will remove{' '}
              <span className="font-medium text-slate-900">{deletingClassroom.className}</span> and its
              student roster from the list.
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setDeletingClassroom(null)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {managingClassroom ? (
        <ClassroomStudentsPanel
          classroom={managingClassroom}
          students={managingStudents}
          onClose={() => setManagingClassroom(null)}
          onEnroll={handleEnroll}
          onRemove={handleRemoveStudent}
        />
      ) : null}
    </section>
  )
}
