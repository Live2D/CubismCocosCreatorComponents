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
export interface MetaInfo {
    json: Meta;
    backup: string;
    EOL: '\n' | '\r\n';
}
/**
 * 复制 meta 数据，将 origin 上的数据复制到 target 上
 * @param target
 * @param origin
 */
export declare function copyMeta(target: Meta, origin: Meta): void;
/**
 * 补全 meta 数据
 * @param meta
 */
export declare function completionMeta(meta: any): Meta;
export declare class MetaManager {
    path2meta: {
        [index: string]: MetaInfo;
    };
    backupJSONFile: string | undefined;
    backupDirname: string | undefined;
    _saveTimer: any;
    /**
     * 设置备份目录
     * @param dirname
     */
    setBackupPath(dirname: string): Promise<void>;
    /**
     * 设置记录 json 的存放文件
     * @param json
     */
    setRecordJSON(json: string): Promise<void>;
    /**
     * 销毁一个管理器实例
     * @param manager
     */
    destroy(): void;
    /**
     * 立即保存当前缓存的数据
     */
    saveImmediate(): void;
    /**
     * 触发保存动作，会延迟并合并多个保存操作
     */
    save(): void;
    /**
     * 从硬盘读取更新一个 meta 文件数据到内存里
     * @param path
     */
    read(path: string): boolean | undefined;
    write(path: any): false | undefined;
    /**
     * 删除内存中的一个 MetaInfo 数据
     * 并放入 backup 文件夹
     * @param path
     */
    remove(path: string): void;
    /**
     * 从缓存里取一个 MetaInfo
     * 如果不存在，则取备份数据
     * 如果还不存在，则生成新的空 MetaInfo 和 meta 文件
     * @param path
     */
    get(path: string): MetaInfo;
    move(pathA: string, pathB: string): void;
}
