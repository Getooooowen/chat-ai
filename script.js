// 导入模块
import { API_CONFIG, APP_CONFIG, MODEL_LIST, getApiKey } from './config.js'
import { callAIAPIStream } from './apiHandler.js'
import { formatTime, showToast, copyToClipboard } from './utils.js'
import { markdownToHtml } from './markdown.js'
import { createMessageElement, appendMessagesBatch } from './messageHandler.js'

// 获取DOM元素
const chatMessages = document.getElementById('chatMessages')
const messageInput = document.getElementById('messageInput')
const sendButton = document.getElementById('sendButton')
const themeToggle = document.getElementById('themeToggle')
const clearButton = document.getElementById('clearButton')
const modelSelect = document.getElementById('modelSelect')
const customModelSelect = document.getElementById('customModelSelect')
const sessionsList = document.getElementById('sessionsList')
const newSessionButton = document.getElementById('newSessionButton')
const currentModelTag = document.getElementById('currentModelTag')
const exportButton = document.getElementById('exportButton')
const importButton = document.getElementById('importButton')
const importFileInput = document.getElementById('importFileInput')
const menuToggle = document.getElementById('menuToggle')
const sidebar = document.getElementById('sidebar')
const sidebarOverlay = document.getElementById('sidebarOverlay')
const sidebarClose = document.getElementById('sidebarClose')
const welcomeSection = document.getElementById('welcomeSection')
const suggestionsList = document.getElementById('suggestionsList')

// 存储对话历史
let conversationHistory = []

// 控制流式输出的变量
let isStreaming = false
let lastUserMessage = ''

// 当前选中的模型索引
let currentModelIndex = 0

// 多会话状态
let sessions = [] // 会话数组：{ id, title, messages: [{role, content}], modelIndex, createdAt }
let activeSessionId = null

// 建议问题列表
const SUGGESTED_QUESTIONS = [
  '如果高考考"如何快乐生活",社会会更卷还是更佛?',
  '如果时间旅行真的存在,为什么我们还没遇到未来人?',
  'AI 教育的实现,能否颠覆传统教学模式?',
  '人类是何时发现玉米可以爆成花的?',
  '如果外星人来地球只偷一种东西,你觉得会是什么?',
  '春天的野菜真的更营养吗?还是人类的"尝鲜焦虑"?'
]

/**
 * 初始化会话列表：从本地存储加载，如无则创建一个默认会话
 * 参数：无
 * 返回：void（不返回值），在内存中初始化 sessions 与 activeSessionId 并渲染侧边栏和消息区
 */
function initSessions () {
  try {
    const savedSessions = localStorage.getItem(
      APP_CONFIG.storageKeys.chatSessions
    )
    const savedActiveId = localStorage.getItem(
      APP_CONFIG.storageKeys.activeSessionId
    )
    if (savedSessions) {
      sessions = JSON.parse(savedSessions)
      // 兼容旧数据：为没有 pinned 字段的会话添加默认值
      sessions.forEach(s => {
        if (s.pinned === undefined) {
          s.pinned = false
          s.pinnedIndex = null
        }
      })
    } else {
      sessions = []
    }

    if (sessions.length === 0) {
      // 创建默认会话，使用当前模型索引
      const defaultSession = createSessionObject('新的对话', currentModelIndex)
      sessions.push(defaultSession)
      activeSessionId = defaultSession.id
      persistSessions()
    } else {
      activeSessionId = savedActiveId || sessions[0].id
    }

    // 渲染侧边栏与当前会话消息
    renderSessionList()
    setActiveSession(activeSessionId)
  } catch (err) {
    console.error('初始化会话失败:', err)
    sessions = []
    const defaultSession = createSessionObject('新的对话', currentModelIndex)
    sessions.push(defaultSession)
    activeSessionId = defaultSession.id
    persistSessions()
    renderSessionList()
    setActiveSession(activeSessionId)
  }
}

/**
 * 创建会话对象
 * 参数：title(string) 会话标题；modelIndex(number) 当前会话使用的模型索引
 * 返回：object 会话结构 {id, title, messages, modelIndex, createdAt}
 */
function createSessionObject (title, modelIndex) {
  return {
    id: 's_' + Date.now() + '_' + Math.random().toString(16).slice(2),
    title: title || '新的对话',
    messages: [],
    modelIndex: typeof modelIndex === 'number' ? modelIndex : 0,
    createdAt: Date.now(),
    pinned: false, // 是否置顶
    pinnedIndex: null // 置顶前的原始位置索引
  }
}

/**
 * 将会话与当前活跃会话ID持久化到本地存储
 * 参数：无
 * 返回：void
 */
function persistSessions () {
  try {
    localStorage.setItem(
      APP_CONFIG.storageKeys.chatSessions,
      JSON.stringify(sessions)
    )
    if (activeSessionId) {
      localStorage.setItem(
        APP_CONFIG.storageKeys.activeSessionId,
        activeSessionId
      )
    }
  } catch (err) {
    console.error('保存会话到本地存储失败:', err)
  }
}

