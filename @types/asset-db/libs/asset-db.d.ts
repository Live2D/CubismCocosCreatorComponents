/// <reference types="node" />
import { EventEmitter } from 'events';
import { ImporterManager } from './importer';
import { Asset, VirtualAsset } from './asset';
import { MetaManager } from './meta';
import { InfoManager } from './info';
import { DependencyManager } from './dependency';
// import { ParallelQueue } from 'workflow-extra';
export { map } from './manager';
export interface AssetDBRefreshOptions {
    ignoreSelf?: boolean;
    hooks?: {
        afterGenerateMete?(): void;
        afterRefresh?(): void;
    };
}
/**
 * 资源数据库启动参数
 */
export interface AssetDBOptions {
    name: string;
    target: string;
    library: string;
    temp: string;
    /**
     * 0: 忽略错误
     * 1: 仅仅打印错误
     * 2: 打印错误、警告
     * 3: 打印错误、警告、日志
     * 4: 打印错误、警告、日志、调试信息
     */
    level: number;
    ignoreFiles: string[];
    ignoreGlob?: string;
    readonly: boolean;
    flags?: {
        reimportCheck?: boolean;
    };
}
export declare const version = "2.0.0";
export declare class AssetDB extends EventEmitter {
    options: AssetDBOptions;
    flag: {
        starting: boolean;
        started: boolean;
    };
    path2asset: Map<string, Asset>;
    uuid2asset: Map<string, Asset>;
    importerManager: ImporterManager;
    metaManager: MetaManager;
    infoManager: InfoManager;
    dependencyManager: DependencyManager;
    // taskManager: ParallelQueue<VirtualAsset, boolean>;
    _lock: boolean;
    _waitLockHandler: Function[];
    /**
     * 锁定资源
     */
    private lock;
    /**
     * 解锁资源
     */
    private unlock;
    /**
     * 实例化过程
     * @param options
     */
    constructor(options: AssetDBOptions);
    preImporterHandler?(file: string): boolean;
    /**
     * 启动资源数据库
     */
    start(options?: AssetDBRefreshOptions): Promise<unknown>;
    /**
     * 停止资源数据库
     */
    stop(): Promise<void>;
    /**
     * 传入 path，返回 asset-db 内对应的 uuid
     * 不存在则返回 null
     * @param path
     */
    pathToUuid(path: string): string | null;
    /**
     * 传入 uuid，返回对应的资源的 path
     * @param uuid
     */
    uuidToPath(uuid: string): string | null;
    /**
     * 查询资源实例
     * @param uuid
     */
    getAsset(uuid: string): VirtualAsset | null;
    /**
     * 重新导入
     * @param fileOrUUID
     */
    reimport(fileOrUUID: string): Promise<boolean | undefined>;
    /**
     * 刷新资源
     * 传入某一个文件或者文件夹，进行数据库刷新操作
     * 会优先同步扫描所有资源，然后等待其他 refresh 队列
     * 默认 refresh 是有队列的，多个 refresh 同时执行需要进入队列等待
     * @param path
     * @returns {number} 刷新的资源个数
     */
    refresh(path: string, options?: AssetDBRefreshOptions): Promise<number>;
    private _replaceUUID;
    /**
     * 检查资源状态
     * 识别是新增、修改还是删除了资源
     * @param addFiles
     * @param deleteFiles
     */
    private _checkAssetsStatSync;
    private _checkAssetStat;
}
