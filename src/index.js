#!/usr/bin/env node
/**
 * 小红书 CLI - 命令行工具
 * 
 * 通过 opencli Browser Bridge 操作浏览器
 * 
 * 用法:
 *   xhs feed              拉取首页推荐
 *   xhs like <note-id>    点赞笔记
 *   xhs collect <note-id> 收藏笔记
 *   xhs note <note-id>    查看笔记详情
 */

import { Command } from 'commander';
import { execSync, spawn } from 'child_process';

const program = new Command();

/**
 * 调用 opencli 命令
 */
function opencli(args, timeout = 60000) {
  try {
    const result = execSync(`opencli xiaohongshu ${args}`, { 
      encoding: 'utf-8',
      timeout,
    });
    return result;
  } catch (e) {
    return e.stdout || e.message;
  }
}

// feed 命令
program
  .command('feed [limit]')
  .description('拉取首页推荐')
  .action(async (limit = 10) => {
    console.log(opencli(`feed --limit ${limit}`));
  });

// like 命令 - 使用 browser 工具
program
  .command('like <note-id>')
  .description('点赞笔记')
  .action(async (noteId) => {
    console.log(`点赞笔记 ${noteId}...`);
    console.log('请手动点赞，或等待 opencli 支持点赞功能');
  });

// collect 命令
program
  .command('collect <note-id>')
  .description('收藏笔记')
  .action(async (noteId) => {
    console.log(`收藏笔记 ${noteId}...`);
    console.log('请手动收藏，或等待 opencli 支持收藏功能');
  });

// note 命令
program
  .command('note <note-id>')
  .description('查看笔记详情')
  .action(async (noteId) => {
    console.log(opencli(`note ${noteId}`));
  });

// batch 命令
program
  .command('batch <file>')
  .description('批量操作（从文件读取 note-id）')
  .action(async (file) => {
    const fs = await import('fs');
    const noteIds = fs.readFileSync(file, 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    
    console.log(`读取到 ${noteIds.length} 个笔记 ID`);
    console.log('请手动操作或等待自动化功能完善');
  });

program.parse();
