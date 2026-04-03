/**
 * Stealth anti-detection script generator.
 *
 * 移植自 opencli/src/browser/stealth.ts
 * 生成注入页面的反检测 JS 代码
 */
/**
 * 生成完整的反检测脚本
 * 在页面加载前注入，隐藏自动化痕迹
 */
export declare function generateStealthJs(): string;
/**
 * 生成网络请求拦截脚本
 * 用于捕获 fetch/XHR 请求
 */
export declare function generateNetworkInterceptorJs(): string;
