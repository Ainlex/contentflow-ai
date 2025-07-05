'use client'

import { useState, useCallback, useRef } from 'react'
import { ContentGenerationRequest, ContentGenerationState, StreamingMessage } from '@/types/content'
import { saveCostBreakdown, type CostBreakdown } from '@/lib/costCalculator'

export function useContentGeneration() {
  const [state, setState] = useState<ContentGenerationState>({
    isGenerating: false,
    generatedContent: '',
    error: null,
    isComplete: false,
    progress: 0,
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const generatedContentRef = useRef<string>('')
  const requestRef = useRef<ContentGenerationRequest>({} as ContentGenerationRequest)

  const generateContent = useCallback(async (request: ContentGenerationRequest) => {
    try {
      console.log('Starting content generation request:', request)
      
      // Store request for cost calculation
      requestRef.current = request
      generatedContentRef.current = ''
      
      // Reset state
      setState({
        isGenerating: true,
        generatedContent: '',
        error: null,
        isComplete: false,
        progress: 0,
      })

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      console.log('Making fetch request to /api/generate')
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: abortControllerRef.current.signal,
      })

      console.log('Response received:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      console.log('Starting to read stream...')
      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            console.log('Stream reading completed')
            break
          }

          buffer += decoder.decode(value, { stream: true })
          console.log('Received chunk, buffer length:', buffer.length)
          
          // Process complete lines
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          console.log('Processing lines:', lines.length)
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              console.log('Processing data line:', data)
              
              if (data.trim()) {
                try {
                  const parsed = JSON.parse(data)
                  console.log('Parsed data:', parsed)
                  
                  // Handle cost tracking messages
                  if (parsed.type === 'cost_tracking' && parsed.data) {
                    console.log('Received cost tracking data:', parsed.data)
                    const costBreakdown = parsed.data as CostBreakdown
                    // Convert timestamp string back to Date
                    costBreakdown.timestamp = new Date(costBreakdown.timestamp)
                    saveCostBreakdown(costBreakdown)
                    console.log('Cost breakdown saved to localStorage')
                    return
                  }
                  
                  // Handle regular streaming messages
                  const streamingMessage = parsed as StreamingMessage
                  
                  if (streamingMessage.error) {
                    setState(prev => ({
                      ...prev,
                      error: streamingMessage.error!,
                      isGenerating: false,
                      isComplete: true,
                    }))
                    return
                  }

                  if (streamingMessage.isComplete) {
                    // Store content for cost calculation
                    const finalContent = generatedContentRef.current
                    
                    // Calculate and save costs on client side
                    setTimeout(() => {
                      try {
                        const inputText = `${requestRef.current.topic} ${requestRef.current.targetAudience} ${requestRef.current.additionalContext || ''}`
                        const inputTokens = Math.ceil(inputText.length / 4)
                        const outputTokens = Math.ceil(finalContent.length / 4)
                        
                        const costBreakdown = {
                          inputTokens,
                          outputTokens,
                          inputCost: (inputTokens / 1000) * 0.15,
                          outputCost: (outputTokens / 1000) * 0.075,
                          totalCost: (inputTokens / 1000) * 0.15 + (outputTokens / 1000) * 0.075,
                          model: 'gpt-4o-mini',
                          timestamp: new Date(),
                        }
                        
                        console.log('Client-side cost calculation:', costBreakdown)
                        saveCostBreakdown(costBreakdown)
                      } catch (error) {
                        console.error('Error calculating costs on client:', error)
                      }
                    }, 100)
                    
                    setState(prev => ({
                      ...prev,
                      isGenerating: false,
                      isComplete: true,
                      progress: 100,
                    }))
                    return
                  }

                  // Update content progressively
                  if (streamingMessage.content) {
                    generatedContentRef.current += streamingMessage.content
                    setState(prev => ({
                      ...prev,
                      generatedContent: prev.generatedContent + streamingMessage.content,
                      progress: Math.min(prev.progress + 2, 95), // Incremental progress
                    }))
                  }
                } catch (parseError) {
                  console.error('Error parsing streaming data:', parseError)
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: 'Generación cancelada',
        }))
        return
      }

      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }))
    }
  }, [])

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const resetState = useCallback(() => {
    setState({
      isGenerating: false,
      generatedContent: '',
      error: null,
      isComplete: false,
      progress: 0,
    })
  }, [])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      return false
    }
  }, [])

  return {
    ...state,
    generateContent,
    cancelGeneration,
    resetState,
    copyToClipboard,
  }
} 