/**
 * 渲染侧边栏的会话列表
 * 参数：无
 * 返回：void（更新DOM）
 */
function renderSessionList () {
  if (!sessionsList) return
  sessionsList.innerHTML = ''

  // 按照置顶状态排序：置顶的在前，未置顶的在后
  // 置顶的会话按置顶顺序排序（先置顶的在前面）
  // 未置顶的会话保持原有顺序
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    if (a.pinned && b.pinned) {
      // 如果都置顶，按在sessions数组中的位置排序（先置顶的在前面）
      const indexA = sessions.findIndex(s => s.id === a.id)
      const indexB = sessions.findIndex(s => s.id === b.id)
      return indexA - indexB
    }
    // 都未置顶，保持原有顺序
    const indexA = sessions.findIndex(s => s.id === a.id)
    const indexB = sessions.findIndex(s => s.id === b.id)
    return indexA - indexB
  })

  sortedSessions.forEach(s => {
    const li = document.createElement('li')
    let className = 'session-item'
    if (s.id === activeSessionId) className += ' active'
    if (s.pinned) className += ' pinned'
    li.className = className
    li.dataset.sessionId = s.id

    // 标题和模型名容器
    const titleMetaContainer = document.createElement('div')
    titleMetaContainer.className = 'session-title-meta-container'
    
    const title = document.createElement('div')
    title.className = 'session-title'
    title.textContent = s.title || '新的对话'

    const meta = document.createElement('div')
    meta.className = 'session-meta'
    const modelName = MODEL_LIST[s.modelIndex]?.name || '未知模型'
    meta.textContent = `${modelName}`
    
    titleMetaContainer.appendChild(title)
    titleMetaContainer.appendChild(meta)

    // 操作区：更多操作按钮（...）或置顶图标
    const actions = document.createElement('div')
    actions.className = 'session-actions'

    // 置顶图标（仅置顶会话显示，hover时隐藏）
    const pinIcon = document.createElement('span')
    pinIcon.className = 'session-pin-icon'
    pinIcon.innerHTML = '📌'
    pinIcon.title = '已置顶'
    if (!s.pinned) {
      pinIcon.style.display = 'none'
    }

    // 更多操作按钮（hover时显示）
    const moreBtn = document.createElement('button')
    moreBtn.className = 'action-btn-more'
    moreBtn.innerHTML = '···'
    moreBtn.title = '更多操作'
    moreBtn.dataset.sessionId = s.id

    // 下拉菜单
    const dropdown = document.createElement('div')
    dropdown.className = 'session-dropdown'
    dropdown.style.display = 'none'

    // 置顶/取消置顶选项
    const pinOption = document.createElement('div')
    pinOption.className = 'dropdown-item'
    if (s.pinned) {
      pinOption.innerHTML =
        '<span class="dropdown-icon">📌</span><span>取消置顶</span>'
      pinOption.addEventListener('click', e => {
        e.stopPropagation()
        unpinSession(s.id)
        closeAllDropdowns()
      })
    } else {
      pinOption.innerHTML =
        '<span class="dropdown-icon">📌</span><span>置顶</span>'
      pinOption.addEventListener('click', e => {
        e.stopPropagation()
        pinSession(s.id)
        closeAllDropdowns()
      })
    }

    // 编辑名称选项
    const editOption = document.createElement('div')
    editOption.className = 'dropdown-item'
    editOption.innerHTML =
      '<span class="dropdown-icon">✏️</span><span>编辑名称</span>'
    editOption.addEventListener('click', e => {
      e.stopPropagation()
      renameSession(s.id)
      closeAllDropdowns()
    })

    // 删除选项
    const deleteOption = document.createElement('div')
    deleteOption.className = 'dropdown-item delete'
    deleteOption.innerHTML =
      '<span class="dropdown-icon">🗑️</span><span>删除</span>'
    deleteOption.addEventListener('click', e => {
      e.stopPropagation()
      deleteSession(s.id)
      closeAllDropdowns()
    })

    dropdown.appendChild(pinOption)
    dropdown.appendChild(editOption)
    dropdown.appendChild(deleteOption)

    // 点击...按钮显示/隐藏菜单
    moreBtn.addEventListener('click', e => {
      e.stopPropagation()
      // 关闭其他菜单
      closeAllDropdowns()
      // 切换当前菜单
      const isVisible = dropdown.style.display === 'block'
      dropdown.style.display = isVisible ? 'none' : 'block'
    })

    actions.appendChild(pinIcon)
    actions.appendChild(moreBtn)
    actions.appendChild(dropdown)

    li.appendChild(titleMetaContainer)
    li.appendChild(actions)
    li.addEventListener('click', (e) => {
      // 如果点击的是操作按钮或下拉菜单，不切换会话
      if (e.target.closest('.session-actions') || e.target.closest('.session-dropdown')) {
        return
      }
      setActiveSession(s.id)
    })
    sessionsList.appendChild(li)
  })
}

