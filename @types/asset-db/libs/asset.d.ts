/// <reference types="node" />
import { AssetDB } from './asset-db';
import { Meta } from './meta';
export declare enum AssetActionEnum {
    'add' = 0,
    'change' = 1,
    'delete' = 2,
    'none' = 3
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
    createSubAsset(name: string, importer: string, options?: {
        displayName?: string;
        id?: string;
    }): Promise<VirtualAsset>;
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
