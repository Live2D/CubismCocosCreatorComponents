declare module '@editor/asset-db' {
  class Asset extends VirtualAsset {
    action: number;
    basename: string;
    invalid: boolean;
    meta: any;
    subAssets: any;
    task: number;
    uuid2recycle: any;
    _assetDB: AssetDB;
    _id: any | undefined;
    _init: boolean;
    _isDirectory: boolean;
    _lock: boolean;
    _name: string | null | undefined;
    _parent: any | null;
    _source: string;
    _swapSpace: any | null;
    _url: string;
  }

  class VirtualAsset extends __proto__VirtualAsset__ {
    extname: string;

    // extra
    updateUrl(): any;
  }

  class __proto__VirtualAsset__ {
    assignUserData(t, e = false): any;
    async copyToLibrary(extname: string, file: string): Promise<void>;
    async createSubAsset(t, e, s = { displayName: '' }): Promise<any>;
    async deleteFromLibrary(t): Promise<any>;
    depend(t): any;
    // displayName: string;
    existsInLibrary(t): any;
    getFilePath(t): any;
    getSwapSpace(): any;
    // imported: boolean;
    init: boolean;
    isDirectory(): Promise<boolean>;
    // library: string;
    async lock(): Promise<any>;
    // parent: any | null;
    async reset(): Promise<any>;
    async save(): Promise<any>;
    async saveToLibrary(extname: string, content: string | Buffer): Promise<void>;
    // source: string;
    // temp: string;
    unlock(): any;
    // url: string;
    // userData: any;
    // uuid: string;
    async waitInit(): Promise<any>;
    get displayName(): string;
    get imported(): boolean;
    set imported(value: boolean);
    get init(): boolean;
    set init(value: boolean);
    get library(): string;
    get parent(): any | null;
    get source(): string;
    get temp(): string;
    get url(): string;
    get userData(): any;
    get uuid(): string;
  }

  class AssetDB {}

  abstract class Importer {
    get version(): string;
    get name(): string;
    get assetType(): string;
    public async validate(asset: VirtualAsset | Asset): Promise<boolean>;
    public async import(asset: Asset): Promise<boolean>;
  }

  function queryPath(args: any): any;
  function queryUrl(args: any): any;
  function queryUUID(args: string): string;
}
