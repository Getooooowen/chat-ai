/**
 * 配置模块
 */

// 本地配置（如果存在）- 从 config.local.js 导入
// 注意：如果 config.local.js 不存在，会忽略导入错误
let LOCAL_CONFIG = null

// API配置 - 支持多个模型配置
export const API_CONFIG = {
  // API端点数组 - 每个模型对应的API地址
  apiUrls: [
    // modelscope
    'https://api-inference.modelscope.cn/v1/chat/completions',
    'https://api-inference.modelscope.cn/v1/chat/completions',
    'https://api-inference.modelscope.cn/v1/chat/completions',
    // openrouter
    'https://openrouter.ai/api/v1/chat/completions',
    'https://openrouter.ai/api/v1/chat/completions',
    'https://openrouter.ai/api/v1/chat/completions',
    'https://openrouter.ai/api/v1/chat/completions',
    // dashscope
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    // MiniMax
    'https://api.minimaxi.com/anthropic',
    // qingyuntop
    'https://api.qingyuntop.top',
    // 智谱
    'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    // gemini
    'https://generativelanguage.googleapis.com/v1beta/models/',
    'https://generativelanguage.googleapis.com/v1beta/models/',
    // siliconflow
    'https://api.siliconflow.cn/v1/chat/completions',
    // iflow
    'https://apis.iflow.cn/v1/chat/completions',
    'https://apis.iflow.cn/v1/chat/completions',
    'https://apis.iflow.cn/v1/chat/completions',
    'https://apis.iflow.cn/v1/chat/completions',
    'https://apis.iflow.cn/v1/chat/completions',
    'https://apis.iflow.cn/v1/chat/completions',
    'https://apis.iflow.cn/v1/chat/completions',
    // burncloud (24个模型，id 22-45)
    'https://ai.burncloud.com/v1/chat/completions', // 22: Claude-Sonnet-4
    'https://ai.burncloud.com/v1/chat/completions', // 23: Claude-3.7-Sonnet
    'https://ai.burncloud.com/v1/chat/completions', // 24: Claude-Opus-4.1
    'https://ai.burncloud.com/v1/chat/completions', // 25: Claude-3.5-Sonnet
    'https://ai.burncloud.com/v1/chat/completions', // 26: Claude-Opus-4
    'https://ai.burncloud.com/v1/chat/completions', // 27: GPT-4.1
    'https://ai.burncloud.com/v1/chat/completions', // 28: GPT-Image-1
    'https://ai.burncloud.com/v1/chat/completions', // 29: GPT-4o
    'https://ai.burncloud.com/v1/chat/completions', // 30: GPT-5
    'https://ai.burncloud.com/v1/chat/completions', // 31: GPT-4o-Mini
    'https://ai.burncloud.com/v1/chat/completions', // 32: GPT-4.1-Mini
    'https://ai.burncloud.com/v1/chat/completions', // 33: ChatGPT-4o-Latest
    'https://ai.burncloud.com/v1/chat/completions', // 34: GPT-4o-2024-11-20
    'https://ai.burncloud.com/v1/chat/completions', // 35: GPT-5-Chat-Latest
    'https://ai.burncloud.com/v1/chat/completions', // 36: Text-Embedding-3-Large
    'https://ai.burncloud.com/v1/chat/completions', // 37: Gemini-2.5-Pro
    'https://ai.burncloud.com/v1/chat/completions', // 38: Gemini-2.5-Flash
    'https://ai.burncloud.com/v1/chat/completions', // 39: Gemini-2.5-Flash-NoThink
    'https://ai.burncloud.com/v1/chat/completions', // 40: Gemini-2.5-Pro-Search
    'https://ai.burncloud.com/v1/chat/completions', // 41: Gemini-2.5-Pro-Preview-05-06
    'https://ai.burncloud.com/v1/chat/completions', // 42: Gemini-2.5-Pro-Preview-06-05
    'https://ai.burncloud.com/v1/chat/completions', // 43: O3
    'https://ai.burncloud.com/v1/chat/completions', // 44: O3-Mini
    'https://ai.burncloud.com/v1/chat/completions' // 45: DeepSeek-V3
  ],

  // 模型名称数组 - 每个模型的实际模型标识
  defaultModels: [
    // modelscope
    'Qwen/Qwen3-Coder-480B-A35B-Instruct',
    'Qwen/Qwen3-235B-A22B-Thinking-2507',
    'ZhipuAI/GLM-4.5',
    // openrouter
    'google/gemini-2.5-pro-preview',
    'anthropic/claude-sonnet-4',
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3.7-sonnet:thinking',
    // dashscope
    'qwen3-coder-plus',
    // MiniMax (空模型，使用默认)
    'claude-3-5-sonnet',
    // qingyuntop (空模型，使用默认)
    'claude-3-5-sonnet',
    // 智谱
    'glm-4.6',
    'glm-4.5-air',
    // gemini
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    // siliconflow
    'moonshotai/Kimi-K2-Instruct',
    // iflow
    'qwen3-coder-plus',
    'kimi-k2-0905',
    'glm-4.5',
    'glm-4.6',
    'qwen3-max',
    'deepseek-v3.1',
    'qwen3-vl-plus',
    // burncloud
    'claude-sonnet-4-20250514',
    'claude-3-7-sonnet-20250219',
    'claude-opus-4-1-20250805',
    'claude-3-5-sonnet-20241022',
    'claude-opus-4-20250514',
    'gpt-4.1',
    'gpt-image-1',
    'gpt-4o',
    'gpt-5',
    'gpt-4o-mini',
    'gpt-4.1-mini',
    'chatgpt-4o-latest',
    'gpt-4o-2024-11-20',
    'gpt-5-chat-latest',
    'text-embedding-3-large',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-nothink',
    'gemini-2.5-pro-search',
    'gemini-2.5-pro-preview-05-06',
    'gemini-2.5-pro-preview-06-05',
    'o3',
    'o3-mini',
    'deepseek-v3' // 尝试小写格式
  ],

  // 默认参数
  defaultParams: {
    temperature: 0.7,
    max_tokens: 2000
  }
}

