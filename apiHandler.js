/**
 * API处理模块
 */

import { API_CONFIG, APP_CONFIG, getModelConfig } from './config.js'

// 调用AI API (流式输出)
export async function callAIAPIStream(userMessage, conversationHistory, streamCallback, shouldStop, modelIndex = 0) {
  try {
    // 更新对话历史
    const updatedHistory = [...conversationHistory, {
      role: 'user',
      content: userMessage
    }]

    // 获取指定模型的配置
    const modelConfig = await getModelConfig(modelIndex)
    if (!modelConfig.apiKey) {
      throw new Error('API密钥未设置，请创建 config.local.js 文件并设置 apiKeys 数组，或通过 localStorage 设置')
    }

    // 构建请求体
    const requestBody = {
      model: modelConfig.model,
      messages: updatedHistory,
      temperature: API_CONFIG.defaultParams.temperature,
      max_tokens: API_CONFIG.defaultParams.max_tokens,
      stream: true  // 启用流式输出
    }

    // 记录实际发送的请求信息
    console.log('发送API请求:', {
      url: modelConfig.apiUrl,
      model: modelConfig.model,
      apiKeyPrefix: modelConfig.apiKey ? modelConfig.apiKey.substring(0, 10) + '...' : '无',
      messageCount: updatedHistory.length
    })

    // 发送流式请求
    const response = await fetch(modelConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${modelConfig.apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      // 尝试解析错误响应体
      let errorMessage = `API请求失败: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.error) {
          // 处理标准错误格式
          if (errorData.error.message) {
            errorMessage = errorData.error.message
          } else if (errorData.error.code) {
            errorMessage = `${errorData.error.code}: ${errorData.error.message || '未知错误'}`
          }
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch (e) {
        // 如果无法解析JSON，使用默认错误信息
        console.warn('无法解析错误响应:', e)
      }
      throw new Error(errorMessage)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let pendingContent = '' // 待显示的缓冲内容

    // 辅助函数：批量显示内容以减少DOM操作
    const flushPendingContent = async () => {
      let batchCount = 0
      while (pendingContent.length > 0 && !shouldStop()) {
        const char = pendingContent[0]
        pendingContent = pendingContent.slice(1)
        fullContent += char
        batchCount++

        // 每batchUpdateThreshold个字符或缓冲区为空时更新DOM
        if (batchCount >= APP_CONFIG.batchUpdateThreshold || pendingContent.length === 0) {
          streamCallback(fullContent)
          batchCount = 0
          // 仅在更新DOM后添加延迟
          if (pendingContent.length > 0) {
            await new Promise(resolve => setTimeout(resolve, APP_CONFIG.streamingDelay))
          }
        }
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        // 流结束，显示剩余的缓冲内容
        await flushPendingContent()
        break
      }

      // 检查是否应该停止
      if (shouldStop()) {
        await reader.cancel() // 取消读取
        // 如果被停止，返回已生成的内容
        return { content: fullContent, history: conversationHistory }
      }

      // 解码数据
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6) // 移除 'data: ' 前缀

          // 检查是否是结束标记
          if (data === '[DONE]') {
            // 流式输出完成，显示剩余的缓冲内容
            await flushPendingContent()
            // 正常完成，添加AI回复到历史
            const finalHistory = fullContent ?
              [...updatedHistory, { role: 'assistant', content: fullContent }] :
              updatedHistory
            return { content: fullContent, history: finalHistory }
          }

          try {
            const json = JSON.parse(data)
            
            // 记录实际返回的模型信息（如果存在）
            if (json.model && !fullContent) {
              console.log('API返回的模型信息:', {
                requestedModel: modelConfig.model,
                actualModel: json.model,
                match: json.model === modelConfig.model || json.model.includes(modelConfig.model.split('/').pop())
              })
            }
            
            const content = json.choices?.[0]?.delta?.content || ''

            if (content) {
              // 将新内容添加到缓冲区，然后显示
              pendingContent += content
              await flushPendingContent()
            }
          } catch (e) {
            // 忽略JSON解析错误
            console.warn('解析JSON失败:', e)
          }
        }
      }
    }

    // 流结束后，返回结果
    const finalHistory = fullContent ?
      [...updatedHistory, { role: 'assistant', content: fullContent }] :
      updatedHistory
    return { content: fullContent, history: finalHistory }
  } catch (error) {
    console.error('API调用错误:', error)
    throw error
  }
}