declare module '@editor/asset-db' {
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

  /**
   * 创建一个新的资源数据库
   * @param options
   */
  export function create(options: AssetDBOptions): AssetDB;
  /**
   * 循环每一个数据库
   * @param handler
   */
  export function forEach(handler: Function): void;
  export declare function setDefaultUserData(name: string, userData: any): void;
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
  /**
   * 存储到 asset db 内的 asset 实例
   * 创建的时候会读取对应的 .meta 文件
   * 如果 meta 不存在则会创建，并分配一个 uuid
   */
  export declare class Asset extends VirtualAsset {
    _source: string;
    get source(): string;
    _url: string;
    get url(): string;
    extname: string;
    basename: string;
    constructor(source: string, meta: Meta, assetDB: AssetDB);
    updateUrl(): void;
    /**
     * 保存当前资源的 meta 信息
     */
    save(): boolean;
    /**
     * 判断是否是文件夹
     */
    isDirectory(): boolean;
  }
  /**
   * 虚拟的 asset 实例
   * 没有对应的源文件都的都是虚拟 asset
   */
  export declare class VirtualAsset {
    _init: boolean;
    get init(): boolean;
    set init(bool: boolean);
    /**
     * 等待导入完成
     */
    _waitInitHandle: Function[];
    waitInit(): Promise<void>;
    action: AssetActionEnum;
    task: number;
    invalid: boolean;
    uuid2recycle: {
      [index: string]: Meta;
    };
    get source(): string;
    get url(): string;
    get library(): string;
    get temp(): string;
    get uuid(): string;
    get displayName(): string;
    meta: Meta;
    subAssets: {
      [name: string]: VirtualAsset;
    };
    set imported(imported: boolean);
    get imported(): boolean;
    _lock: boolean;
    _waitLockHandler: Function[];
    /**
     * 锁定资源
     */
    lock(): Promise<unknown>;
    /**
     * 解锁资源
     */
    unlock(): void;
    _assetDB: AssetDB;
    _parent: VirtualAsset | Asset | null;
    _name: string;
    _id: string;
    _swapSpace: any;
    _isDirectory?: boolean;
    get parent(): Asset | VirtualAsset | null;
    get userData(): {
      [index: string]: any;
    };
    constructor(meta: Meta, name: string, id: string, assetDB: AssetDB);
    /**
     * 复制外部的 userData 数据
     * @param json 模版对象
     * @param overwrite 如果 userData 内有数据，是否使用模版内的数据覆盖，默认 false
     */
    assignUserData(json: Object, overwrite?: boolean): void;
    /**
     * 保存当前资源的 meta 信息
     */
    save(): any;
    /**
     * 清空并还原 meta 数据
     * 并清除 subMeta 内的数据
     * @param handle 删除内部的 subAsset 的时候会执行回调
     */
    reset(): Promise<boolean>;
    /**
     * 查询一个文件的绝对地址
     * @param extOrFile
     */
    getFilePath(extOrFile: string): string;
    /**
     * 存储一个 uuid 为名字的 buffer
     * 传入一个扩展名或者相对路径，如果传入扩展名，则存储到 uuid.extname
     * 如果传入的是一个相对路径或者文件名，则放到 uuid 为名字的目录内
     * @param extOrPath 一个扩展名或者相对路径
     * @param buffer
     */
    saveToLibrary(extOrFile: string, buffer: Buffer | string): Promise<void>;
    /**
     * 复制一个文件到 library 内
     * @param extOrFile
     * @param target
     */
    copyToLibrary(extOrFile: string, target: string): Promise<void>;
    /**
     * 删除一个以 uuid 为名字的导入文件
     * @param extOrFile
     */
    deleteFromLibrary(extOrFile: string): Promise<false | undefined>;
    /**
     * 判断一个以 uuid 为名字的文件是否存在
     * @param extOrFile
     */
    existsInLibrary(extOrFile: string): boolean;
    /**
     * 判断是否是文件夹
     */
    isDirectory(): boolean;
    /**
     * 创建一个虚拟的 asset，这个 asset 没有实体
     * 一个虚拟的 asset 也允许存储都个文件
     * @param name
     * @param importer 使用什么解析
     */
    createSubAsset(
      name: string,
      importer: string,
      options?: {
        displayName?: string;
        id?: string;
      }
    ): Promise<VirtualAsset>;
    /**
     * 注册依赖的文件
     * 记录的是依赖的文件的源路径
     * 在每次 asset 任务之后都需要检查依赖 asset 的资源并更新
     * 依赖的文件更新的时候，需要更新自身
     * @param fileOrUuid 当前资源依赖的文件的绝对路径，不能传入相对路径
     *   db://assets/test.json
     *   /Users/xx/project/assets/test.json
     *   db://assets/test.plist@c30fb
     */
    depend(fileOrUuidOrUrl: string): void;
    /**
     * 获取交换空间对象
     * 这个空间主要是提供给父子资源间数据相互依赖使用的临时数据空间
     * 并不会保证数据存在，需要使用方自己去判断数据正确性，如无数据，需要自己生成
     */
    getSwapSpace<T>(): T;
  }
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
  export namespace Utils {
    /**
     * 从一个名字转换成一个 id
     * 这是个有损压缩，并不能够还原成原来的名字
     * @param id
     * @param extend
     */
    export declare function nameToId(name: string, extend?: number): string;
    /**
     * 判断 path 是否是 root 内的文件夹
     * @param path
     * @param root
     */
    export declare function isSubPath(path: string, root: string): boolean;
  }
  /**
   * 查找已经生成了的资源数据库
   * @param name
   */
  export declare function get(name: string): AssetDB;
  /**
   * 给定一个 uuid 或者 url 或者绝对路径，查询一个资源对象
   * @param uuid
   */
  export declare function queryAsset(uuid_url_path: string): Asset | VirtualAsset | null;
  /**
   * 查询一个 uuid、绝对路径对应的 url 路径
   * url 格式为 db://database_name/source_path@xxx
   * 绝对路径请使用系统分隔符，文件夹末尾不需要带分隔符（mac：/  win：\\）
   * @param uuid_path
   */
  export declare function queryUrl(uuid_path: string): string;
  /**
   * 查询一个 uuid、url 对应的绝对路径地址
   * url 格式为 db://database_name/source_path@xxx
   * 绝对路径请使用系统分隔符，文件夹末尾不需要带分隔符（mac：/  win：\\）
   * @param uuid_url
   */
  export declare function queryPath(uuid_url: string): string;
  /**
   * 查询一个 url、绝对路径对应的 uuid
   * url 格式为 db://database_name/source_path@xxx
   * 绝对路径请使用系统分隔符，文件夹末尾不需要带分隔符（mac：/  win：\\）
   * @param uuid_url
   */
  export declare function queryUUID(url_path: string): string;
  /**
   * 重新导入一个资源
   * url 格式为 db://database_name/source_path@xxx
   * 绝对路径请使用系统分隔符，文件夹末尾不需要带分隔符（mac：/  win：\\）
   * @param uuid_url_path
   */
  export declare function reimport(uuid_url_path: string): Promise<void>;
  /**
   * 刷新一个资源或者资源目录
   * url 格式为 db://database_name/source_path@xxx
   * 绝对路径请使用系统分隔符，文件夹末尾不需要带分隔符（mac：/  win：\\）
   * @param uuid_url_path
   */
  export declare function refresh(uuid_url_path: string): Promise<void>;

