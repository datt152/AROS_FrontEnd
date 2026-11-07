import { Ionicons } from '@expo/vector-icons'
import { getApiErrorMessage } from '@aros/shared/api/apiError'
import {
  EXAM_SESSION_STATUS_LABEL,
  formatOmrDateTime,
  type ExamSessionItem,
} from '@aros/shared/features/omr/types/omr.types'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ClassroomStrip, type ClassroomStripItem } from '@/components/ClassroomStrip'
import { colors } from '@/theme/colors'

import { SessionStatusBadge } from '../components/OmrBadges'
import {
  useCreateExamSession,
  useExamSessions,
  useOmrExamClassrooms,
  useOmrExams,
  useUpdateExamSessionStatus,
} from '../hooks/useOmr'

type OmrSessionsScreenProps = {
  examId: number
}

function suggestedSessionName(classroom: ClassroomStripItem | null) {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `Chấm ${dd}/${mm}${classroom ? ` · ${classroom.className}` : ''}`
}

export function OmrSessionsScreen({ examId }: OmrSessionsScreenProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<ClassroomStripItem | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const examsQuery = useOmrExams()
  const classroomsQuery = useOmrExamClassrooms(examId)
  const sessionsQuery = useExamSessions(examId, selected?.id)
  const createMutation = useCreateExamSession(examId)
  const statusMutation = useUpdateExamSessionStatus(examId)

  const exam = examsQuery.data?.find((item) => item.id === examId)
  const classrooms = classroomsQuery.data ?? []

  const sessions = useMemo(
    () =>
      [...(sessionsQuery.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [sessionsQuery.data],
  )

  const isRefreshing =
    (classroomsQuery.isFetching && !classroomsQuery.isLoading) ||
    (sessionsQuery.isFetching && !sessionsQuery.isLoading)

  function onRefresh() {
    void classroomsQuery.refetch()
    if (selected) void sessionsQuery.refetch()
  }

  function selectClassroom(item: ClassroomStripItem) {
    setSelected(item.id === selected?.id ? null : item)
    setCreateOpen(false)
    setActionError(null)
  }

  function openCreate() {
    setSessionName(suggestedSessionName(selected))
    setCreateOpen(true)
  }

  async function handleCreate() {
    if (!selected) return
    const name = sessionName.trim()
    if (!name) return
    setActionError(null)
    try {
      const session = await createMutation.mutateAsync({
        examId,
        classroomId: selected.id,
        name,
      })
      setCreateOpen(false)
      router.push({
        pathname: '/teacher/workspace',
        params: { sessionId: String(session.id) },
      })
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Không tạo được phiên chấm'))
    }
  }

  async function patchStatus(session: ExamSessionItem, status: 'OPEN' | 'CLOSED' | 'GRADED') {
    setActionError(null)
    try {
      await statusMutation.mutateAsync({ sessionId: session.id, status })
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Không cập nhật được trạng thái phiên'))
    }
  }

  function confirmFinish(session: ExamSessionItem) {
    Alert.alert(
      'Kết thúc phiên chấm',
      `Phiên "${session.name}" có ${session.sheetCount} phiếu. Sau khi kết thúc sẽ không quét thêm được.`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Kết thúc', onPress: () => void patchStatus(session, 'GRADED') },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {exam?.title ?? 'Đề OMR'}
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {exam?.subjectName ?? '—'} · {exam?.totalQuestions ?? 0} câu ·{' '}
            {classrooms.length} lớp đã giao
          </Text>
        </View>
      </View>

      <FlatList
        data={selected ? sessions : []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionLabel}>
              {selected ? 'Lớp đang chấm' : 'Chọn lớp để chấm'}
            </Text>
            <Text style={styles.sectionHint}>Điểm OMR gắn theo lớp — quét lớp A không ghi điểm lớp B.</Text>

            {classroomsQuery.isLoading ? (
              <ActivityIndicator color={colors.primary} style={styles.inlineLoader} />
            ) : classroomsQuery.isError ? (
              <Text style={styles.errorText}>
                {getApiErrorMessage(classroomsQuery.error, 'Không tải được danh sách lớp')}
              </Text>
            ) : classrooms.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyBoxText}>
                  Đề chưa giao lớp. Giao đề cho ít nhất một lớp trước khi tạo phiên chấm.
                </Text>
              </View>
            ) : (
              <View style={styles.stripWrap}>
                <ClassroomStrip
                  classrooms={classrooms}
                  selectedId={selected?.id}
                  onSelect={selectClassroom}
                />
              </View>
            )}

            {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}

            {selected ? (
              <>
                <View style={styles.sessionsHeader}>
                  <Text style={styles.sectionLabel}>Phiên chấm</Text>
                  {!createOpen ? (
                    <Pressable
                      style={({ pressed }) => [styles.createBtn, pressed && styles.createBtnPressed]}
                      onPress={openCreate}
                    >
                      <Ionicons name="add" size={16} color="#fff" />
                      <Text style={styles.createBtnText}>Tạo phiên</Text>
                    </Pressable>
                  ) : null}
                </View>

                {createOpen ? (
                  <View style={styles.createCard}>
                    <Text style={styles.createTitle}>Phiên chấm mới</Text>
                    <Text style={styles.createSub}>
                      Lớp: {selected.className}
                      {selected.subjectName ? ` · ${selected.subjectName}` : ''}
                    </Text>
                    <TextInput
                      style={styles.nameInput}
                      value={sessionName}
                      onChangeText={setSessionName}
                      placeholder="Vd: Chấm buổi sáng"
                      placeholderTextColor={colors.textSubtle}
                      editable={!createMutation.isPending}
                      returnKeyType="done"
                      onSubmitEditing={() => void handleCreate()}
                    />
                    <View style={styles.createActions}>
                      <Pressable
                        style={[styles.formBtn, styles.formBtnCancel]}
                        onPress={() => setCreateOpen(false)}
                        disabled={createMutation.isPending}
                      >
                        <Text style={styles.formBtnCancelText}>Hủy</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.formBtn,
                          styles.formBtnPrimary,
                          (!sessionName.trim() || createMutation.isPending) && styles.formBtnDisabled,
                        ]}
                        onPress={() => void handleCreate()}
                        disabled={!sessionName.trim() || createMutation.isPending}
                      >
                        {createMutation.isPending ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.formBtnPrimaryText}>Tạo</Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </>
            ) : classrooms.length > 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyBoxText}>Bấm vào lớp phía trên để xem và tạo phiên chấm OMR.</Text>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          selected ? (
            sessionsQuery.isLoading ? (
              <View style={styles.inlineCenter}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.loadingText}>Đang tải phiên chấm…</Text>
              </View>
            ) : sessionsQuery.isError ? (
              <View style={styles.inlineCenter}>
                <Text style={styles.errorText}>
                  {getApiErrorMessage(sessionsQuery.error, 'Không tải được phiên chấm')}
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                  onPress={() => void sessionsQuery.refetch()}
                >
                  <Text style={styles.actionBtnText}>Thử lại</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.inlineCenter}>
                <Text style={styles.emptyTitle}>Chưa có phiên chấm</Text>
                <Text style={styles.emptyDesc}>
                  Tạo phiên cho lớp {selected.className} để bắt đầu quét phiếu OMR.
                </Text>
              </View>
            )
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.sessionCard}>
            <View style={styles.sessionTop}>
              <View style={styles.sessionTitleWrap}>
                <Text style={styles.sessionName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.sessionMeta}>
                  {item.classroomName || selected?.className || '—'} · {item.sheetCount} phiếu ·{' '}
                  {formatOmrDateTime(item.createdAt)}
                </Text>
              </View>
              <SessionStatusBadge status={item.status} />
            </View>

            <View style={styles.sessionActions}>
              <Pressable
                style={({ pressed }) => [styles.openSessionBtn, pressed && styles.openSessionBtnPressed]}
                onPress={() =>
                  router.push({
                    pathname: '/teacher/workspace',
                    params: { sessionId: String(item.id) },
                  })
                }
              >
                <Ionicons name="eye-outline" size={16} color="#fff" />
                <Text style={styles.openSessionText}>Mở phiên</Text>
              </Pressable>

              {item.status === 'OPEN' ? (
                <Pressable
                  style={styles.miniBtn}
                  onPress={() => void patchStatus(item, 'CLOSED')}
                  disabled={statusMutation.isPending}
                >
                  <Ionicons name="lock-closed-outline" size={15} color={colors.textMuted} />
                  <Text style={styles.miniBtnText}>Khóa</Text>
                </Pressable>
              ) : null}

              {item.status === 'CLOSED' ? (
                <>
                  <Pressable
                    style={styles.miniBtn}
                    onPress={() => void patchStatus(item, 'OPEN')}
                    disabled={statusMutation.isPending}
                  >
                    <Ionicons name="lock-open-outline" size={15} color="#047857" />
                    <Text style={[styles.miniBtnText, { color: '#047857' }]}>Mở lại</Text>
                  </Pressable>
                  <Pressable
                    style={styles.miniBtn}
                    onPress={() => confirmFinish(item)}
                    disabled={statusMutation.isPending}
                  >
                    <Ionicons name="checkmark-circle-outline" size={15} color={colors.primary} />
                    <Text style={[styles.miniBtnText, { color: colors.primary }]}>Kết thúc</Text>
                  </Pressable>
                </>
              ) : null}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  sectionHint: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 2,
    marginBottom: 10,
  },
  stripWrap: {
    marginHorizontal: -16,
  },
  inlineLoader: {
    marginVertical: 20,
  },
  sessionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 10,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  createBtnPressed: {
    backgroundColor: colors.primaryPressed,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  createCard: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  createSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  nameInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
    marginTop: 4,
  },
  createActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  formBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBtnCancel: {
    backgroundColor: '#F1F5F9',
  },
  formBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  formBtnPrimary: {
    backgroundColor: colors.primary,
  },
  formBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  formBtnDisabled: {
    opacity: 0.5,
  },
  sessionCard: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sessionTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sessionTitleWrap: {
    flex: 1,
    gap: 2,
  },
  sessionName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  sessionMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  openSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  openSessionBtnPressed: {
    backgroundColor: colors.primaryPressed,
  },
  openSessionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  emptyBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    padding: 16,
    marginTop: 8,
  },
  emptyBoxText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  inlineCenter: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    marginTop: 8,
  },
  actionBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnPressed: {
    backgroundColor: '#F8FAFC',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
})
