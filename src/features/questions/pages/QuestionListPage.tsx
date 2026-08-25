import { ArrowLeft, BookOpen, FileSpreadsheet, Plus, Search, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Input } from '../../../components/ui/Input'
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
import { QuestionForm } from '../components/QuestionForm'
import { QuestionItem, QuestionTableRow } from '../components/QuestionItem'
import type {
  Difficulty,
  QuestionFormValues,
  QuestionItem as QuestionItemType,
  QuestionType,
  SubjectOption,
} from '../types/question.types'

type ModalMode = 'create' | 'edit' | null
type ListStatus = 'loading' | 'ready'

const PAGE_SIZE = 10

const MOCK_SUBJECTS: SubjectOption[] = [
  { id: 1, subjectName: 'Software Engineering' },
  { id: 2, subjectName: 'Database Systems' },
  { id: 3, subjectName: 'Web Development' },
]

const MOCK_QUESTIONS: QuestionItemType[] = [
  {
    questionId: 1,
    subjectId: 1,
    content: 'Which of the following best describes a software requirement?',
    difficulty: 'EASY',
    explanation: 'A requirement states what the system should do, not how it is implemented.',
    type: 'SINGLE_CHOICE',
    options: [
      { content: 'A constraint on how code is formatted', isCorrect: false },
      { content: 'A statement of what the system should do', isCorrect: true },
      { content: 'A unit test written by developers', isCorrect: false },
      { content: 'A deployment script', isCorrect: false },
    ],
  },
  {
    questionId: 2,
    subjectId: 1,
    content: 'Select all typical activities in the software development life cycle.',
    difficulty: 'MEDIUM',
    explanation: null,
    type: 'MULTIPLE_CHOICE',
    options: [
      { content: 'Requirements analysis', isCorrect: true },
      { content: 'Design', isCorrect: true },
      { content: 'Hardware soldering', isCorrect: false },
      { content: 'Testing', isCorrect: true },
    ],
  },
  {
    questionId: 3,
    subjectId: 2,
    content: 'What does ACID stand for in database transactions?',
    difficulty: 'HARD',
    explanation: 'Atomicity, Consistency, Isolation, Durability.',
    type: 'SINGLE_CHOICE',
    options: [
      { content: 'Atomicity, Consistency, Isolation, Durability', isCorrect: true },
      { content: 'Access, Control, Index, Data', isCorrect: false },
      { content: 'Aggregate, Count, Insert, Delete', isCorrect: false },
    ],
  },
  {
    questionId: 4,
    subjectId: 2,
    content: 'Which statements about primary keys are true?',
    difficulty: 'MEDIUM',
    explanation: null,
    type: 'MULTIPLE_CHOICE',
    options: [
      { content: 'A primary key uniquely identifies a row', isCorrect: true },
      { content: 'A primary key can contain NULL values', isCorrect: false },
      { content: 'A table can have only one primary key', isCorrect: true },
    ],
  },
  {
    questionId: 5,
    subjectId: 3,
    content: 'Which HTTP method is typically used to create a new resource?',
    difficulty: 'EASY',
    explanation: 'POST is commonly used to create resources.',
    type: 'SINGLE_CHOICE',
    options: [
      { content: 'GET', isCorrect: false },
      { content: 'POST', isCorrect: true },
      { content: 'HEAD', isCorrect: false },
    ],
  },
  {
    questionId: 6,
    subjectId: 3,
    content: 'Select valid ways to persist data in a React SPA without a backend.',
    difficulty: 'VERY_HARD',
    explanation: null,
    type: 'MULTIPLE_CHOICE',
    options: [
      { content: 'localStorage', isCorrect: true },
      { content: 'sessionStorage', isCorrect: true },
      { content: 'IndexedDB', isCorrect: true },
      { content: 'SQL Server stored procedures', isCorrect: false },
    ],
  },
  {
    questionId: 7,
    subjectId: 1,
    content: 'Apply SOLID principles: which change would most improve a God class that mixes UI, API, and DB logic?',
    difficulty: 'APPLICATION',
    explanation: 'Split responsibilities into smaller, focused modules.',
    type: 'SINGLE_CHOICE',
    options: [
      { content: 'Add more static methods', isCorrect: false },
      { content: 'Split UI, API, and persistence into separate layers', isCorrect: true },
      { content: 'Increase the class name length', isCorrect: false },
    ],
  },
  {
    questionId: 8,
    subjectId: 2,
    content: 'Which isolation levels can reduce dirty reads?',
    difficulty: 'HARD',
    explanation: null,
    type: 'MULTIPLE_CHOICE',
    options: [
      { content: 'READ UNCOMMITTED', isCorrect: false },
      { content: 'READ COMMITTED', isCorrect: true },
      { content: 'SERIALIZABLE', isCorrect: true },
    ],
  },
]

