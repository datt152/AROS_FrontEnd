import { Library, Plus, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

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
import { useQuestions } from '../../questions/hooks/useQuestions'
import { useTopics } from '../../questions/hooks/useTopics'
import { useSubjects } from '../../subjects/hooks/useSubjects'
import { ExamTemplateForm } from '../components/ExamTemplateForm'
import { ExamTemplateCard, ExamTemplateTableRow } from '../components/ExamTemplateItem'
import {
  useCreateExamTemplate,
  useDeleteExamTemplate,
  useExamTemplate,
  useExamTemplates,
  useUpdateExamTemplate,
} from '../hooks/useExamTemplates'
import type { ExamTemplateFormValues, ExamTemplateItem } from '../types/examTemplate.types'

type ModalMode = 'create' | 'edit' | null

const PAGE_SIZE = 20

export function ExamTemplateListPage() {
  const subjectsQuery = useSubjects()
  const createTemplate = useCreateExamTemplate()
  const updateTemplate = useUpdateExamTemplate()
  const deleteTemplate = useDeleteExamTemplate()

  const [subjectFilter, setSubjectFilter] = useState<number | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formSubjectId, setFormSubjectId] = useState<number | undefined>(undefined)
  const [formError, setFormError] = useState<string | null>(null)

  const [deletingTemplate, setDeletingTemplate] = useState<ExamTemplateItem | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const templatesQuery = useExamTemplates({
    subjectId: subjectFilter === '' ? undefined : subjectFilter,
    page,
    size: PAGE_SIZE,
  })

  const detailQuery = useExamTemplate(editingId ?? undefined)

  const questionsSubjectId = formSubjectId ?? detailQuery.data?.subjectId
  const questionsQuery = useQuestions(
    questionsSubjectId && questionsSubjectId > 0
      ? { subjectId: questionsSubjectId, page: 0, size: 500 }
      : undefined,
  )
  const topicsQuery = useTopics(
    questionsSubjectId && questionsSubjectId > 0
      ? { subjectId: questionsSubjectId, page: 0, size: 50 }
      : undefined,
  )

  const subjects = subjectsQuery.data ?? []
  const subjectOptions = useMemo(
    () => subjects.map((item) => ({ id: item.id, subjectName: item.subjectName })),
    [subjects],
  )
  const questionOptions = useMemo(
    () =>
      (questionsQuery.data?.items ?? []).map((item) => ({
        questionId: item.questionId,
        content: item.content,
        type: item.type,
        subjectId: item.subjectId,
        topicId: item.topicId ?? null,
        difficulty: item.difficulty ?? undefined,
      })),
    [questionsQuery.data?.items],
  )
  const topicOptions = useMemo(
    () => (topicsQuery.data?.items ?? []).map((item) => ({ id: item.id, name: item.name })),
    [topicsQuery.data?.items],
  )

  const templates = templatesQuery.data?.items ?? []
  const filteredTemplates = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) return templates
    return templates.filter((item) => item.title.toLowerCase().includes(keyword))
  }, [templates, searchQuery])

  const totalPages = Math.max(1, templatesQuery.data?.totalPages ?? 1)
  const isFormSubmitting = createTemplate.isPending || updateTemplate.isPending

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  function openCreate() {
    setFormError(null)
    setEditingId(null)
    setFormSubjectId(undefined)
    setModalMode('create')
  }

  function openEdit(template: ExamTemplateItem) {
    setFormError(null)
    setEditingId(template.id)
    setFormSubjectId(template.subjectId)
    setModalMode('edit')
  }

  function closeModal() {
    if (isFormSubmitting) return
    setModalMode(null)
    setEditingId(null)
    setFormError(null)
    setFormSubjectId(undefined)
  }

  async function handleSubmit(values: ExamTemplateFormValues) {
    setFormError(null)
    const payload = {
      title: values.title.trim(),
      subjectId: Number(values.subjectId),
      questionIds: values.questionIds,
    }

    try {
      if (modalMode === 'create') {
        await createTemplate.mutateAsync(payload)
        setToast('Đã tạo template')
      } else if (editingId) {
        await updateTemplate.mutateAsync({ id: editingId, payload })
        setToast('Đã lưu template')
      }
      closeModal()
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Không thể lưu template'))
    }
  }

  async function confirmDelete() {
    if (!deletingTemplate) return
    setDeleteError(null)
    try {
      await deleteTemplate.mutateAsync(deletingTemplate.id)
      setDeletingTemplate(null)
      setToast('Đã xóa template')
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, 'Không thể xóa template'))
    }
  }

  const selectClassName =
    'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

  const editingInitial =
    modalMode === 'edit' && detailQuery.data
      ? detailQuery.data
      : modalMode === 'edit' && editingId
        ? templates.find((item) => item.id === editingId)
        : undefined

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Thư viện đề</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Thư viện đề</h1>
          <p className="mt-1 text-sm text-slate-500">
            Chỉ cần tiêu đề, môn và câu hỏi. Khi tạo kỳ thi / luyện tập chọn “Theo bộ đề” để dùng lại.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Tạo template
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            placeholder="Tìm theo tiêu đề..."
            className="pl-9"
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <select
          value={subjectFilter}
          onChange={(event) => {
            setSubjectFilter(event.target.value === '' ? '' : Number(event.target.value))
            setPage(0)
          }}
          className={`${selectClassName} w-full lg:w-52`}
        >
          <option value="">Tất cả môn</option>
          {subjectOptions.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subjectName}
            </option>
          ))}
        </select>
      </div>

      {templatesQuery.isLoading ? <Spinner label="Đang tải thư viện đề..." /> : null}
      {templatesQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(templatesQuery.error, 'Không thể tải thư viện đề')}
          action={
            <Button variant="secondary" onClick={() => void templatesQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : null}

      {templatesQuery.isSuccess && filteredTemplates.length === 0 ? (
        <EmptyState
          title="Chưa có template"
          description="Tạo mới với tiêu đề, môn và câu hỏi."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              Tạo template
            </Button>
          }
        />
      ) : null}

      {templatesQuery.isSuccess && filteredTemplates.length > 0 ? (
        <>
          <div className="space-y-3 md:hidden">
            {filteredTemplates.map((template) => (
              <ExamTemplateCard
                key={template.id}
                template={template}
                onEdit={openEdit}
                onDelete={(item) => {
                  setDeleteError(null)
                  setDeletingTemplate(item)
                }}
              />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <Table>
              <TableColGroup>
                <TableCol />
                <TableCol width="5rem" />
                <TableCol width="8rem" />
                <TableCol width="12rem" />
              </TableColGroup>
              <TableHeader>
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Câu</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <ExamTemplateTableRow
                    key={template.id}
                    template={template}
                    onEdit={openEdit}
                    onDelete={(item) => {
                      setDeleteError(null)
                      setDeletingTemplate(item)
                    }}
                  />
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
              <p>
                Trang {page + 1} / {totalPages} · {templatesQuery.data?.totalElements ?? 0} template
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="h-9"
                  disabled={page === 0}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="secondary"
                  className="h-9"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <button type="button" className="hidden flex-1 cursor-default sm:block" aria-label="Đóng" onClick={closeModal} />
          <aside className="flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                  {modalMode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {modalMode === 'create' ? 'Tạo template' : 'Sửa template'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isFormSubmitting}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              {modalMode === 'edit' && detailQuery.isLoading ? (
                <Spinner label="Đang tải template..." />
              ) : (
                <ExamTemplateForm
                  key={`${modalMode}-${editingId ?? 'new'}-${detailQuery.dataUpdatedAt}`}
                  mode={modalMode}
                  initialValues={editingInitial}
                  subjectOptions={subjectOptions}
                  questionOptions={questionOptions}
                  topicOptions={topicOptions}
                  isSubmitting={isFormSubmitting}
                  submitError={formError}
                  onSubjectChange={setFormSubjectId}
                  onSubmit={handleSubmit}
                  onCancel={closeModal}
                />
              )}
            </div>
          </aside>
        </div>
      ) : null}

      {deletingTemplate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">Xóa template?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Xóa <span className="font-medium text-slate-900">{deletingTemplate.title}</span> khỏi thư
              viện.
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
                disabled={deleteTemplate.isPending}
                onClick={() => setDeletingTemplate(null)}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                disabled={deleteTemplate.isPending}
                onClick={() => void confirmDelete()}
              >
                {deleteTemplate.isPending ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[70] max-w-sm rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-xl">
          <div className="flex items-start gap-2">
            <Library className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" strokeWidth={1.75} />
            <p>{toast}</p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
