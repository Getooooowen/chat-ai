/**
 * 消息处理模块
 */

import { formatTime, copyToClipboard } from './utils.js'
import { markdownToHtml } from './markdown.js'

// 创建单个消息元素的辅助函数
export function createMessageElement (messageText, isUser = true) {
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

  // 创建消息操作容器
  const actionsContainer = document.createElement('div')
  actionsContainer.className = 'message-actions'

  if (isUser) {
    // 用户消息：编辑、复制、分享
    const editBtn = document.createElement('button')
    editBtn.className = 'action-btn edit-button'
    editBtn.innerHTML = '✏️'
    editBtn.title = '编辑'
    editBtn.addEventListener('click', e => {
      e.stopPropagation()
      // 将消息内容复制到输入框
      messageInput.value = messageText
    })
    actionsContainer.appendChild(editBtn)

    // 复制按钮（用户消息不需要下拉菜单）
    const copyBtn = document.createElement('button')
    copyBtn.className = 'action-btn copy-button'
    copyBtn.innerHTML = '📋'
    copyBtn.title = '复制'
    copyBtn.addEventListener('click', e => {
      e.stopPropagation()
      copyToClipboard(messageText)
    })
    actionsContainer.appendChild(copyBtn)

    const shareBtn = document.createElement('button')
    shareBtn.className = 'action-btn share-button'
    shareBtn.innerHTML = '🔗'
    shareBtn.title = '生成图片'
    shareBtn.addEventListener('click', e => {
      e.stopPropagation()
      // TODO: 实现分享功能
      console.log('分享消息')
    })
    actionsContainer.appendChild(shareBtn)
  } else {
    // AI消息：复制、收藏、点赞、点踩、重新生成、分享
    // 复制按钮（带下拉菜单）
    const copyWrapper = document.createElement('div')
    copyWrapper.className = 'copy-button-wrapper'
    const copyBtn = document.createElement('button')
    copyBtn.className = 'action-btn copy-button'
    copyBtn.innerHTML = '📋'
    copyBtn.title = '复制'

    // 下拉箭头（仅PC端）
    const arrowBtn = document.createElement('button')
    arrowBtn.className = 'copy-arrow-btn'
    arrowBtn.innerHTML = '▼'
    arrowBtn.title = '更多选项'

    // 下拉菜单
    const dropdown = document.createElement('div')
    dropdown.className = 'copy-dropdown'
    dropdown.innerHTML = `
      <div class="dropdown-item" data-action="copy">复制</div>
      <div class="dropdown-item" data-action="copy-markdown">复制为Markdown</div>
    `

    copyWrapper.appendChild(copyBtn)
    copyWrapper.appendChild(arrowBtn)
    copyWrapper.appendChild(dropdown)
    actionsContainer.appendChild(copyWrapper)

    // 复制按钮点击事件
    copyBtn.addEventListener('click', e => {
      e.stopPropagation()
      copyToClipboard(messageText)
    })

    // 下拉菜单点击事件
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', e => {
        e.stopPropagation()
        const action = item.dataset.action
        if (action === 'copy') {
          copyToClipboard(messageText)
        } else if (action === 'copy-markdown') {
          // 复制为Markdown格式
          const markdown = '```\n' + messageText + '\n```'
          copyToClipboard(markdown)
          // showToast将在script.js中通过全局函数调用
          if (typeof showToast === 'function') {
            showToast('已复制为Markdown格式')
          }
        }
        copyWrapper.classList.remove('open')
      })
    })

    // 箭头按钮点击事件（仅PC端）
    arrowBtn.addEventListener('click', e => {
      e.stopPropagation()
      copyWrapper.classList.toggle('open')
    })

    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', e => {
      if (!copyWrapper.contains(e.target)) {
        copyWrapper.classList.remove('open')
      }
    })

    const favoriteBtn = document.createElement('button')
    favoriteBtn.className = 'action-btn favorite-button'
    favoriteBtn.innerHTML = '⭐'
    favoriteBtn.title = '收藏'
    // 收藏功能将在script.js中动态绑定
    favoriteBtn.dataset.messageContent = messageText
    actionsContainer.appendChild(favoriteBtn)

    const thumbsUpBtn = document.createElement('button')
    thumbsUpBtn.className = 'action-btn thumbs-up-button'
    thumbsUpBtn.innerHTML = '👍'
    thumbsUpBtn.title = '点赞'
    thumbsUpBtn.addEventListener('click', e => {
      e.stopPropagation()
      // TODO: 实现点赞功能
      console.log('点赞')
    })
    actionsContainer.appendChild(thumbsUpBtn)

    const thumbsDownBtn = document.createElement('button')
    thumbsDownBtn.className = 'action-btn thumbs-down-button'
    thumbsDownBtn.innerHTML = '👎'
    thumbsDownBtn.title = '点踩'
    thumbsDownBtn.addEventListener('click', e => {
      e.stopPropagation()
      // TODO: 实现点踩功能
      console.log('点踩')
    })
    actionsContainer.appendChild(thumbsDownBtn)

    const regenerateBtn = document.createElement('button')
    regenerateBtn.className = 'action-btn regenerate-button'
    regenerateBtn.innerHTML = '🔄'
    regenerateBtn.title = '重新生成'
    // 重新生成功能将在script.js中动态绑定
    actionsContainer.appendChild(regenerateBtn)

    const shareBtn = document.createElement('button')
    shareBtn.className = 'action-btn share-button'
    shareBtn.innerHTML = '🔗'
    shareBtn.title = '生成图片'
    shareBtn.addEventListener('click', e => {
      e.stopPropagation()
      // TODO: 实现分享功能
      console.log('分享消息')
    })
    actionsContainer.appendChild(shareBtn)
  }

  messageContent.appendChild(textDiv)
  messageDiv.appendChild(messageContent)
  messageDiv.appendChild(actionsContainer)
  messageDiv.style.position = 'relative'

  // const timeDiv = document.createElement('div')
  // timeDiv.className = 'message-time'
  // timeDiv.textContent = time
  // messageDiv.appendChild(timeDiv)

  return messageDiv
}

// 批量添加消息的优化函数
export function appendMessagesBatch (chatMessages, messages) {
  // 使用DocumentFragment减少DOM重排
  const fragment = document.createDocumentFragment()

  messages.forEach(({ text, isUser }) => {
    const messageElement = createMessageElement(text, isUser)
    fragment.appendChild(messageElement)
  })

  chatMessages.appendChild(fragment)
  chatMessages.scrollTop = chatMessages.scrollHeight
}
