import { Ionicons } from '@expo/vector-icons'
import { getApiErrorMessage } from '@aros/shared/api/apiError'
import { sortByNewest } from '@aros/shared/utils/sortByNewest'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors } from '@/theme/colors'

import { useOmrExams } from '../hooks/useOmr'

export function OmrExamListScreen() {
  const router = useRouter()
  const examsQuery = useOmrExams()
  const [search, setSearch] = useState('')

  const exams = useMemo(() => {
    const sorted = sortByNewest(examsQuery.data ?? [])
    const keyword = search.trim().toLowerCase()
    if (!keyword) return sorted
    return sorted.filter(
      (exam) =>
        exam.title.toLowerCase().includes(keyword) ||
        (exam.subjectName ?? '').toLowerCase().includes(keyword),
    )
  }, [examsQuery.data, search])

  const isRefreshing = examsQuery.isFetching && !examsQuery.isLoading

  if (examsQuery.isLoading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.fullCenter}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải đề OMR…</Text>
      </View>
      </SafeAreaView>
    )
  }

  if (examsQuery.isError) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.fullCenter}>
        <View style={styles.errorIcon}>
          <Ionicons name="cloud-offline-outline" size={36} color={colors.danger} />
        </View>
        <Text style={styles.emptyTitle}>Không tải được đề OMR</Text>
        <Text style={styles.emptyDesc}>{getApiErrorMessage(examsQuery.error)}</Text>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          onPress={() => void examsQuery.refetch()}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.primary} />
          <Text style={styles.actionBtnText}>Thử lại</Text>
        </Pressable>
      </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
    <FlatList
      style={styles.screen}
      data={exams}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void examsQuery.refetch()} />
      }
      ListHeaderComponent={
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.textSubtle} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm đề, môn học…"
            placeholderTextColor={colors.textSubtle}
            returnKeyType="search"
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textSubtle} />
            </Pressable>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.inlineCenter}>
          <View style={styles.emptyIllustration}>
            <Ionicons name="scan-outline" size={36} color={colors.textSubtle} />
          </View>
          <Text style={styles.emptyTitle}>
            {search ? 'Không tìm thấy đề' : 'Chưa có đề OMR'}
          </Text>
          <Text style={styles.emptyDesc}>
            {search
              ? 'Thử từ khóa khác.'
              : 'Tạo đề với hình thức OMR / Giấy trong Quản lý bài thi trên web trước.'}
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const versionCodes = item.versionCodes ?? []
        const classroomCount = item.classroomIds?.length ?? 0
        const ready = versionCodes.length > 0 && classroomCount > 0
        return (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() =>
              router.push({ pathname: '/teacher/sessions', params: { examId: String(item.id) } })
            }
          >
            <View style={styles.cardTop}>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                  {item.subjectName ?? '—'}
                </Text>
              </View>
              <View style={styles.omrBadge}>
                <Text style={styles.omrBadgeText}>OMR</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Câu hỏi</Text>
                <Text style={styles.statValue}>{item.totalQuestions ?? 0}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Lớp gán</Text>
                <Text style={styles.statValue}>{classroomCount}</Text>
              </View>
            </View>

            {!ready ? (
              <Text style={styles.warnText}>
                Cần có mã đề và ít nhất một lớp trước khi mở phiên chấm.
              </Text>
            ) : null}

            <View style={[styles.openBtn, !ready && styles.openBtnMuted]}>
              <Ionicons
                name="scan-outline"
                size={17}
                color={ready ? '#fff' : colors.textMuted}
              />
              <Text style={[styles.openBtnText, !ready && styles.openBtnTextMuted]}>
                Phiên chấm
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={ready ? '#fff' : colors.textMuted}
              />
            </View>
          </Pressable>
        )
      }}
    />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  card: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 18,
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textMuted,
  },
  omrBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
  },
  omrBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  warnText: {
    fontSize: 12,
    color: '#B45309',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  openBtnMuted: {
    backgroundColor: '#F1F5F9',
  },
  openBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  openBtnTextMuted: {
    color: colors.textMuted,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
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
    textAlign: 'center',
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
