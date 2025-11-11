/**
 * Markdown解析器模块
 */

// 简单的Markdown转HTML函数（支持常用格式）
export function markdownToHtml(text) {
  if (!text) return ''

  // 先保护代码块，使用占位符
  const codeBlocks = []
  let placeholderIndex = 0
  // 匹配代码块，支持语言标识符：```language 或 ```
  // 改进正则：支持可选的换行符和语言标识符
  let html = text.replace(/```(\w+)?\s*\n?([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${placeholderIndex}__`
    const language = lang ? lang.trim() : ''
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    // 创建代码块HTML，包含语言类和复制按钮
    const codeBlockId = `code-block-${placeholderIndex}`
    const codeBlockHtml = `
      <div class="code-block-wrapper">
        <div class="code-block-header">
          ${language ? `<span class="code-language">${language}</span>` : ''}
          <button class="code-copy-btn" data-code-id="${codeBlockId}" title="复制代码">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
            </svg>
            <span class="copy-text">复制</span>
          </button>
        </div>
        <pre><code class="${language ? `language-${language}` : ''}" id="${codeBlockId}">${escapedCode}</code></pre>
      </div>
    `
    codeBlocks[placeholderIndex] = codeBlockHtml
    placeholderIndex++
    return placeholder
  })

  // 按行分割处理
  const lines = html.split('\n')
  const result = []
  let inList = false
  let listType = null
  let listItems = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // 如果是代码块占位符，直接添加
    if (line.match(/^__CODE_BLOCK_\d+__$/)) {
      closeList(result, listItems, listType)
      inList = false
      listType = null
      const blockIndex = parseInt(line.match(/\d+/)[0])
      result.push(codeBlocks[blockIndex])
      continue
    }

    // 转义HTML特殊字符
    line = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // 处理标题
    if (line.match(/^###\s+/)) {
      closeList(result, listItems, listType)
      inList = false
      listType = null
      result.push(`<h3>${line.replace(/^###\s+/, '')}</h3>`)
    } else if (line.match(/^##\s+/)) {
      closeList(result, listItems, listType)
      inList = false
      listType = null
      result.push(`<h2>${line.replace(/^##\s+/, '')}</h2>`)
    } else if (line.match(/^#\s+/)) {
      closeList(result, listItems, listType)
      inList = false
      listType = null
      result.push(`<h1>${line.replace(/^#\s+/, '')}</h1>`)
    }
    // 处理有序列表
    else if (line.match(/^\d+\.\s+/)) {
      if (!inList || listType !== 'ol') {
        closeList(result, listItems, listType)
        inList = true
        listType = 'ol'
        listItems = []
      }
      listItems.push(line.replace(/^\d+\.\s+/, ''))
    }
    // 处理无序列表
    else if (line.match(/^[-*]\s+/)) {
      if (!inList || listType !== 'ul') {
        closeList(result, listItems, listType)
        inList = true
        listType = 'ul'
        listItems = []
      }
      listItems.push(line.replace(/^[-*]\s+/, ''))
    }
    // 处理段落
    else {
      closeList(result, listItems, listType)
      inList = false
      listType = null

      if (line.trim()) {
        // 处理行内格式（先处理代码，避免与列表标记冲突）
        line = line.replace(/`([^`]+)`/g, '<code>$1</code>')
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>')

        result.push(`<p>${line}</p>`)
      }
    }
  }

  closeList(result, listItems, listType)

  const finalHtml = result.join('')
  
  // 返回HTML后，需要在DOM中高亮代码块
  // 这个函数返回HTML字符串，实际的高亮处理在插入DOM后执行
  return finalHtml

  function closeList(result, items, type) {
    if (items && items.length > 0 && type) {
      const itemsHtml = items.map(item => {
        // 处理列表项内的格式
        let itemHtml = item
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
        return `<li>${itemHtml}</li>`
      }).join('')
      result.push(`<${type}>${itemsHtml}</${type}>`)
      items.length = 0 // 清空列表项
    }
  }
}

/**
 * 高亮代码块（在DOM插入后调用）
 * @param {HTMLElement} container - 包含代码块的容器元素
 */
export function highlightCodeBlocks(container) {
  if (!container || typeof hljs === 'undefined') return
  
  // 查找所有代码块
  const codeBlocks = container.querySelectorAll('pre code')
  codeBlocks.forEach(block => {
    // 如果已经高亮过，跳过
    if (block.classList.contains('hljs')) return
    
    // 使用 highlight.js 高亮代码
    hljs.highlightElement(block)
  })
  
  // 绑定复制按钮事件
  const copyButtons = container.querySelectorAll('.code-copy-btn')
  copyButtons.forEach(btn => {
    // 移除旧的事件监听器（如果存在）
    const newBtn = btn.cloneNode(true)
    btn.parentNode.replaceChild(newBtn, btn)
    
    newBtn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const codeId = newBtn.dataset.codeId
      const codeElement = container.querySelector(`#${codeId}`)
      if (codeElement) {
        const codeText = codeElement.textContent || codeElement.innerText
        try {
          await navigator.clipboard.writeText(codeText)
          // 更新按钮状态
          const copyText = newBtn.querySelector('.copy-text')
          if (copyText) {
            const originalText = copyText.textContent
            copyText.textContent = '已复制!'
            newBtn.classList.add('copied')
            setTimeout(() => {
              copyText.textContent = originalText
              newBtn.classList.remove('copied')
            }, 2000)
          }
        } catch (err) {
          console.error('复制失败:', err)
        }
      }
    })
  })
}