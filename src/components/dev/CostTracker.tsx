'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  getDailyCostSummary, 
  checkCostAlert, 
  getCostColor, 
  resetDailyCosts,
  getCurrentModel,
  MODEL_PRICING,
  type DailyCostSummary 
} from '@/lib/costCalculator'
import { ChevronDown, ChevronUp, DollarSign, AlertTriangle } from 'lucide-react'

export function CostTracker() {
  const [dailyData, setDailyData] = useState<DailyCostSummary | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  // Only show in development
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  if (!isDev) return null

  useEffect(() => {
    // Load initial data
    loadData()

    // Set up interval to refresh data
    const interval = setInterval(loadData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    const data = getDailyCostSummary()
    setDailyData(data)
    
    if (data) {
      const alert = checkCostAlert(data.totalCost)
      setShowAlert(alert.shouldAlert)
    } else {
      setShowAlert(false)
    }
  }

  const handleReset = () => {
    resetDailyCosts()
    setDailyData(null)
    setShowAlert(false)
  }

  const currentModel = getCurrentModel()
  const modelPricing = MODEL_PRICING[currentModel]

  // Always show data, even if empty
  const displayData = dailyData || {
    date: new Date().toISOString().split('T')[0],
    totalCost: 0,
    requestCount: 0,
    model: currentModel,
    breakdown: [],
  }

  const alert = checkCostAlert(displayData.totalCost)
  const costColor = getCostColor(displayData.totalCost)

  return (
    <div className={`border rounded-lg p-3 mb-4 ${
      alert.shouldAlert 
        ? (alert.level === 'danger' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200')
        : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">
            Today: <span className={costColor}>${displayData.totalCost.toFixed(4)}</span>
          </span>
          <span className="text-sm text-gray-500">
            ({displayData.requestCount} requests)
          </span>
          <span className="text-sm text-gray-500">
            - Model: {modelPricing?.name}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {showAlert && (
            <AlertTriangle className={`h-4 w-4 ${
              alert.level === 'danger' ? 'text-red-500' : 'text-yellow-500'
            }`} />
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Alert Message */}
      {showAlert && (
        <div className={`mt-2 p-2 rounded text-sm ${
          alert.level === 'danger' 
            ? 'bg-red-100 text-red-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {alert.message}
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {/* Pricing Info */}
          <div className="bg-white rounded p-3 mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Current Pricing ({modelPricing?.name})
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Input:</span>
                <span className="ml-2 font-mono">${modelPricing?.inputPricePer1K}/1K tokens</span>
              </div>
              <div>
                <span className="text-gray-600">Output:</span>
                <span className="ml-2 font-mono">${modelPricing?.outputPricePer1K}/1K tokens</span>
              </div>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Recent Requests</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {displayData.breakdown.length > 0 ? (
                displayData.breakdown.slice(-5).reverse().map((req, idx) => (
                <div key={idx} className="bg-white rounded p-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-gray-600">
                        Input: {req.inputTokens} tokens → ${req.inputCost.toFixed(4)}
                      </div>
                      <div className="font-mono text-gray-600">
                        Output: {req.outputTokens} tokens → ${req.outputCost.toFixed(4)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${getCostColor(req.totalCost)}`}>
                        ${req.totalCost.toFixed(4)}
                      </div>
                      <div className="text-gray-500">
                        {new Date(req.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <div className="bg-white rounded p-2 text-xs text-gray-500 text-center">
                  No hay requests aún. Genera contenido para ver el breakdown de costos.
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-red-600 hover:text-red-700"
            >
              Reset Daily Costs
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 