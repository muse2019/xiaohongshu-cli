/**
 * 鼠标轨迹模拟 - 使用贝塞尔曲线模拟真人移动
 */
export interface Point {
    x: number;
    y: number;
}
export declare class MouseTrajectory {
    /**
     * 生成贝塞尔曲线轨迹点
     * @param start 起点
     * @param end 终点
     * @param steps 步数（越大越平滑但越慢）
     */
    static generateBezierPath(start: Point, end: Point, steps?: number): Point[];
    /**
     * 三次贝塞尔曲线计算
     */
    private static cubicBezier;
    /**
     * 生成带时间戳的轨迹
     * 用于模拟真实鼠标移动速度变化
     */
    static generateTimedPath(start: Point, end: Point, durationMs?: number): Array<{
        point: Point;
        delayMs: number;
    }>;
    /**
     * 生成随机曲线轨迹（用于页面滚动等）
     */
    static generateRandomCurve(start: Point, end: Point, randomness?: number): Point[];
}
