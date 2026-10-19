import { Ionicons } from '@expo/vector-icons'
import {
  STUDENT_EXAM_STATUS_LABEL,
  type StudentExamListItem,
} from '@aros/shared/features/exams/types/studentExam.types'
import {
  PURPOSE_LABEL,
  formatSubmissionDateTime,
  getSubmissionListScoreDisplay,
  type StudentSubmissionItem,
} from '@aros/shared/features/submissions/types/submission.types'
import { getMyExams } from '@aros/shared/features/exams/api/exams.api'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { useMyClasses } from '@/features/classrooms/hooks/useMyClasses'
import { useMySubmissions } from '@/features/submissions/hooks/useMySubmissions'
import { colors } from '@/theme/colors'

// ─── Calendar helpers ────────────────────────────────────────

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  let startDow = first.getDay() - 1
  if (startDow < 0) startDow = 6

  const cells: Array<{ day: number; key: string } | null> = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= lastDay; d++) {
    cells.push({ day: d, key: `${year}-${month}-${d}` })
  }
  return cells
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function formatMonthYear(year: number, month: number) {
  const d = new Date(year, month, 1)
  return d.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
}

type CalendarEvent = {
  id: number
  title: string
  purpose: 'EXAM' | 'PRACTICE'
  examStatus: string
  startAt: string | null
  endAt: string | null
  classroomName?: string
  duration: number
  timeLimitEnabled: boolean
}

// ─── Main screen ─────────────────────────────────────────────

