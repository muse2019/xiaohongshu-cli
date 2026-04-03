/**
 * 真人行为模拟模块
 *
 * 封装 Playwright 的 Page，添加真人行为模拟
 */
import type { Page as PlaywrightPage } from 'playwright';
import { type Point } from './mouse-trajectory.js';
export interface HumanBehaviorOptions {
    /** 是否启用鼠标轨迹模拟 */
    enableMouseTrajectory?: boolean;
    /** 是否启用随机延迟 */
    enableRandomDelay?: boolean;
    /** 是否启用打字模拟 */
    enableTypingSimulation?: boolean;
    /** 是否启用滚动模拟 */
    enableScrollSimulation?: boolean;
}
export declare class HumanBehavior {
    private page;
    private mouse;
    private keyboard;
    private options;
    private lastPosition;
    constructor(page: PlaywrightPage, options?: HumanBehaviorOptions);
    /**
     * 真人风格的鼠标移动
     */
    humanMove(x: number, y: number): Promise<void>;
    /**
     * 真人风格的点击
     */
    humanClick(x: number, y: number, options?: {
        doubleClick?: boolean;
    }): Promise<void>;
    /**
     * 真人风格的输入
     */
    humanType(text: string, options?: {
        delay?: number;
    }): Promise<void>;
    /**
     * 真人风格的滚动
     */
    humanScroll(direction: 'up' | 'down', distance?: number): Promise<void>;
    /**
     * 随机页面滚动 - 模拟浏览行为
     */
    randomScroll(durationMs?: number): Promise<void>;
    /**
     * 模拟阅读页面
     */
    simulateReading(textLength: number): Promise<void>;
    /**
     * 随机移动鼠标 - 模拟真人无意识移动
     */
    randomMouseMove(): Promise<void>;
    /**
     * 执行一个完整的"真人操作"序列
     */
    performHumanAction(action: () => Promise<void>): Promise<void>;
    /**
     * 批量操作 - 带有反爬虫间隔
     */
    batchAction<T>(items: T[], action: (item: T, index: number) => Promise<void>): Promise<void>;
    /**
     * 随机化当前鼠标位置
     */
    updateLastPosition(x: number, y: number): void;
    /**
     * 获取当前鼠标位置
     */
    getLastPosition(): Point;
}
