import { Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'

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
import { useClassrooms } from '../../classrooms/hooks/useClassrooms'
import { ExamAssignClassroomsModal } from '../../exams/components/ExamAssignClassroomsModal'
import { ExamOpenModal } from '../../exams/components/ExamOpenModal'
import { ExamVersionGenerateModal } from '../../exams/components/ExamVersionGenerateModal'
import {
  useCreateExam,
  useCreateExamVersions,
  useDeleteExam,
  useExam,
  useExams,
  useExamVersions,
  useExamVersionsMany,
  useUpdateExam,
  useUpdateExamClassrooms,
} from '../../exams/hooks/useExams'
import type {
  ExamItem as ExamItemType,
  ExamOpenValues,
  ExamUpdatePayload,
  ExamVersionCreateValues,
} from '../../exams/types/exam.types'
import { useQuestions } from '../../questions/hooks/useQuestions'
import { useTopics } from '../../questions/hooks/useTopics'
import { useSubjects } from '../../subjects/hooks/useSubjects'
import { PracticeDetailPanel } from '../components/PracticeDetailPanel'
import { PracticeFilterBar } from '../components/PracticeFilterBar'
import { PracticeForm } from '../components/PracticeForm'
import { PracticeTableRow } from '../components/PracticeTableRow'
import type { PracticeFormValues, PracticeItem, PracticeStatus } from '../types/practice.types'
import { examToPracticeItem } from '../types/practice.types'

type DrawerMode = 'create' | 'edit' | null

const FETCH_SIZE = 100

function buildUpdatePayload(exam: ExamItemType, patch: Partial<ExamUpdatePayload>): ExamUpdatePayload {
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

export function PracticeListPage() {
  const subjectsQuery = useSubjects()
  const classroomsQuery = useClassrooms()
  const examsQuery = useExams({ page: 0, size: FETCH_SIZE, purpose: 'PRACTICE' })

  const createExam = useCreateExam()
  const updateExam = useUpdateExam()
  const deleteExam = useDeleteExam()
  const updateClassrooms = useUpdateExamClassrooms()
  const createVersions = useCreateExamVersions()

  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [classroomId, setClassroomId] = useState<number | ''>('')
  const [status, setStatus] = useState<PracticeStatus | ''>('')
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
  const [editing, setEditing] = useState<PracticeItem | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [assignExam, setAssignExam] = useState<ExamItemType | null>(null)
  const [versionExam, setVersionExam] = useState<ExamItemType | null>(null)
  const [openExam, setOpenExam] = useState<ExamItemType | null>(null)
  const [formSubjectId, setFormSubjectId] = useState<number | undefined>(undefined)
  const [formError, setFormError] = useState<string | null>(null)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [versionError, setVersionError] = useState<string | null>(null)
  const [openError, setOpenError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const detailQuery = useExam(detailId ?? undefined)
  const detailVersionsQuery = useExamVersions(detailId ?? undefined)
  const openVersionsQuery = useExamVersions(openExam?.id)

  const questionsQuery = useQuestions(
    formSubjectId || editing?.subjectId
      ? { subjectId: formSubjectId ?? editing!.subjectId, page: 0, size: 500 }
      : undefined,
  )

  const topicsSubjectId = formSubjectId ?? editing?.subjectId
  const topicsQuery = useTopics(
    topicsSubjectId ? { subjectId: topicsSubjectId, page: 0, size: 50 } : undefined,
  )

  const draftIds = useMemo(
    () => (examsQuery.data?.items ?? []).filter((item) => item.status === 'DRAFT').map((item) => item.id),
    [examsQuery.data?.items],
  )
  const versionQueries = useExamVersionsMany(draftIds)

  const examsWithVersions = useMemo(() => {
    const codeById = new Map<number, string[]>()
    draftIds.forEach((id, index) => {
      const codes = versionQueries[index]?.data
      if (codes) codeById.set(id, codes)
    })
    return (examsQuery.data?.items ?? []).map((exam) =>
      codeById.has(exam.id) ? { ...exam, versionCodes: codeById.get(exam.id) } : exam,
    )
  }, [examsQuery.data?.items, draftIds, versionQueries])

  const practices = useMemo(() => examsWithVersions.map(examToPracticeItem), [examsWithVersions])

  const subjects = useMemo(
    () => (subjectsQuery.data ?? []).map((item) => ({ id: item.id, subjectName: item.subjectName })),
    [subjectsQuery.data],
  )

  const classrooms = useMemo(
    () =>
      (classroomsQuery.data ?? []).map((item) => ({
        id: item.id,
        className: item.className,
        subjectId: item.subjectId,
      })),
    [classroomsQuery.data],
  )

  const classroomsForFilter = useMemo(
    () => (subjectId === '' ? classrooms : classrooms.filter((item) => item.subjectId === subjectId)),
    [classrooms, subjectId],
  )

  const classroomOptions = useMemo(
    () =>
      (classroomsQuery.data ?? []).map((item) => ({
        id: item.id,
        className: item.className,
        subjectId: item.subjectId,
        subjectName: item.subjectName,
      })),
    [classroomsQuery.data],
  )

  const questions = useMemo(
    () =>
      (questionsQuery.data?.items ?? []).map((item) => ({
        questionId: item.questionId,
        content: item.content,
        type: item.type,
        subjectId: item.subjectId,
        topicId: item.topicId ?? null,
      })),
    [questionsQuery.data?.items],
  )

  const topics = useMemo(
    () => (topicsQuery.data?.items ?? []).map((item) => ({ id: item.id, name: item.name })),
    [topicsQuery.data?.items],
  )

  const filtered = useMemo(() => {
    return practices.filter((item) => {
      if (subjectId !== '' && item.subjectId !== subjectId) return false
      if (classroomId !== '' && !item.classroomIds.includes(classroomId)) return false
      if (status !== '' && item.status !== status) return false
      return true
    })
  }, [practices, subjectId, classroomId, status])

  const detailPractice = useMemo(() => {
    if (!detailQuery.data) return null
    return examToPracticeItem({
      ...detailQuery.data,
      versionCodes: detailVersionsQuery.data ?? detailQuery.data.versionCodes,
    })
  }, [detailQuery.data, detailVersionsQuery.data])

  const editingExamRaw = useMemo(
    () => (editing ? examsWithVersions.find((item) => item.id === editing.id) : undefined),
    [editing, examsWithVersions],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  async function handleCreate(values: PracticeFormValues) {
    setFormError(null)
    try {
      await createExam.mutateAsync({
        title: values.title.trim(),
        duration: Number(values.duration) || 30,
        examMode: 'ONLINE',
        purpose: 'PRACTICE',
        subjectId: Number(values.subjectId),
        questionIds: values.questionIds,
        maxScore: 10,
        classroomIds: values.classroomIds.length > 0 ? values.classroomIds : undefined,
        config: {
          showScoreToStudent: true,
          timeLimitEnabled: values.config.timeLimitEnabled,
          maxAttempts: values.config.maxAttempts === '' ? null : Number(values.config.maxAttempts),
          shuffleQuestions: values.config.shuffleQuestions,
          shuffleAnswers: values.config.shuffleAnswers,
          semester: values.config.semester || undefined,
          academicYear: values.config.academicYear || undefined,
        },
      })
      setDrawerMode(null)
      showToast('Đã tạo bài luyện tập')
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Không thể tạo bài luyện tập'))
    }
  }

  async function handleUpdate(values: PracticeFormValues) {
    if (!editing || !editingExamRaw) return
    setFormError(null)
    try {
      await updateExam.mutateAsync({
        id: editing.id,
        payload: buildUpdatePayload(editingExamRaw, {
          title: values.title.trim(),
          duration: Number(values.duration) || editing.duration,
          examMode: 'ONLINE',
          subjectId: Number(values.subjectId) || editing.subjectId,
          maxScore: 10,
          config: {
            showScoreToStudent: true,
            timeLimitEnabled: values.config.timeLimitEnabled,
            maxAttempts: values.config.maxAttempts === '' ? null : Number(values.config.maxAttempts),
            shuffleQuestions: values.config.shuffleQuestions,
            shuffleAnswers: values.config.shuffleAnswers,
            semester: values.config.semester,
            academicYear: values.config.academicYear,
          },
        }),
      })
      if (values.classroomIds.join(',') !== editing.classroomIds.join(',')) {
        await updateClassrooms.mutateAsync({ id: editing.id, classroomIds: values.classroomIds })
      }
      setDrawerMode(null)
      setEditing(null)
      showToast('Đã lưu bài luyện tập')
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Không thể lưu bài luyện tập'))
    }
  }

  async function handleAssign(classroomIds: number[]) {
    if (!assignExam) return
    setAssignError(null)
    try {
      await updateClassrooms.mutateAsync({ id: assignExam.id, classroomIds })
      setAssignExam(null)
      showToast('Đã giao lớp')
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
        ...(values.mode === 'manual'
          ? { manualVersionCodes: values.manualVersionCodes }
          : { autoGenerateCount: Number(values.autoGenerateCount) }),
        replaceExisting: values.replaceExisting,
      })
      setVersionExam(null)
      showToast('Đã sinh mã đề')
    } catch (error) {
      setVersionError(getApiErrorMessage(error, 'Không thể sinh mã đề'))
    }
  }

  async function handleOpen(values: ExamOpenValues) {
    if (!openExam) return
    setOpenError(null)
    try {
      await updateExam.mutateAsync({
        id: openExam.id,
        payload: buildUpdatePayload(openExam, {
          status: values.status,
          startAt: values.startAt,
          endAt: values.endAt,
        }),
      })
      setOpenExam(null)
      showToast('Đã mở luyện tập')
    } catch (error) {
      setOpenError(getApiErrorMessage(error, 'Không thể mở luyện tập'))
    }
  }

  async function handleClose(item: PracticeItem) {
    const raw = examsWithVersions.find((exam) => exam.id === item.id)
    if (!raw) return
    try {
      await updateExam.mutateAsync({
        id: item.id,
        payload: buildUpdatePayload(raw, { status: 'CLOSED' }),
      })
      setDetailId(null)
      showToast('Đã đóng bài luyện tập')
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Không thể đóng bài'))
    }
  }

  async function handleDelete(item: PracticeItem) {
    try {
      await deleteExam.mutateAsync(item.id)
      showToast('Đã xoá bài luyện tập')
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Không thể xoá'))
    }
  }

  function toExamForModal(item: PracticeItem): ExamItemType {
    const raw = examsWithVersions.find((exam) => exam.id === item.id)
    return (
      raw ?? {
        id: item.id,
        title: item.title,
        duration: item.duration,
        examMode: item.examMode,
        purpose: 'PRACTICE',
        status: item.status,
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        createdAt: item.createdAt,
        totalQuestions: item.totalQuestions,
        maxScore: item.maxScore,
        classroomIds: item.classroomIds,
        versionCodes: item.versionCodes,
        questionIds: item.questionIds,
        config: item.config,
      }
    )
  }

  const isLoading = examsQuery.isLoading || subjectsQuery.isLoading

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Luyện tập</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Bài luyện tập</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý bài luyện tập (mở/đóng đề). Không theo dõi trạng thái từng sinh viên.
          </p>
        </div>
        <Button
          className="w-full shrink-0 sm:w-auto"
          onClick={() => {
            setEditing(null)
            setFormSubjectId(undefined)
            setFormError(null)
            setDrawerMode('create')
          }}
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Tạo bài luyện tập
        </Button>
      </div>

      {examsQuery.isError ? (
        <ErrorState
          title="Không tải được bài luyện tập"
          message={getApiErrorMessage(examsQuery.error, 'Không thể tải danh sách')}
          action={
            <button
              type="button"
              onClick={() => void examsQuery.refetch()}
              className="h-9 rounded-xl bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
            >
              Thử lại
            </button>
          }
        />
      ) : null}

      {!examsQuery.isError ? (
        <PracticeFilterBar
          subjects={subjects}
          classrooms={classroomsForFilter}
          subjectId={subjectId}
          classroomId={classroomId}
          status={status}
          onSubjectChange={(value) => {
            setSubjectId(value)
            setClassroomId('')
          }}
          onClassroomChange={setClassroomId}
          onStatusChange={setStatus}
        />
      ) : null}

      {isLoading ? <Spinner label="Đang tải bài luyện tập..." /> : null}

      {!isLoading && !examsQuery.isError && filtered.length === 0 ? (
        <EmptyState
          title="Chưa có bài luyện tập"
          description="Tạo bài mới hoặc đổi bộ lọc môn / lớp / trạng thái đề."
          action={
            <Button
              onClick={() => {
                setEditing(null)
                setDrawerMode('create')
              }}
            >
              Tạo bài luyện tập
            </Button>
          }
        />
      ) : null}

      {!isLoading && !examsQuery.isError && filtered.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableColGroup>
                <TableCol />
                <TableCol width="7rem" />
                <TableCol width="12%" />
                <TableCol width="8rem" />
                <TableCol width="8rem" />
                <TableCol width="5rem" />
                <TableCol width="20rem" />
              </TableColGroup>
              <TableHeader>
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Trạng thái đề</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Số lần</TableHead>
                  <TableHead>Giới hạn giờ</TableHead>
                  <TableHead>Số lớp</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <PracticeTableRow
                    key={item.id}
                    item={item}
                    onDetail={(practice) => setDetailId(practice.id)}
                    onEdit={(practice) => {
                      setEditing(practice)
                      setFormSubjectId(practice.subjectId)
                      setFormError(null)
                      setDrawerMode('edit')
                    }}
                    onDelete={(practice) => void handleDelete(practice)}
                    onAssign={(practice) => {
                      setAssignError(null)
                      setAssignExam(toExamForModal(practice))
                    }}
                    onGenerateVersions={(practice) => {
                      setVersionError(null)
                      setVersionExam(toExamForModal(practice))
                    }}
                    onOpen={(practice) => {
                      setOpenError(null)
                      setOpenExam({
                        ...toExamForModal(practice),
                        versionCodes: practice.versionCodes,
                      })
                    }}
                    onClose={(practice) => void handleClose(practice)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}

      {drawerMode ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <button
            type="button"
            className="hidden flex-1 cursor-default sm:block"
            aria-label="Đóng"
            onClick={() => {
              setDrawerMode(null)
              setEditing(null)
            }}
          />
          <aside className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                  {drawerMode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {drawerMode === 'create' ? 'Tạo bài luyện tập' : 'Sửa bài luyện tập'}
                </h2>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                onClick={() => {
                  setDrawerMode(null)
                  setEditing(null)
                }}
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {formError ? (
              <p className="mx-5 mt-3 shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <PracticeForm
              mode={drawerMode}
              initialValues={editing ?? undefined}
              subjects={subjects}
              classrooms={classrooms}
              questions={questions}
              topics={topics}
              onSubjectChange={setFormSubjectId}
              onCancel={() => {
                setDrawerMode(null)
                setEditing(null)
              }}
              onSubmit={(values) => {
                if (drawerMode === 'create') {
                  void handleCreate(values)
                } else {
                  void handleUpdate(values)
                }
              }}
            />
          </aside>
        </div>
      ) : null}

      {detailId !== null && detailQuery.isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <Spinner label="Đang tải chi tiết..." />
        </div>
      ) : null}

      {detailPractice ? (
        <PracticeDetailPanel
          item={detailPractice}
          onClose={() => setDetailId(null)}
          onEdit={(practice) => {
            setDetailId(null)
            setEditing(practice)
            setFormSubjectId(practice.subjectId)
            setDrawerMode('edit')
          }}
          onAssign={(practice) => {
            setAssignError(null)
            setAssignExam(toExamForModal(practice))
          }}
          onGenerateVersions={(practice) => {
            setVersionError(null)
            setVersionExam(toExamForModal(practice))
          }}
          onOpen={(practice) => {
            setOpenError(null)
            setOpenExam({ ...toExamForModal(practice), versionCodes: practice.versionCodes })
          }}
          onClosePractice={(practice) => void handleClose(practice)}
        />
      ) : null}

      {assignExam ? (
        <ExamAssignClassroomsModal
          exam={assignExam}
          classroomOptions={classroomOptions}
          isSubmitting={updateClassrooms.isPending}
          submitError={assignError}
          onClose={() => setAssignExam(null)}
          onSubmit={(ids) => void handleAssign(ids)}
        />
      ) : null}

      {versionExam ? (
        <ExamVersionGenerateModal
          examTitle={versionExam.title}
          isSubmitting={createVersions.isPending}
          submitError={versionError}
          onClose={() => setVersionExam(null)}
          onSubmit={(values) => void handleGenerateVersions(values)}
        />
      ) : null}

      {openExam ? (
        <ExamOpenModal
          exam={{
            ...openExam,
            versionCodes: openVersionsQuery.data ?? openExam.versionCodes,
          }}
          isSubmitting={updateExam.isPending}
          submitError={openError}
          onClose={() => setOpenExam(null)}
          onSubmit={(values) => void handleOpen(values)}
        />
      ) : null}

      {toast ? (
        <div className="fixed right-4 bottom-4 z-[60] rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </section>
  )
}
