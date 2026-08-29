import { Plus, X } from 'lucide-react'

import { useState } from 'react'



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

import { IncludeInactiveToggle } from '../../../components/common/IncludeInactiveToggle'

import { SubjectForm } from '../components/SubjectForm'

import { SubjectItem, SubjectTableRow } from '../components/SubjectItem'

import {

  useCreateSubject,

  useDeleteSubject,

  useSubjects,

  useUpdateSubject,

} from '../hooks/useSubjects'

import type { SubjectFormValues, SubjectItem as SubjectItemType, SubjectUpdatePayload } from '../types/subject.types'



type ModalMode = 'create' | 'edit' | null



export function SubjectListPage() {

  const [includeInactive, setIncludeInactive] = useState(false)

  const subjectsQuery = useSubjects({ includeInactive })

  const createSubject = useCreateSubject()

  const updateSubject = useUpdateSubject()

  const deleteSubject = useDeleteSubject()



  const [modalMode, setModalMode] = useState<ModalMode>(null)

  const [editingSubject, setEditingSubject] = useState<SubjectItemType | null>(null)

  const [hidingSubject, setHidingSubject] = useState<SubjectItemType | null>(null)

  const [formError, setFormError] = useState<string | null>(null)

  const [hideError, setHideError] = useState<string | null>(null)



  const subjects = subjectsQuery.data ?? []

  const isFormSubmitting = createSubject.isPending || updateSubject.isPending



  function openCreate() {

    setFormError(null)

    setEditingSubject(null)

    setModalMode('create')

  }



  function openEdit(subject: SubjectItemType) {

    setFormError(null)

    setEditingSubject(subject)

    setModalMode('edit')

  }



  function closeModal() {

    if (isFormSubmitting) return

    setModalMode(null)

    setEditingSubject(null)

    setFormError(null)

  }



  async function handleSubmit(values: SubjectFormValues) {

    setFormError(null)



    try {

      if (modalMode === 'create') {

        await createSubject.mutateAsync({

          subjectName: values.subjectName,

          description: values.description,

        })

      }



      if (modalMode === 'edit' && editingSubject) {

        const payload: SubjectUpdatePayload = {

          subjectName: values.subjectName,

          description: values.description,

          isActive: values.isActive,

        }

        await updateSubject.mutateAsync({ id: editingSubject.id, payload })

      }



      setModalMode(null)

      setEditingSubject(null)

    } catch (error) {

      setFormError(getApiErrorMessage(error, 'Không thể lưu môn học'))

    }

  }



  async function confirmHide() {

    if (!hidingSubject) return

    setHideError(null)



    try {

      await deleteSubject.mutateAsync(hidingSubject.id)

      setHidingSubject(null)

    } catch (error) {

      setHideError(getApiErrorMessage(error, 'Không thể ẩn môn học'))

    }

  }



  return (

    <section className="space-y-5">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Môn học</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Quản lý môn học</h1>

          <p className="mt-1 text-sm text-slate-500">Tạo, chỉnh sửa và quản lý các môn học.</p>

        </div>

        <Button onClick={openCreate} className="w-full sm:w-auto">

          <Plus className="h-4 w-4" strokeWidth={2} />

          Thêm môn học

        </Button>

      </div>

      <IncludeInactiveToggle checked={includeInactive} onChange={setIncludeInactive} />



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

          description="Thêm môn học đầu tiên để bắt đầu xây dựng đề thi và bộ câu hỏi luyện tập."

          action={

            <Button onClick={openCreate}>

              <Plus className="h-4 w-4" strokeWidth={2} />

              Thêm môn học

            </Button>

          }

        />

      ) : null}



      {subjectsQuery.isSuccess && subjects.length > 0 ? (

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="divide-y divide-slate-100 md:hidden">

            {subjects.map((subject) => (

              <SubjectItem

                key={subject.id}

                subject={subject}

                onEdit={openEdit}

                onHide={(item) => {

                  setHideError(null)

                  setHidingSubject(item)

                }}

              />

            ))}

          </div>



          <div className="hidden md:block">

            <Table>

              <TableColGroup>

                <TableCol width="30%" />

                <TableCol />

                <TableCol width="8rem" />

                <TableCol width="20%" />

              </TableColGroup>

              <TableHeader>

                <TableRow className="border-b-0 hover:bg-transparent">

                  <TableHead>Tên môn học</TableHead>

                  <TableHead>Mô tả</TableHead>

                  <TableHead>Trạng thái</TableHead>

                  <TableHead>Thao tác</TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {subjects.map((subject) => (

                  <SubjectTableRow

                    key={subject.id}

                    subject={subject}

                    onEdit={openEdit}

                    onHide={(item) => {

                      setHideError(null)

                      setHidingSubject(item)

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

                  {modalMode === 'create' ? 'Thêm môn học' : 'Chỉnh sửa môn học'}

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

            <SubjectForm

              mode={modalMode}

              initialValues={editingSubject ?? undefined}

              isSubmitting={isFormSubmitting}

              submitError={formError}

              onSubmit={handleSubmit}

              onCancel={closeModal}

            />

          </div>

        </div>

      ) : null}



      {hidingSubject ? (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">

          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">

            <h3 className="text-base font-semibold text-slate-900">Ẩn môn học?</h3>

            <p className="mt-2 text-sm text-slate-600">

              Môn{' '}

              <span className="font-medium text-slate-900">{hidingSubject.subjectName}</span> sẽ không còn hiển thị

              trong danh sách mặc định. Bạn có thể khôi phục bằng cách bật lại &quot;Môn đang hiển thị&quot; khi sửa.

            </p>

            {hideError ? (

              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">

                {hideError}

              </p>

            ) : null}

            <div className="mt-5 flex gap-2">

              <Button

                variant="secondary"

                className="flex-1"

                disabled={deleteSubject.isPending}

                onClick={() => setHidingSubject(null)}

              >

                Hủy

              </Button>

              <Button

                variant="danger"

                className="flex-1"

                disabled={deleteSubject.isPending}

                onClick={() => void confirmHide()}

              >

                {deleteSubject.isPending ? 'Đang ẩn...' : 'Ẩn môn'}

              </Button>

            </div>

          </div>

        </div>

      ) : null}

    </section>

  )

}

