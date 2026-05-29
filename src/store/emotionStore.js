import { create } from 'zustand'

// ─── Emotion Matrix ───────────────────────────────────────────────
// 這是系統的靈魂：State → Emotion → Character Behavior

export const EMOTION_MATRIX = {
  // 系統監控
  SystemStress:   { emoji: '😰', label: '緊張',   color: '#EF9F27', bg: '#FAEEDA', animation: 'wobble',  message: '系統壓力偏高，正在處理中…' },
  SystemError:    { emoji: '😱', label: '驚慌',   color: '#E24B4A', bg: '#FCEBEB', animation: 'shake',   message: '偵測到錯誤，請確認系統狀態' },
  SystemRecovery: { emoji: '😅', label: '恢復',   color: '#639922', bg: '#EAF3DE', animation: 'bounce',  message: '系統已恢復正常，鬆一口氣' },
  SystemIdle:     { emoji: '😌', label: '放鬆',   color: '#888780', bg: '#F1EFE8', animation: 'breathe', message: '一切正常，靜靜陪著你' },

  // 烘焙 / 訂單
  NewOrder:       { emoji: '🏃', label: '衝刺',   color: '#639922', bg: '#EAF3DE', animation: 'run',     message: '新訂單來了！' },
  OrderSurge:     { emoji: '🤩', label: '興奮',   color: '#534AB7', bg: '#EEEDFE', animation: 'spin',    message: '訂單暴增，今日創紀錄！' },
  OrderUrgent:    { emoji: '😬', label: '焦急',   color: '#EF9F27', bg: '#FAEEDA', animation: 'shake',   message: '出貨快超時，請注意！' },
  LowStock:       { emoji: '😟', label: '擔心',   color: '#D85A30', bg: '#FAECE7', animation: 'wobble',  message: '備料不足，記得補貨' },
  HighSales:      { emoji: '🥂', label: '慶祝',   color: '#534AB7', bg: '#EEEDFE', animation: 'party',   message: '今日業績超標，開香檳！' },
  GoodReview:     { emoji: '🌸', label: '驕傲',   color: '#D4537E', bg: '#FBEAF0', animation: 'sparkle', message: '收到五星好評！' },

  // 使用者行為
  UserIdle:       { emoji: '💤', label: '無聊',   color: '#888780', bg: '#F1EFE8', animation: 'sleep',   message: '你已經離開很久了…' },
  UserTired:      { emoji: '☕', label: '提醒',   color: '#BA7517', bg: '#FAEEDA', animation: 'nudge',   message: '連續工作 3 小時，休息一下吧' },
  UserOverloaded: { emoji: '😵', label: '過載',   color: '#E24B4A', bg: '#FCEBEB', animation: 'dizzy',   message: '待辦太多了，先處理最重要的' },
  TaskDone:       { emoji: '🎆', label: '開心',   color: '#639922', bg: '#EAF3DE', animation: 'party',   message: '任務完成！' },
  GoalAchieved:   { emoji: '🏆', label: '勝利',   color: '#534AB7', bg: '#EEEDFE', animation: 'spin',    message: '今日目標達成，完美收工！' },
}

// ─── Event → State Mapping ────────────────────────────────────────

export function deriveState(metrics) {
  const { cpu, ram, errorRate, orderCount, orderBaseline,
          urgentOrders, stockLevel, todaySales, salesTarget,
          pendingTasks, idleMinutes, workHours, newReview } = metrics

  // 系統監控優先（危急訊號 > 業務訊號）
  if (errorRate > 5)              return 'SystemError'
  if (cpu > 85 || ram > 90)       return 'SystemStress'

  // 烘焙 / 訂單場景
  if (newReview)                  return 'GoodReview'
  if (todaySales >= salesTarget)  return 'GoalAchieved'
  if (urgentOrders > 0)           return 'OrderUrgent'
  if (stockLevel < 20)            return 'LowStock'
  if (orderCount > orderBaseline * 1.5) return 'OrderSurge'
  if (orderCount > orderBaseline * 1.1) return 'NewOrder'
  if (todaySales > salesTarget * 0.9)   return 'HighSales'

  // 使用者行為
  if (pendingTasks > 20)          return 'UserOverloaded'
  if (workHours >= 3)             return 'UserTired'
  if (idleMinutes >= 10)          return 'UserIdle'

  // 系統恢復 or 閒置
  if (cpu < 30 && errorRate === 0) return 'SystemIdle'
  return 'SystemIdle'
}

// ─── Zustand Store ────────────────────────────────────────────────

export const useEmotionStore = create((set, get) => ({
  // 當前狀態
  currentState: 'SystemIdle',
  emotion: EMOTION_MATRIX['SystemIdle'],
  history: [],           // 最近 10 筆事件紀錄
  isVisible: false,      // 角色是否顯示（低存在感核心）
  lastTriggered: null,

  // 系統指標（可由外部更新）
  metrics: {
    cpu: 12, ram: 45, errorRate: 0,
    orderCount: 8, orderBaseline: 20,
    urgentOrders: 0, stockLevel: 80,
    todaySales: 12000, salesTarget: 30000,
    pendingTasks: 3, idleMinutes: 0, workHours: 0,
    newReview: false,
  },

  // 更新指標並重新判斷狀態
  updateMetrics(partial) {
    const next = { ...get().metrics, ...partial }
    const newState = deriveState(next)
    const prev = get().currentState

    set({ metrics: next })

    // 只有狀態真正改變才觸發角色
    if (newState !== prev) {
      get().triggerEmotion(newState)
    }
  },

  // 觸發情緒（帶自動消失邏輯）
  triggerEmotion(stateName) {
    const emotion = EMOTION_MATRIX[stateName]
    if (!emotion) return

    const entry = {
      state: stateName,
      emotion,
      time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }

    set(s => ({
      currentState: stateName,
      emotion,
      isVisible: true,
      lastTriggered: Date.now(),
      history: [entry, ...s.history].slice(0, 10),
    }))

    // 非閒置狀態：5 秒後自動縮回低存在感
    if (stateName !== 'SystemIdle') {
      setTimeout(() => {
        if (Date.now() - get().lastTriggered >= 4900) {
          set({ isVisible: false })
          setTimeout(() => set({ currentState: 'SystemIdle', emotion: EMOTION_MATRIX['SystemIdle'], isVisible: true }), 300)
        }
      }, 5000)
    }
  },

  clearHistory() { set({ history: [] }) },
}))