/**
 * 设置当前活跃会话，并渲染该会话的消息与模型状态
 * 参数：sessionId(string)
 * 返回：void
 */
// 关闭移动端侧边栏的辅助函数
function closeSidebarIfMobile () {
  // 检查是否是移动端（窗口宽度小于768px）
  if (window.innerWidth <= 768) {
    if (sidebar) sidebar.classList.remove('show')
    if (sidebarOverlay) sidebarOverlay.classList.remove('show')
    document.body.style.overflow = ''
  }
}

function setActiveSession (sessionId) {
  activeSessionId = sessionId
  const session = sessions.find(s => s.id === sessionId)
  if (!session) return

  // 更新当前模型索引与选择框
  currentModelIndex = session.modelIndex || 0
  if (modelSelect) {
    modelSelect.value = String(currentModelIndex)
  }
  if (window.updateCustomSelectValue) {
    updateCustomSelectValue(currentModelIndex)
  }
  updateCurrentModelTag()

  // 更新会话列表选中态
  renderSessionList()

  // 渲染消息
  renderActiveSessionMessages()

  // 保存活跃ID
  persistSessions()

  // 移动端：点击会话后自动关闭侧边栏
  closeSidebarIfMobile()
}

/**
 * 渲染当前会话的消息到聊天窗口
 * 参数：无
 * 返回：void
 */
function renderActiveSessionMessages () {
  const session = sessions.find(s => s.id === activeSessionId)
  if (!session) return
  conversationHistory = session.messages

  // 清空聊天窗口
  chatMessages.innerHTML = ''

  // 追加历史消息
  for (let i = 0; i < conversationHistory.length; i++) {
    const msg = conversationHistory[i]
    const msgDiv = createMessageElement(msg.content, msg.role === 'user')
    chatMessages.appendChild(msgDiv)
  }

  // 更新欢迎区域显示状态
  updateWelcomeSectionVisibility()

  if (conversationHistory.length > 0) {
    chatMessages.scrollTop = chatMessages.scrollHeight
  }
}

/**
 * 更新欢迎区域显示状态
 * 参数：无
 * 返回：void
 */
function updateWelcomeSectionVisibility () {
  if (!welcomeSection) return

  const hasMessages = conversationHistory && conversationHistory.length > 0
  const hasMessagesInDOM = chatMessages && chatMessages.children.length > 0

  // 如果有消息，立即隐藏欢迎区域（包括建议问题）
  if (hasMessages || hasMessagesInDOM) {
    welcomeSection.style.display = 'none'
    welcomeSection.classList.add('hidden')
  } else {
    welcomeSection.style.display = ''
    welcomeSection.classList.remove('hidden')
  }
}

/**
 * 初始化建议问题
 * 参数：无
 * 返回：void
 */
function initSuggestions () {
  if (!suggestionsList) return

  suggestionsList.innerHTML = ''

  // 随机选择3个问题
  const shuffled = [...SUGGESTED_QUESTIONS].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 3)

  selected.forEach(question => {
    const item = document.createElement('div')
    item.className = 'suggestion-item'
    item.textContent = question
    item.addEventListener('click', () => {
      // 直接发送消息，不填充到输入框
      sendMessage(question, true)
    })
    suggestionsList.appendChild(item)
  })
}

/**
 * 新建对话：创建会话并设为活跃
 * 参数：无
 * 返回：void
 */
function createNewSession () {
  const title = '新的对话'
  const newSession = createSessionObject(title, currentModelIndex)
  sessions.unshift(newSession) // 新会话放在列表顶部
  activeSessionId = newSession.id
  persistSessions()
  renderSessionList()
  setActiveSession(activeSessionId) // setActiveSession中已包含关闭侧边栏逻辑
}

/**
 * 更新当前模型标签显示
 * 参数：无
 * 返回：void
 */
function updateCurrentModelTag () {
  if (!currentModelTag) return
  const name = MODEL_LIST[currentModelIndex]?.name || '未选择'
  const provider = MODEL_LIST[currentModelIndex]?.provider || ''
  currentModelTag.textContent = `当前模型：${name}${
    provider ? '（' + provider + '）' : ''
  }`

  // 同时更新自定义下拉框（如果存在）
  if (window.updateCustomSelectValue) {
    updateCustomSelectValue(currentModelIndex)
  }
}

/**
 * 当模型选择器变更时，更新当前活跃会话的模型索引
 * 参数：index(number) 下拉框选中的模型索引
 * 返回：void
 */
function updateActiveSessionModel (index) {
  const session = sessions.find(s => s.id === activeSessionId)
  if (!session) return
  session.modelIndex = index
  currentModelIndex = index
  updateCustomSelectValue(index)
  updateCurrentModelTag()
  persistSessions()
}

