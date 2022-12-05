import type { VirtualAsset } from './asset';
export interface IData {
    url: string;
    value: {
        [key: string]: any;
    };
}
/**
 * 资源关联以及依赖关系列表
 * 部分数据需要固化到硬盘上
 */
export declare class DataManager {
    file: string | undefined;
    dataMap: {
        [uuid: string]: IData;
    };
    _saveTimer: any;
    /**
     * 设置用于记录的 json 文件
     * @param json
     */
    setRecordJSON(json: string): Promise<void>;
    save(): void;
    saveImmediate(): void;
    /**
     * 获取一个 data 信息
     * 需要传递 source，如果 source 信息不一致，会更新 source
     * @param uuid
     * @param source
     * @returns
     */
    get(asset: VirtualAsset): IData;
}