// 模型列表配置 - 用于UI显示
export const MODEL_LIST = [
  // modelscope
  { id: 0, name: 'Qwen3-Coder-480B', provider: 'ModelScope' },
  { id: 1, name: 'Qwen3-235B-Thinking', provider: 'ModelScope' },
  { id: 2, name: 'GLM-4.5', provider: 'ModelScope' },
  // openrouter
  { id: 3, name: 'Gemini-2.5-Pro', provider: 'OpenRouter' },
  { id: 4, name: 'Claude-Sonnet-4', provider: 'OpenRouter' },
  { id: 5, name: 'Claude-3.5-Sonnet', provider: 'OpenRouter' },
  { id: 6, name: 'Claude-3.7-Thinking', provider: 'OpenRouter' },
  // dashscope
  { id: 7, name: 'Qwen3-Coder-Plus', provider: 'DashScope' },
  // MiniMax
  { id: 8, name: 'Claude-3.5-Sonnet', provider: 'MiniMax' },
  // qingyuntop
  { id: 9, name: 'Claude-3.5-Sonnet', provider: 'QingYunTop' },
  // 智谱
  { id: 10, name: 'GLM-4.6', provider: '智谱AI' },
  { id: 11, name: 'GLM-4.5-Air', provider: '智谱AI' },
  // gemini
  { id: 12, name: 'Gemini-2.5-Flash', provider: 'Google' },
  { id: 13, name: 'Gemini-2.5-Pro', provider: 'Google' },
  // siliconflow
  { id: 14, name: 'Kimi-K2', provider: 'SiliconFlow' },
  // iflow
  { id: 15, name: 'Qwen3-Coder-Plus', provider: 'iFlow' },
  { id: 16, name: 'Kimi-K2', provider: 'iFlow' },
  { id: 17, name: 'GLM-4.5', provider: 'iFlow' },
  { id: 18, name: 'GLM-4.6', provider: 'iFlow' },
  { id: 19, name: 'Qwen3-Max', provider: 'iFlow' },
  { id: 20, name: 'DeepSeek-V3.1', provider: 'iFlow' },
  { id: 21, name: 'Qwen3-VL-Plus', provider: 'iFlow' },
  // burncloud
  { id: 22, name: 'Claude-Sonnet-4', provider: 'BurnCloud' },
  { id: 23, name: 'Claude-3.7-Sonnet', provider: 'BurnCloud' },
  { id: 24, name: 'Claude-Opus-4.1', provider: 'BurnCloud' },
  { id: 25, name: 'Claude-3.5-Sonnet', provider: 'BurnCloud' },
  { id: 26, name: 'Claude-Opus-4', provider: 'BurnCloud' },
  { id: 27, name: 'GPT-4.1', provider: 'BurnCloud' },
  { id: 28, name: 'GPT-Image-1', provider: 'BurnCloud' },
  { id: 29, name: 'GPT-4o', provider: 'BurnCloud' },
  { id: 30, name: 'GPT-5', provider: 'BurnCloud' },
  { id: 31, name: 'GPT-4o-Mini', provider: 'BurnCloud' },
  { id: 32, name: 'GPT-4.1-Mini', provider: 'BurnCloud' },
  { id: 33, name: 'ChatGPT-4o-Latest', provider: 'BurnCloud' },
  { id: 34, name: 'GPT-4o-2024-11-20', provider: 'BurnCloud' },
  { id: 35, name: 'GPT-5-Chat-Latest', provider: 'BurnCloud' },
  { id: 36, name: 'Text-Embedding-3-Large', provider: 'BurnCloud' },
  { id: 37, name: 'Gemini-2.5-Pro', provider: 'BurnCloud' },
  { id: 38, name: 'Gemini-2.5-Flash', provider: 'BurnCloud' },
  { id: 39, name: 'Gemini-2.5-Flash-NoThink', provider: 'BurnCloud' },
  { id: 40, name: 'Gemini-2.5-Pro-Search', provider: 'BurnCloud' },
  { id: 41, name: 'Gemini-2.5-Pro-Preview-05-06', provider: 'BurnCloud' },
  { id: 42, name: 'Gemini-2.5-Pro-Preview-06-05', provider: 'BurnCloud' },
  { id: 43, name: 'O3', provider: 'BurnCloud' },
  { id: 44, name: 'O3-Mini', provider: 'BurnCloud' },
  { id: 45, name: 'DeepSeek-V3', provider: 'BurnCloud' }
]

