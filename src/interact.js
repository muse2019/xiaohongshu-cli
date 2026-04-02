/**
 * 小红书互动脚本
 * 
 * 在浏览器控制台中运行，或通过 OpenClaw browser 工具调用
 */

// 点赞当前页面的笔记
function like() {
  const btn = document.querySelector('.like-wrapper');
  if (!btn) return { success: false, detail: '未找到点赞按钮' };
  
  const isLiked = btn.classList.contains('like-active');
  if (isLiked) return { success: false, detail: '之前已点赞' };
  
  btn.click();
  return { success: true, detail: '已点赞' };
}

// 取消点赞
function unlike() {
  const btn = document.querySelector('.like-wrapper');
  if (!btn) return { success: false, detail: '未找到点赞按钮' };
  
  const isLiked = btn.classList.contains('like-active');
  if (!isLiked) return { success: false, detail: '之前未点赞' };
  
  btn.click();
  return { success: true, detail: '已取消点赞' };
}

// 收藏当前页面的笔记
function collect() {
  const btn = document.querySelector('.collect-wrapper');
  if (!btn) return { success: false, detail: '未找到收藏按钮' };
  
  const isCollected = btn.classList.contains('collect-active');
  if (isCollected) return { success: false, detail: '之前已收藏' };
  
  btn.click();
  return { success: true, detail: '已收藏' };
}

// 取消收藏
function uncollect() {
  const btn = document.querySelector('.collect-wrapper');
  if (!btn) return { success: false, detail: '未找到收藏按钮' };
  
  const isCollected = btn.classList.contains('collect-active');
  if (!isCollected) return { success: false, detail: '之前未收藏' };
  
  btn.click();
  return { success: true, detail: '已取消收藏' };
}

// 评论（发表评论）
function comment(text) {
  if (!text || typeof text !== 'string') {
    return { success: false, detail: '请提供评论内容' };
  }
  
  const input = document.querySelector('#content-textarea');
  if (!input) return { success: false, detail: '未找到评论输入框' };
  
  // 设置评论内容
  input.textContent = text;
  
  // 触发input事件
  const inputEvent = new Event('input', { bubbles: true });
  input.dispatchEvent(inputEvent);
  
  // 找发送按钮
  const submitBtn = document.querySelector('button.btn.submit');
  if (!submitBtn) return { success: false, detail: '未找到发送按钮' };
  
  // 点击发送
  submitBtn.click();
  
  return { success: true, detail: '评论已发送', content: text };
}

// 获取当前笔记信息
function getNoteInfo() {
  const noteContent = document.querySelector('.note-content');
  const title = noteContent?.querySelector('.title')?.textContent?.trim();
  const desc = noteContent?.querySelector('.desc, .note-text')?.textContent?.trim();
  
  const author = document.querySelector('.author-wrapper .username, [class*="author-name"]')?.textContent?.trim();
  
  const likeBtn = document.querySelector('.like-wrapper');
  const collectBtn = document.querySelector('.collect-wrapper');
  const chatBtn = document.querySelector('.chat-wrapper');
  
  return {
    title: title || '未找到标题',
    content: desc || '未找到正文',
    author: author || '未找到作者',
    stats: {
      likes: likeBtn?.textContent?.trim() || '0',
      collects: collectBtn?.textContent?.trim() || '0',
      comments: chatBtn?.textContent?.trim() || '0'
    },
    status: {
      liked: likeBtn?.classList.contains('like-active') || false,
      collected: collectBtn?.classList.contains('collect-active') || false
    }
  };
}

// 批量点赞首页笔记
async function batchLikeFromFeed(count = 5) {
  const noteCards = document.querySelectorAll('a[href*="/explore/"]');
  const results = [];
  
  for (let i = 0; i < Math.min(count, noteCards.length); i++) {
    const card = noteCards[i];
    const href = card.getAttribute('href');
    const match = href?.match(/explore\/([a-f0-9]+)/);
    
    if (match) {
      results.push({
        noteId: match[1],
        title: card.textContent?.trim().slice(0, 50)
      });
      
      // 点击打开笔记
      card.click();
      await new Promise(r => setTimeout(r, 3000));
      
      // 点赞
      const likeResult = like();
      results[i].liked = likeResult.success;
      results[i].detail = likeResult.detail;
      
      // 返回首页
      history.back();
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  return results;
}

// 导出函数
if (typeof window !== 'undefined') {
  window.xhs = { like, unlike, collect, uncollect, comment, getNoteInfo, batchLikeFromFeed };
}
