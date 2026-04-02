# 小红书 CLI

命令行工具，自动化小红书操作。

## 功能

- `xhs feed [limit]` — 拉取首页推荐
- `xhs note <note-id>` — 查看笔记详情
- 点赞/收藏功能开发中

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

## 技术实现

### 点赞/收藏按钮选择器

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

## 依赖

- opencli Browser Bridge（用于浏览器自动化）

## License

MIT