  // Source: asset-db/libs/meta.d.ts
  export interface Meta {
    ver: string;
    importer: string;
    imported: boolean;
    uuid: string;
    files: string[];
    subMetas: {
      [index: string]: Meta;
    };
    userData: {
      [index: string]: any;
    };
    displayName: string;
    id: string;
    name: string;
  }
}

// import { AssetDBOptions, AssetDB } from './libs/asset-db';
// import { isSubPath, nameToId } from './libs/utils';
// import { setDefaultUserData } from './libs/default-meta';
// export { Importer } from './libs/importer';
// export { Asset, VirtualAsset } from './libs/asset';
// export { get, queryAsset, queryUrl, queryPath, queryUUID, reimport, refresh } from './libs/manager';

// declare module '@editor/asset-db' {
//   /**
//    * 创建一个新的资源数据库
//    * @param options
//    */
//   export function create(options: AssetDBOptions): AssetDB;
//   /**
//    * 循环每一个数据库
//    * @param handler
//    */
//   export function forEach(handler: Function): void;
//   export { setDefaultUserData } from './libs/default-meta';
//   export { Importer } from './libs/importer';
//   export { Asset, VirtualAsset } from './libs/asset';
//   export { AssetDB } from './libs/asset-db';
//   export const Utils: {
//     nameToId: typeof nameToId;
//     isSubPath: typeof isSubPath;
//   };
//   export {
//     get,
//     queryAsset,
//     queryUrl,
//     queryPath,
//     queryUUID,
//     reimport,
//     refresh,
//   } from './libs/manager';
// }
