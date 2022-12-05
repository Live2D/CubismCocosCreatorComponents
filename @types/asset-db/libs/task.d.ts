import type { AssetDB } from './asset-db';
import { Asset, VirtualAsset } from './asset';
import { Importer } from './importer';
/**
 * 任务基础类型
 */
export declare class Task {
    private event;
    /**
     * 监听事件
     * @param name
     * @param func
     */
    on(name: string, func: Function): void;
    /**
     * 触发事件
     * @param name
     * @param args
     */
    emit(name: string, ...args: any[]): void;
}
/**
 * 导入任务
 */
export declare class ImportTask extends Task {
    /**
     * 实际的导入流程，允许传入实体资源以及虚拟资源
     * @param database
     * @param asset
     * @param importer
     * @param dirty
     */
    exec(database: AssetDB, asset: Asset | VirtualAsset, importer: Importer, dirty: boolean): Promise<boolean>;
    /**
     * 导入实体资源的流程
     */
    importAsset(database: AssetDB, asset: Asset, importer: Importer, dirty: boolean): Promise<boolean>;
    /**
     * 导入虚拟资源的流程
     * @param database
     * @param asset
     * @param dirty 是否被修改
     */
    importVirtualAsset(database: AssetDB, asset: VirtualAsset, importer: Importer, dirty: boolean): Promise<boolean>;
    /**
     * 迁移资源
     * @param importer
     * @param database
     * @param asset
     */
    migrateAsset(importer: Importer, database: AssetDB, asset: Asset | VirtualAsset): Promise<void>;
}
export declare class DestroyTask extends Task {
    /**
     * 销毁一个资源
     * @param database
     * @param asset
     */
    exec(database: AssetDB, asset: Asset | VirtualAsset): Promise<any>;
    destroyAsset(database: AssetDB, asset: Asset | VirtualAsset): Promise<void>;
}
/**
 * 任务缓存
 */
export declare const TASK_MAP: {
    import: ImportTask;
    destroy: DestroyTask;
};
