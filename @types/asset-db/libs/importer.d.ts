import { VirtualAsset, Asset } from './asset';
import { AssetDB } from './asset-db';
/**
 * 迁移队列
 */
export interface Migrate {
    version: string;
    migrate?: Function;
}
/**
 * 导入器导入流程的钩子函数
 */
export interface MigrateHook {
    pre(asset: Asset | VirtualAsset): any;
    post(asset: Asset | VirtualAsset, num: number): any;
}
/**
 * 导入器管理器
 */
export declare class ImporterManager {
    extname2importer: {
        [index: string]: [Importer];
    };
    name2importer: {
        [index: string]: Importer;
    };
    assetDB: AssetDB;
    constructor(assetDB: AssetDB);
    /**
     * 新增一个导入器
     * @param importer
     * @param extnames
     */
    add(importer: typeof Importer, extnames: string[]): void;
    /**
     * 删除一个导入器
     * @param importer
     */
    remove(importer: typeof Importer): boolean;
    /**
     * 清空所有的 importer
     */
    clear(): void;
    /**
     * 查找可以导入某个扩展名的所有导入器
     */
    find(asset: VirtualAsset | Asset): Promise<Importer | null>;
}
/**
 * 导入器
 * 需要负责检查文件是否使用该导入器导入资源
 * 资源导入的流程：
 *   1. 将 asset 当作 raw asset ，直接改名复制到 library 文件夹
 *   2. importer 作者自定义的
 */
export declare class Importer {
    assetDB: AssetDB;
    extnames: string[];
    flag: {
        [name: string]: boolean;
    };
    get version(): string;
    get migrations(): Migrate[];
    get migrationHook(): MigrateHook;
    get name(): string;
    constructor(assetDB: AssetDB);
    /**
     * 检查文件是否适用于这个 importer
     * @param asset
     */
    validate(asset: VirtualAsset | Asset): Promise<boolean>;
    /**
     * 是否强制刷新
     * @param asset
     */
    force(asset: VirtualAsset | Asset): Promise<boolean>;
    /**
     * 开始执行文件的导入操作
     *   1. 将文件复制到 library 内
     *
     * 返回是否导入成功的标记
     * 如果返回 false，则 imported 标记不会变成 true
     * 后续的一系列操作都不会执行
     *
     * @param asset
     */
    import(asset: VirtualAsset | Asset): Promise<boolean>;
}
export declare class DefaultImporter extends Importer {
    /**
     * 检查文件是否适用于这个 importer
     * @param asset
     */
    validate(asset: VirtualAsset | Asset): Promise<boolean>;
    /**
     * 开始执行文件的导入操作
     *   1. 将文件复制到 library 内
     *
     * 返回是否导入成功的标记
     * 如果返回 false，则 imported 标记不会变成 true
     * 后续的一系列操作都不会执行
     *
     * @param asset
     */
    import(asset: VirtualAsset | Asset): Promise<boolean>;
}
