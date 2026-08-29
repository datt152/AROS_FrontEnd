import { ArrowLeft, BookOpen, FolderOpen, Plus, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { INTERACTIVE_CARD_HOVER_CLASS } from '../../../constants/ui'
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
import { TopicForm } from '../components/TopicForm'
import { TopicItem } from '../components/TopicItem'
import {
  useCreateQuestion,
  useDeleteQuestion,
  useQuestionCounts,
  useQuestions,
  useUpdateQuestion,
} from '../hooks/useQuestions'
import {
  useCreateTopic,
  useDeleteTopic,
  useTopics,
  useUpdateTopic,
} from '../hooks/useTopics'
import type {
  Difficulty,
  QuestionFormValues,
  QuestionItem as QuestionItemType,
  QuestionType,
} from '../types/question.types'
import { DIFFICULTY_LABEL } from '../types/question.types'
import type { TopicFormValues, TopicItem as TopicItemType } from '../types/topic.types'

type QuestionModalMode = 'create' | 'edit' | null
type TopicModalMode = 'create' | 'edit' | null

const PAGE_SIZE = 10
const FILTER_FETCH_SIZE = 200
const TOPIC_PAGE_SIZE = 50
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
  const createTopic = useCreateTopic()
  const updateTopic = useUpdateTopic()
  const deleteTopic = useDeleteTopic()

  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<TopicItemType | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<QuestionType | ''>('')
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | ''>('')
  const [page, setPage] = useState(0)

  const [questionModalMode, setQuestionModalMode] = useState<QuestionModalMode>(null)
  const [editingQuestion, setEditingQuestion] = useState<QuestionItemType | null>(null)
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionItemType | null>(null)
  const [questionFormError, setQuestionFormError] = useState<string | null>(null)
  const [questionDeleteError, setQuestionDeleteError] = useState<string | null>(null)
  const [formSubjectId, setFormSubjectId] = useState<number | undefined>(undefined)

  const [topicModalMode, setTopicModalMode] = useState<TopicModalMode>(null)
  const [editingTopic, setEditingTopic] = useState<TopicItemType | null>(null)
  const [deletingTopic, setDeletingTopic] = useState<TopicItemType | null>(null)
  const [topicFormError, setTopicFormError] = useState<string | null>(null)
  const [topicDeleteError, setTopicDeleteError] = useState<string | null>(null)

  const subjects = subjectsQuery.data ?? []
  const subjectIds = subjects.map((subject) => subject.id)
  const countQueries = useQuestionCounts(subjectIds)

  const topicsQuery = useTopics(
    selectedSubjectId
      ? { subjectId: selectedSubjectId, page: 0, size: TOPIC_PAGE_SIZE }
      : undefined,
  )

  const formTopicsSubjectId =
    formSubjectId ?? selectedSubjectId ?? editingQuestion?.subjectId ?? undefined
  const formTopicsQuery = useTopics(
    questionModalMode && formTopicsSubjectId
      ? { subjectId: formTopicsSubjectId, page: 0, size: TOPIC_PAGE_SIZE }
      : undefined,
  )

  const hasClientFilters = Boolean(searchQuery.trim() || typeFilter || difficultyFilter)

  const questionsQuery = useQuestions(
    selectedTopic
      ? {
          topicId: selectedTopic.id,
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

  const topicOptions = useMemo(
    () => (formTopicsQuery.data?.items ?? []).map((topic) => ({ id: topic.id, name: topic.name })),
    [formTopicsQuery.data?.items],
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

  const isQuestionFormSubmitting = createQuestion.isPending || updateQuestion.isPending
  const isTopicFormSubmitting = createTopic.isPending || updateTopic.isPending

  const totalQuestionLabel = hasClientFilters
    ? filteredQuestions.length
    : (questionsQuery.data?.totalElements ?? filteredQuestions.length)

  const selectClassName =
    'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

  function selectSubject(subjectId: number) {
    setSelectedSubjectId(subjectId)
    setSelectedTopic(null)
    resetQuestionFilters()
  }

  function backToSubjectPicker() {
    setSelectedSubjectId(null)
    setSelectedTopic(null)
    resetQuestionFilters()
  }

  function backToTopicList() {
    setSelectedTopic(null)
    resetQuestionFilters()
  }

  function resetQuestionFilters() {
    setSearchQuery('')
    setTypeFilter('')
    setDifficultyFilter('')
    setPage(0)
  }

  function openCreateQuestion() {
    setQuestionFormError(null)
    setEditingQuestion(null)
    setFormSubjectId(selectedSubjectId ?? undefined)
    setQuestionModalMode('create')
  }

  function openEditQuestion(question: QuestionItemType) {
    setQuestionFormError(null)
    setEditingQuestion(question)
    setFormSubjectId(question.subjectId)
    setQuestionModalMode('edit')
  }

  function closeQuestionModal() {
    if (isQuestionFormSubmitting) return
    setQuestionModalMode(null)
    setEditingQuestion(null)
    setQuestionFormError(null)
    setFormSubjectId(undefined)
  }

  function openCreateTopic() {
    setTopicFormError(null)
    setEditingTopic(null)
    setTopicModalMode('create')
  }

  function openEditTopic(topic: TopicItemType) {
    setTopicFormError(null)
    setEditingTopic(topic)
    setTopicModalMode('edit')
  }

  function closeTopicModal() {
    if (isTopicFormSubmitting) return
    setTopicModalMode(null)
    setEditingTopic(null)
    setTopicFormError(null)
  }

  async function handleQuestionSubmit(values: QuestionFormValues) {
    setQuestionFormError(null)
    try {
      if (questionModalMode === 'create') {
        await createQuestion.mutateAsync(values)
      }
      if (questionModalMode === 'edit' && editingQuestion) {
        await updateQuestion.mutateAsync({ id: editingQuestion.questionId, payload: values })
      }
      closeQuestionModal()
    } catch (error) {
      setQuestionFormError(getApiErrorMessage(error, 'Không thể lưu câu hỏi'))
    }
  }

  async function confirmDeleteQuestion() {
    if (!deletingQuestion) return
    setQuestionDeleteError(null)
    try {
      await deleteQuestion.mutateAsync(deletingQuestion.questionId)
      setDeletingQuestion(null)
    } catch (error) {
      setQuestionDeleteError(getApiErrorMessage(error, 'Không thể xóa câu hỏi'))
    }
  }

  async function handleTopicSubmit(values: TopicFormValues) {
    if (!selectedSubjectId) return
    setTopicFormError(null)
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
        displayOrder: Number(values.displayOrder),
        subjectId: selectedSubjectId,
      }
      if (topicModalMode === 'create') {
        await createTopic.mutateAsync(payload)
      }
      if (topicModalMode === 'edit' && editingTopic) {
        await updateTopic.mutateAsync({ id: editingTopic.id, payload })
        if (selectedTopic?.id === editingTopic.id) {
          setSelectedTopic({
            ...selectedTopic,
            name: payload.name,
            description: payload.description,
            displayOrder: payload.displayOrder,
          })
        }
      }
      closeTopicModal()
    } catch (error) {
      setTopicFormError(getApiErrorMessage(error, 'Không thể lưu chủ đề'))
    }
  }

  async function confirmDeleteTopic() {
    if (!deletingTopic) return
    setTopicDeleteError(null)
    try {
      await deleteTopic.mutateAsync(deletingTopic.id)
      if (selectedTopic?.id === deletingTopic.id) setSelectedTopic(null)
      setDeletingTopic(null)
    } catch (error) {
      setTopicDeleteError(
        getApiErrorMessage(error, 'Không xóa được vì còn câu hỏi'),
      )
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Ngân hàng câu hỏi</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Quản lý câu hỏi</h1>
        <p className="mt-1 text-sm text-slate-500">
          {!selectedSubjectId
            ? 'Chọn môn học → chủ đề → câu hỏi.'
            : !selectedTopic
              ? `Chủ đề trong môn ${selectedSubjectName}.`
              : `Câu hỏi thuộc ${selectedTopic.name}.`}
        </p>
      </div>

      {/* Level 0: subjects */}
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
                  className={`flex min-h-36 flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm ${INTERACTIVE_CARD_HOVER_CLASS}`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="inline-flex shrink-0 rounded-xl bg-blue-50 p-2.5 text-blue-600">
                      <BookOpen className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <p className="line-clamp-2 font-semibold text-slate-900">{subject.subjectName}</p>
                  </div>
                  <div className="text-sm text-slate-500">{subject.description}</div>
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

      {/* Level 1: topics in subject */}
      {selectedSubjectId && !selectedTopic ? (
        <>
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            <button type="button" className="font-medium text-blue-600 hover:text-blue-700" onClick={backToSubjectPicker}>
              Ngân hàng
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-800">{selectedSubjectName}</span>
          </nav>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={backToSubjectPicker}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Đổi môn học
            </Button>
            <Button onClick={openCreateTopic} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Thêm chủ đề
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-900">{selectedSubjectName}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {topicsQuery.data?.totalElements ?? topicsQuery.data?.items.length ?? 0} chủ đề
            </p>
          </div>

          {topicsQuery.isLoading ? <Spinner label="Đang tải chủ đề..." /> : null}
          {topicsQuery.isError ? (
            <ErrorState
              message={getApiErrorMessage(topicsQuery.error, 'Không thể tải chủ đề')}
              action={
                <Button variant="secondary" onClick={() => void topicsQuery.refetch()}>
                  Thử lại
                </Button>
              }
            />
          ) : null}
          {topicsQuery.isSuccess && (topicsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState
              title="Chưa có chủ đề"
              description="Tạo Chương 1, Chương 2… rồi thêm câu hỏi vào từng chủ đề."
              action={
                <Button onClick={openCreateTopic}>
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Thêm chủ đề
                </Button>
              }
            />
          ) : null}
          {topicsQuery.isSuccess && (topicsQuery.data?.items.length ?? 0) > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topicsQuery.data!.items.map((topic) => (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  onOpen={setSelectedTopic}
                  onEdit={openEditTopic}
                  onDelete={(item) => {
                    setTopicDeleteError(null)
                    setDeletingTopic(item)
                  }}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      {/* Level 2: questions in topic */}
      {selectedSubjectId && selectedTopic ? (
        <>
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            <button type="button" className="font-medium text-blue-600 hover:text-blue-700" onClick={backToSubjectPicker}>
              Ngân hàng
            </button>
            <span className="text-slate-300">/</span>
            <button type="button" className="font-medium text-blue-600 hover:text-blue-700" onClick={backToTopicList}>
              {selectedSubjectName}
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-800">{selectedTopic.name}</span>
          </nav>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={backToTopicList}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Về danh sách chủ đề
            </Button>
            <Button onClick={openCreateQuestion} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Thêm câu hỏi
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="inline-flex shrink-0 rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <FolderOpen className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{selectedTopic.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {totalQuestionLabel} câu hỏi · {selectedSubjectName}
                </p>
              </div>
            </div>
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
              title={
                searchQuery || typeFilter || difficultyFilter
                  ? 'Không tìm thấy câu hỏi phù hợp'
                  : 'Chưa có câu hỏi nào'
              }
              description={
                searchQuery || typeFilter || difficultyFilter
                  ? 'Thử từ khóa khác hoặc xóa bộ lọc.'
                  : 'Thêm câu hỏi đầu tiên cho chủ đề này.'
              }
              action={
                searchQuery || typeFilter || difficultyFilter ? (
                  <Button variant="secondary" onClick={resetQuestionFilters}>
                    Xóa bộ lọc
                  </Button>
                ) : (
                  <Button onClick={openCreateQuestion}>
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Thêm câu hỏi
                  </Button>
                )
              }
            />
          ) : null}
          {questionsQuery.isSuccess && filteredQuestions.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 md:hidden">
                {pagedQuestions.map((question) => (
                  <QuestionItem
                    key={question.questionId}
                    question={question}
                    onEdit={openEditQuestion}
                    onDelete={(item) => {
                      setQuestionDeleteError(null)
                      setDeletingQuestion(item)
                    }}
                  />
                ))}
              </div>
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
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
                          onEdit={openEditQuestion}
                          onDelete={(item) => {
                            setQuestionDeleteError(null)
                            setDeletingQuestion(item)
                          }}
                        />
                      ))}
                    </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
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

      {/* Topic modal */}
      {topicModalMode ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <button
            type="button"
            className="hidden flex-1 cursor-default sm:block"
            aria-label="Đóng bảng"
            onClick={closeTopicModal}
          />
          <aside className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                  {topicModalMode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {topicModalMode === 'create' ? 'Thêm chủ đề' : 'Sửa chủ đề'}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">{selectedSubjectName}</p>
              </div>
              <button
                type="button"
                onClick={closeTopicModal}
                disabled={isTopicFormSubmitting}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <TopicForm
                mode={topicModalMode}
                initialValues={editingTopic ?? undefined}
                isSubmitting={isTopicFormSubmitting}
                submitError={topicFormError}
                onSubmit={handleTopicSubmit}
                onCancel={closeTopicModal}
              />
            </div>
          </aside>
        </div>
      ) : null}

      {/* Question modal */}
      {questionModalMode ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <button
            type="button"
            className="hidden flex-1 cursor-default sm:block"
            aria-label="Đóng bảng"
            onClick={closeQuestionModal}
          />
          <aside className="flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                  {questionModalMode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {questionModalMode === 'create' ? 'Thêm câu hỏi' : 'Chỉnh sửa câu hỏi'}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {selectedSubjectName}
                  {selectedTopic ? ` · ${selectedTopic.name}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={closeQuestionModal}
                disabled={isQuestionFormSubmitting}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <QuestionForm
                mode={questionModalMode}
                initialValues={editingQuestion ?? undefined}
                subjectOptions={subjectOptions}
                topicOptions={topicOptions}
                lockedSubjectId={
                  questionModalMode === 'create' ? (selectedSubjectId ?? undefined) : undefined
                }
                lockedTopicId={
                  questionModalMode === 'create' ? (selectedTopic?.id ?? undefined) : undefined
                }
                topicsLoading={formTopicsQuery.isLoading}
                isSubmitting={isQuestionFormSubmitting}
                submitError={questionFormError}
                onSubjectChange={setFormSubjectId}
                onSubmit={handleQuestionSubmit}
                onCancel={closeQuestionModal}
              />
            </div>
          </aside>
        </div>
      ) : null}

      {deletingTopic ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">Xóa chủ đề?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Xóa <span className="font-medium text-slate-900">{deletingTopic.name}</span>. Không xóa được nếu
              còn câu hỏi active.
            </p>
            {topicDeleteError ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {topicDeleteError}
              </p>
            ) : null}
            <div className="mt-5 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={deleteTopic.isPending}
                onClick={() => setDeletingTopic(null)}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                disabled={deleteTopic.isPending}
                onClick={() => void confirmDeleteTopic()}
              >
                {deleteTopic.isPending ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </div>
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
            {questionDeleteError ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {questionDeleteError}
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
                onClick={() => void confirmDeleteQuestion()}
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
