import type { AssetDB } from './asset-db';
import type { Asset, VirtualAsset } from './asset';
export declare const map: {
    [index: string]: AssetDB;
};
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
/**
 * 查找受影响的资源
 * @param asset
 */
export declare function getAssociatedAssets(asset: Asset | VirtualAsset): string[];
/**
 * 递归资源依赖的所有资源
 * @param asset
 * @param handle
 */
export declare function recursiveGetAssociatedAssets(asset: Asset | VirtualAsset, handle: Function): string[];
/**
 * 递归检查是否允许插入依赖
 * asset 依赖 fileOrUuidOrUrl
 * 检查是否有循环依赖出现
 * @param fileOrUuidOrUrl
 * @param asset
 */
export declare function recursiveCheckAssociatedAssets(fileOrUuidOrUrl: string, asset: Asset | VirtualAsset): boolean;
/**
 * 重新导入受影响的资源
 * @param database
 * @param asset
 */
export declare function importAssociatedAssets(database: AssetDB, asset: Asset | VirtualAsset): void;
