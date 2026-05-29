import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Character from './Character'
import { useEmotionStore, EMOTION_MATRIX } from '../store/emotionStore'

// ─── Metric Card ──────────────────────────────────────────────────

function MetricCard({ label, value, unit, bar, barColor, icon }) {
  return (
    <div style={{
      background: 'var(--color-background-secondary)',
      borderRadius: 10,
      padding: '10px 14px',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)' }}>
        {value}<span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2, color: 'var(--color-text-secondary)' }}>{unit}</span>
      </div>
      {bar !== undefined && (
        <div style={{ height: 3, borderRadius: 2, background: 'var(--color-border-tertiary)', marginTop: 8 }}>
          <motion.div
            animate={{ width: `${Math.min(bar, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 2, background: barColor ?? '#639922' }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Slider Control ───────────────────────────────────────────────

function SliderRow({ label, value, min, max, step = 1, unit = '', onChange, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', minWidth: 100 }}>{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: color }}
      />
      <span style={{ fontSize: 12, fontWeight: 500, minWidth: 40, textAlign: 'right', color: 'var(--color-text-primary)' }}>
        {value}{unit}
      </span>
    </div>
  )
}

// ─── Event Log ────────────────────────────────────────────────────

function EventLog({ history }) {
  return (
    <div style={{
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '8px 14px',
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--color-text-secondary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        background: 'var(--color-background-secondary)',
      }}>
        事件紀錄
      </div>
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        <AnimatePresence initial={false}>
          {history.length === 0 ? (
            <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              尚無事件
            </div>
          ) : history.map((entry, i) => (
            <motion.div
              key={entry.time + entry.state + i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 14px',
                borderBottom: i < history.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none',
                fontSize: 12,
              }}
            >
              <span style={{ fontSize: 18 }}>{entry.emotion.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{entry.emotion.label}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 11, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.emotion.message}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{entry.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Widget Pill (Dynamic Island-style) ──────────────────────────

function WidgetPill() {
  const { emotion, currentState, isVisible } = useEmotionStore()
  const idle = currentState === 'SystemIdle'
  return (
    <motion.div
      layout
      animate={{ width: idle ? 100 : 220 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        height: 32,
        borderRadius: 16,
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        gap: 8,
        overflow: 'hidden',
        margin: '0 auto',
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{emotion.emoji}</span>
      <AnimatePresence>
        {!idle && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: 11, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            {emotion.message}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────

export default function Dashboard() {
  const { metrics, updateMetrics, history, clearHistory, triggerEmotion } = useEmotionStore()
  const [tab, setTab] = useState('bakery')
  const autoRef = useRef(null)
  const [autoPlay, setAutoPlay] = useState(false)

  // Auto-demo sequence
  const demoStates = ['NewOrder','OrderSurge','OrderUrgent','GoalAchieved','SystemStress','SystemError','SystemRecovery','UserTired','TaskDone','GoodReview']
  const demoIdx = useRef(0)

  useEffect(() => {
    if (autoPlay) {
      autoRef.current = setInterval(() => {
        triggerEmotion(demoStates[demoIdx.current % demoStates.length])
        demoIdx.current++
      }, 3000)
    } else {
      clearInterval(autoRef.current)
    }
    return () => clearInterval(autoRef.current)
  }, [autoPlay])

  const tabStyle = (t) => ({
    padding: '6px 16px',
    borderRadius: 99,
    border: '0.5px solid var(--color-border-secondary)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: tab === t ? 500 : 400,
    background: tab === t ? 'var(--color-text-primary)' : 'transparent',
    color: tab === t ? 'var(--color-background-primary)' : 'var(--color-text-secondary)',
  })

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Widget pill */}
      <WidgetPill />

      {/* Character */}
      <div style={{ display: 'flex', justifyContent: 'center', minHeight: 120 }}>
        <Character size="lg" showLabel showMessage />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={tabStyle('bakery')} onClick={() => setTab('bakery')}>烘焙店</button>
        <button style={tabStyle('system')} onClick={() => setTab('system')}>系統監控</button>
        <button style={tabStyle('user')} onClick={() => setTab('user')}>使用者行為</button>
        <button style={tabStyle('log')} onClick={() => setTab('log')}>事件紀錄</button>
      </div>

      {/* Bakery Panel */}
      {tab === 'bakery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <MetricCard label="今日訂單" value={metrics.orderCount} unit="筆" icon="📦"
              bar={(metrics.orderCount / metrics.orderBaseline) * 100} barColor="#639922" />
            <MetricCard label="今日業績" value={`$${metrics.todaySales.toLocaleString()}`} unit="" icon="💰"
              bar={(metrics.todaySales / metrics.salesTarget) * 100} barColor="#534AB7" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <MetricCard label="緊急出貨" value={metrics.urgentOrders} unit="筆" icon="⏱"
              bar={metrics.urgentOrders * 20} barColor="#E24B4A" />
            <MetricCard label="備料庫存" value={metrics.stockLevel} unit="%" icon="🧁"
              bar={metrics.stockLevel} barColor={metrics.stockLevel < 30 ? '#E24B4A' : '#639922'} />
          </div>

          <div style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 10 }}>調整數值觀察角色反應</div>
            <SliderRow label="訂單數量" value={metrics.orderCount} min={0} max={60} color="#639922"
              onChange={v => updateMetrics({ orderCount: v })} unit=" 筆" />
            <SliderRow label="今日業績" value={metrics.todaySales} min={0} max={50000} step={1000} color="#534AB7"
              onChange={v => updateMetrics({ todaySales: v })} unit="" />
            <SliderRow label="緊急訂單" value={metrics.urgentOrders} min={0} max={10} color="#E24B4A"
              onChange={v => updateMetrics({ urgentOrders: v })} unit=" 筆" />
            <SliderRow label="庫存水位" value={metrics.stockLevel} min={0} max={100} color="#BA7517"
              onChange={v => updateMetrics({ stockLevel: v })} unit="%" />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => triggerEmotion('GoodReview')}
              style={{ fontSize: 12, padding: '6px 14px', borderRadius: 99, border: '0.5px solid var(--color-border-secondary)', cursor: 'pointer', background: 'transparent', color: 'var(--color-text-primary)' }}>
              觸發好評 🌸
            </button>
            <button onClick={() => triggerEmotion('GoalAchieved')}
              style={{ fontSize: 12, padding: '6px 14px', borderRadius: 99, border: '0.5px solid var(--color-border-secondary)', cursor: 'pointer', background: 'transparent', color: 'var(--color-text-primary)' }}>
              今日目標達成 🏆
            </button>
          </div>
        </div>
      )}

      {/* System Panel */}
      {tab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <MetricCard label="CPU" value={metrics.cpu} unit="%" icon="💻"
              bar={metrics.cpu} barColor={metrics.cpu > 85 ? '#E24B4A' : '#378ADD'} />
            <MetricCard label="RAM" value={metrics.ram} unit="%" icon="🧠"
              bar={metrics.ram} barColor={metrics.ram > 90 ? '#E24B4A' : '#639922'} />
          </div>
          <MetricCard label="錯誤率" value={metrics.errorRate} unit="%" icon="🚨"
            bar={metrics.errorRate * 10} barColor="#E24B4A" />

          <div style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 10 }}>調整數值觀察角色反應</div>
            <SliderRow label="CPU 使用率" value={metrics.cpu} min={0} max={100} color="#378ADD"
              onChange={v => updateMetrics({ cpu: v })} unit="%" />
            <SliderRow label="RAM 使用率" value={metrics.ram} min={0} max={100} color="#639922"
              onChange={v => updateMetrics({ ram: v })} unit="%" />
            <SliderRow label="錯誤率" value={metrics.errorRate} min={0} max={20} step={0.5} color="#E24B4A"
              onChange={v => updateMetrics({ errorRate: v })} unit="%" />
          </div>
        </div>
      )}

      {/* User Behavior Panel */}
      {tab === 'user' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <MetricCard label="待辦事項" value={metrics.pendingTasks} unit="項" icon="📋"
              bar={(metrics.pendingTasks / 25) * 100} barColor={metrics.pendingTasks > 20 ? '#E24B4A' : '#639922'} />
            <MetricCard label="閒置時間" value={metrics.idleMinutes} unit="分" icon="⏸"
              bar={(metrics.idleMinutes / 15) * 100} barColor="#888780" />
          </div>
          <MetricCard label="連續工作" value={metrics.workHours.toFixed(1)} unit="小時" icon="⏰"
            bar={(metrics.workHours / 4) * 100} barColor={metrics.workHours >= 3 ? '#EF9F27' : '#639922'} />

          <div style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 10 }}>調整數值觀察角色反應</div>
            <SliderRow label="待辦事項" value={metrics.pendingTasks} min={0} max={30} color="#639922"
              onChange={v => updateMetrics({ pendingTasks: v })} unit=" 項" />
            <SliderRow label="閒置分鐘" value={metrics.idleMinutes} min={0} max={20} color="#888780"
              onChange={v => updateMetrics({ idleMinutes: v })} unit=" 分" />
            <SliderRow label="工作小時" value={metrics.workHours} min={0} max={5} step={0.5} color="#EF9F27"
              onChange={v => updateMetrics({ workHours: v })} unit=" 時" />
          </div>

          <button onClick={() => triggerEmotion('TaskDone')}
            style={{ fontSize: 12, padding: '6px 14px', borderRadius: 99, border: '0.5px solid var(--color-border-secondary)', cursor: 'pointer', background: 'transparent', color: 'var(--color-text-primary)', alignSelf: 'flex-start' }}>
            完成任務 🎆
          </button>
        </div>
      )}

      {/* Event Log */}
      {tab === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <EventLog history={history} />
          {history.length > 0 && (
            <button onClick={clearHistory}
              style={{ fontSize: 12, padding: '6px 14px', borderRadius: 99, border: '0.5px solid var(--color-border-secondary)', cursor: 'pointer', background: 'transparent', color: 'var(--color-text-secondary)', alignSelf: 'flex-start' }}>
              清除紀錄
            </button>
          )}
        </div>
      )}

      {/* Auto-demo */}
      <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>自動演示（每 3 秒切換狀態）</span>
        <button
          onClick={() => setAutoPlay(p => !p)}
          style={{
            fontSize: 12, padding: '5px 14px', borderRadius: 99,
            border: '0.5px solid var(--color-border-secondary)', cursor: 'pointer',
            background: autoPlay ? 'var(--color-text-primary)' : 'transparent',
            color: autoPlay ? 'var(--color-background-primary)' : 'var(--color-text-secondary)',
          }}
        >
          {autoPlay ? '停止' : '開始演示'}
        </button>
      </div>
    </div>
  )
}