// 保存对话历史到localStorage
function saveConversationHistory () {
  try {
    localStorage.setItem(
      APP_CONFIG.storageKeys.conversationHistory,
      JSON.stringify(conversationHistory)
    )
  } catch (err) {
    console.error('保存对话历史失败:', err)
  }
}

// 从localStorage加载对话历史
function loadConversationHistory () {
  try {
    // 兼容旧版本：若发现旧存储键值，尝试迁移到会话结构
    const saved = localStorage.getItem(
      APP_CONFIG.storageKeys.conversationHistory
    )
    if (saved) {
      try {
        const oldHistory = JSON.parse(saved)
        if (Array.isArray(oldHistory) && oldHistory.length > 0) {
          const migrated = createSessionObject('迁移的对话', currentModelIndex)
          migrated.messages = oldHistory
          sessions.push(migrated)
          activeSessionId = migrated.id
          localStorage.removeItem(APP_CONFIG.storageKeys.conversationHistory)
          persistSessions()
        }
      } catch (e) {
        console.warn('旧历史迁移失败:', e)
      }
    }
  } catch (err) {
    console.error('加载对话历史失败:', err)
    conversationHistory = []
  }
}

// 渲染历史对话
function renderHistory () {
  // 直接渲染所有历史对话，不清空欢迎消息
  for (let i = 0; i < conversationHistory.length; i++) {
    const msg = conversationHistory[i]

    if (msg.role === 'user') {
      const userMsgDiv = createMessageElement(msg.content, true)
      chatMessages.appendChild(userMsgDiv)
    } else if (msg.role === 'assistant') {
      const aiMsgDiv = createMessageElement(msg.content, false)
      chatMessages.appendChild(aiMsgDiv)
    }
  }

  // 滚动到底部
  chatMessages.scrollTop = chatMessages.scrollHeight
}

