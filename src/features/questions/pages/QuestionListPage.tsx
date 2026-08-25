import { ArrowLeft, BookOpen, FileSpreadsheet, Plus, Search, Sparkles, X } from 'lucide-react'

import { useMemo, useState } from 'react'



import { Button } from '../../../components/ui/Button'

import { EmptyState } from '../../../components/ui/EmptyState'

import { ErrorState } from '../../../components/ui/ErrorState'

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

import { getApiErrorMessage } from '../../../lib/apiError'

import { useSubjects } from '../../subjects/hooks/useSubjects'

import { QuestionForm } from '../components/QuestionForm'

import { QuestionItem, QuestionTableRow } from '../components/QuestionItem'

import {

  useCreateQuestion,

  useDeleteQuestion,

  useQuestionCounts,

  useQuestions,

  useUpdateQuestion,

} from '../hooks/useQuestions'

import type {

  Difficulty,

  QuestionFormValues,

  QuestionItem as QuestionItemType,

  QuestionType,

} from '../types/question.types'

import { DIFFICULTY_LABEL } from '../types/question.types'



type ModalMode = 'create' | 'edit' | null



const PAGE_SIZE = 10

const FILTER_FETCH_SIZE = 200

const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'VERY_HARD', 'APPLICATION']



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

  const subjectsQuery = useSubjects()

  const createQuestion = useCreateQuestion()

  const updateQuestion = useUpdateQuestion()

  const deleteQuestion = useDeleteQuestion()



  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)

  const [searchQuery, setSearchQuery] = useState('')

  const [typeFilter, setTypeFilter] = useState<QuestionType | ''>('')

  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | ''>('')

  const [page, setPage] = useState(0)



  const [modalMode, setModalMode] = useState<ModalMode>(null)

  const [editingQuestion, setEditingQuestion] = useState<QuestionItemType | null>(null)

  const [deletingQuestion, setDeletingQuestion] = useState<QuestionItemType | null>(null)

  const [formError, setFormError] = useState<string | null>(null)

  const [deleteError, setDeleteError] = useState<string | null>(null)



  const subjects = subjectsQuery.data ?? []

  const subjectIds = subjects.map((subject) => subject.id)

  const countQueries = useQuestionCounts(subjectIds)



  const hasClientFilters = Boolean(searchQuery.trim() || typeFilter || difficultyFilter)



  const questionsQuery = useQuestions(

    selectedSubjectId

      ? {

          subjectId: selectedSubjectId,

          page: hasClientFilters ? 0 : page,

          size: hasClientFilters ? FILTER_FETCH_SIZE : PAGE_SIZE,

        }

      : undefined,

  )



  const selectedSubjectName = useMemo(() => {

    if (!selectedSubjectId) return ''

    return subjects.find((subject) => subject.id === selectedSubjectId)?.subjectName ?? `Môn #${selectedSubjectId}`

  }, [selectedSubjectId, subjects])



  const subjectOptions = useMemo(

    () => subjects.map((subject) => ({ id: subject.id, subjectName: subject.subjectName })),

    [subjects],

  )



  const questionCountBySubject = useMemo(() => {

    const counts = new Map<number, number>()

    subjects.forEach((subject, index) => {

      counts.set(subject.id, countQueries[index]?.data ?? 0)

    })

    return counts

  }, [subjects, countQueries])



  const filteredQuestions = useMemo(() => {

    const items = questionsQuery.data?.items ?? []

    if (!hasClientFilters) return items



    return items.filter((question) => {

      if (typeFilter && question.type !== typeFilter) return false

      if (difficultyFilter && question.difficulty !== difficultyFilter) return false

      if (!questionMatchesSearch(question, searchQuery)) return false

      return true

    })

  }, [questionsQuery.data?.items, hasClientFilters, typeFilter, difficultyFilter, searchQuery])



  const totalPages = hasClientFilters

    ? Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE))

    : Math.max(1, questionsQuery.data?.totalPages ?? 1)



  const currentPage = Math.min(page, totalPages - 1)



  const pagedQuestions = hasClientFilters

    ? filteredQuestions.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

    : filteredQuestions



  const isFormSubmitting = createQuestion.isPending || updateQuestion.isPending



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



  function openDelete(question: QuestionItemType) {

    setDeleteError(null)

    setDeletingQuestion(question)

  }



  function closeModal() {

    if (isFormSubmitting) return

    setModalMode(null)

    setEditingQuestion(null)

    setFormError(null)

  }



  async function handleSubmit(values: QuestionFormValues) {

    setFormError(null)



    try {

      if (modalMode === 'create') {

        await createQuestion.mutateAsync(values)

      }



      if (modalMode === 'edit' && editingQuestion) {

        await updateQuestion.mutateAsync({ id: editingQuestion.questionId, payload: values })

      }



      setModalMode(null)

      setEditingQuestion(null)

    } catch (error) {

      setFormError(getApiErrorMessage(error, 'Không thể lưu câu hỏi'))

    }

  }



  async function confirmDelete() {

    if (!deletingQuestion) return

    setDeleteError(null)



    try {

      await deleteQuestion.mutateAsync(deletingQuestion.questionId)

      setDeletingQuestion(null)

    } catch (error) {

      setDeleteError(getApiErrorMessage(error, 'Không thể xóa câu hỏi'))

    }

  }



  const selectClassName =

    'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100'



  const totalQuestionLabel = hasClientFilters

    ? filteredQuestions.length

    : (questionsQuery.data?.totalElements ?? filteredQuestions.length)



  return (

    <section className="space-y-5">

      <div>

        <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Ngân hàng câu hỏi</p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Quản lý câu hỏi</h1>

        <p className="mt-1 text-sm text-slate-500">

          {selectedSubjectId

            ? `Xem và quản lý câu hỏi cho ${selectedSubjectName}.`

            : 'Chọn một môn học để xem và quản lý ngân hàng câu hỏi.'}

        </p>

      </div>



      {!selectedSubjectId ? (

        <>

          {subjectsQuery.isLoading ? <Spinner label="Đang tải môn học..." /> : null}



          {subjectsQuery.isError ? (

            <ErrorState

              message={getApiErrorMessage(subjectsQuery.error, 'Không thể tải danh sách môn học')}

              action={

                <Button variant="secondary" onClick={() => void subjectsQuery.refetch()}>

                  Thử lại

                </Button>

              }

            />

          ) : null}



          {subjectsQuery.isSuccess && subjects.length === 0 ? (

            <EmptyState

              title="Chưa có môn học nào"

              description="Tạo môn học trước khi xây dựng ngân hàng câu hỏi."

            />

          ) : null}



          {subjectsQuery.isSuccess && subjects.length > 0 ? (

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {subjects.map((subject, index) => (

                <button

                  key={subject.id}

                  type="button"

                  onClick={() => selectSubject(subject.id)}

                  className="flex min-h-36 flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"

                >

                  <div className="mb-3 flex items-center gap-3">
                    <div className="inline-flex shrink-0 rounded-xl bg-blue-50 p-2.5 text-blue-600">
                      <BookOpen className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <p className="line-clamp-2 font-semibold text-slate-900">{subject.subjectName}</p>
                  </div>


                  <p className="mt-auto pt-2 text-sm text-slate-500">

                    {countQueries[index]?.isLoading

                      ? 'Đang tải...'

                      : `${questionCountBySubject.get(subject.id) ?? 0} câu hỏi`}

                  </p>

                </button>

              ))}

            </div>

          ) : null}

        </>

      ) : null}



      {selectedSubjectId ? (

        <>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

            <Button variant="secondary" className="w-full sm:w-auto" onClick={backToSubjectPicker}>

              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />

              Đổi môn học

            </Button>

            <div className="flex flex-col gap-2 sm:flex-row">

              <Button variant="secondary" className="w-full sm:w-auto" disabled title="Sắp ra mắt">

                <FileSpreadsheet className="h-4 w-4" strokeWidth={1.75} />

                Nhập Excel

              </Button>

              <Button variant="secondary" className="w-full sm:w-auto" disabled title="Sắp ra mắt">

                <Sparkles className="h-4 w-4" strokeWidth={1.75} />

                Tạo bằng AI

              </Button>

              <Button onClick={openCreate} className="w-full sm:w-auto">

                <Plus className="h-4 w-4" strokeWidth={2} />

                Thêm câu hỏi

              </Button>

            </div>

          </div>



          <div className="rounded-2xl border border-slate-200 bg-white p-4">

            <p className="text-sm font-medium text-slate-900">{selectedSubjectName}</p>

            <p className="mt-0.5 text-xs text-slate-500">{totalQuestionLabel} câu hỏi trong môn này</p>

          </div>



          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center">

            <div className="relative min-w-0 flex-1">

              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input

                value={searchQuery}

                placeholder="Tìm câu hỏi, đáp án, giải thích..."

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

              <option value="">Tất cả loại</option>

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

              <option value="">Tất cả độ khó</option>

              {DIFFICULTIES.map((difficulty) => (

                <option key={difficulty} value={difficulty}>

                  {DIFFICULTY_LABEL[difficulty]}

                </option>

              ))}

            </select>

          </div>



          {questionsQuery.isLoading ? <Spinner label="Đang tải câu hỏi..." /> : null}



          {questionsQuery.isError ? (

            <ErrorState

              message={getApiErrorMessage(questionsQuery.error, 'Không thể tải câu hỏi')}

              action={

                <Button variant="secondary" onClick={() => void questionsQuery.refetch()}>

                  Thử lại

                </Button>

              }

            />

          ) : null}



          {questionsQuery.isSuccess && filteredQuestions.length === 0 ? (

            <EmptyState

              title={searchQuery || typeFilter || difficultyFilter ? 'Không tìm thấy câu hỏi phù hợp' : 'Chưa có câu hỏi nào'}

              description={

                searchQuery || typeFilter || difficultyFilter

                  ? 'Thử từ khóa khác hoặc xóa bộ lọc.'

                  : 'Thêm câu hỏi đầu tiên cho môn học này.'

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

                    Xóa bộ lọc

                  </Button>

                ) : (

                  <Button onClick={openCreate}>

                    <Plus className="h-4 w-4" strokeWidth={2} />

                    Thêm câu hỏi

                  </Button>

                )

              }

            />

          ) : null}



          {questionsQuery.isSuccess && filteredQuestions.length > 0 ? (

            <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex-1">

                <div className="divide-y divide-slate-200 md:hidden">

                  {pagedQuestions.map((question) => (

                    <QuestionItem

                      key={question.questionId}

                      question={question}

                      onEdit={openEdit}

                      onDelete={openDelete}

                    />

                  ))}

                </div>



                <div className="hidden md:block">

                  <Table>

                    <TableColGroup>

                      <TableCol />

                      <TableCol width="8.5rem" />

                      <TableCol width="7.5rem" />

                      <TableCol width="4.5rem" />

                      <TableCol width="12rem" />

                    </TableColGroup>

                    <TableHeader>

                      <TableRow className="border-b-0 hover:bg-transparent">

                        <TableHead>Câu hỏi</TableHead>

                        <TableHead>Loại</TableHead>

                        <TableHead>Độ khó</TableHead>

                        <TableHead>Đáp án</TableHead>

                        <TableHead>Thao tác</TableHead>

                      </TableRow>

                    </TableHeader>

                    <TableBody>

                      {pagedQuestions.map((question) => (

                        <QuestionTableRow

                          key={question.questionId}

                          question={question}

                          onEdit={openEdit}

                          onDelete={openDelete}

                        />

                      ))}

                    </TableBody>

                  </Table>

                </div>

              </div>



              <div className="mt-auto flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">

                <p>

                  Trang {currentPage + 1} / {totalPages} · {totalQuestionLabel} câu hỏi

                </p>

                <div className="flex gap-2">

                  <Button

                    variant="secondary"

                    className="h-9"

                    disabled={currentPage === 0}

                    onClick={() => setPage((value) => Math.max(0, value - 1))}

                  >

                    Trước

                  </Button>

                  <Button

                    variant="secondary"

                    className="h-9"

                    disabled={currentPage >= totalPages - 1}

                    onClick={() => setPage((value) => value + 1)}

                  >

                    Sau

                  </Button>

                </div>

              </div>

            </div>

          ) : null}

        </>

      ) : null}



      {modalMode ? (

        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">

          <button type="button" className="hidden flex-1 cursor-default sm:block" aria-label="Đóng bảng" onClick={closeModal} />

          <aside className="flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-2xl">

            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">

              <div>

                <p className="text-xs font-medium uppercase tracking-wider text-blue-600">

                  {modalMode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'}

                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-900">

                  {modalMode === 'create' ? 'Thêm câu hỏi' : 'Chỉnh sửa câu hỏi'}

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

                aria-label="Đóng"

              >

                <X className="h-4 w-4" strokeWidth={2} />

              </button>

            </div>

            <div className="overflow-y-auto px-5 py-4">

              <QuestionForm

                mode={modalMode}

                initialValues={editingQuestion ?? undefined}

                subjectOptions={subjectOptions}

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



      {deletingQuestion ? (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">

          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">

            <h3 className="text-base font-semibold text-slate-900">Xóa câu hỏi?</h3>

            <p className="mt-2 text-sm text-slate-600">

              Thao tác này sẽ xóa vĩnh viễn{' '}

              <span className="font-medium text-slate-900">

                {deletingQuestion.content.length > 80

                  ? `${deletingQuestion.content.slice(0, 80)}…`

                  : deletingQuestion.content}

              </span>{' '}

              khỏi ngân hàng câu hỏi.

            </p>

            {deleteError ? (

              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">

                {deleteError}

              </p>

            ) : null}

            <div className="mt-5 flex gap-2">

              <Button

                variant="secondary"

                className="flex-1"

                disabled={deleteQuestion.isPending}

                onClick={() => setDeletingQuestion(null)}

              >

                Hủy

              </Button>

              <Button

                variant="danger"

                className="flex-1"

                disabled={deleteQuestion.isPending}

                onClick={() => void confirmDelete()}

              >

                {deleteQuestion.isPending ? 'Đang xóa...' : 'Xóa'}

              </Button>

            </div>

          </div>

        </div>

      ) : null}

    </section>

  )

}