// 应用配置
export const APP_CONFIG = {
  // 流式输出延迟（毫秒）
  streamingDelay: 20,

  // 批量更新阈值 - 减少DOM操作频率
  batchUpdateThreshold: 5,

  // 本地存储键名
  storageKeys: {
    conversationHistory: 'chatHistory',
    theme: 'theme',
    selectedModel: 'selectedModel',
    chatSessions: 'chatSessions',
    activeSessionId: 'activeSessionId'
  }
}

// 动态加载本地配置文件
async function loadLocalConfig () {
  if (LOCAL_CONFIG !== null) {
    return LOCAL_CONFIG // 已经加载过或已尝试加载
  }

  try {
    const module = await import('./config.local.js')
    LOCAL_CONFIG = module.default || module.LOCAL_CONFIG || module
    return LOCAL_CONFIG
  } catch (e) {
    // 如果 config.local.js 不存在，设为空对象
    LOCAL_CONFIG = {}
    return LOCAL_CONFIG
  }
}

// 获取API密钥（优先级从高到低）
export async function getApiKey (modelIndex = 0) {
  // 1. 优先从本地配置文件读取（config.local.js）
  const localConfig = await loadLocalConfig()
  if (
    localConfig &&
    localConfig.apiKeys &&
    Array.isArray(localConfig.apiKeys)
  ) {
    if (localConfig.apiKeys[modelIndex]) {
      return localConfig.apiKeys[modelIndex]
    }
    // 如果指定索引没有密钥，尝试使用第一个密钥
    if (localConfig.apiKeys[0]) {
      return localConfig.apiKeys[0]
    }
  }
  // 兼容旧版本的单个 apiKey
  if (localConfig && localConfig.apiKey) {
    return localConfig.apiKey
  }

  // 2. 从 window 对象读取（构建时注入，用于生产环境）
  if (
    typeof window !== 'undefined' &&
    window.SILICONFLOW_API_KEYS &&
    Array.isArray(window.SILICONFLOW_API_KEYS)
  ) {
    if (window.SILICONFLOW_API_KEYS[modelIndex]) {
      return window.SILICONFLOW_API_KEYS[modelIndex]
    }
    if (window.SILICONFLOW_API_KEYS[0]) {
      return window.SILICONFLOW_API_KEYS[0]
    }
  }
  // 兼容旧版本的单个密钥
  if (typeof window !== 'undefined' && window.SILICONFLOW_API_KEY) {
    return window.SILICONFLOW_API_KEY
  }

  // 3. 从 localStorage 读取（用户手动设置）
  if (typeof window !== 'undefined') {
    const storedKeys = localStorage.getItem('SILICONFLOW_API_KEYS')
    if (storedKeys) {
      try {
        const keys = JSON.parse(storedKeys)
        if (Array.isArray(keys) && keys[modelIndex]) {
          return keys[modelIndex]
        }
        if (Array.isArray(keys) && keys[0]) {
          return keys[0]
        }
      } catch (e) {
        // 忽略解析错误
      }
    }
    // 兼容旧版本的单个密钥
    const storedKey = localStorage.getItem('SILICONFLOW_API_KEY')
    if (storedKey) {
      return storedKey
    }
  }

  // 如果都没有，返回空字符串，需要在调用时检查
  console.warn(
    'API密钥未设置，请创建 config.local.js 文件并设置 apiKeys 数组，或通过 localStorage 设置'
  )
  return ''
}

// 获取指定模型的配置
export async function getModelConfig (modelIndex) {
  // 验证索引范围
  if (modelIndex < 0 || modelIndex >= API_CONFIG.apiUrls.length) {
    console.error(
      `模型索引 ${modelIndex} 超出范围，数组长度: apiUrls=${API_CONFIG.apiUrls.length}, defaultModels=${API_CONFIG.defaultModels.length}`
    )
    throw new Error(`模型索引 ${modelIndex} 无效，请选择有效的模型`)
  }

  const apiKey = await getApiKey(modelIndex)
  const apiUrl = API_CONFIG.apiUrls[modelIndex]
  const model = API_CONFIG.defaultModels[modelIndex]

  // 调试信息
  console.log(`模型配置 [索引 ${modelIndex}]:`, {
    apiUrl,
    model,
    apiKeyLength: apiKey ? apiKey.length : 0
  })

  if (!apiUrl || !model) {
    throw new Error(`模型索引 ${modelIndex} 的配置不完整`)
  }

  return {
    apiKey,
    apiUrl,
    model
  }
}
