import { Ionicons } from '@expo/vector-icons'
import type { ClassroomItem } from '@aros/shared/features/classrooms/types/classroom.types'
import {
  mergeStudentExamsWithSubmissions,
  type StudentExamListItem,
} from '@aros/shared/features/exams/types/studentExam.types'
import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { getApiErrorMessage } from '@aros/shared/api/apiError'

import { ClassroomStrip } from '@/components/ClassroomStrip'
import { ExamConfirmModal } from '@/components/ExamConfirmModal'
import { StudentExamCard } from '@/components/StudentExamCard'
import { useMyClasses } from '@/features/classrooms/hooks/useMyClasses'
import { useMySubmissions } from '@/features/submissions/hooks/useMySubmissions'
import { colors } from '@/theme/colors'

import { useOfficialExams } from '../hooks/useExams'

export function ExamListScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState<ClassroomItem | null>(null)
  const [confirmExam, setConfirmExam] = useState<StudentExamListItem | null>(null)

  const classesQuery = useMyClasses()
  const examsQuery = useOfficialExams(selected?.id)
  const submissionsQuery = useMySubmissions()

  const classrooms = classesQuery.data ?? []

  const exams = useMemo(
    () =>
      mergeStudentExamsWithSubmissions(
        examsQuery.data ?? [],
        submissionsQuery.data ?? [],
        'EXAM',
      ),
    [examsQuery.data, submissionsQuery.data],
  )

  const isRefreshing =
    (classesQuery.isFetching && !classesQuery.isLoading) ||
    (examsQuery.isFetching && !examsQuery.isLoading)

  const handleCardPress = useCallback(
    (exam: StudentExamListItem) => {
      if (!exam.canTake) return
      setConfirmExam(exam)
    },
    [],
  )

  function handleConfirmTake() {
    if (!confirmExam || !selected) return
    setConfirmExam(null)
    router.push({
      pathname: '/student/take-exam',
      params: { examId: String(confirmExam.id), classroomId: String(selected.id) },
    })
  }

  function onRefresh() {
    void classesQuery.refetch()
    if (selected) void examsQuery.refetch()
    void submissionsQuery.refetch()
  }

  // ─── Full-screen states ─────────────────────────────────────

  if (classesQuery.isLoading) {
    return (
      <View style={styles.fullCenter}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách lớp…</Text>
      </View>
    )
  }

  if (classesQuery.isError) {
    return (
      <View style={styles.fullCenter}>
        <View style={styles.errorIcon}>
          <Ionicons name="cloud-offline-outline" size={36} color={colors.danger} />
        </View>
        <Text style={styles.emptyTitle}>Lỗi kết nối</Text>
        <Text style={styles.emptyDesc}>
          {getApiErrorMessage(classesQuery.error, 'Không thể tải danh sách lớp')}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          onPress={() => void classesQuery.refetch()}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.primary} />
          <Text style={styles.actionBtnText}>Thử lại</Text>
        </Pressable>
      </View>
    )
  }

  if (classrooms.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.fullCenter}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.emptyIllustration}>
          <Ionicons name="school-outline" size={44} color={colors.textSubtle} />
        </View>
        <Text style={styles.emptyTitle}>Chưa có lớp học</Text>
        <Text style={styles.emptyDesc}>
          Bạn chưa được ghi danh vào lớp nào.{'\n'}Liên hệ giáo viên để được thêm vào lớp.
        </Text>
      </ScrollView>
    )
  }

  // ─── Main list ──────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <FlatList
        data={exams}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.cardPadding}>
            <StudentExamCard
              exam={item}
              purpose="EXAM"
              onPress={item.canTake ? handleCardPress : undefined}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <ClassroomStrip
              classrooms={classrooms}
              selectedId={selected?.id}
              onSelect={(item) => setSelected(item.id === selected?.id ? null : item)}
            />

            {selected ? (
              <View style={styles.contextBar}>
                <Ionicons name="document-text-outline" size={15} color={colors.primary} />
                <Text style={styles.contextText} numberOfLines={1}>
                  {selected.className} · {selected.subjectName}
                </Text>
                <Text style={styles.contextCount}>
                  {exams.length} bài
                </Text>
              </View>
            ) : (
              <View style={styles.promptCard}>
                <Ionicons name="hand-left-outline" size={28} color={colors.textSubtle} />
                <View style={styles.promptTextWrap}>
                  <Text style={styles.promptTitle}>Chọn lớp — môn học</Text>
                  <Text style={styles.promptDesc}>Vuốt ngang phía trên để chọn lớp bạn muốn xem</Text>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          selected ? (
            examsQuery.isLoading ? (
              <View style={styles.inlineCenter}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.loadingText}>Đang tải bài thi…</Text>
              </View>
            ) : examsQuery.isError ? (
              <View style={styles.inlineCenter}>
                <Text style={styles.errorText}>
                  {getApiErrorMessage(examsQuery.error, 'Không thể tải danh sách bài thi')}
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                  onPress={() => void examsQuery.refetch()}
                >
                  <Ionicons name="refresh-outline" size={16} color={colors.primary} />
                  <Text style={styles.actionBtnText}>Thử lại</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.inlineCenter}>
                <View style={styles.emptyIllustration}>
                  <Ionicons name="clipboard-outline" size={36} color={colors.textSubtle} />
                </View>
                <Text style={styles.emptyTitle}>Chưa có bài thi</Text>
                <Text style={styles.emptyDesc}>
                  Lớp này chưa có bài thi chính thức nào.
                </Text>
              </View>
            )
          ) : null
        }
      />

      <ExamConfirmModal
        visible={confirmExam !== null}
        exam={confirmExam}
        purpose="EXAM"
        onConfirm={handleConfirmTake}
        onClose={() => setConfirmExam(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 32,
    backgroundColor: colors.background,
  },
  inlineCenter: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  cardPadding: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  contextText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  contextCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },

  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  promptTextWrap: {
    flex: 1,
    gap: 2,
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  promptDesc: {
    fontSize: 13,
    color: colors.textSubtle,
  },

  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyIllustration: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnPressed: {
    backgroundColor: '#F8FAFC',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
})
