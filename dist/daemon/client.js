/**
 * Daemon Client - CLI 端
 *
 * 发送命令到 Daemon，由 Daemon 转发给 Chrome Extension 执行
 */
const DAEMON_PORT = 19826;
const DAEMON_URL = `http://localhost:${DAEMON_PORT}`;
/**
 * 检查 Daemon 状态
 */
export async function checkDaemonStatus() {
    try {
        const response = await fetch(`${DAEMON_URL}/status`);
        return await response.json();
    }
    catch {
        return null;
    }
}
/**
 * 检查扩展是否已连接
 */
export async function isExtensionConnected() {
    const status = await checkDaemonStatus();
    return status?.extensionConnected ?? false;
}
/**
 * 发送命令到 Daemon
 */
export async function sendCommand(action, params = {}) {
    const response = await fetch(`${DAEMON_URL}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
    }
    return await response.json();
}
// ==================== 配置 ====================
/**
 * 设置 CDP 模式（isTrusted=true 事件）
 * @param enabled - 是否启用 CDP（会产生浏览器警告条）
 */
export async function setCdpMode(enabled) {
    return await sendCommand('setConfig', { cdp: enabled });
}
/**
 * 获取当前配置
 */
export async function getConfig() {
    return await sendCommand('getConfig');
}
// ==================== 便捷方法 ====================
/**
 * 导航到 URL
 */
export async function navigate(url, tabId) {
    return await sendCommand('navigate', { url, tabId });
}
/**
 * 执行 JavaScript
 */
export async function exec(code, tabId) {
    const result = await sendCommand('exec', { code, tabId });
    // 处理返回结果 { success, result, error }
    if (result && typeof result === 'object') {
        if (result.success && 'result' in result) {
            return result.result;
        }
        if (!result.success && result.error) {
            return { error: result.error };
        }
        return result.result ?? result;
    }
    return result;
}
/**
 * 截图
 */
export async function screenshot(tabId, format = 'png') {
    const result = await sendCommand('screenshot', { tabId, format });
    return result.dataUrl;
}
/**
 * 获取 Cookie
 */
export async function getCookies(domain) {
    const result = await sendCommand('cookies', { domain });
    return result.cookies;
}
/**
 * 获取标签页列表
 */
export async function listTabs() {
    const result = await sendCommand('tabs', { op: 'list' });
    return result.tabs;
}
/**
 * 选择标签页
 */
export async function selectTab(index) {
    await sendCommand('tabs', { op: 'select', index });
}
/**
 * 点击元素
 */
export async function click(selector, tabId) {
    await sendCommand('click', { selector, tabId });
}
/**
 * 输入文本
 */
export async function type(selector, text, tabId) {
    await sendCommand('type', { selector, text, tabId });
}
/**
 * 滚动
 */
export async function scroll(direction, amount = 300, tabId) {
    await sendCommand('scroll', { direction, amount, tabId });
}
/**
 * 等待
 */
export async function wait(ms) {
    await sendCommand('wait', { ms });
}
// ==================== 真人行为 ====================
/**
 * 真人风格点击坐标
 */
export async function humanClick(x, y, options) {
    return await sendCommand('humanClick', { x, y, options });
}
/**
 * 真人风格点击元素
 */
export async function humanClickElement(selector) {
    return await sendCommand('humanClickElement', { selector });
}
/**
 * 真人风格输入
 */
export async function humanType(selector, text) {
    return await sendCommand('humanType', { selector, text });
}
/**
 * 真人风格滚动
 */
export async function humanScroll(direction, amount = 300) {
    return await sendCommand('humanScroll', { direction, amount });
}
/**
 * 随机滚动浏览
 */
export async function randomScroll(durationMs = 5000) {
    return await sendCommand('randomScroll', { durationMs });
}
// ==================== 小红书专用 ====================
/**
 * 小红书点赞（真人风格）
 */
export async function xhsLike() {
    return await sendCommand('xhsLike', {});
}
/**
 * 小红书收藏（真人风格）
 */
export async function xhsCollect() {
    return await sendCommand('xhsCollect', {});
}
/**
 * 小红书评论（真人风格）
 */
export async function xhsComment(text) {
    return await sendCommand('xhsComment', { text });
}
/**
 * 小红书浏览笔记（真人风格）
 */
export async function xhsBrowseNote(durationMs = 5000) {
    return await sendCommand('xhsBrowseNote', { durationMs });
}