// 发送消息函数
function sendMessage (messageText, isUser = true) {
  if (!messageText.trim()) return

  // 立即隐藏欢迎区域（包括建议问题）
  if (welcomeSection) {
    welcomeSection.style.display = 'none'
    welcomeSection.style.visibility = 'hidden'
    welcomeSection.classList.add('hidden')
    // 强制应用样式
    welcomeSection.setAttribute(
      'style',
      'display: none !important; visibility: hidden !important;'
    )
  }

  // 创建消息元素
  const messageDiv = createMessageElement(messageText, isUser)

  // 添加到聊天区域
  chatMessages.appendChild(messageDiv)

  // 再次确保隐藏欢迎区域（在消息添加后）
  if (welcomeSection) {
    welcomeSection.style.display = 'none'
    welcomeSection.classList.add('hidden')
  }

  // 滚动到底部
  chatMessages.scrollTop = chatMessages.scrollHeight

  // 如果是用户消息，调用AI接口
  if (isUser) {
    // 为用户消息添加“编辑”按钮
    try {
      const contentEl = messageDiv.querySelector('.message-content')
      if (contentEl) {
        const editBtn = document.createElement('button')
        editBtn.className = 'edit-button'
        editBtn.textContent = '编辑'
        editBtn.title = '编辑此问题'
        editBtn.addEventListener('click', () => {
          messageInput.value = messageText
          messageInput.focus()
        })
        contentEl.appendChild(editBtn)
      }
    } catch (e) {
      console.warn('添加编辑按钮失败:', e)
    }
    // 保存用户消息
    lastUserMessage = messageText
    isStreaming = true
    let wasManuallyStopped = false // 用于标记是否被手动停止

    // 更新按钮样式为"停止"
    sendButton.textContent = '停止'
    sendButton.classList.add('stop-button')

    // 创建AI回复消息容器（流式输出用）
    const aiMessageDiv = document.createElement('div')
    aiMessageDiv.className = 'message bot-message'
    aiMessageDiv.id = 'streaming-message'
    const time = formatTime()

    // 使用createElement代替innerHTML防止XSS
    const messageContent = document.createElement('div')
    messageContent.className = 'message-content'
    const textDiv = document.createElement('div')
    textDiv.className = 'message-text markdown-content'
    messageContent.appendChild(textDiv)

    const timeDiv = document.createElement('div')
    timeDiv.className = 'message-time'
    timeDiv.textContent = time

    aiMessageDiv.appendChild(messageContent)
    aiMessageDiv.appendChild(timeDiv)
    chatMessages.appendChild(aiMessageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight

    // 流式输出更新函数
    const messageTextDiv = aiMessageDiv.querySelector('.message-text')

    const shouldStop = () => {
      if (!isStreaming) {
        wasManuallyStopped = true
        return true
      }
      return false
    }

    const updateStreamMessage = content => {
      // 先移除之前的光标（如果存在）
      const oldCursor = messageTextDiv.querySelector('.streaming-cursor')
      if (oldCursor) {
        oldCursor.remove()
      }

      // 流式输出时使用Markdown渲染
      const html = markdownToHtml(content)
      messageTextDiv.innerHTML = html

      // 找到最后一个文本节点并在其后插入光标
      const cursor = document.createElement('span')
      cursor.className = 'streaming-cursor'
      cursor.textContent = '▊'

      // 递归查找最后一个包含文本的节点及其插入位置
      function findLastTextPosition (node) {
        if (!node) return null

        // 如果是文本节点且包含非空白字符
        if (
          node.nodeType === Node.TEXT_NODE &&
          node.textContent.trim().length > 0
        ) {
          return { node: node, insertAfter: true }
        }

        // 如果是元素节点
        if (node.nodeType === Node.ELEMENT_NODE) {
          // 检查子节点（从后往前）
          for (let i = node.childNodes.length - 1; i >= 0; i--) {
            const child = node.childNodes[i]
            const result = findLastTextPosition(child)
            if (result) return result
          }

          // 如果这个元素包含文本且没有子节点（或只有文本子节点），在它内部末尾插入
          if (node.textContent.trim().length > 0) {
            // 检查是否有非文本子节点
            const hasElementChild = Array.from(node.childNodes).some(
              c => c.nodeType === Node.ELEMENT_NODE
            )
            if (!hasElementChild) {
              return { node: node, insertAfter: false }
            }
          }
        }

        return null
      }

      const position = findLastTextPosition(messageTextDiv)

      // 插入光标
      if (position) {
        if (position.insertAfter) {
          // 在文本节点后插入
          if (position.node.nextSibling) {
            position.node.parentNode.insertBefore(
              cursor,
              position.node.nextSibling
            )
          } else {
            position.node.parentNode.appendChild(cursor)
          }
        } else {
          // 在元素节点内部末尾插入
          position.node.appendChild(cursor)
        }
      } else {
        // 如果没有找到，直接添加到容器末尾
        messageTextDiv.appendChild(cursor)
      }

      messageTextDiv.classList.add('streaming') // 添加流式样式
      chatMessages.scrollTop = chatMessages.scrollHeight
    }

    // 调用AI API (流式) - 传入当前选中的模型索引
    callAIAPIStream(
      messageText,
      conversationHistory,
      updateStreamMessage,
      shouldStop,
      currentModelIndex
    )
      .then(({ content: fullContent, history: updatedHistory }) => {
        // 更新对话历史
        conversationHistory = updatedHistory
        // 写回当前会话
        const session = sessions.find(s => s.id === activeSessionId)
        if (session) {
          session.messages = conversationHistory
          // 如果是首条用户消息，生成一个可读标题（截断前20字）
          if (!session.title || session.title === '新的对话') {
            session.title =
              lastUserMessage.length > 20
                ? lastUserMessage.slice(0, 20) + '…'
                : lastUserMessage
          }
          renderSessionList()
        }

        // 流式输出完成，移除流式光标和临时ID，重新渲染完整内容
        messageTextDiv.classList.remove('streaming')
        messageTextDiv.innerHTML = markdownToHtml(fullContent)
        aiMessageDiv.removeAttribute('id')

        // 为AI回复添加复制与重试按钮（包括被停止的情况）
        if (fullContent) {
          const copyBtn = document.createElement('button')
          copyBtn.className = 'copy-button'
          copyBtn.innerHTML = '📋'
          copyBtn.title = '复制'
          copyBtn.addEventListener('click', () => {
            copyToClipboard(fullContent)
          })
          messageContent.appendChild(copyBtn)

          const retryBtn = document.createElement('button')
          retryBtn.className = 'retry-button'
          retryBtn.textContent = '重试'
          retryBtn.title = '使用相同问题重新生成'
          retryBtn.addEventListener('click', () => {
            if (lastUserMessage && lastUserMessage.trim()) {
              sendMessage(lastUserMessage, true)
            }
          })
          messageContent.appendChild(retryBtn)
        }

        // 保存会话列表
        persistSessions()

        // 检查是否被手动停止
        if (wasManuallyStopped && fullContent) {
          // 显示停止信息和重新编辑按钮
          const stopInfoDiv = document.createElement('div')
          stopInfoDiv.className = 'message bot-message stop-info'
          const stopTime = formatTime()

          // 使用createElement代替innerHTML防止XSS
          const messageContent = document.createElement('div')
          messageContent.className = 'message-content'

          const textDiv = document.createElement('div')
          textDiv.className = 'message-text'

          const span = document.createElement('span')
          span.textContent = '你停止生成了本次回答'

          const reEditBtn = document.createElement('button')
          reEditBtn.className = 're-edit-button'
          reEditBtn.textContent = '重新编辑问题'
          reEditBtn.addEventListener('click', () => {
            messageInput.value = lastUserMessage
            messageInput.focus()
            stopInfoDiv.remove()
          })

          textDiv.appendChild(span)
          textDiv.appendChild(reEditBtn)
          messageContent.appendChild(textDiv)

          const timeDiv = document.createElement('div')
          timeDiv.className = 'message-time'
          timeDiv.textContent = stopTime

          stopInfoDiv.appendChild(messageContent)
          stopInfoDiv.appendChild(timeDiv)
          chatMessages.appendChild(stopInfoDiv)
          chatMessages.scrollTop = chatMessages.scrollHeight
        }

        // 恢复按钮样式
        sendButton.textContent = '发送'
        sendButton.classList.remove('stop-button')
        isStreaming = false
      })
      .catch(error => {
        // 发生错误，移除流式光标和流式消息并显示错误
        messageTextDiv.classList.remove('streaming')
        aiMessageDiv.remove()
        sendMessage(`抱歉，出现了错误：${error.message}`, false)

        // 恢复按钮样式
        sendButton.textContent = '发送'
        sendButton.classList.remove('stop-button')
        isStreaming = false
      })
  }
}

// 发送按钮点击事件
sendButton.addEventListener('click', () => {
  // 如果正在流式输出，则停止
  if (isStreaming) {
    isStreaming = false

    // 恢复按钮样式
    sendButton.textContent = '发送'
    sendButton.classList.remove('stop-button')
    return
  }

  // 正常发送消息
  const message = messageInput.value.trim()
  if (message) {
    sendMessage(message, true)
    messageInput.value = ''
  }
})

// 回车键发送，Shift+Enter 换行
messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault() // 防止默认换行行为
    sendButton.click()
  }
  // Shift+Enter 允许换行（不阻止默认行为）
})

