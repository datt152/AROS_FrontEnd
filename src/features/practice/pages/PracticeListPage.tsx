import { Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'

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
import { PracticeDetailPanel } from '../components/PracticeDetailPanel'
import { PracticeFilterBar } from '../components/PracticeFilterBar'
import { PracticeForm } from '../components/PracticeForm'
import { PracticeTableRow } from '../components/PracticeTableRow'
import type { PracticeFormValues, PracticeItem, PracticeStatus } from '../types/practice.types'
import {
  MOCK_PRACTICE_CLASSROOMS,
  MOCK_PRACTICE_QUESTIONS,
  MOCK_PRACTICE_SUBJECTS,
  MOCK_PRACTICES,
} from '../types/practice.types'

type DrawerMode = 'create' | 'edit' | null

/** Skeleton UI — Bài luyện tập GV (mock). API wiring: Loại B */
export function PracticeListPage() {
  const [items, setItems] = useState<PracticeItem[]>(MOCK_PRACTICES)
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [classroomId, setClassroomId] = useState<number | ''>('')
  const [status, setStatus] = useState<PracticeStatus | ''>('')
  const [isLoading] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
  const [editing, setEditing] = useState<PracticeItem | null>(null)
  const [detail, setDetail] = useState<PracticeItem | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const classroomsForFilter = useMemo(
    () =>
      subjectId === ''
        ? MOCK_PRACTICE_CLASSROOMS
        : MOCK_PRACTICE_CLASSROOMS.filter((classroom) => classroom.subjectId === subjectId),
    [subjectId],
  )

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (subjectId !== '' && item.subjectId !== subjectId) return false
      if (classroomId !== '' && !item.classroomIds.includes(classroomId)) return false
      if (status !== '' && item.status !== status) return false
      return true
    })
  }, [items, subjectId, classroomId, status])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleCreate(values: PracticeFormValues) {
    const subject = MOCK_PRACTICE_SUBJECTS.find((item) => item.id === values.subjectId)
    const classroomNames = MOCK_PRACTICE_CLASSROOMS.filter((classroom) =>
      values.classroomIds.includes(classroom.id),
    ).map((classroom) => classroom.className)

    const next: PracticeItem = {
      id: Date.now(),
      title: values.title.trim(),
      purpose: 'PRACTICE',
      duration: Number(values.duration) || 30,
      examMode: values.examMode === '' ? 'ONLINE' : values.examMode,
      status: 'DRAFT',
      subjectId: Number(values.subjectId),
      subjectName: subject?.subjectName ?? '',
      maxScore: Number(values.maxScore) || 10,
      totalQuestions: values.questionIds.length,
      classroomIds: values.classroomIds,
      classroomNames,
      createdAt: new Date().toISOString(),
      versionCodes: [],
      questionIds: values.questionIds,
      config: {
        showScoreToStudent: values.config.showScoreToStudent,
        timeLimitEnabled: values.config.timeLimitEnabled,
        maxAttempts: values.config.maxAttempts === '' ? null : Number(values.config.maxAttempts),
        shuffleQuestions: values.config.shuffleQuestions,
        shuffleAnswers: values.config.shuffleAnswers,
        paperCount: Number(values.config.paperCount) || 1,
        allowEdit: values.config.allowEdit,
        semester: values.config.semester,
        academicYear: values.config.academicYear,
      },
    }

    setItems((current) => [next, ...current])
    setDrawerMode(null)
    showToast('Đã tạo bài luyện tập (mock)')
  }

  function handleUpdate(values: PracticeFormValues) {
    if (!editing) return
    setItems((current) =>
      current.map((item) =>
        item.id === editing.id
          ? {
              ...item,
              title: values.title.trim(),
              duration: Number(values.duration) || item.duration,
              examMode: values.examMode === '' ? item.examMode : values.examMode,
              maxScore: Number(values.maxScore) || item.maxScore,
              classroomIds: values.classroomIds,
              classroomNames: MOCK_PRACTICE_CLASSROOMS.filter((classroom) =>
                values.classroomIds.includes(classroom.id),
              ).map((classroom) => classroom.className),
              config: {
                ...item.config,
                showScoreToStudent: values.config.showScoreToStudent,
                timeLimitEnabled: values.config.timeLimitEnabled,
                maxAttempts:
                  values.config.maxAttempts === '' ? null : Number(values.config.maxAttempts),
                shuffleQuestions: values.config.shuffleQuestions,
                shuffleAnswers: values.config.shuffleAnswers,
                paperCount: Number(values.config.paperCount) || 1,
                allowEdit: values.config.allowEdit,
                semester: values.config.semester,
                academicYear: values.config.academicYear,
              },
            }
          : item,
      ),
    )
    setDrawerMode(null)
    setEditing(null)
    setDetail(null)
    showToast('Đã lưu bài luyện tập (mock)')
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Luyện tập</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Bài luyện tập</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý bài luyện tập (mở/đóng đề). Không theo dõi trạng thái từng sinh viên — phần đó thuộc Chấm điểm.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDrawerMode('create')
          }}
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Tạo bài luyện tập
        </Button>
      </div>

      <PracticeFilterBar
        subjects={MOCK_PRACTICE_SUBJECTS}
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

      {isLoading ? <Spinner label="Đang tải bài luyện tập..." /> : null}

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          title="Chưa có bài luyện tập"
          description="Tạo bài mới hoặc đổi bộ lọc môn / lớp / trạng thái."
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

      {!isLoading && filtered.length > 0 ? (
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
                    onDetail={setDetail}
                    onEdit={(practice) => {
                      setEditing(practice)
                      setDrawerMode('edit')
                    }}
                    onDelete={(practice) => {
                      setItems((current) => current.filter((row) => row.id !== practice.id))
                      showToast('Đã xoá (mock)')
                    }}
                    onAssign={() => showToast('Giao lớp — mock (Loại B: PUT /exams/{id}/classrooms)')}
                    onGenerateVersions={(practice) => {
                      setItems((current) =>
                        current.map((row) =>
                          row.id === practice.id
                            ? {
                                ...row,
                                versionCodes:
                                  row.versionCodes.length > 0 ? row.versionCodes : ['001', '002'],
                              }
                            : row,
                        ),
                      )
                      showToast('Đã sinh mã đề (mock)')
                    }}
                    onOpen={(practice) => {
                      setItems((current) =>
                        current.map((row) =>
                          row.id === practice.id ? { ...row, status: 'ONGOING' as const } : row,
                        ),
                      )
                      setDetail(null)
                      showToast('Đã mở luyện tập (mock)')
                    }}
                    onClose={(practice) => {
                      setItems((current) =>
                        current.map((row) =>
                          row.id === practice.id ? { ...row, status: 'CLOSED' as const } : row,
                        ),
                      )
                      setDetail(null)
                      showToast('Đã đóng bài luyện tập (mock)')
                    }}
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
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
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
            <PracticeForm
              mode={drawerMode}
              initialValues={editing ?? undefined}
              subjects={MOCK_PRACTICE_SUBJECTS}
              classrooms={MOCK_PRACTICE_CLASSROOMS}
              questions={MOCK_PRACTICE_QUESTIONS}
              onCancel={() => {
                setDrawerMode(null)
                setEditing(null)
              }}
              onSubmit={drawerMode === 'create' ? handleCreate : handleUpdate}
            />
          </aside>
        </div>
      ) : null}

      {detail ? (
        <PracticeDetailPanel
          item={items.find((row) => row.id === detail.id) ?? detail}
          onClose={() => setDetail(null)}
          onEdit={(practice) => {
            setDetail(null)
            setEditing(practice)
            setDrawerMode('edit')
          }}
          onAssign={() => showToast('Giao lớp — mock')}
          onGenerateVersions={(practice) => {
            setItems((current) =>
              current.map((row) =>
                row.id === practice.id
                  ? {
                      ...row,
                      versionCodes: row.versionCodes.length > 0 ? row.versionCodes : ['001', '002'],
                    }
                  : row,
              ),
            )
            showToast('Đã sinh mã đề (mock)')
          }}
          onOpen={(practice) => {
            setItems((current) =>
              current.map((row) => (row.id === practice.id ? { ...row, status: 'ONGOING' as const } : row)),
            )
            setDetail(null)
            showToast('Đã mở luyện tập (mock)')
          }}
          onClosePractice={(practice) => {
            setItems((current) =>
              current.map((row) => (row.id === practice.id ? { ...row, status: 'CLOSED' as const } : row)),
            )
            setDetail(null)
            showToast('Đã đóng bài luyện tập (mock)')
          }}
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
