/**
 * 浏览器页面操作核心模块
 *
 * 封装 Playwright，提供类似 opencli 的操作接口
 * 内置反检测和真人行为模拟
 */
import { type Browser, type Page as PlaywrightPage, type BrowserContext } from 'playwright';
import { HumanBehavior } from '../stealth/human-behavior.js';
export interface PageOptions {
    /** 是否无头模式 */
    headless?: boolean;
    /** 是否启用反检测 */
    enableStealth?: boolean;
    /** 是否启用真人行为模拟 */
    enableHumanBehavior?: boolean;
    /** 用户数据目录（持久化登录） */
    userDataDir?: string;
    /** 代理设置 */
    proxy?: {
        server: string;
        username?: string;
        password?: string;
    };
    /** User-Agent */
    userAgent?: string;
    /** 视口大小 */
    viewport?: {
        width: number;
        height: number;
    };
}
export interface ScreenshotOptions {
    path?: string;
    fullPage?: boolean;
}
export interface ElementInfo {
    ref: string;
    tag: string;
    text: string;
    attributes: Record<string, string>;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
/**
 * 增强版 Page 类
 */
export declare class Page {
    private page;
    private context;
    private browser;
    private human;
    private options;
    private elementCounter;
    constructor(page: PlaywrightPage, context: BrowserContext, browser: Browser, options: PageOptions);
    /**
     * 创建新的 Page 实例
     */
    static create(options?: PageOptions): Promise<Page>;
    /**
     * 注入反检测脚本
     */
    private injectStealth;
    /**
     * 导航到 URL
     */
    goto(url: string, options?: {
        waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
    }): Promise<void>;
    /**
     * 等待 DOM 稳定
     */
    private waitForDomStable;
    /**
     * 注入元素引用标记
     */
    private injectElementRefs;
    /**
     * 获取页面状态
     */
    getState(): Promise<{
        url: string;
        title: string;
        elements: ElementInfo[];
    }>;
    /**
     * 点击元素
     */
    click(ref: string): Promise<void>;
    /**
     * 输入文本
     */
    type(ref: string, text: string): Promise<void>;
    /**
     * 执行 JavaScript
     */
    evaluate<R>(fn: () => R): Promise<R>;
    evaluate<R, A>(fn: (arg: A) => R, arg: A): Promise<R>;
    /**
     * 等待选择器
     */
    waitForSelector(selector: string, timeout?: number): Promise<void>;
    /**
     * 等待文本出现
     */
    waitForText(text: string, timeout?: number): Promise<void>;
    /**
     * 等待指定时间
     */
    wait(seconds: number): Promise<void>;
    /**
     * 滚动页面
     */
    scroll(direction: 'up' | 'down', amount?: number): Promise<void>;
    /**
     * 截图
     */
    screenshot(options?: ScreenshotOptions): Promise<Buffer>;
    /**
     * 获取捕获的网络请求
     */
    getNetworkRequests(): Promise<any[]>;
    /**
     * 获取当前 URL
     */
    getUrl(): string;
    /**
     * 获取页面标题
     */
    getTitle(): Promise<string>;
    /**
     * 获取 HumanBehavior 实例
     */
    getHuman(): HumanBehavior;
    /**
     * 获取原生 Playwright Page
     */
    getPlaywrightPage(): PlaywrightPage;
    /**
     * 获取 BrowserContext
     */
    getContext(): BrowserContext;
    /**
     * 获取 Cookie
     */
    getCookies(): Promise<Array<{
        name: string;
        value: string;
        domain: string;
    }>>;
    /**
     * 设置 Cookie
     */
    setCookies(cookies: Array<{
        name: string;
        value: string;
        domain?: string;
    }>): Promise<void>;
    /**
     * 关闭页面
     */
    close(): Promise<void>;
    /**
     * 关闭浏览器
     */
    closeBrowser(): Promise<void>;
}
