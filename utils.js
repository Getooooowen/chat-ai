/**
 * 工具函数模块
 */

// 格式化时间的辅助函数
export function formatTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 显示吐司提示
export function showToast(message) {
  // 移除已存在的吐司
  const existingToast = document.querySelector('.toast')
  if (existingToast) {
    existingToast.remove()
  }

  // 创建吐司元素
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  document.body.appendChild(toast)

  // 触发动画
  setTimeout(() => {
    toast.classList.add('show')
  }, 10)

  // 2秒后自动移除
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, 2000)
}

// 复制文本功能
export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('复制成功！')
  }).catch(err => {
    console.error('复制失败:', err)
    showToast('复制失败！')
  })
}

// 防抖函数
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}