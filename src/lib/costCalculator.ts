// Cost Calculator para OpenAI API
// Temporal para development - removible

export interface ModelPricing {
  name: string
  inputPricePer1K: number
  outputPricePer1K: number
}

export interface CostBreakdown {
  inputTokens: number
  outputTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
  model: string
  timestamp: Date
}

export interface DailyCostSummary {
  date: string
  totalCost: number
  requestCount: number
  model: string
  breakdown: CostBreakdown[]
}

// Pricing configuration
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4o-mini': {
    name: 'GPT-4o-Mini',
    inputPricePer1K: 0.15,
    outputPricePer1K: 0.075,
  },
  'gpt-4o': {
    name: 'GPT-4o',
    inputPricePer1K: 2.50,
    outputPricePer1K: 1.25,
  },
}

// Get current model based on environment
export function getCurrentModel(): string {
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  return isDev 
    ? (process.env.OPENAI_MODEL_DEV || 'gpt-4o-mini')
    : (process.env.OPENAI_MODEL_PROD || 'gpt-4o')
}

// Calculate cost for a single request
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string = getCurrentModel()
): CostBreakdown {
  const pricing = MODEL_PRICING[model]
  
  if (!pricing) {
    throw new Error(`Unknown model: ${model}`)
  }

  const inputCost = (inputTokens / 1000) * pricing.inputPricePer1K
  const outputCost = (outputTokens / 1000) * pricing.outputPricePer1K
  const totalCost = inputCost + outputCost

  return {
    inputTokens,
    outputTokens,
    inputCost: Math.round(inputCost * 10000) / 10000, // 4 decimal places
    outputCost: Math.round(outputCost * 10000) / 10000,
    totalCost: Math.round(totalCost * 10000) / 10000,
    model,
    timestamp: new Date(),
  }
}

// Local storage key
const COST_STORAGE_KEY = 'contentflow_daily_costs'

// Save cost breakdown to localStorage
export function saveCostBreakdown(breakdown: CostBreakdown): void {
  if (typeof window === 'undefined') return

  const today = new Date().toISOString().split('T')[0]
  const existingData = localStorage.getItem(COST_STORAGE_KEY)
  
  let dailyCosts: Record<string, DailyCostSummary> = {}
  if (existingData) {
    try {
      dailyCosts = JSON.parse(existingData)
    } catch (e) {
      console.error('Error parsing cost data:', e)
    }
  }

  if (!dailyCosts[today]) {
    dailyCosts[today] = {
      date: today,
      totalCost: 0,
      requestCount: 0,
      model: breakdown.model,
      breakdown: [],
    }
  }

  dailyCosts[today].breakdown.push(breakdown)
  dailyCosts[today].totalCost += breakdown.totalCost
  dailyCosts[today].requestCount += 1
  dailyCosts[today].totalCost = Math.round(dailyCosts[today].totalCost * 10000) / 10000

  localStorage.setItem(COST_STORAGE_KEY, JSON.stringify(dailyCosts))
}

// Get daily cost summary
export function getDailyCostSummary(date?: string): DailyCostSummary | null {
  if (typeof window === 'undefined') return null

  const targetDate = date || new Date().toISOString().split('T')[0]
  const existingData = localStorage.getItem(COST_STORAGE_KEY)
  
  if (!existingData) return null

  try {
    const dailyCosts = JSON.parse(existingData)
    return dailyCosts[targetDate] || null
  } catch (e) {
    console.error('Error parsing cost data:', e)
    return null
  }
}

// Reset daily costs (for testing)
export function resetDailyCosts(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(COST_STORAGE_KEY)
}

// Check if cost exceeds limits
export function checkCostAlert(dailyCost: number): {
  shouldAlert: boolean
  level: 'warning' | 'danger'
  message: string
} {
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  const warningLimit = isDev ? 2 : 20
  const dangerLimit = isDev ? 5 : 50

  if (dailyCost >= dangerLimit) {
    return {
      shouldAlert: true,
      level: 'danger',
      message: `¡Costo diario alto! $${dailyCost.toFixed(4)} (límite: $${dangerLimit})`,
    }
  }

  if (dailyCost >= warningLimit) {
    return {
      shouldAlert: true,
      level: 'warning',
      message: `Costo diario elevado: $${dailyCost.toFixed(4)} (límite: $${dangerLimit})`,
    }
  }

  return {
    shouldAlert: false,
    level: 'warning',
    message: '',
  }
}

// Get color for cost display
export function getCostColor(cost: number): string {
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  const warningLimit = isDev ? 2 : 20
  const dangerLimit = isDev ? 10 : 100

  if (cost >= dangerLimit) return 'text-red-600'
  if (cost >= warningLimit) return 'text-yellow-600'
  return 'text-green-600'
} 