// 初始化模型选择器
function initModelSelect () {
  if (!customModelSelect || !modelSelect) return

  const selectTrigger = customModelSelect.querySelector('.select-trigger')
  const selectText = customModelSelect.querySelector('.select-text')
  const selectOptions = customModelSelect.querySelector('.select-options')
  const selectDropdown = customModelSelect.querySelector('.select-dropdown')

  // 清空现有选项
  selectOptions.innerHTML = ''
  modelSelect.innerHTML = ''

  // 添加模型选项
  MODEL_LIST.forEach((model, index) => {
    // 原生select选项（用于兼容）
    const option = document.createElement('option')
    option.value = model.id
    option.textContent = `${model.name} (${model.provider})`
    modelSelect.appendChild(option)

    // 自定义下拉选项
    const customOption = document.createElement('div')
    customOption.className = 'select-option'
    customOption.dataset.value = model.id
    customOption.dataset.index = index
    customOption.textContent = `${model.name} (${model.provider})`
    selectOptions.appendChild(customOption)
  })

  // 加载保存的模型选择
  const savedModelIndex = localStorage.getItem(
    APP_CONFIG.storageKeys.selectedModel
  )
  if (savedModelIndex !== null) {
    const index = parseInt(savedModelIndex)
    if (index >= 0 && index < MODEL_LIST.length) {
      currentModelIndex = index
      modelSelect.value = index
      updateCustomSelectDisplay(index)
    }
  } else {
    // 默认选择第一个模型
    modelSelect.value = 0
    currentModelIndex = 0
    updateCustomSelectDisplay(0)
  }

  // 更新自定义下拉框显示（内部函数）
  function updateCustomSelectDisplay (index) {
    if (index >= 0 && index < MODEL_LIST.length) {
      const model = MODEL_LIST[index]
      selectText.textContent = `${model.name} (${model.provider})`

      // 更新选中状态
      selectOptions.querySelectorAll('.select-option').forEach((opt, idx) => {
        if (idx === index) {
          opt.classList.add('selected')
        } else {
          opt.classList.remove('selected')
        }
      })
    }
  }

  // 全局函数：更新自定义下拉框值（供其他函数调用）
  window.updateCustomSelectValue = function (index) {
    if (!customModelSelect) return
    const selectText = customModelSelect.querySelector('.select-text')
    const selectOptions = customModelSelect.querySelector('.select-options')
    if (selectText && selectOptions) {
      if (index >= 0 && index < MODEL_LIST.length) {
        const model = MODEL_LIST[index]
        selectText.textContent = `${model.name} (${model.provider})`

        // 更新选中状态
        selectOptions.querySelectorAll('.select-option').forEach((opt, idx) => {
          if (idx === index) {
            opt.classList.add('selected')
          } else {
            opt.classList.remove('selected')
          }
        })
      }
    }
  }

  // 点击触发器打开/关闭下拉框
  selectTrigger.addEventListener('click', e => {
    e.stopPropagation()
    const wasOpen = customModelSelect.classList.contains('open')
    customModelSelect.classList.toggle('open')

    // 如果下拉框刚打开，滚动到选中项
    if (!wasOpen && customModelSelect.classList.contains('open')) {
      setTimeout(() => {
        const selectedOption = selectOptions.querySelector(
          '.select-option.selected'
        )
        if (selectedOption) {
          // 滚动到选中项，确保它在可视区域内
          selectedOption.scrollIntoView({
            block: 'nearest',
            behavior: 'instant'
          })
        }
      }, 10)
    }
  })

  // 点击选项
  selectOptions.addEventListener('click', e => {
    const option = e.target.closest('.select-option')
    if (!option) return

    const index = parseInt(option.dataset.index)
    if (index >= 0 && index < MODEL_LIST.length) {
      currentModelIndex = index
      modelSelect.value = index
      localStorage.setItem(
        APP_CONFIG.storageKeys.selectedModel,
        currentModelIndex
      )

      updateCustomSelectDisplay(index)
      updateActiveSessionModel(currentModelIndex)
      showToast(`已切换到 ${MODEL_LIST[currentModelIndex].name}`)

      // 关闭下拉框
      customModelSelect.classList.remove('open')
    }
  })

  // 打开下拉框时，滚动到选中项
  selectTrigger.addEventListener('click', () => {
    if (customModelSelect.classList.contains('open')) {
      setTimeout(() => {
        const selectedOption = selectOptions.querySelector(
          '.select-option.selected'
        )
        if (selectedOption) {
          selectedOption.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
          })
        }
      }, 10)
    }
  })

  // 点击外部关闭下拉框
  document.addEventListener('click', e => {
    if (!customModelSelect.contains(e.target)) {
      customModelSelect.classList.remove('open')
    }
  })

  // 键盘导航支持
  selectTrigger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      customModelSelect.classList.toggle('open')
    } else if (e.key === 'Escape') {
      customModelSelect.classList.remove('open')
    }
  })

  updateCurrentModelTag()
}