function resolveSubjectName(subjectId: number) {
  return MOCK_SUBJECTS.find((subject) => subject.id === subjectId)?.subjectName ?? `Môn #${subjectId}`
}

function questionMatchesSearch(question: QuestionItemType, query: string) {
  const keyword = query.trim().toLowerCase()
  if (!keyword) return true

  const searchableText = [
    question.content,
    question.explanation ?? '',
    ...question.options.map((option) => option.content),
  ]
    .join(' ')
    .toLowerCase()

  return searchableText.includes(keyword)
}

export function QuestionListPage() {
  const [status, setStatus] = useState<ListStatus>('loading')
  const [questions, setQuestions] = useState<QuestionItemType[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<QuestionType | ''>('')
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | ''>('')
  const [page, setPage] = useState(0)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingQuestion, setEditingQuestion] = useState<QuestionItemType | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuestions(MOCK_QUESTIONS)
      setStatus('ready')
    }, 700)

    return () => window.clearTimeout(timer)
  }, [])

  const questionCountBySubject = useMemo(() => {
    const counts = new Map<number, number>()
    for (const question of questions) {
      counts.set(question.subjectId, (counts.get(question.subjectId) ?? 0) + 1)
    }
    return counts
  }, [questions])

  const selectedSubjectName = selectedSubjectId ? resolveSubjectName(selectedSubjectId) : ''

  const filteredQuestions = useMemo(() => {
    if (!selectedSubjectId) return []

    return questions.filter((question) => {
      if (question.subjectId !== selectedSubjectId) return false
      if (typeFilter && question.type !== typeFilter) return false
      if (difficultyFilter && question.difficulty !== difficultyFilter) return false
      if (!questionMatchesSearch(question, searchQuery)) return false
      return true
    })
  }, [questions, selectedSubjectId, typeFilter, difficultyFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pagedQuestions = filteredQuestions.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  function selectSubject(subjectId: number) {
    setSelectedSubjectId(subjectId)
    setSearchQuery('')
    setTypeFilter('')
    setDifficultyFilter('')
    setPage(0)
  }

  function backToSubjectPicker() {
    setSelectedSubjectId(null)
    setSearchQuery('')
    setTypeFilter('')
    setDifficultyFilter('')
    setPage(0)
  }

  function openCreate() {
    setFormError(null)
    setEditingQuestion(null)
    setModalMode('create')
  }

  function openEdit(question: QuestionItemType) {
    setFormError(null)
    setEditingQuestion(question)
    setModalMode('edit')
  }

  function closeModal() {
    if (isFormSubmitting) return
    setModalMode(null)
    setEditingQuestion(null)
    setFormError(null)
  }

  async function handleSubmit(values: QuestionFormValues) {
    setFormError(null)
    setIsFormSubmitting(true)
    await new Promise((resolve) => window.setTimeout(resolve, 350))

    if (modalMode === 'create') {
      const nextId = questions.reduce((max, item) => Math.max(max, item.questionId), 0) + 1
      setQuestions((current) => [
        {
          questionId: nextId,
          ...values,
          explanation: values.explanation || null,
          subjectName: resolveSubjectName(values.subjectId),
        },
        ...current,
      ])
    }

    if (modalMode === 'edit' && editingQuestion) {
      setQuestions((current) =>
        current.map((item) =>
          item.questionId === editingQuestion.questionId
            ? {
                ...item,
                ...values,
                explanation: values.explanation || null,
                subjectName: resolveSubjectName(values.subjectId),
              }
            : item,
        ),
      )
    }

    setIsFormSubmitting(false)
    setModalMode(null)
    setEditingQuestion(null)
  }

  const selectClassName =
    'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Question bank</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Question management</h1>
        <p className="mt-1 text-sm text-slate-500">
          {selectedSubjectId
            ? `Browse and manage questions for ${selectedSubjectName}.`
            : 'Select a subject to view and manage its question bank.'}
        </p>
      </div>

      {status === 'loading' ? <Spinner label="Loading questions..." /> : null}

      {status === 'ready' && !selectedSubjectId ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_SUBJECTS.map((subject) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => selectSubject(subject.id)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="mb-3 inline-flex rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <BookOpen className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className="font-semibold text-slate-900">{subject.subjectName}</p>
              <p className="mt-1 text-sm text-slate-500">
                {questionCountBySubject.get(subject.id) ?? 0} questions
              </p>
            </button>
          ))}
        </div>
      ) : null}

      {status === 'ready' && selectedSubjectId ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={backToSubjectPicker}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Change subject
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" className="w-full sm:w-auto" disabled title="Sắp ra mắt">
                <FileSpreadsheet className="h-4 w-4" strokeWidth={1.75} />
                Import Excel
              </Button>
              <Button variant="secondary" className="w-full sm:w-auto" disabled title="Sắp ra mắt">
                <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                AI generate
              </Button>
              <Button onClick={openCreate} className="w-full sm:w-auto">
                <Plus className="h-4 w-4" strokeWidth={2} />
                Add question
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-900">{selectedSubjectName}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {questions.filter((question) => question.subjectId === selectedSubjectId).length} questions in this
              subject
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                placeholder="Search question, answer, explanation..."
                className="pl-9"
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setPage(0)
                }}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as QuestionType | '')
                setPage(0)
              }}
              className={`${selectClassName} w-full lg:w-44`}
            >
              <option value="">All types</option>
              <option value="SINGLE_CHOICE">Một đáp án</option>
              <option value="MULTIPLE_CHOICE">Nhiều đáp án</option>
            </select>
            <select
              value={difficultyFilter}
              onChange={(event) => {
                setDifficultyFilter(event.target.value as Difficulty | '')
                setPage(0)
              }}
              className={`${selectClassName} w-full lg:w-44`}
            >
              <option value="">All difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
              <option value="VERY_HARD">Very hard</option>
              <option value="APPLICATION">Application</option>
            </select>
          </div>

          {filteredQuestions.length === 0 ? (
            <EmptyState
              title={searchQuery || typeFilter || difficultyFilter ? 'No matching questions' : 'No questions yet'}
              description={
                searchQuery || typeFilter || difficultyFilter
                  ? 'Try different keywords or clear filters.'
                  : 'Add your first question for this subject.'
              }
              action={
                searchQuery || typeFilter || difficultyFilter ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchQuery('')
                      setTypeFilter('')
                      setDifficultyFilter('')
                      setPage(0)
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Add question
                  </Button>
                )
              }
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100 md:hidden">
                {pagedQuestions.map((question) => (
                  <QuestionItem key={question.questionId} question={question} onEdit={openEdit} />
                ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableColGroup>
                    <TableCol />
                    <TableCol width="8.5rem" />
                    <TableCol width="7.5rem" />
                    <TableCol width="4.5rem" />
                    <TableCol width="11.5rem" />
                  </TableColGroup>
                  <TableHeader>
                    <TableRow className="border-b-0 hover:bg-transparent">
                      <TableHead>Question</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Options</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedQuestions.map((question) => (
                      <QuestionTableRow key={question.questionId} question={question} onEdit={openEdit} />
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                <p>
                  Page {currentPage + 1} / {totalPages} · {filteredQuestions.length} questions
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="h-9"
                    disabled={currentPage === 0}
                    onClick={() => setPage((value) => Math.max(0, value - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-9"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <button type="button" className="hidden flex-1 cursor-default sm:block" aria-label="Close panel" onClick={closeModal} />
          <aside className="flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                  {modalMode === 'create' ? 'Create' : 'Edit'}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {modalMode === 'create' ? 'Add question' : 'Edit question'}
                </h2>
                {selectedSubjectId ? (
                  <p className="mt-0.5 text-sm text-slate-500">{selectedSubjectName}</p>
                ) : null}
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
            <div className="overflow-y-auto px-5 py-4">
              <QuestionForm
                mode={modalMode}
                initialValues={editingQuestion ?? undefined}
                subjectOptions={MOCK_SUBJECTS}
                lockedSubjectId={modalMode === 'create' ? (selectedSubjectId ?? undefined) : undefined}
                isSubmitting={isFormSubmitting}
                submitError={formError}
                onSubmit={handleSubmit}
                onCancel={closeModal}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  )
}
