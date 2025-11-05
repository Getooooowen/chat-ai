/**
 * Markdown解析器模块
 */

// 简单的Markdown转HTML函数（支持常用格式）
export function markdownToHtml(text) {
  if (!text) return ''

  // 先保护代码块，使用占位符
  const codeBlocks = []
  let placeholderIndex = 0
  let html = text.replace(/```([\s\S]*?)```/g, (match, code) => {
    const placeholder = `__CODE_BLOCK_${placeholderIndex}__`
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    codeBlocks[placeholderIndex] = `<pre><code>${escapedCode}</code></pre>`
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

  return result.join('')

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