// 页面加载时加载对话历史
document.addEventListener('DOMContentLoaded', () => {
  loadConversationHistory()

  // 初始化模型选择器
  initModelSelect()

  // 初始化会话列表
  initSessions()

  // 初始化建议问题
  initSuggestions()

  // 初始化欢迎区域显示状态
  updateWelcomeSectionVisibility()

  // 加载保存的主题设置
  const savedTheme = localStorage.getItem(APP_CONFIG.storageKeys.theme)
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme')
  }

  // 移动端侧边栏控制
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (sidebar) sidebar.classList.add('show')
      if (sidebarOverlay) sidebarOverlay.classList.add('show')
      document.body.style.overflow = 'hidden'
    })
  }
  if (sidebarClose) {
    sidebarClose.addEventListener('click', () => {
      if (sidebar) sidebar.classList.remove('show')
      if (sidebarOverlay) sidebarOverlay.classList.remove('show')
      document.body.style.overflow = ''
    })
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', (e) => {
      // 确保点击遮罩层时关闭侧边栏
      if (sidebar) sidebar.classList.remove('show')
      if (sidebarOverlay) sidebarOverlay.classList.remove('show')
      document.body.style.overflow = ''
    })
  }
  
  // 确保侧边栏内的点击事件不会冒泡到遮罩层
  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      e.stopPropagation()
    })
  }

  // 添加主题切换事件监听器
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme)
  }

  // 添加清除对话历史事件监听器
  if (clearButton) {
    clearButton.addEventListener('click', clearConversation)
  }

  // 导出会话
  if (exportButton) {
    exportButton.addEventListener('click', exportSessions)
  }

  // 导入会话
  if (importButton && importFileInput) {
    importButton.addEventListener('click', () => importFileInput.click())
    importFileInput.addEventListener('change', importSessionsFromFileInput)
  }

  // 点击外部关闭所有下拉菜单
  document.addEventListener('click', e => {
    if (!e.target.closest('.session-actions')) {
      closeAllDropdowns()
    }
  })

  // 设置欢迎消息的时间
  const messageTime = document.querySelector('.message-time')
  if (messageTime) {
    messageTime.textContent = formatTime()
  }
})

// 主题切换功能
function toggleTheme () {
  document.body.classList.toggle('dark-theme')

  // 保存主题设置到localStorage
  const isDarkTheme = document.body.classList.contains('dark-theme')
  localStorage.setItem(
    APP_CONFIG.storageKeys.theme,
    isDarkTheme ? 'dark' : 'light'
  )
}

// 清除对话历史功能
function clearConversation () {
  // 确认用户是否真的要清除对话历史
  if (confirm('确定要清除所有对话历史吗？此操作不可撤销。')) {
    // 仅清除当前会话的消息
    conversationHistory = []
    const session = sessions.find(s => s.id === activeSessionId)
    if (session) {
      session.messages = []
    }
    persistSessions()
    renderActiveSessionMessages()
    updateWelcomeSectionVisibility()
    showToast('当前会话已清空')
  }
}

/**
 * 重命名会话
 * 参数：sessionId(string)
 * 返回：void
 */
