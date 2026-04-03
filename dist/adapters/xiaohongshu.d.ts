/**
 * 小红书适配器
 *
 * 实现小红书专用功能：
 * - 笔记详情获取
 * - 点赞/收藏
 * - 评论
 * - 首页推荐
 * - 搜索
 * - 发布笔记
 *
 * 所有操作都带有反爬虫防御
 */
import type { Page } from '../browser/index.js';
export interface NoteInfo {
    id: string;
    title: string;
    desc: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    stats: {
        likes: number;
        collects: number;
        comments: number;
    };
    images: string[];
    video?: string;
    tags: string[];
    liked: boolean;
    collected: boolean;
}
export interface FeedItem {
    id: string;
    title: string;
    cover: string;
    author: string;
    likes: number;
}
export interface SearchResult {
    notes: FeedItem[];
    users: Array<{
        id: string;
        name: string;
        avatar: string;
    }>;
}
export interface PublishOptions {
    title: string;
    content: string;
    images: string[];
    tags?: string[];
    location?: string;
}
export interface LoginStatus {
    isLoggedIn: boolean;
    userId?: string;
    username?: string;
    avatar?: string;
}
export declare class XiaohongshuAdapter {
    private page;
    private baseUrl;
    private loginStatus;
    constructor(page: Page);
    /**
     * 检查登录状态
     *
     * 登录状态获取方式：
     * 1. 检查页面是否有用户头像（登录后才显示）
     * 2. 检查 cookie 中的 a1 和 web_session
     * 3. 检查 localStorage 中的用户信息
     */
    checkLoginStatus(): Promise<LoginStatus>;
    /**
     * 获取登录 Cookie
     * 用于持久化登录状态
     */
    getLoginCookies(): Promise<Record<string, string>>;
    /**
     * 等待用户登录
     * 打开登录页面，等待用户完成登录
     */
    waitForLogin(timeoutMs?: number): Promise<boolean>;
    /**
     * 打开小红书首页
     */
    openHome(): Promise<void>;
    /**
     * 打开笔记详情页
     */
    openNote(noteId: string): Promise<void>;
    /**
     * 打开搜索页面
     */
    openSearch(keyword: string): Promise<void>;
    /**
     * 搜索笔记
     */
    search(keyword: string, options?: {
        type?: 'note' | 'user';
        limit?: number;
    }): Promise<SearchResult>;
    /**
     * 在搜索结果中筛选
     */
    searchWithFilter(keyword: string, filter: {
        sortBy?: 'general' | 'newest' | 'hottest';
        type?: 'all' | 'video' | 'image';
    }): Promise<SearchResult>;
    /**
     * 发表评论
     */
    comment(text: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * 回复评论
     */
    replyComment(commentIndex: number, text: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * 获取评论列表
     */
    getComments(limit?: number): Promise<Array<{
        id: string;
        user: string;
        content: string;
        likes: number;
        time: string;
    }>>;
    /**
     * 发布笔记
     *
     * @param options 发布选项
     * @param options.title 标题
     * @param options.content 正文
     * @param options.images 本地图片路径数组（最多9张）
     * @param options.tags 标签
     * @param options.location 位置
     */
    publishNote(options: PublishOptions): Promise<{
        success: boolean;
        message: string;
        noteId?: string;
    }>;
    /**
     * 发布视频笔记
     */
    publishVideo(options: {
        title: string;
        content: string;
        videoPath: string;
        coverPath?: string;
        tags?: string[];
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * 获取笔记信息
     */
    getNoteInfo(): Promise<NoteInfo | null>;
    /**
     * 点赞笔记
     */
    like(): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * 取消点赞
     */
    unlike(): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * 收藏笔记
     */
    collect(): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * 模拟浏览行为
     */
    simulateBrowsing(durationMs?: number): Promise<void>;
    /**
     * 滚动加载更多
     */
    loadMore(times?: number): Promise<void>;
    /**
     * 获取首页推荐列表
     */
    getFeed(limit?: number): Promise<FeedItem[]>;
    /**
     * 批量操作（带反爬虫间隔）
     */
    batchAction<T>(items: T[], action: (item: T, index: number) => Promise<void>): Promise<void>;
}
