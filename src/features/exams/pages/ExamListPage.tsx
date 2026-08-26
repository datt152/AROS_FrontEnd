import { BarChart3, ClipboardList, Plus, Printer, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
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
import { ROUTES } from '../../../routes/routes.config'
import { useClassrooms } from '../../classrooms/hooks/useClassrooms'
import { useQuestions } from '../../questions/hooks/useQuestions'
import { useTopics } from '../../questions/hooks/useTopics'
import { useSubjects } from '../../subjects/hooks/useSubjects'
import { toRawPointsPayload } from '../api/exams.api'
import { ExamAssignClassroomsModal } from '../components/ExamAssignClassroomsModal'
import { ExamDetailPanel } from '../components/ExamDetailPanel'
import { ExamForm } from '../components/ExamForm'
import { ExamItem, ExamTableRow } from '../components/ExamItem'
import { ExamOpenModal } from '../components/ExamOpenModal'
import { ExamVersionGenerateModal } from '../components/ExamVersionGenerateModal'
import { ExamVersionPreview } from '../components/ExamVersionPreview'
import {
  useCreateExam,
  useCreateExamVersions,
  useDeleteExam,
  useExam,
  useExamClassrooms,
  useExams,
  useExamVersionDetail,
  useExamVersions,
  useExamVersionsMany,
  useSaveExamAsTemplate,
  useUpdateExam,
  useUpdateExamClassrooms,
} from '../hooks/useExams'
import type {
  ExamCreateFormValues,
  ExamItem as ExamItemType,
  ExamMode,
  ExamOpenValues,
  ExamStatus,
  ExamUpdateFormValues,
  ExamUpdatePayload,
  ExamVersionCreateValues,
  QuestionPickItem,
} from '../types/exam.types'

type ModalMode = 'create' | 'edit' | null

const FETCH_SIZE = 100
const PAGE_SIZE = 5

function buildUpdatePayload(
  exam: ExamItemType,
  patch: Partial<ExamUpdatePayload>,
): ExamUpdatePayload {
  return {
    title: patch.title ?? exam.title,
    duration: patch.duration ?? exam.duration,
    examMode: patch.examMode ?? exam.examMode,
    subjectId: patch.subjectId ?? exam.subjectId,
    maxScore: patch.maxScore ?? exam.maxScore,
    status: patch.status === undefined ? undefined : patch.status,
    startAt: patch.startAt === undefined ? exam.startAt ?? null : patch.startAt,
    endAt: patch.endAt === undefined ? exam.endAt ?? null : patch.endAt,
    config: patch.config === undefined ? exam.config ?? null : patch.config,
  }
}

export function ExamListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const subjectsQuery = useSubjects()
  const classroomsQuery = useClassrooms()
  const examsQuery = useExams({ page: 0, size: FETCH_SIZE, purpose: 'EXAM' })

  const createExam = useCreateExam()
  const updateExam = useUpdateExam()
  const deleteExam = useDeleteExam()
  const updateClassrooms = useUpdateExamClassrooms()
  const createVersions = useCreateExamVersions()
  const saveAsTemplate = useSaveExamAsTemplate()

  const [subjectFilter, setSubjectFilter] = useState<number | ''>('')
  const [modeFilter, setModeFilter] = useState<ExamMode | ''>('')
  const [statusFilter, setStatusFilter] = useState<ExamStatus | ''>('')
  const [page, setPage] = useState(0)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingExam, setEditingExam] = useState<ExamItemType | null>(null)
  const [deletingExam, setDeletingExam] = useState<ExamItemType | null>(null)
  const [detailExamId, setDetailExamId] = useState<number | null>(null)
  const [versionExam, setVersionExam] = useState<ExamItemType | null>(null)
  const [assignExam, setAssignExam] = useState<ExamItemType | null>(null)
  const [openExam, setOpenExam] = useState<ExamItemType | null>(null)
  const [previewCode, setPreviewCode] = useState<string | null>(null)
  const [saveAsTemplateError, setSaveAsTemplateError] = useState<string | null>(null)

  const [formSubjectId, setFormSubjectId] = useState<number | undefined>(undefined)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [versionError, setVersionError] = useState<string | null>(null)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [openError, setOpenError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const detailQuery = useExam(detailExamId ?? undefined)
  const detailVersionsQuery = useExamVersions(detailExamId ?? undefined)
  const detailClassroomsQuery = useExamClassrooms(detailExamId ?? undefined)
  const openVersionsQuery = useExamVersions(openExam?.id)

  const questionsSubjectId =
    formSubjectId ?? editingExam?.subjectId ?? detailQuery.data?.subjectId
  const questionsQuery = useQuestions(
    questionsSubjectId
      ? {
          subjectId: questionsSubjectId,
          page: 0,
          size: 500,
        }
      : undefined,
  )

  const topicsQuery = useTopics(
    questionsSubjectId
      ? {
          subjectId: questionsSubjectId,
          page: 0,
          size: 50,
        }
      : undefined,
  )

  const questionOptions: QuestionPickItem[] = useMemo(
    () =>
      (questionsQuery.data?.items ?? []).map((question) => ({
        questionId: question.questionId,
        content: question.content,
        type: question.type,
        difficulty: question.difficulty ?? undefined,
        subjectId: question.subjectId,
        topicId: question.topicId ?? null,
        topicName: question.topicName ?? null,
      })),
    [questionsQuery.data?.items],
  )

  const topicOptions = useMemo(
    () => (topicsQuery.data?.items ?? []).map((topic) => ({ id: topic.id, name: topic.name })),
    [topicsQuery.data?.items],
  )

  const detailQuestionsFromBank = useMemo(() => {
    const ids = detailQuery.data?.questionIds ?? []
    if (ids.length === 0) return []
    const byId = new Map(questionOptions.map((question) => [question.questionId, question]))
    return ids
      .map((id) => byId.get(id))
      .filter((question): question is QuestionPickItem => question !== undefined)
  }, [detailQuery.data?.questionIds, questionOptions])

  const detailFallbackVersionCode =
    detailExamId &&
    !(detailQuery.data?.questions?.length) &&
    detailQuestionsFromBank.length === 0 &&
    !questionsQuery.isFetching
      ? detailVersionsQuery.data?.[0]
      : undefined

  const detailQuestionsVersionQuery = useExamVersionDetail(
    detailFallbackVersionCode ? detailExamId! : undefined,
    detailFallbackVersionCode,
  )

  const previewQuery = useExamVersionDetail(
    previewCode ? (detailExamId ?? openExam?.id ?? versionExam?.id ?? undefined) : undefined,
    previewCode ?? undefined,
  )

  const exams = examsQuery.data?.items ?? []

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      if (subjectFilter && exam.subjectId !== subjectFilter) return false
      if (modeFilter && exam.examMode !== modeFilter) return false
      if (statusFilter && exam.status !== statusFilter) return false
      return true
    })
  }, [exams, subjectFilter, modeFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pagedExams = filteredExams.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  const draftIdsOnPage = pagedExams.filter((exam) => exam.status === 'DRAFT').map((exam) => exam.id)
  const versionQueries = useExamVersionsMany(draftIdsOnPage)

  const examsWithVersions = useMemo(() => {
    return pagedExams.map((exam) => {
      if (exam.status !== 'DRAFT') return exam
      const index = draftIdsOnPage.indexOf(exam.id)
      const codes = index >= 0 ? versionQueries[index]?.data : undefined
      return codes ? { ...exam, versionCodes: codes } : exam
    })
  }, [pagedExams, draftIdsOnPage, versionQueries])

  const detailExam = useMemo(() => {
    if (!detailQuery.data) return null

    let questions = detailQuery.data.questions
    if (!questions?.length && detailQuestionsFromBank.length > 0) {
      questions = detailQuestionsFromBank
    }
    if (!questions?.length && detailQuestionsVersionQuery.data?.questions?.length) {
      questions = detailQuestionsVersionQuery.data.questions.map((question) => ({
        questionId: question.originalQuestionId,
        content: question.content,
        type: question.type,
        subjectId: detailQuery.data.subjectId,
      }))
    }

    return {
      ...detailQuery.data,
      versionCodes: detailVersionsQuery.data ?? detailQuery.data.versionCodes,
      questions,
    }
  }, [
    detailQuery.data,
    detailVersionsQuery.data,
    detailQuestionsFromBank,
    detailQuestionsVersionQuery.data,
  ])

  const subjectOptions = useMemo(
    () => (subjectsQuery.data ?? []).map((subject) => ({ id: subject.id, subjectName: subject.subjectName })),
    [subjectsQuery.data],
  )

  const classroomOptions = useMemo(
    () =>
      (classroomsQuery.data ?? []).map((classroom) => ({
        id: classroom.id,
        className: classroom.className,
        subjectId: classroom.subjectId,
        subjectName: classroom.subjectName,
      })),
    [classroomsQuery.data],
  )

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const detailParam = searchParams.get('detail')
    if (!detailParam) return
    const id = Number(detailParam)
    if (!Number.isFinite(id) || id <= 0) return
    setDetailExamId(id)
    const next = new URLSearchParams(searchParams)
    next.delete('detail')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const isMutating =
    createExam.isPending ||
    updateExam.isPending ||
    deleteExam.isPending ||
    updateClassrooms.isPending ||
    createVersions.isPending

  const selectClassName =
    'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

  function openCreate() {
    setFormError(null)
    setEditingExam(null)
    setFormSubjectId(undefined)
    setModalMode('create')
  }

  function openEdit(exam: ExamItemType) {
    setFormError(null)
    setEditingExam(exam)
    setFormSubjectId(exam.subjectId)
    setModalMode('edit')
  }

  function closeModal() {
    if (isMutating) return
    setModalMode(null)
    setEditingExam(null)
    setFormError(null)
    setFormSubjectId(undefined)
  }

  async function handleCreate(values: ExamCreateFormValues) {
    setFormError(null)
    try {
      await createExam.mutateAsync({
        title: values.title,
        duration: Number(values.duration),
        examMode: values.examMode as ExamMode,
        purpose: 'EXAM',
        subjectId: Number(values.subjectId),
        questionIds: values.questionIds,
        maxScore: 10,
        rawPoints: toRawPointsPayload(values.rawPoints),
        classroomIds: values.classroomIds.length > 0 ? values.classroomIds : undefined,
        config: {
          shuffleQuestions: values.config.shuffleQuestions,
          shuffleAnswers: values.config.shuffleAnswers,
          paperCount: 1,
          semester: values.config.semester || undefined,
          academicYear: values.config.academicYear || undefined,
          showScoreToStudent: values.config.showScoreToStudent,
        },
      })
      setModalMode(null)
      setToast('Đã tạo đề thi ở trạng thái nháp — giao lớp ở chi tiết đề')
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Không thể tạo đề thi'))
    }
  }

  async function handleUpdate(values: ExamUpdateFormValues) {
    if (!editingExam) return
    setFormError(null)
    try {
      await updateExam.mutateAsync({
        id: editingExam.id,
        payload: buildUpdatePayload(editingExam, {
          title: values.title,
          duration: Number(values.duration),
          examMode: values.examMode as ExamMode,
          subjectId: Number(values.subjectId),
          maxScore: 10,
          config: values.config
            ? {
                shuffleQuestions: values.config.shuffleQuestions,
                shuffleAnswers: values.config.shuffleAnswers,
                paperCount: 1,
                semester: values.config.semester,
                academicYear: values.config.academicYear,
                showScoreToStudent: values.config.showScoreToStudent,
              }
            : undefined,
        }),
      })
      setModalMode(null)
      setEditingExam(null)
      setToast('Đã lưu thay đổi')
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Không thể cập nhật đề thi'))
    }
  }

  async function confirmDelete() {
    if (!deletingExam) return
    setDeleteError(null)
    try {
      await deleteExam.mutateAsync(deletingExam.id)
      if (detailExamId === deletingExam.id) setDetailExamId(null)
      setDeletingExam(null)
      setToast('Đã xóa đề thi')
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, 'Không thể xóa đề thi'))
      setToast(getApiErrorMessage(error, 'Xóa thất bại'))
    }
  }

  async function handleAssignClassrooms(classroomIds: number[]) {
    if (!assignExam) return
    setAssignError(null)
    try {
      await updateClassrooms.mutateAsync({ id: assignExam.id, classroomIds })
      setAssignExam(null)
      setToast('Đã cập nhật lớp được giao')
    } catch (error) {
      setAssignError(getApiErrorMessage(error, 'Không thể giao lớp'))
    }
  }

  async function handleGenerateVersions(values: ExamVersionCreateValues) {
    if (!versionExam) return
    setVersionError(null)
    try {
      await createVersions.mutateAsync({
        examId: versionExam.id,
        replaceExisting: values.replaceExisting,
        ...(values.mode === 'manual'
          ? { manualVersionCodes: values.manualVersionCodes }
          : { autoGenerateCount: Number(values.autoGenerateCount) }),
      })
      setVersionExam(null)
      setToast('Đã sinh mã đề')
    } catch (error) {
      setVersionError(getApiErrorMessage(error, 'Không thể sinh mã đề'))
    }
  }

  async function handleOpenExam(values: ExamOpenValues) {
    if (!openExam) return
    setOpenError(null)
    try {
      await updateExam.mutateAsync({
        id: openExam.id,
        payload: buildUpdatePayload(openExam, {
          status: values.status,
          startAt: values.startAt || null,
          endAt: values.endAt || null,
        }),
      })
      setOpenExam(null)
      setToast(values.status === 'ONGOING' ? 'Đề thi đã mở' : 'Đề thi đã lên lịch')
    } catch (error) {
      setOpenError(getApiErrorMessage(error, 'Không thể mở thi'))
    }
  }

  async function handleCloseExam(exam: ExamItemType) {
    try {
      await updateExam.mutateAsync({
        id: exam.id,
        payload: buildUpdatePayload(exam, { status: 'CLOSED' }),
      })
      setToast('Đã đóng đề thi')
    } catch (error) {
      setToast(getApiErrorMessage(error, 'Không thể đóng đề thi'))
    }
  }

  const actionProps = {
    onDetail: (exam: ExamItemType) => setDetailExamId(exam.id),
    onEdit: openEdit,
    onDelete: (item: ExamItemType) => {
      setDeleteError(null)
      setDeletingExam(item)
    },
    onAssignClassrooms: (item: ExamItemType) => {
      setAssignError(null)
      setAssignExam(item)
    },
    onGenerateVersions: (item: ExamItemType) => {
      setVersionError(null)
      setVersionExam(item)
    },
    onOpenExam: (item: ExamItemType) => {
      setOpenError(null)
      setOpenExam(item)
    },
    onCloseExam: (item: ExamItemType) => void handleCloseExam(item),
  }

  return (
    <section className="space-y-5">
      {toast ? (
        <div className="fixed right-4 top-4 z-[80] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg">
          {toast}{' '}
          <Link to={ROUTES.teacher.examTemplates} className="font-medium text-blue-600 hover:text-blue-700">
            Mở thư viện
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Đề thi</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Quản lý đề thi</h1>
          <p className="mt-1 text-sm text-slate-500">Tạo nháp → giao lớp → sinh mã đề → mở thi.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button variant="secondary" className="w-full sm:w-auto" disabled title="Sắp ra mắt">
            <ClipboardList className="h-4 w-4" strokeWidth={1.75} />
            Giao đề cho lớp
          </Button>
          <Button variant="secondary" className="w-full sm:w-auto" disabled title="Sắp ra mắt">
            <Printer className="h-4 w-4" strokeWidth={1.75} />
            OMR / Chấm giấy
          </Button>
          <Button variant="secondary" className="w-full sm:w-auto" disabled title="Sắp ra mắt">
            <BarChart3 className="h-4 w-4" strokeWidth={1.75} />
            Thống kê điểm
          </Button>
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Tạo đề thi
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center">
        <select
          value={subjectFilter}
          onChange={(event) => {
            setSubjectFilter(event.target.value === '' ? '' : Number(event.target.value))
            setPage(0)
          }}
          className={`${selectClassName} w-full lg:w-52`}
        >
          <option value="">Tất cả môn học</option>
          {subjectOptions.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subjectName}
            </option>
          ))}
        </select>
        <select
          value={modeFilter}
          onChange={(event) => {
            setModeFilter(event.target.value as ExamMode | '')
            setPage(0)
          }}
          className={`${selectClassName} w-full lg:w-44`}
        >
          <option value="">Tất cả hình thức</option>
          <option value="ONLINE">Trực tuyến</option>
          <option value="OMR_PAPER">OMR / Giấy</option>
        </select>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as ExamStatus | '')
            setPage(0)
          }}
          className={`${selectClassName} w-full lg:w-44`}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="DRAFT">Nháp</option>
          <option value="UPCOMING">Sắp diễn ra</option>
          <option value="ONGOING">Đang mở</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CLOSED">Đã đóng</option>
        </select>
      </div>

      {examsQuery.isLoading ? <Spinner label="Đang tải đề thi..." /> : null}

      {examsQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(examsQuery.error, 'Không thể tải đề thi')}
          action={
            <Button variant="secondary" onClick={() => void examsQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : null}

      {examsQuery.isSuccess && filteredExams.length === 0 ? (
        <EmptyState
          title={subjectFilter || modeFilter || statusFilter ? 'Không có đề thi phù hợp' : 'Chưa có đề — Tạo đề đầu tiên'}
          description={
            subjectFilter || modeFilter || statusFilter
              ? 'Thử đổi bộ lọc hoặc xóa bộ lọc.'
              : 'Tạo đề nháp, giao lớp, sinh mã rồi mới mở thi.'
          }
          action={
            subjectFilter || modeFilter || statusFilter ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setSubjectFilter('')
                  setModeFilter('')
                  setStatusFilter('')
                  setPage(0)
                }}
              >
                Xóa bộ lọc
              </Button>
            ) : (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" strokeWidth={2} />
                Tạo đề thi
              </Button>
            )
          }
        />
      ) : null}

      {examsQuery.isSuccess && filteredExams.length > 0 ? (
        <div className="flex min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex-1">
            <div className="divide-y divide-slate-200 md:hidden">
              {examsWithVersions.map((exam) => (
                <ExamItem key={exam.id} exam={exam} {...actionProps} />
              ))}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableColGroup>
                  <TableCol />
                  <TableCol width="7rem" />
                  <TableCol width="12%" />
                  <TableCol width="7rem" />
                  <TableCol width="14%" />
                  <TableCol width="4.5rem" />
                  <TableCol width="20rem" />
                </TableColGroup>
                <TableHeader>
                  <TableRow className="border-b-0 hover:bg-transparent">
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Môn học</TableHead>
                    <TableHead>Hình thức</TableHead>
                    <TableHead>Lịch</TableHead>
                    <TableHead>Số lớp</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examsWithVersions.map((exam) => (
                    <ExamTableRow key={exam.id} exam={exam} {...actionProps} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
            <p>
              Trang {currentPage + 1} / {totalPages} · {filteredExams.length} đề thi
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

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <button type="button" className="hidden flex-1 cursor-default sm:block" aria-label="Đóng bảng" onClick={closeModal} />
          <aside className="flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                  {modalMode === 'create' ? 'Tạo' : 'Sửa'}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {modalMode === 'create' ? 'Tạo đề thi (nháp)' : 'Sửa đề thi'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isMutating}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <ExamForm
                mode={modalMode}
                initialValues={editingExam ?? undefined}
                subjectOptions={subjectOptions}
                questionOptions={questionOptions}
                topicOptions={topicOptions}
                classroomOptions={classroomOptions}
                isSubmitting={isMutating}
                submitError={formError}
                onSubjectChange={setFormSubjectId}
                onSubmitCreate={handleCreate}
                onSubmitUpdate={handleUpdate}
                onCancel={closeModal}
              />
            </div>
          </aside>
        </div>
      ) : null}

      {deletingExam ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">Xóa đề thi?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Thao tác này sẽ xóa <span className="font-medium text-slate-900">{deletingExam.title}</span>.
            </p>
            {deleteError ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{deleteError}</p>
            ) : null}
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" className="flex-1" disabled={deleteExam.isPending} onClick={() => setDeletingExam(null)}>
                Hủy
              </Button>
              <Button variant="danger" className="flex-1" disabled={deleteExam.isPending} onClick={() => void confirmDelete()}>
                {deleteExam.isPending ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {detailExamId && detailQuery.isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <Spinner label="Đang tải chi tiết..." />
        </div>
      ) : null}

      {detailExam ? (
        <ExamDetailPanel
          exam={detailExam}
          classroomOptions={
            detailClassroomsQuery.data?.length
              ? detailClassroomsQuery.data
              : classroomOptions.filter((item) => (detailExam.classroomIds ?? []).includes(item.id))
          }
          questionOptions={questionOptions}
          questionsLoading={
            questionsQuery.isLoading ||
            detailQuestionsVersionQuery.isLoading ||
            (Boolean(detailExamId) && detailVersionsQuery.isLoading && !(detailExam.questions?.length))
          }
          isSavingAsTemplate={saveAsTemplate.isPending}
          saveAsTemplateError={saveAsTemplateError}
          onClose={() => setDetailExamId(null)}
          onAssignClassrooms={() => {
            setAssignError(null)
            setAssignExam(detailExam)
          }}
          onGenerateVersions={() => {
            setVersionError(null)
            setVersionExam(detailExam)
          }}
          onOpenExam={() => {
            setOpenError(null)
            setOpenExam(detailExam)
          }}
          onPreviewVersion={(versionCode) => setPreviewCode(versionCode)}
          onSaveAsTemplate={() => {
            setSaveAsTemplateError(null)
            void saveAsTemplate
              .mutateAsync(detailExam.id)
              .then(() => {
                setToast('Đã lưu thành template — xem Thư viện đề')
              })
              .catch((error) => {
                setSaveAsTemplateError(getApiErrorMessage(error, 'Không thể lưu thành template'))
              })
          }}
        />
      ) : null}

      {assignExam ? (
        <ExamAssignClassroomsModal
          exam={assignExam}
          classroomOptions={classroomOptions}
          isSubmitting={updateClassrooms.isPending}
          submitError={assignError}
          onClose={() => {
            if (updateClassrooms.isPending) return
            setAssignExam(null)
          }}
          onSubmit={handleAssignClassrooms}
        />
      ) : null}

      {versionExam ? (
        <ExamVersionGenerateModal
          examTitle={versionExam.title}
          isSubmitting={createVersions.isPending}
          submitError={versionError}
          onClose={() => {
            if (createVersions.isPending) return
            setVersionExam(null)
            setVersionError(null)
          }}
          onSubmit={handleGenerateVersions}
        />
      ) : null}

      {openExam ? (
        <ExamOpenModal
          exam={{
            ...openExam,
            versionCodes:
              openExam.versionCodes ??
              openVersionsQuery.data ??
              (detailExamId === openExam.id ? detailVersionsQuery.data : undefined) ??
              [],
          }}
          isSubmitting={updateExam.isPending}
          submitError={openError}
          onClose={() => {
            if (updateExam.isPending) return
            setOpenExam(null)
          }}
          onSubmit={handleOpenExam}
        />
      ) : null}

      {previewCode && previewQuery.data ? (
        <ExamVersionPreview detail={previewQuery.data} onClose={() => setPreviewCode(null)} />
      ) : null}

      {previewCode && previewQuery.isLoading ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40">
          <Spinner label="Đang tải mã đề..." />
        </div>
      ) : null}
    </section>
  )
}
