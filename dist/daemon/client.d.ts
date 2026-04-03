/**
 * Daemon Client - CLI 端
 *
 * 发送命令到 Daemon，由 Daemon 转发给 Chrome Extension 执行
 */
export interface DaemonStatus {
    running: boolean;
    extensionConnected: boolean;
    lastHeartbeat: number;
}
/**
 * 检查 Daemon 状态
 */
export declare function checkDaemonStatus(): Promise<DaemonStatus | null>;
/**
 * 检查扩展是否已连接
 */
export declare function isExtensionConnected(): Promise<boolean>;
/**
 * 发送命令到 Daemon
 */
export declare function sendCommand(action: string, params?: Record<string, any>): Promise<any>;
/**
 * 设置 CDP 模式（isTrusted=true 事件）
 * @param enabled - 是否启用 CDP（会产生浏览器警告条）
 */
export declare function setCdpMode(enabled: boolean): Promise<{
    cdp: boolean;
}>;
/**
 * 获取当前配置
 */
export declare function getConfig(): Promise<{
    cdp: boolean;
}>;
/**
 * 导航到 URL
 */
export declare function navigate(url: string, tabId?: number): Promise<{
    tabId: number;
    url: string;
}>;
/**
 * 执行 JavaScript
 */
export declare function exec(code: string, tabId?: number): Promise<any>;
/**
 * 截图
 */
export declare function screenshot(tabId?: number, format?: 'png' | 'jpeg'): Promise<string>;
/**
 * 获取 Cookie
 */
export declare function getCookies(domain?: string): Promise<Array<{
    name: string;
    value: string;
}>>;
/**
 * 获取标签页列表
 */
export declare function listTabs(): Promise<Array<{
    id: number;
    url: string;
    title: string;
}>>;
/**
 * 选择标签页
 */
export declare function selectTab(index: number): Promise<void>;
/**
 * 点击元素
 */
export declare function click(selector: string, tabId?: number): Promise<void>;
/**
 * 输入文本
 */
export declare function type(selector: string, text: string, tabId?: number): Promise<void>;
/**
 * 滚动
 */
export declare function scroll(direction: 'up' | 'down', amount?: number, tabId?: number): Promise<void>;
/**
 * 等待
 */
export declare function wait(ms: number): Promise<void>;
/**
 * 真人风格点击坐标
 */
export declare function humanClick(x: number, y: number, options?: {
    doubleClick?: boolean;
}): Promise<any>;
/**
 * 真人风格点击元素
 */
export declare function humanClickElement(selector: string): Promise<any>;
/**
 * 真人风格输入
 */
export declare function humanType(selector: string, text: string): Promise<any>;
/**
 * 真人风格滚动
 */
export declare function humanScroll(direction: 'up' | 'down', amount?: number): Promise<any>;
/**
 * 随机滚动浏览
 */
export declare function randomScroll(durationMs?: number): Promise<any>;
/**
 * 小红书点赞（真人风格）
 */
export declare function xhsLike(): Promise<any>;
/**
 * 小红书收藏（真人风格）
 */
export declare function xhsCollect(): Promise<any>;
/**
 * 小红书评论（真人风格）
 */
export declare function xhsComment(text: string): Promise<any>;
/**
 * 小红书浏览笔记（真人风格）
 */
export declare function xhsBrowseNote(durationMs?: number): Promise<any>;