function renameSession (sessionId) {
  const session = sessions.find(s => s.id === sessionId)
  if (!session) return
  const title = prompt('请输入新的会话名称：', session.title || '')
  if (title === null) return // 用户取消
  const newTitle = (title || '').trim()
  if (!newTitle) {
    showToast('标题不能为空')
    return
  }
  session.title = newTitle
  persistSessions()
  renderSessionList()
}

/**
 * 关闭所有下拉菜单
 * 参数：无
 * 返回：void
 */
function closeAllDropdowns () {
  const allDropdowns = document.querySelectorAll('.session-dropdown')
  allDropdowns.forEach(dropdown => {
    dropdown.style.display = 'none'
  })
}

/**
 * 置顶会话
 * 参数：sessionId(string)
 * 返回：void
 */
function pinSession (sessionId) {
  const index = sessions.findIndex(s => s.id === sessionId)
  if (index < 0) return

  const session = sessions[index]
  // 如果已经置顶，不做处理
  if (session.pinned) return

  // 记录原始位置
  session.pinnedIndex = index
  session.pinned = true

  // 从当前位置移除
  sessions.splice(index, 1)

  // 插入到最前面（新置顶的在最前面）
  sessions.unshift(session)

  persistSessions()
  renderSessionList()
  showToast('已置顶')
}

/**
 * 取消置顶会话
 * 参数：sessionId(string)
 * 返回：void
 */
function unpinSession (sessionId) {
  const index = sessions.findIndex(s => s.id === sessionId)
  if (index < 0) return

  const session = sessions[index]
  // 如果未置顶，不做处理
  if (!session.pinned) return

  // 从当前位置移除
  sessions.splice(index, 1)

  // 恢复置顶状态
  session.pinned = false

  // 找到第一个未置顶会话的位置，将会话插入到未置顶会话的顶部
  const firstUnpinnedIndex = sessions.findIndex(s => !s.pinned)
  if (firstUnpinnedIndex >= 0) {
    sessions.splice(firstUnpinnedIndex, 0, session)
  } else {
    // 如果所有会话都已置顶（不应该发生），则放到末尾
    sessions.push(session)
  }

  session.pinnedIndex = null

  persistSessions()
  renderSessionList()
  showToast('已取消置顶')
}

/**
 * 删除会话
 * 参数：sessionId(string)
 * 返回：void
 */
function deleteSession (sessionId) {
  const idx = sessions.findIndex(s => s.id === sessionId)
  if (idx < 0) return
  if (!confirm('删除后不可恢复，确认删除该会话吗？')) return
  const removed = sessions.splice(idx, 1)[0]
  // 如果删除的是当前激活会话，切换到第一个或新建
  if (removed && removed.id === activeSessionId) {
    activeSessionId = sessions[0]?.id || null
    if (!activeSessionId) {
      const newS = createSessionObject('新的对话', currentModelIndex)
      sessions.push(newS)
      activeSessionId = newS.id
    }
    setActiveSession(activeSessionId)
  } else {
    renderSessionList()
  }
  persistSessions()
}
// 新建对话按钮事件
if (newSessionButton) {
  newSessionButton.addEventListener('click', () => {
    createNewSession()
  })
}

/**
 * 导出当前所有会话为JSON文件
 * 参数：无
 * 返回：void，触发浏览器下载
 */
function exportSessions () {
  try {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      sessions,
      activeSessionId
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chat-sessions.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('已导出会话为 chat-sessions.json')
  } catch (e) {
    console.error('导出会话失败:', e)
    showToast('导出失败')
  }
}

/**
 * 从文件选择输入导入会话
 * 参数：event(File input change事件)
 * 返回：void，成功后刷新会话列表
 */
function importSessionsFromFileInput (event) {
  const file = event.target.files && event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result)
      if (validateImportedData(json)) {
        sessions = json.sessions || []
        activeSessionId =
          json.activeSessionId || (sessions[0] && sessions[0].id) || null
        persistSessions()
        renderSessionList()
        if (activeSessionId) setActiveSession(activeSessionId)
        showToast('导入成功')
      } else {
        showToast('导入的文件格式不正确')
      }
    } catch (e) {
      console.error('解析导入文件失败:', e)
      showToast('导入失败')
    } finally {
      importFileInput.value = ''
    }
  }
  reader.readAsText(file)
}

/**
 * 校验导入JSON的基本结构
 * 参数：data(object)
 * 返回：boolean 是否有效
 */
function validateImportedData (data) {
  if (!data || typeof data !== 'object') return false
  if (!Array.isArray(data.sessions)) return false
  // 简单校验每个会话结构
  for (const s of data.sessions) {
    if (!s || typeof s !== 'object') return false
    if (typeof s.id !== 'string') return false
    if (!Array.isArray(s.messages)) return false
    if (typeof s.modelIndex !== 'number') return false
  }
  return true
}
