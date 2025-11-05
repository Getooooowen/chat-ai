# AI对话助手

一个基于纯前端技术的AI聊天应用，使用SiliconFlow API。

## 功能特性

- 🤖 智能对话：支持流式输出，实时响应
- 📝 Markdown支持：代码块、列表、加粗等格式
- 🎨 现代化UI：渐变背景、流畅动画
- 💬 对话历史：完整的上下文记忆
- ⏱️ 时间显示：每条消息附带时间戳
- 📱 响应式设计：适配各种设备

## 技术栈

- HTML5
- CSS3
- Vanilla JavaScript
- SiliconFlow API

## 项目结构

```
chat-ai/
├── index.html    # 主页面
├── style.css     # 样式文件
├── app.css       # 侧边栏样式
├── script.js     # 核心逻辑
├── config.js     # 配置文件
├── apiHandler.js # API处理
├── utils.js      # 工具函数
├── markdown.js   # Markdown渲染
├── messageHandler.js # 消息处理
└── README.md     # 项目说明
```

## 本地运行

⚠️ **重要提示**：由于项目使用了 ES6 模块，**不能直接双击打开 `index.html` 文件**！必须通过 HTTP 服务器运行。

### 快速启动（推荐）

**Windows 用户：**
- 双击运行 `启动服务器.bat` 文件
- 然后在浏览器访问 `http://localhost:8000`

### 手动启动

1. 克隆项目
```bash
git clone <your-repo-url>
cd chat-ai
```

2. 启动本地服务器（选择以下方法之一）：

**方法1: 使用 Python（推荐）**
```bash
python -m http.server 8000
```

**方法2: 使用 Node.js**
```bash
npx http-server -p 8000
```

**方法3: 使用 VS Code Live Server 插件**
- 在 VS Code 中安装 "Live Server" 插件
- 右键点击 `index.html` → 选择 "Open with Live Server"

**方法4: 使用 PowerShell**
```powershell
.\启动服务器.ps1
```

3. 在浏览器访问 `http://localhost:8000`

### 为什么需要本地服务器？

浏览器出于安全考虑，不允许通过 `file://` 协议加载 ES6 模块。必须使用 `http://` 或 `https://` 协议。

## 部署指南

### 方式一：使用Nginx部署（服务器部署）

1. 将项目文件上传到服务器
```bash
scp -r * user@your-server:/var/www/chat-ai/
```

2. 创建Nginx配置文件 `/etc/nginx/sites-available/chat-ai`：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/chat-ai;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

3. 启用配置并重启Nginx
```bash
sudo ln -s /etc/nginx/sites-available/chat-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 方式二：使用Vercel部署（推荐，免费）

1. 注册[Vercel账号](https://vercel.com)

2. 安装Vercel CLI
```bash
npm i -g vercel
```

3. 部署
```bash
vercel login
vercel --prod
```

4. 自动获得HTTPS域名

### 方式三：使用Netlify部署（推荐，免费）

1. 注册[Netlify账号](https://netlify.com)

2. 安装Netlify CLI
```bash
npm i -g netlify-cli
```

3. 部署
```bash
netlify login
netlify deploy --prod --dir=.
```

4. 自动获得HTTPS域名

### 方式四：使用GitHub Pages

1. 创建GitHub仓库

2. 上传代码
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/chat-ai.git
git push -u origin main
```

3. 在GitHub仓库设置中启用Pages
   - Settings → Pages
   - Source: main branch
   - 自动获得 `https://yourusername.github.io/chat-ai/`

## 安全提示

⚠️ **重要**：项目已移除硬编码的 API 密钥，需要手动配置！

## 配置说明

### API密钥设置

项目支持多种方式配置 API 密钥，按以下优先级顺序读取：

#### 方式1：使用项目配置文件（推荐，最简单）⭐

1. 复制示例配置文件：
   ```bash
   # Windows
   copy config.local.js.example config.local.js
   
   # Linux/Mac
   cp config.local.js.example config.local.js
   ```

2. 编辑 `config.local.js` 文件，填入你的 API 密钥：
   ```javascript
   const LOCAL_CONFIG = {
     apiKey: '你的API密钥'
   }
   ```

3. 保存文件即可，无需重启服务器

**优点：**
- ✅ 密钥保存在项目文件中，方便管理
- ✅ 已添加到 `.gitignore`，不会被提交到版本控制
- ✅ 优先级最高，会自动读取

#### 方式2：在浏览器控制台设置（临时）

1. 启动本地服务器并打开项目
2. 按 `F12` 打开浏览器控制台
3. 运行以下命令：
```javascript
localStorage.setItem('SILICONFLOW_API_KEY', '你的API密钥')
```
4. 刷新页面即可生效

#### 方式3：通过环境变量设置（用于生产环境）

**Vercel 部署：**
1. 在 Vercel 项目设置中添加环境变量 `SILICONFLOW_API_KEY`
2. 在构建时注入到 `window.SILICONFLOW_API_KEY`

**Netlify 部署：**
1. 在 Netlify 项目设置中添加环境变量 `SILICONFLOW_API_KEY`
2. 通过构建脚本注入到 `window.SILICONFLOW_API_KEY`

**其他平台：**
根据平台文档配置环境变量，并在构建时注入到 `window.SILICONFLOW_API_KEY`

#### API密钥获取优先级（从高到低）

1. **`config.local.js`** - 项目配置文件（推荐用于本地开发）
2. **`window.SILICONFLOW_API_KEY`** - 构建时注入（用于生产环境）
3. **`localStorage.getItem('SILICONFLOW_API_KEY')`** - 浏览器本地存储（临时使用）

### 安全建议

⚠️ **重要提醒**：
- 永远不要将 API 密钥提交到代码仓库
- 生产环境建议使用后端代理来隐藏 API 密钥
- 在 SiliconFlow 控制台设置请求频率限制和使用配额

### API端点
在 `script.js` 的第7行修改API地址：
```javascript
const apiUrl = 'https://api.siliconflow.cn/v1/chat/completions'
```

## 注意事项

1. 确保API密钥有效且有足够额度
2. 遵守SiliconFlow的使用条款
3. 注意API调用频率限制
4. 生产环境建议添加错误监控
5. 考虑添加用户身份验证

## 故障排查

### 问题：无法连接API
- 检查网络连接
- 验证API密钥是否正确
- 查看浏览器控制台错误信息
- 检查API服务状态

### 问题：样式不显示
- 确保文件路径正确
- 检查服务器MIME类型配置
- 清除浏览器缓存

### 问题：部署后无法访问
- 检查服务器防火墙
- 验证Nginx配置（如使用Nginx）
- 查看服务器日志（如使用Nginx：`tail -f /var/log/nginx/error.log`）

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有问题，请提交Issue或联系项目维护者。

