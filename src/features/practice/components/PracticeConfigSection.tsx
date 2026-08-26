type PracticeConfigSectionProps = {
  timeLimitEnabled: boolean
  duration: number | ''
  maxAttempts: number | ''
  errors?: {
    duration?: string
    maxAttempts?: string
  }
  onChange: (patch: {
    timeLimitEnabled?: boolean
    duration?: number | ''
    maxAttempts?: number | ''
  }) => void
}

function Switch({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-3 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-slate-900">
          {label}
        </label>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-blue-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export function PracticeConfigSection({
  timeLimitEnabled,
  duration,
  maxAttempts,
  errors,
  onChange,
}: PracticeConfigSectionProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Cấu hình luyện tập</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Điểm luôn hiện cho sinh viên sau khi nộp. Có thể tắt giới hạn giờ và giới hạn số lần làm.
        </p>
      </div>

      <Switch
        id="practice-time-limit"
        checked={timeLimitEnabled}
        onChange={(checked) => onChange({ timeLimitEnabled: checked })}
        label="Giới hạn thời gian làm bài"
        description="Tắt: không countdown / không auto-nộp hết giờ."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="practice-duration" className="text-sm font-medium text-slate-700">
            Thời lượng (phút)
          </label>
          <input
            id="practice-duration"
            type="number"
            min={1}
            value={duration}
            disabled={!timeLimitEnabled}
            onChange={(event) =>
              onChange({ duration: event.target.value === '' ? '' : Number(event.target.value) })
            }
            className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
              errors?.duration
                ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
            }`}
          />
          {!timeLimitEnabled ? (
            <p className="text-xs text-slate-500">Không áp dụng</p>
          ) : null}
          {errors?.duration ? <p className="text-xs text-red-600">{errors.duration}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="practice-max-attempts" className="text-sm font-medium text-slate-700">
            Số lần làm tối đa
          </label>
          <input
            id="practice-max-attempts"
            type="number"
            min={1}
            placeholder="Để trống = không giới hạn"
            value={maxAttempts}
            onChange={(event) =>
              onChange({ maxAttempts: event.target.value === '' ? '' : Number(event.target.value) })
            }
            className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-4 ${
              errors?.maxAttempts
                ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
            }`}
          />
          {errors?.maxAttempts ? <p className="text-xs text-red-600">{errors.maxAttempts}</p> : null}
        </div>
      </div>
    </section>
  )
}
