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

import { useSubjects } from '../../subjects/hooks/useSubjects'

import { ClassroomForm } from '../components/ClassroomForm'

import { ClassroomItem, ClassroomTableRow } from '../components/ClassroomItem'

import { ClassroomStudentsPanel } from '../components/ClassroomStudentsPanel'

import {

  useClassroomStudents,

  useClassrooms,

  useCreateClassroom,

  useDeleteClassroom,

  useEnrollStudents,

  useRemoveStudentFromClass,

  useUpdateClassroom,

} from '../hooks/useClassrooms'

import type { ClassroomFormValues, ClassroomItem as ClassroomItemType } from '../types/classroom.types'



type ModalMode = 'create' | 'edit' | null



export function ClassroomListPage() {

  const classroomsQuery = useClassrooms()

  const subjectsQuery = useSubjects()

  const createClassroom = useCreateClassroom()

  const updateClassroom = useUpdateClassroom()

  const deleteClassroom = useDeleteClassroom()

  const enrollStudents = useEnrollStudents()

  const removeStudent = useRemoveStudentFromClass()



  const [modalMode, setModalMode] = useState<ModalMode>(null)

  const [editingClassroom, setEditingClassroom] = useState<ClassroomItemType | null>(null)

  const [deletingClassroom, setDeletingClassroom] = useState<ClassroomItemType | null>(null)

  const [managingClassroom, setManagingClassroom] = useState<ClassroomItemType | null>(null)

  const [formError, setFormError] = useState<string | null>(null)

  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [enrollError, setEnrollError] = useState<string | null>(null)



  const studentsQuery = useClassroomStudents(managingClassroom?.id)



  const classrooms = classroomsQuery.data ?? []

  const subjectOptions = useMemo(

    () => (subjectsQuery.data ?? []).map((subject) => ({ id: subject.id, subjectName: subject.subjectName })),

    [subjectsQuery.data],

  )



  const isFormSubmitting = createClassroom.isPending || updateClassroom.isPending



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



  async function handleSubmit(values: ClassroomFormValues) {

    setFormError(null)



    try {

      if (modalMode === 'create') {

        await createClassroom.mutateAsync(values)

      }



      if (modalMode === 'edit' && editingClassroom) {

        await updateClassroom.mutateAsync({ id: editingClassroom.id, payload: values })

      }



      setModalMode(null)

      setEditingClassroom(null)

    } catch (error) {

      setFormError(getApiErrorMessage(error, 'Không thể lưu lớp học'))

    }

  }



  async function confirmDelete() {

    if (!deletingClassroom) return

    setDeleteError(null)



    try {

      await deleteClassroom.mutateAsync(deletingClassroom.id)

      if (managingClassroom?.id === deletingClassroom.id) setManagingClassroom(null)

      setDeletingClassroom(null)

    } catch (error) {

      setDeleteError(getApiErrorMessage(error, 'Không thể xóa lớp học'))

    }

  }



  async function handleEnroll(studentEmails: string[]) {

    if (!managingClassroom) return

    setEnrollError(null)



    try {

      await enrollStudents.mutateAsync({

        classroomId: managingClassroom.id,

        payload: { studentEmails },

      })

    } catch (error) {

      setEnrollError(getApiErrorMessage(error, 'Không thể ghi danh sinh viên'))

      throw error

    }

  }



  async function handleRemoveStudent(studentId: number) {

    if (!managingClassroom) return



    await removeStudent.mutateAsync({

      classroomId: managingClassroom.id,

      studentId,

    })

  }



  return (

    <section className="space-y-5">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Lớp học</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Quản lý lớp học</h1>

          <p className="mt-1 text-sm text-slate-500">

            Tạo lớp học, gán môn học và quản lý ghi danh sinh viên.

          </p>

        </div>

        <Button onClick={openCreate} className="w-full sm:w-auto">

          <Plus className="h-4 w-4" strokeWidth={2} />

          Thêm lớp học

        </Button>

      </div>



      {classroomsQuery.isLoading ? <Spinner label="Đang tải lớp học..." /> : null}



      {classroomsQuery.isError ? (

        <ErrorState

          message={getApiErrorMessage(classroomsQuery.error, 'Không thể tải danh sách lớp học')}

          action={

            <Button variant="secondary" onClick={() => void classroomsQuery.refetch()}>

              Thử lại

            </Button>

          }

        />

      ) : null}



      {classroomsQuery.isSuccess && classrooms.length === 0 ? (

        <EmptyState

          title="Chưa có lớp học nào"

          description="Thêm lớp học đầu tiên để bắt đầu ghi danh sinh viên."

          action={

            <Button onClick={openCreate}>

              <Plus className="h-4 w-4" strokeWidth={2} />

              Thêm lớp học

            </Button>

          }

        />

      ) : null}



      {classroomsQuery.isSuccess && classrooms.length > 0 ? (

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="divide-y divide-slate-100 md:hidden">

            {classrooms.map((classroom) => (

              <ClassroomItem

                key={classroom.id}

                classroom={classroom}

                onEdit={openEdit}

                onDelete={(item) => {

                  setDeleteError(null)

                  setDeletingClassroom(item)

                }}

                onManageStudents={(item) => {

                  setEnrollError(null)

                  setManagingClassroom(item)

                }}

              />

            ))}

          </div>



          <div className="hidden md:block">

            <Table>

              <TableColGroup>

                <TableCol width="20%" />

                <TableCol width="20%" />

                <TableCol width="6.5%" />

                <TableCol width="7.5%" />

                <TableCol width="11%" />

                <TableCol width="25%" />

              </TableColGroup>

              <TableHeader>

                <TableRow className="border-b-0 hover:bg-transparent">

                  <TableHead>Tên lớp</TableHead>

                  <TableHead>Môn học</TableHead>

                  <TableHead>Học kỳ</TableHead>

                  <TableHead>Năm học</TableHead>

                  <TableHead>Trạng thái</TableHead>

                  <TableHead>Thao tác</TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {classrooms.map((classroom) => (

                  <ClassroomTableRow

                    key={classroom.id}

                    classroom={classroom}

                    onEdit={openEdit}

                    onDelete={(item) => {

                      setDeleteError(null)

                      setDeletingClassroom(item)

                    }}

                    onManageStudents={(item) => {

                      setEnrollError(null)

                      setManagingClassroom(item)

                    }}

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

                  {modalMode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'}

                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-900">

                  {modalMode === 'create' ? 'Thêm lớp học' : 'Chỉnh sửa lớp học'}

                </h2>

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

            <ClassroomForm

              mode={modalMode}

              initialValues={editingClassroom ?? undefined}

              subjectOptions={subjectOptions}

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

            <h3 className="text-base font-semibold text-slate-900">Xóa lớp học?</h3>

            <p className="mt-2 text-sm text-slate-600">

              Thao tác này sẽ xóa{' '}

              <span className="font-medium text-slate-900">{deletingClassroom.className}</span> và danh sách sinh viên

              khỏi hệ thống.

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

                disabled={deleteClassroom.isPending}

                onClick={() => setDeletingClassroom(null)}

              >

                Hủy

              </Button>

              <Button

                variant="danger"

                className="flex-1"

                disabled={deleteClassroom.isPending}

                onClick={() => void confirmDelete()}

              >

                {deleteClassroom.isPending ? 'Đang xóa...' : 'Xóa'}

              </Button>

            </div>

          </div>

        </div>

      ) : null}



      {managingClassroom ? (

        <ClassroomStudentsPanel

          classroom={managingClassroom}

          students={studentsQuery.data ?? []}

          isLoadingStudents={studentsQuery.isLoading}

          studentsError={

            studentsQuery.isError ? getApiErrorMessage(studentsQuery.error, 'Không thể tải danh sách sinh viên') : null

          }

          onRetryStudents={() => void studentsQuery.refetch()}

          isEnrolling={enrollStudents.isPending}

          enrollError={enrollError}

          isRemoving={removeStudent.isPending}

          onClose={() => setManagingClassroom(null)}

          onEnroll={handleEnroll}

          onRemove={(student) => void handleRemoveStudent(student.id)}

        />

      ) : null}

    </section>

  )

}

