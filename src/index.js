#!/usr/bin/env node
/**
 * 小红书 CLI - 命令行工具
 * 
 * 用法:
 *   xhs feed              拉取首页推荐
 *   xhs like <note-id>    点赞笔记
 *   xhs collect <note-id> 收藏笔记
 *   xhs note <note-id>    查看笔记详情
 *   xhs publish           发布笔记
 */

import { Command } from 'commander';
import { chromium } from 'playwright';
import path from 'path';
import os from 'os';

const program = new Command();

// Chrome 用户数据目录（你的登录状态）
const CHROME_PROFILE = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
const CDP_PORT = 9222;

/**
 * 连接到已运行的 Chrome（需要以调试模式启动）
 */
async function connectChrome() {
  try {
    const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
    return browser;
  } catch (e) {
    console.error('❌ 无法连接到 Chrome');
    console.error('请先以调试模式启动 Chrome:');
    console.error('  chrome.exe --remote-debugging-port=9222');
    process.exit(1);
  }
}

/**
 * 创建新的浏览器实例（使用你的 profile）
 */
async function launchChrome() {
  const browser = await chromium.launchPersistentContext(
    path.join(os.homedir(), '.xhs-browser'),
    {
      headless: false,
      channel: 'chrome',
    }
  );
  return browser;
}

// feed 命令
program
  .command('feed [limit]')
  .description('拉取首页推荐')
  .action(async (limit = 20) => {
    const browser = await launchChrome();
    const page = await browser.newPage();
    
    await page.goto('https://www.xiaohongshu.com/explore');
    await page.waitForTimeout(3000);
    
    // TODO: 提取 feed 数据
    
    console.log(`拉取 ${limit} 条推荐...`);
  });

// like 命令
program
  .command('like <note-id>')
  .description('点赞笔记')
  .action(async (noteId) => {
    const browser = await launchChrome();
    const page = await browser.newPage();
    
    const url = noteId.includes('xiaohongshu.com') 
      ? noteId 
      : `https://www.xiaohongshu.com/explore/${noteId}`;
    
    await page.goto(url);
    await page.waitForTimeout(2000);
    
    // 查找并点击点赞按钮
    const result = await page.evaluate(() => {
      const selectors = ['.like-wrapper', '[class*="like"]'];
      
      for (const sel of selectors) {
        const btn = document.querySelector(sel);
        if (btn) {
          const isLiked = btn.classList.contains('liked') || 
                          btn.classList.contains('active');
          
          if (isLiked) {
            return { success: false, detail: '之前已点赞' };
          }
          
          btn.click();
          return { success: true, detail: '已点赞' };
        }
      }
      
      return { success: false, detail: '未找到点赞按钮' };
    });
    
    console.log(result.success ? '✅' : '❌', result.detail);
    
    await browser.close();
  });

// collect 命令
program
  .command('collect <note-id>')
  .description('收藏笔记')
  .action(async (noteId) => {
    const browser = await launchChrome();
    const page = await browser.newPage();
    
    const url = noteId.includes('xiaohongshu.com') 
      ? noteId 
      : `https://www.xiaohongshu.com/explore/${noteId}`;
    
    await page.goto(url);
    await page.waitForTimeout(2000);
    
    const result = await page.evaluate(() => {
      const selectors = ['.collect-wrapper', '.star-wrapper', '[class*="collect"]'];
      
      for (const sel of selectors) {
        const btn = document.querySelector(sel);
        if (btn) {
          const isCollected = btn.classList.contains('collected') || 
                              btn.classList.contains('active');
          
          if (isCollected) {
            return { success: false, detail: '之前已收藏' };
          }
          
          btn.click();
          return { success: true, detail: '收藏成功' };
        }
      }
      
      return { success: false, detail: '未找到收藏按钮' };
    });
    
    console.log(result.success ? '✅' : '❌', result.detail);
    
    await browser.close();
  });

// note 命令
program
  .command('note <note-id>')
  .description('查看笔记详情')
  .action(async (noteId) => {
    const browser = await launchChrome();
    const page = await browser.newPage();
    
    const url = noteId.includes('xiaohongshu.com') 
      ? noteId 
      : `https://www.xiaohongshu.com/explore/${noteId}`;
    
    await page.goto(url);
    await page.waitForTimeout(2000);
    
    const data = await page.evaluate(() => {
      const clean = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
      
      return {
        title: clean(document.querySelector('#detail-title, .title')),
        author: clean(document.querySelector('.username, .author-wrapper .name')),
        likes: clean(document.querySelector('.like-wrapper .count')),
        collects: clean(document.querySelector('.collect-wrapper .count')),
        comments: clean(document.querySelector('.chat-wrapper .count')),
      };
    });
    
    console.table(data);
    
    await browser.close();
  });

program.parse();
