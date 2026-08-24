import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spinner } from '../../../components/ui/Spinner'
import { SubjectForm } from '../components/SubjectForm'
import type { SubjectFormValues, SubjectItem } from '../types/subject.types'

const MOCK_SUBJECTS: SubjectItem[] = [
  {
    id: 1,
    subjectName: 'Software Engineering',
    description: 'Software process, requirements, design and testing fundamentals.',
  },
  {
    id: 2,
    subjectName: 'Database Systems',
    description: 'Relational modeling, SQL, transactions and indexing.',
  },
  {
    id: 3,
    subjectName: 'Web Development',
    description: 'Modern frontend and backend patterns for web applications.',
  },
  {
    id: 4,
    subjectName: 'Operating Systems',
    description: 'Processes, memory management, concurrency and file systems.',
  },
]

type ModalMode = 'create' | 'edit' | null

export function SubjectListPage() {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null)
  const [deletingSubject, setDeletingSubject] = useState<SubjectItem | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSubjects(MOCK_SUBJECTS)
      setStatus('ready')
    }, 700)
    return () => window.clearTimeout(timer)
  }, [])

  function openCreate() {
    setEditingSubject(null)
    setModalMode('create')
  }

  function openEdit(subject: SubjectItem) {
    setEditingSubject(subject)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
    setEditingSubject(null)
  }

  function handleSubmit(values: SubjectFormValues) {
    if (modalMode === 'create') {
      const nextId = subjects.reduce((max, item) => Math.max(max, item.id), 0) + 1
      setSubjects((current) => [
        {
          id: nextId,
          subjectName: values.subjectName,
          description: values.description,
        },
        ...current,
      ])
    }

    if (modalMode === 'edit' && editingSubject) {
      setSubjects((current) =>
        current.map((item) =>
          item.id === editingSubject.id
            ? {
                ...item,
                subjectName: values.subjectName,
                description: values.description,
              }
            : item,
        ),
      )
    }

    closeModal()
  }

  function confirmDelete() {
    if (!deletingSubject) return
    setSubjects((current) => current.filter((item) => item.id !== deletingSubject.id))
    setDeletingSubject(null)
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Subjects</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Subject management</h1>
          <p className="mt-1 text-sm text-slate-500">Create, edit, and organize teaching subjects.</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add subject
        </Button>
      </div>

      {status === 'loading' ? <Spinner label="Loading subjects..." /> : null}

      {status === 'ready' && subjects.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          description="Add your first subject to start building exams and practice sets."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add subject
            </Button>
          }
        />
      ) : null}

      {status === 'ready' && subjects.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Subject name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-900">{subject.subjectName}</td>
                    <td className="max-w-md px-4 py-3 text-slate-600">{subject.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="secondary" className="h-9 px-3" onClick={() => openEdit(subject)}>
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-9 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setDeletingSubject(subject)}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {subjects.map((subject) => (
              <article key={subject.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">{subject.subjectName}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{subject.description}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" className="h-9 flex-1" onClick={() => openEdit(subject)}>
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeletingSubject(subject)}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </>
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
                  {modalMode === 'create' ? 'Add subject' : 'Edit subject'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <SubjectForm
              mode={modalMode}
              initialValues={editingSubject ?? undefined}
              onSubmit={handleSubmit}
              onCancel={closeModal}
            />
          </div>
        </div>
      ) : null}

      {deletingSubject ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">Delete subject?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This will remove <span className="font-medium text-slate-900">{deletingSubject.subjectName}</span> from
              the list. This action cannot be undone in this mock UI.
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setDeletingSubject(null)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
