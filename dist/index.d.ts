#!/usr/bin/env node
/**
 * 小红书 CLI - 复用已登录 Chrome，无需重新登录
 *
 * 架构: CLI -> Daemon -> Chrome Extension -> 浏览器
 *
 * 用法:
 *   xhs daemon start          启动 Daemon
 *   xhs operate open <url>    打开网页（使用已登录的 Chrome）
 *   xhs xiaohongshu search <keyword>  搜索
 */
export {};
