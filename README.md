# 小红书 CLI

命令行工具，自动化小红书操作。

## 功能

- `xhs feed [limit]` — 拉取首页推荐
- `xhs like` — 点赞当前页面笔记
- `xhs collect` — 收藏当前页面笔记
- `xhs note <note-id>` — 查看笔记详情

## 安装

```bash
cd C:\Users\jinmi\projects\xiaohongshu-cli
npm install
```

## 使用

### 拉取首页推荐

```bash
node src/index.js feed 10
```

### 查看笔记详情

```bash
node src/index.js note 69a8423f000000002202cdee
```

## 点赞/收藏功能

### 通过 OpenClaw Browser 工具

在 OpenClaw 中连接到你的 Chrome 浏览器（需要已登录小红书）：

```javascript
// 点赞
browser action: act, kind: evaluate, profile: user
fn: () => {
  const btn = document.querySelector('.like-wrapper');
  if (!btn) return { success: false, detail: '未找到点赞按钮' };
  if (btn.classList.contains('like-active')) return { success: false, detail: '之前已点赞' };
  btn.click();
  return { success: true, detail: '已点赞' };
}

// 收藏
fn: () => {
  const btn = document.querySelector('.collect-wrapper');
  if (!btn) return { success: false, detail: '未找到收藏按钮' };
  if (btn.classList.contains('collect-active')) return { success: false, detail: '之前已收藏' };
  btn.click();
  return { success: true, detail: '已收藏' };
}
```

### 通过 opencli 命令

```bash
# 需要在笔记详情页执行
opencli xiaohongshu like
opencli xiaohongshu collect
```

## 技术实现

### 按钮选择器

```javascript
// 点赞按钮
const likeBtn = document.querySelector('.like-wrapper');
// 已点赞状态
likeBtn.classList.contains('like-active');

// 收藏按钮
const collectBtn = document.querySelector('.collect-wrapper');
// 已收藏状态
collectBtn.classList.contains('collect-active');

// 评论按钮
const chatBtn = document.querySelector('.chat-wrapper');
```

### 互动容器结构

```
.interact-container
  └── .buttons.engage-bar-style
      ├── .left
      │   ├── .like-wrapper (点赞)
      │   ├── .collect-wrapper (收藏)
      │   └── .chat-wrapper (评论)
      └── .share-wrapper (分享)
```

## 注意事项

1. **自动化检测**：小红书会检测自动化浏览器，直接访问笔记 URL 会被拦截
2. **解决方案**：通过 OpenClaw 的 browser 工具连接到用户已登录的 Chrome（`profile: user`）
3. **推荐方式**：从首页点击打开笔记，而不是直接访问笔记 URL

## 依赖

- OpenClaw Browser Bridge（用于浏览器自动化）
- Chrome 浏览器（已登录小红书账号）

## License

MIT