export function DashboardScreen() {
  const classesQuery = useMyClasses()
  const submissionsQuery = useMySubmissions()

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)

  const classrooms = classesQuery.data ?? []
  const submissions = submissionsQuery.data ?? []

  const recentSubmissions = useMemo(
    () =>
      submissions
        .filter((s) => s.status === 'SUBMITTED')
        .sort((a, b) => {
          const ta = a.submitTime ? new Date(a.submitTime).getTime() : 0
          const tb = b.submitTime ? new Date(b.submitTime).getTime() : 0
          return tb - ta
        })
        .slice(0, 8),
    [submissions],
  )

  // Fetch all exams across classrooms for calendar
  const fetchEvents = useCallback(async () => {
    if (classrooms.length === 0) {
      setEvents([])
      setEventsLoading(false)
      return
    }
    setEventsLoading(true)
    try {
      const results = await Promise.all(
        classrooms.slice(0, 10).map(async (c) => {
          const [exams, practices] = await Promise.all([
            getMyExams({ classroomId: c.id, purpose: 'EXAM', page: 0, size: 50 }),
            getMyExams({ classroomId: c.id, purpose: 'PRACTICE', page: 0, size: 50 }),
          ])
          return [
            ...exams.items.map((e) => ({ ...e, classroomName: c.className, purpose: 'EXAM' as const })),
            ...practices.items.map((e) => ({ ...e, classroomName: c.className, purpose: 'PRACTICE' as const })),
          ]
        }),
      )
      const all = results.flat()
      const seen = new Set<number>()
      const unique = all.filter((e) => {
        if (seen.has(e.id)) return false
        seen.add(e.id)
        return true
      })
      setEvents(
        unique.map((e) => ({
          id: e.id,
          title: e.title,
          purpose: e.purpose,
          examStatus: e.examStatus,
          startAt: e.startAt,
          endAt: e.endAt,
          classroomName: e.classroomName,
          duration: e.duration,
          timeLimitEnabled: e.timeLimitEnabled,
        })),
      )
    } catch {
      setEvents([])
    } finally {
      setEventsLoading(false)
    }
  }, [classrooms])

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  // Map dateKey → events
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of events) {
      if (!ev.startAt) continue
      const d = new Date(ev.startAt)
      if (Number.isNaN(d.getTime())) continue
      const key = dateKey(d)
      const list = map.get(key) ?? []
      list.push(ev)
      map.set(key, list)
    }
    return map
  }, [events])

  // Days for current month
  const cells = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth])
  const todayKey = dateKey(today)

  // Selected day events
  const selectedEvents = useMemo(() => {
    if (selectedDay === null) return []
    const key = `${viewYear}-${viewMonth}-${selectedDay}`
    return eventsByDate.get(key) ?? []
  }, [selectedDay, viewYear, viewMonth, eventsByDate])

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
    setSelectedDay(null)
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
    setSelectedDay(null)
  }

  function goToday() {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDay(today.getDate())
  }

  const isRefreshing =
    (classesQuery.isFetching && !classesQuery.isLoading) ||
    (submissionsQuery.isFetching && !submissionsQuery.isLoading)

  function onRefresh() {
    void classesQuery.refetch()
    void submissionsQuery.refetch()
  }

  if (classesQuery.isLoading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      {/* ─── Calendar ──────────────────────────────────────── */}
      <View style={styles.calendarCard}>
        {/* Month nav */}
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} hitSlop={12} style={styles.monthArrow}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
          <Pressable onPress={goToday}>
            <Text style={styles.monthTitle}>{formatMonthYear(viewYear, viewMonth)}</Text>
          </Pressable>
          <Pressable onPress={nextMonth} hitSlop={12} style={styles.monthArrow}>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Weekday header */}
        <View style={styles.weekRow}>
          {WEEKDAYS.map((w) => (
            <Text key={w} style={styles.weekLabel}>{w}</Text>
          ))}
        </View>

        {/* Day grid */}
        <View style={styles.dayGrid}>
          {cells.map((cell, i) => {
            if (!cell) return <View key={`e-${i}`} style={styles.dayCell} />

            const key = cell.key
            const isToday = key === todayKey
            const isSelected = cell.day === selectedDay
            const dayEvents = eventsByDate.get(key)
            const hasExam = dayEvents?.some((e) => e.purpose === 'EXAM')
            const hasPractice = dayEvents?.some((e) => e.purpose === 'PRACTICE')

            return (
              <Pressable
                key={key}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isToday && !isSelected && styles.dayCellToday,
                ]}
                onPress={() => setSelectedDay(cell.day === selectedDay ? null : cell.day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.dayTextSelected,
                    isToday && !isSelected && styles.dayTextToday,
                  ]}
                >
                  {cell.day}
                </Text>
                {/* Dots */}
                {hasExam || hasPractice ? (
                  <View style={styles.dotRow}>
                    {hasExam ? <View style={[styles.dot, styles.dotExam]} /> : null}
                    {hasPractice ? <View style={[styles.dot, styles.dotPractice]} /> : null}
                  </View>
                ) : null}
              </Pressable>
            )
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.dotExam]} />
            <Text style={styles.legendText}>Bài thi</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.dotPractice]} />
            <Text style={styles.legendText}>Luyện tập</Text>
          </View>
        </View>

        {eventsLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 8 }} />
        ) : null}
      </View>

      {/* ─── Events for selected day ──────────────────────── */}
      {selectedDay !== null && selectedEvents.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Ngày {selectedDay}/{viewMonth + 1}
          </Text>
          <View style={styles.eventList}>
            {selectedEvents.map((ev) => (
              <EventRow key={ev.id} event={ev} />
            ))}
          </View>
        </View>
      ) : selectedDay !== null && !eventsLoading ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Ngày {selectedDay}/{viewMonth + 1}
          </Text>
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayText}>Không có lịch thi</Text>
          </View>
        </View>
      ) : null}

      {/* ─── Recent submissions ────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={18} color={colors.textMuted} />
          <Text style={styles.sectionTitle}>Bài làm gần đây</Text>
        </View>

        {recentSubmissions.length === 0 ? (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayText}>Chưa có bài nộp nào</Text>
          </View>
        ) : (
          <View style={styles.submissionList}>
            {recentSubmissions.map((s) => (
              <SubmissionRow key={s.submissionId} item={s} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  )
}

// ─── Sub-components ──────────────────────────────────────────

function EventRow({ event }: { event: CalendarEvent }) {
  const isPractice = event.purpose === 'PRACTICE'
  const time = event.startAt
    ? new Date(event.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <View style={styles.eventCard}>
      <View style={[styles.eventAccent, isPractice ? styles.accentPractice : styles.accentExam]} />
      <View style={styles.eventBody}>
        <View style={styles.eventTop}>
          <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
          <View style={[styles.purposeBadge, isPractice ? styles.badgePractice : styles.badgeExam]}>
            <Text style={[styles.purposeText, isPractice ? styles.purposePractice : styles.purposeExam]}>
              {isPractice ? 'Luyện tập' : 'Bài thi'}
            </Text>
          </View>
        </View>
        <View style={styles.eventMeta}>
          {time ? (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={colors.textSubtle} />
              <Text style={styles.metaText}>{time}</Text>
            </View>
          ) : null}
          <View style={styles.metaItem}>
            <Ionicons name="hourglass-outline" size={13} color={colors.textSubtle} />
            <Text style={styles.metaText}>
              {event.timeLimitEnabled ? `${event.duration} phút` : 'Tự do'}
            </Text>
          </View>
          {event.classroomName ? (
            <View style={styles.metaItem}>
              <Ionicons name="school-outline" size={13} color={colors.textSubtle} />
              <Text style={styles.metaText}>{event.classroomName}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  )
}

function SubmissionRow({ item }: { item: StudentSubmissionItem }) {
  const scoreDisplay = getSubmissionListScoreDisplay(item)
  const isPractice = item.purpose === 'PRACTICE'

  return (
    <View style={styles.subRow}>
      <View style={[styles.subIcon, isPractice ? styles.subIconPractice : styles.subIconExam]}>
        <Ionicons
          name={isPractice ? 'book-outline' : 'document-text-outline'}
          size={16}
          color={isPractice ? colors.accent : colors.primary}
        />
      </View>
      <View style={styles.subInfo}>
        <Text style={styles.subTitle} numberOfLines={1}>{item.examTitle}</Text>
        <Text style={styles.subMeta}>
          {PURPOSE_LABEL[item.purpose]} · {formatSubmissionDateTime(item.submitTime)}
        </Text>
      </View>
      <View style={styles.subScore}>
        <Text style={[styles.subScoreText, scoreDisplay.locked && styles.subScoreLocked]}>
          {scoreDisplay.text}
        </Text>
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: 8,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  // ── Calendar
  calendarCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSubtle,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellToday: {
    backgroundColor: '#EFF6FF',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  dayTextToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotExam: {
    backgroundColor: '#3B82F6',
  },
  dotPractice: {
    backgroundColor: '#10B981',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSubtle,
  },

  // ── Section
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },

  // ── Events
  eventList: {
    gap: 8,
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  eventAccent: {
    width: 4,
  },
  accentExam: {
    backgroundColor: '#3B82F6',
  },
  accentPractice: {
    backgroundColor: '#10B981',
  },
  eventBody: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  purposeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeExam: {
    backgroundColor: '#EFF6FF',
  },
  badgePractice: {
    backgroundColor: '#ECFDF5',
  },
  purposeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  purposeExam: {
    color: '#3B82F6',
  },
  purposePractice: {
    color: '#059669',
  },
  eventMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSubtle,
  },

  // ── Empty day
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyDayText: {
    fontSize: 13,
    color: colors.textSubtle,
  },

  // ── Submissions
  submissionList: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  subIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subIconPractice: {
    backgroundColor: '#ECFDF5',
  },
  subIconExam: {
    backgroundColor: '#EFF6FF',
  },
  subInfo: {
    flex: 1,
    gap: 2,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  subMeta: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  subScore: {
    alignItems: 'flex-end',
  },
  subScoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  subScoreLocked: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSubtle,
  },

  bottomPadding: {
    height: 32,
  },
})
