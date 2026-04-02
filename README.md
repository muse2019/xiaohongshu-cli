# 小红书 CLI

命令行工具，自动化小红书操作。

## 功能

- `xhs feed` — 拉取首页推荐
- `xhs like <note-id>` — 点赞笔记
- `xhs collect <note-id>` — 收藏笔记
- `xhs note <note-id>` — 查看笔记详情

## 安装

```bash
npm install
npm link
```

## 使用

### 点赞

```bash
xhs like 69ce4cb80000000021038163
# 或完整 URL
xhs like "https://www.xiaohongshu.com/explore/69ce4cb80000000021038163"
```

### 收藏

```bash
xhs collect 69ce4cb80000000021038163
```

### 查看详情

```bash
xhs note 69ce4cb80000000021038163
```

## 登录状态

首次使用会打开浏览器，请登录小红书。登录状态会保存在 `~/.xhs-browser` 目录。

## 技术栈

- Node.js
- Playwright
- Commander.js

## License

MIT
