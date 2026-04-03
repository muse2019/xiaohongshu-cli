/**
 * 随机延迟模块 - 模拟真人操作时间
 */
export declare class RandomDelay {
    /**
     * 基础随机延迟
     */
    static random(minMs: number, maxMs: number): number;
    /**
     * 思考时间 - 点击前的犹豫
     */
    static thinkTime(): number;
    /**
     * 阅读时间 - 根据字数估算
     */
    static readTime(wordCount: number): number;
    /**
     * 打字延迟 - 模拟真实打字速度
     */
    static typingDelay(): number;
    /**
     * 页面滚动延迟
     */
    static scrollDelay(): number;
    /**
     * 页面加载等待
     */
    static pageLoadDelay(): number;
    /**
     * 操作间隔 - 两次操作之间
     */
    static actionInterval(): number;
    /**
     * 高斯分布延迟 - 更自然的分布
     */
    static gaussian(mean: number, stdDev: number): number;
    /**
     * 模拟人类不规律的等待
     * 有时会"走神"更久
     */
    static humanWait(baseMs: number): number;
    /**
     * 批量操作间隔 - 防止被封
     */
    static batchInterval(index: number, total: number): number;
}
/**
 * 延迟函数
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * 随机延迟函数
 */
export declare function randomSleep(minMs: number, maxMs: number): Promise<void>;
