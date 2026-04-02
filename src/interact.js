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

// 获取当前笔记信息
function getNoteInfo() {
  const titleEl = document.querySelector('#detail-title, .title');
  const authorEl = document.querySelector('.author-wrapper .username, [class*="author"]');
  const likeCount = document.querySelector('.like-wrapper')?.textContent?.trim();
  const collectCount = document.querySelector('.collect-wrapper')?.textContent?.trim();
  const chatCount = document.querySelector('.chat-wrapper')?.textContent?.trim();
  
  const likeBtn = document.querySelector('.like-wrapper');
  const collectBtn = document.querySelector('.collect-wrapper');
  
  return {
    title: titleEl?.textContent?.trim() || '未知',
    author: authorEl?.textContent?.trim() || '未知',
    stats: {
      likes: likeCount || '0',
      collects: collectCount || '0',
      comments: chatCount || '0'
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
  window.xhs = { like, unlike, collect, uncollect, getNoteInfo, batchLikeFromFeed };
}
