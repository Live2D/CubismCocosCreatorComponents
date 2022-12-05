interface SimpleInfo {
    time: number;
    uuid?: string;
    missing?: boolean;
}
/**
 * 缓存所有文件的 mtimeMs 时间，用于比对是否修改
 * 这部分数据需要落地到文件系统
 */
export declare class InfoManager {
    file: string | undefined;
    map: {
        [index: string]: SimpleInfo;
    };
    _saveTimer: any;
    /**
     * 设置记录数据的 json 文件
     * @param json
     */
    setRecordJSON(json: string): Promise<void>;
    /**
     * 销毁一个管理器实例
     * @param manager
     */
    destroy(): void;
    save(): void;
    saveImmediate(): void;
    /**
     * 更新一个缓存数据
     * @param path
     * @param mtimeMs
     * @param uuid
     */
    add(path: string, mtimeMs: number, uuid?: string): void;
    /**
     * 删除缓存的一个 mtime 数据
     * @param path
     */
    remove(path: string): void;
    /**
     * 获取缓存的 stats 对象
     * @param path
     */
    get(path: string): SimpleInfo;
    /**
     * 对比现在文件和内存里缓存的 stats 是否有修改
     * 返回是否相等
     * @param path
     * @param stats
     */
    compare(path: string, mtimeMs: number): boolean;
}
export {};
