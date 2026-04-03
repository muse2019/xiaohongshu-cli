/**
 * 浏览器页面操作核心模块
 *
 * 封装 Playwright，提供类似 opencli 的操作接口
 * 内置反检测和真人行为模拟
 */
import { chromium } from 'playwright';
import { generateStealthJs, generateNetworkInterceptorJs } from '../stealth/stealth-script.js';
import { HumanBehavior } from '../stealth/human-behavior.js';
import { sleep } from '../stealth/random-delay.js';
/**
 * 增强版 Page 类
 */
export class Page {
    page;
    context;
    browser;
    human;
    options;
    elementCounter = 0;
    constructor(page, context, browser, options) {
        this.page = page;
        this.context = context;
        this.browser = browser;
        this.options = options;
        this.human = new HumanBehavior(page, {
            enableMouseTrajectory: options.enableHumanBehavior !== false,
            enableRandomDelay: options.enableHumanBehavior !== false,
            enableTypingSimulation: options.enableHumanBehavior !== false,
            enableScrollSimulation: options.enableHumanBehavior !== false,
        });
    }
    /**
     * 创建新的 Page 实例
     */
    static async create(options = {}) {
        const launchOptions = {
            headless: options.headless ?? false,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
            ],
            ignoreDefaultArgs: ['--enable-automation'],
        };
        // 持久化上下文
        if (options.userDataDir) {
            const context = await chromium.launchPersistentContext(options.userDataDir, {
                ...launchOptions,
                userAgent: options.userAgent,
                viewport: options.viewport ?? { width: 1920, height: 1080 },
                locale: 'zh-CN',
                timezoneId: 'Asia/Shanghai',
            });
            const page = context.pages()[0] || await context.newPage();
            const instance = new Page(page, context, context.browser(), options);
            if (options.enableStealth !== false) {
                await instance.injectStealth();
            }
            return instance;
        }
        // 普通模式
        const browser = await chromium.launch(launchOptions);
        const contextOptions = {
            userAgent: options.userAgent ?? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: options.viewport ?? { width: 1920, height: 1080 },
            locale: 'zh-CN',
            timezoneId: 'Asia/Shanghai',
        };
        if (options.proxy) {
            contextOptions.proxy = options.proxy;
        }
        const context = await browser.newContext(contextOptions);
        const page = await context.newPage();
        const instance = new Page(page, context, browser, options);
        if (options.enableStealth !== false) {
            await instance.injectStealth();
        }
        return instance;
    }
    /**
     * 注入反检测脚本
     */
    async injectStealth() {
        await this.context.addInitScript(generateStealthJs());
        await this.context.addInitScript(generateNetworkInterceptorJs());
    }
    /**
     * 导航到 URL
     */
    async goto(url, options) {
        await this.page.goto(url, {
            waitUntil: options?.waitUntil ?? 'domcontentloaded',
            timeout: 30000,
        });
        // 等待页面稳定
        await this.waitForDomStable();
        // 注入元素引用
        await this.injectElementRefs();
        // 更新鼠标位置
        this.human.updateLastPosition(Math.floor(Math.random() * 500), Math.floor(Math.random() * 500));
    }
    /**
     * 等待 DOM 稳定
     */
    async waitForDomStable() {
        await sleep(500);
        await this.page.waitForLoadState('domcontentloaded');
    }
    /**
     * 注入元素引用标记
     */
    async injectElementRefs() {
        await this.page.evaluate(() => {
            const interactiveSelectors = [
                'a', 'button', 'input', 'select', 'textarea',
                '[role="button"]', '[role="link"]', '[role="checkbox"]',
                '[tabindex]:not([tabindex="-1"])',
                '[contenteditable="true"]'
            ];
            const elements = document.querySelectorAll(interactiveSelectors.join(', '));
            let counter = 0;
            elements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                // 只标记可见元素
                if (rect.width > 0 && rect.height > 0) {
                    el.setAttribute('data-xhs-ref', String(counter));
                    counter++;
                }
            });
            window.__xhs_element_count = counter;
        });
    }
    /**
     * 获取页面状态
     */
    async getState() {
        const url = this.page.url();
        const title = await this.page.title();
        const elements = await this.page.evaluate(() => {
            const results = [];
            const elements = document.querySelectorAll('[data-xhs-ref]');
            elements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                results.push({
                    ref: el.getAttribute('data-xhs-ref'),
                    tag: el.tagName.toLowerCase(),
                    text: (el.textContent || '').trim().slice(0, 100),
                    attributes: Object.fromEntries(Array.from(el.attributes).map(a => [a.name, a.value])),
                    bounds: {
                        x: Math.round(rect.x),
                        y: Math.round(rect.y),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                    },
                });
            });
            return results;
        });
        return { url, title, elements };
    }
    /**
     * 点击元素
     */
    async click(ref) {
        const selector = `[data-xhs-ref="${ref}"]`;
        const element = await this.page.$(selector);
        if (!element) {
            throw new Error(`Element not found: ${ref}`);
        }
        // 获取元素位置
        const bounds = await element.boundingBox();
        if (!bounds) {
            throw new Error(`Element not visible: ${ref}`);
        }
        // 使用真人点击
        const x = bounds.x + bounds.width / 2;
        const y = bounds.y + bounds.height / 2;
        await this.human.humanClick(x, y);
    }
    /**
     * 输入文本
     */
    async type(ref, text) {
        const selector = `[data-xhs-ref="${ref}"]`;
        const element = await this.page.$(selector);
        if (!element) {
            throw new Error(`Element not found: ${ref}`);
        }
        // 先点击聚焦
        await this.click(ref);
        await sleep(200 + Math.random() * 300);
        // 使用真人输入
        await this.human.humanType(text);
    }
    async evaluate(fn, arg) {
        return await this.page.evaluate(fn, arg);
    }
    /**
     * 等待选择器
     */
    async waitForSelector(selector, timeout = 10000) {
        await this.page.waitForSelector(selector, { timeout });
    }
    /**
     * 等待文本出现
     */
    async waitForText(text, timeout = 10000) {
        await this.page.waitForFunction((t) => document.body.innerText.includes(t), text, { timeout });
    }
    /**
     * 等待指定时间
     */
    async wait(seconds) {
        await sleep(seconds * 1000);
    }
    /**
     * 滚动页面
     */
    async scroll(direction, amount = 300) {
        await this.human.humanScroll(direction, amount);
    }
    /**
     * 截图
     */
    async screenshot(options = {}) {
        if (options.path) {
            await this.page.screenshot({
                path: options.path,
                fullPage: options.fullPage ?? false,
            });
            return Buffer.from('');
        }
        return await this.page.screenshot({
            fullPage: options.fullPage ?? false,
        });
    }
    /**
     * 获取捕获的网络请求
     */
    async getNetworkRequests() {
        return await this.page.evaluate(() => {
            return window.__xhs_net || [];
        });
    }
    /**
     * 获取当前 URL
     */
    getUrl() {
        return this.page.url();
    }
    /**
     * 获取页面标题
     */
    async getTitle() {
        return await this.page.title();
    }
    /**
     * 获取 HumanBehavior 实例
     */
    getHuman() {
        return this.human;
    }
    /**
     * 获取原生 Playwright Page
     */
    getPlaywrightPage() {
        return this.page;
    }
    /**
     * 获取 BrowserContext
     */
    getContext() {
        return this.context;
    }
    /**
     * 获取 Cookie
     */
    async getCookies() {
        const cookies = await this.context.cookies();
        return cookies.map(c => ({
            name: c.name,
            value: c.value,
            domain: c.domain,
        }));
    }
    /**
     * 设置 Cookie
     */
    async setCookies(cookies) {
        await this.context.addCookies(cookies.map(c => ({
            name: c.name,
            value: c.value,
            domain: c.domain || '.xiaohongshu.com',
            path: '/',
        })));
    }
    /**
     * 关闭页面
     */
    async close() {
        await this.page.close();
    }
    /**
     * 关闭浏览器
     */
    async closeBrowser() {
        await this.context.close();
        await this.browser.close();
    }
}
