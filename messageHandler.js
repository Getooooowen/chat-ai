/**
 * 消息处理模块
 */

import { formatTime, copyToClipboard } from './utils.js'
import { markdownToHtml } from './markdown.js'

// 创建单个消息元素的辅助函数
export function createMessageElement(messageText, isUser = true) {
  const messageDiv = document.createElement('div')
  messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`

  const time = formatTime()

  const messageContent = document.createElement('div')
  messageContent.className = 'message-content'

  const textDiv = document.createElement('div')
  textDiv.className = 'message-text'

  // 对AI消息使用Markdown渲染，用户消息保持纯文本
  if (isUser) {
    textDiv.textContent = messageText
  } else {
    textDiv.innerHTML = markdownToHtml(messageText)
    textDiv.classList.add('markdown-content')
  }

  // 添加复制按钮
  const copyBtn = document.createElement('button')
  copyBtn.className = 'copy-button'
  copyBtn.innerHTML = '📋'
  copyBtn.title = '复制'
  copyBtn.addEventListener('click', () => {
    copyToClipboard(messageText)
  })

  messageContent.appendChild(textDiv)
  messageContent.appendChild(copyBtn)
  messageDiv.appendChild(messageContent)

  const timeDiv = document.createElement('div')
  timeDiv.className = 'message-time'
  timeDiv.textContent = time
  messageDiv.appendChild(timeDiv)

  return messageDiv
}

// 批量添加消息的优化函数
export function appendMessagesBatch(chatMessages, messages) {
  // 使用DocumentFragment减少DOM重排
  const fragment = document.createDocumentFragment()

  messages.forEach(({ text, isUser }) => {
    const messageElement = createMessageElement(text, isUser)
    fragment.appendChild(messageElement)
  })

  chatMessages.appendChild(fragment)
  chatMessages.scrollTop = chatMessages.scrollHeight
}