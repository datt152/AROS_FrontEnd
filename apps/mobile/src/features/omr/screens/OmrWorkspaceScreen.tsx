import { Ionicons } from '@expo/vector-icons'
import { getApiErrorMessage } from '@aros/shared/api/apiError'
import {
  formatOmrDateTime,
  formatOmrScore,
  getOmrSheetMatchIssues,
  type OmrSheetStatus,
} from '@aros/shared/features/omr/types/omr.types'
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors } from '@/theme/colors'

import { SessionStatusBadge, SheetStatusBadge } from '../components/OmrBadges'
import { useExamSession, useOmrSheets } from '../hooks/useOmr'

type StatusFilter = OmrSheetStatus | ''

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: '', label: 'Tất cả' },
  { id: 'GRADED', label: 'Đã chấm' },
  { id: 'NEEDS_REVIEW', label: 'Cần xem lại' },
  { id: 'PROCESSING', label: 'Đang xử lý' },
  { id: 'RETAKE_REQUIRED', label: 'Chụp lại' },
  { id: 'FAILED', label: 'Lỗi' },
]

export function OmrWorkspaceScreen({ sessionId }: { sessionId: number }) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const sessionQuery = useExamSession(sessionId)
  const sheetsQuery = useOmrSheets(sessionId)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [query, setQuery] = useState('')

  const session = sessionQuery.data
  const sheets = sheetsQuery.data ?? []
  const sessionOpen = session?.status === 'OPEN'

  const stats = useMemo(
    () => ({
      total: sheets.length,
      graded: sheets.filter((s) => s.status === 'GRADED').length,
      needsReview: sheets.filter((s) => s.status === 'NEEDS_REVIEW').length,
      processing: sheets.filter((s) => s.status === 'PROCESSING').length,
    }),
    [sheets],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sheets.filter((sheet) => {
      if (statusFilter && sheet.status !== statusFilter) return false
      if (!q) return true
      return (
        (sheet.studentId ?? '').toLowerCase().includes(q) ||
        (sheet.studentName ?? '').toLowerCase().includes(q) ||
        (sheet.examCode ?? '').toLowerCase().includes(q) ||
        String(sheet.submissionId).includes(q)
      )
    })
  }, [sheets, statusFilter, query])

  const isRefreshing =
    (sessionQuery.isFetching && !sessionQuery.isLoading) ||
    (sheetsQuery.isFetching && !sheetsQuery.isLoading)

  function onRefresh() {
    void sessionQuery.refetch()
    void sheetsQuery.refetch()
  }

  if (sessionQuery.isLoading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.fullCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (sessionQuery.isError || !session) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Phiên chấm</Text>
        </View>
        <View style={styles.fullCenter}>
          <Text style={styles.emptyTitle}>Không tải được phiên chấm</Text>
          <Text style={styles.emptyDesc}>
            {getApiErrorMessage(sessionQuery.error, 'Phiên chấm không tồn tại.')}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={() => void sessionQuery.refetch()}
          >
            <Text style={styles.actionBtnText}>Thử lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {session.name}
            </Text>
            <SessionStatusBadge status={session.status} />
          </View>
          <Text style={styles.headerSub} numberOfLines={1}>
            {session.examTitle}
            {session.classroomName ? ` · ${session.classroomName}` : ''}
          </Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.submissionId)}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 120 + insets.bottom },
        ]}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              <StatBox label="Tổng phiếu" value={stats.total} />
              <StatBox label="Đã chấm" value={stats.graded} accent="#047857" />
              <StatBox label="Cần xem lại" value={stats.needsReview} accent="#B45309" />
              <StatBox label="Đang xử lý" value={stats.processing} />
            </View>

            {!sessionOpen ? (
              <View style={styles.closedNotice}>
                <Ionicons name="lock-closed-outline" size={16} color="#B45309" />
                <Text style={styles.closedNoticeText}>
                  Phiên đã {session.status === 'GRADED' ? 'kết thúc' : 'khóa'} — không quét thêm
                  được. Mở lại phiên ở màn hình trước nếu cần quét tiếp.
                </Text>
              </View>
            ) : null}

            {/* Search */}
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={18} color={colors.textSubtle} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="MSSV, tên, mã đề…"
                placeholderTextColor={colors.textSubtle}
                returnKeyType="search"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textSubtle} />
                </Pressable>
              ) : null}
            </View>

            {/* Filter chips */}
            <View style={styles.chipRow}>
              {FILTERS.map((filter) => {
                const active = statusFilter === filter.id
                return (
                  <Pressable
                    key={filter.id || 'all'}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setStatusFilter(filter.id)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {filter.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          sheetsQuery.isLoading ? (
            <View style={styles.inlineCenter}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Đang tải danh sách phiếu…</Text>
            </View>
          ) : sheetsQuery.isError ? (
            <View style={styles.inlineCenter}>
              <Text style={styles.errorText}>
                {getApiErrorMessage(sheetsQuery.error, 'Không tải được danh sách phiếu')}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                onPress={() => void sheetsQuery.refetch()}
              >
                <Text style={styles.actionBtnText}>Thử lại</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.inlineCenter}>
              <View style={styles.emptyIllustration}>
                <Ionicons name="documents-outline" size={36} color={colors.textSubtle} />
              </View>
              <Text style={styles.emptyTitle}>
                {statusFilter || query ? 'Không có phiếu phù hợp' : 'Chưa có phiếu'}
              </Text>
              <Text style={styles.emptyDesc}>
                {statusFilter || query
                  ? 'Thử đổi bộ lọc hoặc từ khóa tìm kiếm.'
                  : sessionOpen
                    ? 'Bấm "Quét phiếu" bên dưới để bắt đầu chấm.'
                    : 'Phiên chưa có phiếu nào.'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const issues = getOmrSheetMatchIssues(item)
          return (
            <Pressable
              style={({ pressed }) => [styles.sheetCard, pressed && styles.sheetCardPressed]}
              onPress={() =>
                router.push({
                  pathname: '/teacher/sheet',
                  params: { sheetId: String(item.submissionId) },
                })
              }
            >
              <View style={styles.sheetTop}>
                <View style={styles.sheetTitleWrap}>
                  <Text style={styles.sheetName} numberOfLines={1}>
                    {item.studentName ?? item.studentId ?? 'Phiếu chưa nhận diện'}
                  </Text>
                  <Text style={styles.sheetMeta}>
                    MSSV {item.studentId ?? '—'} · mã {item.examCode ?? '—'}
                  </Text>
                </View>
                <View style={styles.badgeCol}>
                  <SheetStatusBadge status={item.status} />
                  {issues.label ? (
                    <View style={styles.issueBadge}>
                      <Ionicons name="warning-outline" size={11} color="#B45309" />
                      <Text style={styles.issueText}>{issues.label}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={styles.sheetBottom}>
                <Text style={styles.scoreText}>
                  Điểm {formatOmrScore(item.score, item.maxScore)}
                </Text>
                <Text style={styles.timeText}>{formatOmrDateTime(item.gradedAt)}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
              </View>
            </Pressable>
          )
        }}
      />

      {/* Sticky scan CTA */}
      {sessionOpen ? (
        <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 14 }]}>
          <Pressable
            style={({ pressed }) => [styles.scanBtn, pressed && styles.scanBtnPressed]}
            onPress={() =>
              router.push({ pathname: '/teacher/scan', params: { sessionId: String(sessionId) } })
            }
          >
            <Ionicons name="scan" size={22} color="#fff" />
            <Text style={styles.scanBtnText}>Quét phiếu</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  )
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: string
}) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    flexShrink: 1,
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
    gap: 10,
    paddingBottom: 110,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  closedNotice: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    padding: 12,
    marginBottom: 12,
  },
  closedNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
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
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: '#fff',
  },
  sheetCard: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sheetCardPressed: {
    opacity: 0.85,
  },
  sheetTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sheetTitleWrap: {
    flex: 1,
    gap: 2,
  },
  sheetName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  sheetMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  badgeCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  issueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  issueText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B45309',
  },
  sheetBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  timeText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSubtle,
  },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: 'rgba(248,250,252,0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  scanBtnPressed: {
    backgroundColor: colors.primaryPressed,
  },
  scanBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 32,
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
  emptyIllustration: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
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
