/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Proprietary Software license
 * that can be found at https://www.live2d.com/eula/live2d-proprietary-software-license-agreement_en.html.
 */

import { assetManager, BufferAsset, js } from 'cc';
import Live2DCubismCoreModuleFactory from './resources/WebAssembly/Live2DCubismCore.js';
import { EDITOR } from 'cc/env';

type ByteArrayPtr = number;
type IntArrayPtr = number;
type FloatArrayPtr = number;
type StringArrayPtr = number;
type FloatArrayPtrArrsyPtr = number;
type MocPtr = number;
type ModelPtr = number;
type MemoryPtr = number;

async function loadWasmBinary(wasmBinaryUuid: string) {
  let wasmBinary: Uint8Array | undefined;
  if (!EDITOR) {
    const bufferAsset = await new Promise<BufferAsset | null>((resolve, reject) => {
      assetManager.loadBundle('Live2DCubismBuiltinResource', (error, bundle) => {
        if (error) {
          console.error(error);
        } else {
          bundle.load<BufferAsset>('WebAssembly/Live2DCubismCore', (error, asset) => {
            if (error) {
              console.error(error);
              reject(null);
            } else {
              resolve(asset);
            }
          })
        }
      });
    });
    wasmBinary = bufferAsset == null ? undefined : new Uint8Array(bufferAsset.buffer());
  } else {
    const wasmFilePath = await Editor.Message.request('asset-db', 'query-path', wasmBinaryUuid);
    console.info(`wasmFilePath: ${wasmFilePath}`);
    if (!wasmFilePath) {
      throw new Error(`'Failed to load WebAssembly Binary ${wasmBinaryUuid}`);
    }
    const buffer = require('fs').readFileSync(wasmFilePath);
    wasmBinary = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }
  return wasmBinary;
}

async function loadCubismCoreModule() {

  console.log(`Loading Live2D Cubism Core.`);

  const myModulePromiseCacheKey = Symbol.for('CubismCoreEmscriptenModulePromise');
  const global = globalThis as unknown as {
    [myModulePromiseCacheKey]: ReturnType<typeof Live2DCubismCoreModuleFactory>;
  };
  const modulePromise = (global[myModulePromiseCacheKey] ??= (async () => {
    const wasmBinaryUuid = '2ae9481d-aa06-4cce-ae8e-bcecaf63d82b';
    const wasmBinary = await loadWasmBinary(wasmBinaryUuid);
    const index = await Live2DCubismCoreModuleFactory({ wasmBinary });
    if (!index) {
      throw new Error(`'Failed to get Live2D Cubism Core module factory.`);
    }
    return index;
  })());

  return await modulePromise;
}

// CAUTION HERE
// We're using the experimental feature: top level await.
const CubismCoreModule = await loadCubismCoreModule();

export function getCubismCoreVersionString(): string {
  const version = CubismCoreModule._csmGetVersion();
  const major = (version & 0xff000000) >> 24;
  const minor = (version & 0x00ff0000) >> 16;
  const patch = version & 0x0000ffff;
  return js.formatStr(
    `Loaded Live2D Cubism Core version: `,
    ('00' + major).slice(-2),
    ('00' + minor).slice(-2),
    ('0000' + patch).slice(-4)
  );
}

console.log(getCubismCoreVersionString());
// CAUTION END

export namespace Live2DCubismCore {
  export namespace _csm {
    export function getVersion(): number {
      return CubismCoreModule._csmGetVersion();
    }
    export function getLatestMocVersion(): number {
      return CubismCoreModule._csmGetLatestMocVersion();
    }
    export function getMocVersion(moc: MocPtr): number {
      return CubismCoreModule._csmGetMocVersion(moc);
    }
    export function getSizeofModel(moc: MocPtr): number {
      return CubismCoreModule._csmGetSizeofModel(moc);
    }
    export function hasMocConsistency(memory: any, mocSize: number): number {
        return CubismCoreModule._csmHasMocConsistency(memory, mocSize);
    };
    export function reviveMocInPlace(memory: MemoryPtr, mocSize: number) {
      return CubismCoreModule._csmReviveMocInPlace(memory, mocSize);
    }
    export function initializeModelInPlace(moc: MocPtr, memory: MemoryPtr, modelSize: number) {
      return CubismCoreModule._csmInitializeModelInPlace(moc, memory, modelSize);
    }
    export function getParameterCount(model: ModelPtr) {
      return CubismCoreModule._csmGetParameterCount(model);
    }
    export function getParameterIds(model: ModelPtr): StringArrayPtr {
      return CubismCoreModule._csmGetParameterIds(model);
    }
    export function getParameterMinimumValues(model: ModelPtr): FloatArrayPtr {
      return CubismCoreModule._csmGetParameterMinimumValues(model);
    }
    export function getParameterMaximumValues(model: ModelPtr): FloatArrayPtr {
      return CubismCoreModule._csmGetParameterMaximumValues(model);
    }
    export function getParameterDefaultValues(model: ModelPtr): FloatArrayPtr {
      return CubismCoreModule._csmGetParameterDefaultValues(model);
    }
    export function getParameterValues(model: ModelPtr): FloatArrayPtr {
      return CubismCoreModule._csmGetParameterValues(model);
    }
    export function getParameterKeyCounts(model: ModelPtr): IntArrayPtr {
      return CubismCoreModule._csmGetParameterKeyCounts(model);
    }
    export function getParameterKeyValues(model: ModelPtr): FloatArrayPtrArrsyPtr {
      return CubismCoreModule._csmGetParameterKeyValues(model);
    }
    export function getParameterTypes(model: ModelPtr) {
      return CubismCoreModule._csmGetParameterTypes(model);
    }
    export function getPartCount(model: ModelPtr) {
      return CubismCoreModule._csmGetPartCount(model);
    }
    export function getPartIds(model: ModelPtr): StringArrayPtr {
      return CubismCoreModule._csmGetPartIds(model);
    }
    export function getPartOpacities(model: ModelPtr): FloatArrayPtr {
      return CubismCoreModule._csmGetPartOpacities(model);
    }
    export function getPartParentPartIndices(model: ModelPtr): IntArrayPtr {
      return CubismCoreModule._csmGetPartParentPartIndices(model);
    }
    export function getDrawableCount(model: ModelPtr) {
      return CubismCoreModule._csmGetDrawableCount(model);
    }
    export function getDrawableIds(model: ModelPtr): StringArrayPtr {
      return CubismCoreModule._csmGetDrawableIds(model);
    }
    export function getDrawableConstantFlags(model: ModelPtr): ByteArrayPtr {
      return CubismCoreModule._csmGetDrawableConstantFlags(model);
    }
    export function getDrawableDynamicFlags(model: ModelPtr): ByteArrayPtr {
      return CubismCoreModule._csmGetDrawableDynamicFlags(model);
    }
    export function getDrawableTextureIndices(model: ModelPtr): IntArrayPtr {
      return CubismCoreModule._csmGetDrawableTextureIndices(model);
    }
    export function getDrawableDrawOrders(model: ModelPtr): IntArrayPtr {
      return CubismCoreModule._csmGetDrawableDrawOrders(model);
    }
    export function getDrawableRenderOrders(model: ModelPtr): IntArrayPtr {
      return CubismCoreModule._csmGetDrawableRenderOrders(model);
    }
    export function getDrawableOpacities(model: ModelPtr): FloatArrayPtr {
      return CubismCoreModule._csmGetDrawableOpacities(model);
    }
    export function getDrawableMaskCounts(model: ModelPtr): IntArrayPtr {
      return CubismCoreModule._csmGetDrawableMaskCounts(model);
    }
    export function getDrawableMasks(model: ModelPtr) {
      return CubismCoreModule._csmGetDrawableMasks(model);
    }
    export function getDrawableVertexCounts(model: ModelPtr): IntArrayPtr {
      return CubismCoreModule._csmGetDrawableVertexCounts(model);
    }
    export function getDrawableVertexPositions(model: ModelPtr) {
      return CubismCoreModule._csmGetDrawableVertexPositions(model);
    }
    export function getDrawableVertexUvs(model: ModelPtr) {
      return CubismCoreModule._csmGetDrawableVertexUvs(model);
    }
    export function getDrawableIndexCounts(model: ModelPtr): IntArrayPtr {
      return CubismCoreModule._csmGetDrawableIndexCounts(model);
    }
    export function getDrawableIndices(model: ModelPtr) {
      return CubismCoreModule._csmGetDrawableIndices(model);
    }
    export function getDrawableMultiplyColors(model: ModelPtr) {
      return CubismCoreModule._csmGetDrawableMultiplyColors(model);
    }
    export function getDrawableScreenColors(model: ModelPtr) {
      return CubismCoreModule._csmGetDrawableScreenColors(model);
    }
    export function getDrawableParentPartIndices(model: ModelPtr) {
      return CubismCoreModule._csmGetDrawableParentPartIndices(model);
    }
    export function mallocMoc(mocSize: number) {
      return CubismCoreModule._csmMallocMoc(mocSize);
    }
    export function mallocModelAndInitialize(moc: ModelPtr) {
      return CubismCoreModule._csmMallocModelAndInitialize(moc);
    }
    export function malloc(size: number) {
      return CubismCoreModule._csmMalloc(size);
    }
    export function setLogFunction(handler: any) {
      CubismCoreModule._csmSetLogFunction(handler);
    }
    export function updateModel(model: ModelPtr) {
      CubismCoreModule._csmUpdateModel(model);
    }
    export function readCanvasInfo(
      model: ModelPtr,
      outSizeInPixels: number,
      outOriginInPixels: number,
      outPixelsPerUnit: number
    ) {
      CubismCoreModule._csmReadCanvasInfo(model, outSizeInPixels, outOriginInPixels, outPixelsPerUnit);
    }
    export function resetDrawableDynamicFlags(model: ModelPtr) {
      CubismCoreModule._csmResetDrawableDynamicFlags(model);
    }
    export function free(memory: MemoryPtr) {
      CubismCoreModule._csmFree(memory);
    }
  }

  /** Necessary alignment for mocs (in bytes). */
  export const AlignofMoc = 64;
  /** Necessary alignment for models (in bytes). */
  export const AlignofModel = 16;
  /** .moc3 file version Unknown */
  export const MocVersion_Unknown = 0;
  /** .moc3 file version 3.0.00 - 3.2.07 */
  export const MocVersion_30 = 1;
  /** .moc3 file version 3.3.00 - 3.3.03 */
  export const MocVersion_33 = 2;
  /** .moc3 file version 4.0.00 - 4.1.05 */
  export const MocVersion_40 = 3;
  /** .moc3 file version 4.2.00 - */
  export const MocVersion_42 = 4;
  /** Normal Parameter. */
  export const ParameterType_Normal = 0;
  /** Parameter for blend shape. */
  export const ParameterType_BlendShape = 1;

  export namespace Version {
    /**
     * Queries Core version.
     *
     * @return Core version.
     */
    export function csmGetVersion() {
      return Live2DCubismCore._csm.getVersion();
    }

    /**
     * Gets Moc file supported latest version.
     *
     * @return Moc file latest format version.
     */
    export function csmGetLatestMocVersion() {
      return Live2DCubismCore._csm.getLatestMocVersion();
    }

    /**
     * Gets Moc file format version.
     *
     * @param moc Moc
     *
     * @return csmMocVersion
     */
    export function csmGetMocVersion(moc: any) {
      return Live2DCubismCore._csm.getMocVersion(moc._ptr);
    }
  }

  export namespace Logging {
    let logFunction: ((message: string) => void) | null = null;

    /**
     * Sets log handler.
     *
     * @param handler  Handler to use.
     */
    export function csmSetLogFunction(handler: ((message: string) => void) | null) {
      // Cache log handler.
      logFunction = handler;
      // Wrap function to pointer.
      const pointer = CubismCoreModule.addFunction(Logging.wrapLogFunction, 'vi');
      // Sets log handler.
      _csm.setLogFunction(pointer);
    }

    /**
     * Queries log handler.
     *
     * @return Log handler.
     */
    export function csmGetLogFunction(): ((message: string) => void) | null {
      return logFunction;
    }

    export function wrapLogFunction(messagePtr: any) {
      // Pointer to string.
      let messageStr = CubismCoreModule.UTF8ToString(messagePtr);
      // Run log function.
      logFunction?.(messageStr);
    }
  }
}

export class Moc {
  private _ptr: number = 0;
  public get ptr(): number {
    return this._ptr;
  }
  private constructor(ptr: number) {
    this._ptr = ptr;
  }
  /**
   * Checks consistency of a moc.
   *
   * @param mocBytes Moc bytes.
   *
   * @returns '1' if Moc is valid; '0' otherwise.
   */
  public static hasMocConsistency (mocBytes: ArrayBuffer): number | null {
      // Allocate memory.
      var memory = Live2DCubismCore._csm.mallocMoc(mocBytes.byteLength);
      if (!memory) {
          return null;
      }
      // Initialize memory.
      var destination = new Uint8Array(CubismCoreModule.HEAPU8.buffer, memory, mocBytes.byteLength);
      destination.set(new Uint8Array(mocBytes));
      var hasConsistency = Live2DCubismCore._csm.hasMocConsistency(memory, mocBytes.byteLength);
      Live2DCubismCore._csm.free(memory);
      return hasConsistency;
  }
  /**
   * Creates {@link Moc} from {@link ArrayBuffer}.
   * @param buffer Array buffer
   * @return [{@link Moc}] on success; null otherwise.
   */
  public static fromArrayBuffer(mocBytes: ArrayBuffer): Moc | null {
    // Allocate memory.
    const memory = Live2DCubismCore._csm.mallocMoc(mocBytes.byteLength);
    if (!memory) {
      return null;
    }
    // Initialize memory.
    const destination = new Uint8Array(CubismCoreModule.HEAPU8.buffer, memory, mocBytes.byteLength);
    destination.set(new Uint8Array(mocBytes));

    // Revive moc.
    const ptr = Live2DCubismCore._csm.reviveMocInPlace(memory, mocBytes.byteLength);
    if (!ptr) {
      console.log(mocBytes);
      Live2DCubismCore._csm.free(memory);
      return null;
    }
    return new Moc(ptr);
  }
  /** Releases instance. */
  public _release() {
    Live2DCubismCore._csm.free(this._ptr);
    this._ptr = 0;
  }
}

/**
 * Initializes instance.
 *
 * @param moc Moc
 */
export class Model {
  private _parameters: Parameters;
  /** Parameters */
  public get parameters() {
    return this._parameters;
  }

  private _parts: Parts;
  /** Parts */
  public get parts() {
    return this._parts;
  }

  private _drawables: Drawables;
  /** Drawables. */
  public get drawables() {
    return this._drawables;
  }

  private _canvasinfo: CanvasInfo;
  /** Canvas information. */
  public get canvasinfo() {
    return this._canvasinfo;
  }

  private _ptr: number = 0;
  public get ptr(): number {
    return this._ptr;
  }

  private constructor(
    mocPtr: number,
    parameters: Parameters,
    parts: Parts,
    drawables: Drawables,
    canvasinfo: CanvasInfo
  ) {
    this._ptr = mocPtr;
    this._parameters = parameters;
    this._parts = parts;
    this._drawables = drawables;
    this._canvasinfo = canvasinfo;
  }

  /**
   * Creates [{@link Model}] from [{@link Moc}].
   *
   * @param moc Moc
   * @return [{@link Model}] on success; null otherwise.
   */
  public static fromMoc(moc: Moc): Model | null {
    const ptr = Live2DCubismCore._csm.mallocModelAndInitialize(moc.ptr);
    if (!ptr) {
      return null;
    }
    const parameters = new Parameters(ptr);
    const parts = new Parts(ptr);
    const drawables = new Drawables(ptr);
    const canvasinfo = new CanvasInfo(ptr);

    const model = new Model(ptr, parameters, parts, drawables, canvasinfo);
    return model;
  }

  /** Updates instance. */
  public update() {
    Live2DCubismCore._csm.updateModel(this._ptr);
  }

  /** Releases instance. */
  public release() {
    Live2DCubismCore._csm.free(this._ptr);
    this._ptr = 0;
  }
}

/**
 * Initializes instance.
 *
 * @param modelPtr Native model pointer.
 */
export class CanvasInfo {
  /** Width of native model canvas. */
  CanvasWidth: number = 0;
  /** Height of native model canvas. */
  CanvasHeight: number = 0;
  /** Coordinate origin of X axis. */
  CanvasOriginX: number = 0;
  /** Coordinate origin of Y axis. */
  CanvasOriginY: number = 0;
  /** Pixels per unit of native model. */
  PixelsPerUnit: number = 0;

  public constructor(ptr: ModelPtr) {
    if (!ptr) {
      return;
    }
    // Preserve the pointer ant heap for get data throw args.
    const canvasSizeDataSize = 2;
    const canvasOriginDataSize = 2;
    const canvasPPUDataSize = 1;
    const heap = allocateMemory(
      Float32Array.BYTES_PER_ELEMENT *
        (canvasSizeDataSize + canvasOriginDataSize + canvasPPUDataSize)
    );

    if (!heap) {
      console.assert(!heap);
      return;
    }

    const canvasSizeData = new Float32Array(heap.buffer, heap.byteOffset, canvasSizeDataSize);
    const canvasOriginData = new Float32Array(
      heap.buffer,
      heap.byteOffset + canvasSizeData.byteLength,
      canvasOriginDataSize
    );
    const canvasPPUData = new Float32Array(
      heap.buffer,
      canvasOriginData.byteOffset + canvasOriginData.byteLength,
      canvasPPUDataSize
    );

    // Call function and get result
    Live2DCubismCore._csm.readCanvasInfo(
      ptr,
      canvasSizeData.byteOffset,
      canvasOriginData.byteOffset,
      canvasPPUData.byteOffset
    );
    this.CanvasWidth = canvasSizeData[0];
    this.CanvasHeight = canvasSizeData[1];
    this.CanvasOriginX = canvasOriginData[0];
    this.CanvasOriginY = canvasOriginData[1];
    this.PixelsPerUnit = canvasPPUData[0];
    // Free heap memory
    Live2DCubismCore._csm.free(heap.byteOffset);
  }
}

/**
 * Initializes instance.
 *
 * @param modelPtr Native model.
 */
export class Parameters {
  /** Parameter count. */
  public readonly count: number;
  /** Parameter IDs. */
  public readonly ids: Array<string>;
  /** Minimum parameter values. */
  public readonly minimumValues: Float32Array;
  /** Maximum parameter values. */
  public readonly maximumValues: Float32Array;
  /** Default parameter values. */
  public readonly defaultValues: Float32Array;
  /** Parameter values. */
  public values: Float32Array;
  /** Parameter types. */
  public readonly types: Int32Array;
  /** Number of key values of each parameter. */
  public readonly keyCounts: Int32Array;
  /** Key values of each parameter. */
  public readonly keyValues: Array<Float32Array>;

  public constructor(ptr: ModelPtr) {
    const count = Live2DCubismCore._csm.getParameterCount(ptr);
    this.count = count;
    this.ids = new Array(count);
    const ids = new Uint32Array(
      CubismCoreModule.HEAPU32.buffer,
      Live2DCubismCore._csm.getParameterIds(ptr),
      count
    );
    for (let i = 0; i < ids.length; i++) {
      this.ids[i] = CubismCoreModule.UTF8ToString(ids[i]);
    }
    this.minimumValues = new Float32Array(
      CubismCoreModule.HEAPF32.buffer,
      Live2DCubismCore._csm.getParameterMinimumValues(ptr),
      count
    );
    this.maximumValues = new Float32Array(
      CubismCoreModule.HEAPF32.buffer,
      Live2DCubismCore._csm.getParameterMaximumValues(ptr),
      count
    );
    this.defaultValues = new Float32Array(
      CubismCoreModule.HEAPF32.buffer,
      Live2DCubismCore._csm.getParameterDefaultValues(ptr),
      count
    );
    this.values = new Float32Array(
      CubismCoreModule.HEAPF32.buffer,
      Live2DCubismCore._csm.getParameterValues(ptr),
      count
    );
    this.types = new Int32Array(
      CubismCoreModule.HEAP32.buffer,
      Live2DCubismCore._csm.getParameterTypes(ptr),
      count
    );

    const keyCounts = new Int32Array(
      CubismCoreModule.HEAP32.buffer,
      Live2DCubismCore._csm.getParameterKeyCounts(ptr),
      count
    );
    this.keyCounts = keyCounts;

    this.keyValues = new Array(count);
    const keyValues = new Uint32Array(
      CubismCoreModule.HEAPU32.buffer,
      Live2DCubismCore._csm.getParameterKeyValues(ptr),
      count
    );
    for (let i = 0; i < keyValues.length; i++) {
      this.keyValues[i] = new Float32Array(CubismCoreModule.HEAPF32.buffer, keyValues[i], keyCounts[i]);
    }
  }
}

/**
 * Initializes instance.
 *
 * @param modelPtr Native model.
 */
export class Parts {
  /** Part count. */
  count: number;
  /** Part IDs. */
  ids: Array<string>;
  /** Opacity values. */
  opacities: Float32Array;
  /** Part's parent part indices. */
  parentIndices: Int32Array;
  constructor(modelPtr: any) {
    const _count = Live2DCubismCore._csm.getPartCount(modelPtr);
    this.count = _count;
    this.ids = new Array(_count);
    const _ids = new Uint32Array(
      CubismCoreModule.HEAPU32.buffer,
      Live2DCubismCore._csm.getPartIds(modelPtr),
      _count
    );
    for (let i = 0; i < _ids.length; i++) {
      this.ids[i] = CubismCoreModule.UTF8ToString(_ids[i]);
    }
    this.opacities = new Float32Array(
      CubismCoreModule.HEAPF32.buffer,
      Live2DCubismCore._csm.getPartOpacities(modelPtr),
      _count
    );
    this.parentIndices = new Int32Array(
      CubismCoreModule.HEAP32.buffer,
      Live2DCubismCore._csm.getPartParentPartIndices(modelPtr),
      _count
    );
  }
}

export class Drawables {
  /** Drawable count. */
  public readonly count: number;
  /** Drawable IDs. */
  public readonly ids: Array<string>;
  /** Constant drawable flags. */
  public readonly constantFlags: Uint8Array;
  /** Dynamic drawable flags. */
  public readonly dynamicFlags: Uint8Array;
  /** Drawable texture indices. */
  public readonly textureIndices: Int32Array;
  /** Drawable draw orders. */
  public readonly drawOrders: Int32Array;
  /** Drawable render orders. */
  public readonly renderOrders: Int32Array;
  /** Drawable opacities. */
  public readonly opacities: Float32Array;
  /** Mask count for each drawable. */
  public readonly maskCounts: Int32Array;
  /** Masks for each drawable. */
  public readonly masks: Array<Int32Array>;
  /** Number of vertices of each drawable. */
  public readonly vertexCounts: Int32Array;
  /** 2D vertex position data of each drawable. */
  public readonly vertexPositions: Array<Float32Array>;
  /** 2D texture coordinate data of each drawables. */
  public readonly vertexUvs: Array<Float32Array>;
  /** Number of triangle indices for each drawable. */
  public readonly indexCounts: Int32Array;
  /** Triangle index data for each drawable. */
  public readonly indices: Array<Uint16Array>;
  /** Multiply Colors */
  public readonly multiplyColors: Float32Array;
  /** Screen Colors */
  public readonly screenColors: Float32Array;
  /** Indices of drawables parent part. */
  public readonly parentPartIndices: Int32Array;

  /** Native model. */
  private _modelPtr;

  public constructor(modelPtr: any) {
    this._modelPtr = modelPtr;
    const count = Live2DCubismCore._csm.getDrawableCount(modelPtr);
    this.count = count;
    this.ids = new Array(count);
    const ids = new Uint32Array(
      CubismCoreModule.HEAPU32.buffer,
      Live2DCubismCore._csm.getDrawableIds(modelPtr),
      count
    );
    for (let i = 0; i < ids.length; i++) {
      this.ids[i] = CubismCoreModule.UTF8ToString(ids[i]);
    }
    this.constantFlags = new Uint8Array(
      CubismCoreModule.HEAPU8.buffer,
      Live2DCubismCore._csm.getDrawableConstantFlags(modelPtr),
      count
    );
    this.dynamicFlags = new Uint8Array(
      CubismCoreModule.HEAPU8.buffer,
      Live2DCubismCore._csm.getDrawableDynamicFlags(modelPtr),
      count
    );
    this.textureIndices = new Int32Array(
      CubismCoreModule.HEAP32.buffer,
      Live2DCubismCore._csm.getDrawableTextureIndices(modelPtr),
      count
    );
    this.drawOrders = new Int32Array(
      CubismCoreModule.HEAP32.buffer,
      Live2DCubismCore._csm.getDrawableDrawOrders(modelPtr),
      count
    );
    this.renderOrders = new Int32Array(
      CubismCoreModule.HEAP32.buffer,
      Live2DCubismCore._csm.getDrawableRenderOrders(modelPtr),
      count
    );
    this.opacities = new Float32Array(
      CubismCoreModule.HEAPF32.buffer,
      Live2DCubismCore._csm.getDrawableOpacities(modelPtr),
      count
    );
    const maskCounts = new Int32Array(
      CubismCoreModule.HEAP32.buffer,
      Live2DCubismCore._csm.getDrawableMaskCounts(modelPtr),
      count
    );
    this.maskCounts = maskCounts;
    const vertexCounts = new Int32Array(
      CubismCoreModule.HEAP32.buffer,
      Live2DCubismCore._csm.getDrawableVertexCounts(modelPtr),
      count
    );
    this.vertexCounts = vertexCounts;
    const indexCounts = new Int32Array(
      CubismCoreModule.HEAP32.buffer,
      Live2DCubismCore._csm.getDrawableIndexCounts(modelPtr),
      count
    );
    this.indexCounts = indexCounts;

    this.masks = new Array(count);
    let masks = new Uint32Array(
      CubismCoreModule.HEAPU32.buffer,
      Live2DCubismCore._csm.getDrawableMasks(modelPtr),
      count
    );
    for (let i = 0; i < masks.length; i++) {
      this.masks[i] = new Int32Array(CubismCoreModule.HEAP32.buffer, masks[i], maskCounts[i]);
    }
    this.vertexPositions = new Array(count);
    let vertexPositions = new Uint32Array(
      CubismCoreModule.HEAPU32.buffer,
      Live2DCubismCore._csm.getDrawableVertexPositions(modelPtr),
      count
    );
    for (let i = 0; i < vertexPositions.length; i++) {
      this.vertexPositions[i] = new Float32Array(
        CubismCoreModule.HEAPF32.buffer,
        vertexPositions[i],
        vertexCounts[i] * 2
      );
    }
    this.vertexUvs = new Array(count);
    let vertexUvs = new Uint32Array(
      CubismCoreModule.HEAPU32.buffer,
      Live2DCubismCore._csm.getDrawableVertexUvs(modelPtr),
      count
    );
    for (let i = 0; i < vertexUvs.length; i++) {
      this.vertexUvs[i] = new Float32Array(
        CubismCoreModule.HEAPF32.buffer,
        vertexUvs[i],
        vertexCounts[i] * 2
      );
    }
    this.indices = new Array(count);
    let indices = new Uint32Array(
      CubismCoreModule.HEAPU32.buffer,
      Live2DCubismCore._csm.getDrawableIndices(modelPtr),
      count
    );
    for (let i = 0; i < indices.length; i++) {
      this.indices[i] = new Uint16Array(CubismCoreModule.HEAPU16.buffer, indices[i], indexCounts[i]);
    }
    this.multiplyColors = new Float32Array(
      CubismCoreModule.HEAPU32.buffer,
      Live2DCubismCore._csm.getDrawableMultiplyColors(modelPtr),
      count * 4
    );
    this.screenColors = new Float32Array(
      CubismCoreModule.HEAPU32.buffer,
      Live2DCubismCore._csm.getDrawableScreenColors(modelPtr),
      count * 4
    );
    this.parentPartIndices = new Int32Array(
      CubismCoreModule.HEAP32.buffer,
      Live2DCubismCore._csm.getDrawableParentPartIndices(modelPtr),
      count
    );
  }
  /** Resets all dynamic drawable flags.. */
  public resetDynamicFlags = () => {
    Live2DCubismCore._csm.resetDrawableDynamicFlags(this._modelPtr);
  };
}

export namespace Utils {
  /**
   * Checks whether flag is set in bitfield.
   *
   * @param bitfield Bitfield to query against.
   *
   * @return [[true]] if bit set; [[false]] otherwise
   */
  export function hasBlendAdditiveBit(bitfield: number) {
    return (bitfield & (1 << 0)) == 1 << 0;
  }
  /**
   * Checks whether flag is set in bitfield.
   *
   * @param bitfield Bitfield to query against.
   *
   * @return [[true]] if bit set; [[false]] otherwise
   */
  export function hasBlendMultiplicativeBit(bitfield: number) {
    return (bitfield & (1 << 1)) == 1 << 1;
  }
  /**
   * Checks whether flag is set in bitfield.
   *
   * @param bitfield Bitfield to query against.
   *
   * @return [[true]] if bit set; [[false]] otherwise
   */
  export function hasIsDoubleSidedBit(bitfield: number) {
    return (bitfield & (1 << 2)) == 1 << 2;
  }
  /**
   * Checks whether flag is set in bitfield.
   *
   * @param bitfield Bitfield to query against.
   *
   * @return [[true]] if bit set; [[false]] otherwise
   */
  export function hasIsInvertedMaskBit(bitfield: number) {
    return (bitfield & (1 << 3)) == 1 << 3;
  }
  /**
   * Checks whether flag is set in bitfield.
   *
   * @param bitfield Bitfield to query against.
   *
   * @return [[true]] if bit set; [[false]] otherwise
   */
  export function hasIsVisibleBit(bitfield: number) {
    return (bitfield & (1 << 0)) == 1 << 0;
  }
  /**
   * Checks whether flag is set in bitfield.
   *
   * @param bitfield Bitfield to query against.
   *
   * @return [[true]] if bit set; [[false]] otherwise
   */
  export function hasVisibilityDidChangeBit(bitfield: number) {
    return (bitfield & (1 << 1)) == 1 << 1;
  }
  /**
   * Checks whether flag is set in bitfield.
   *
   * @param bitfield Bitfield to query against.
   *
   * @return [[true]] if bit set; [[false]] otherwise
   */
  export function hasOpacityDidChangeBit(bitfield: number) {
    return (bitfield & (1 << 2)) == 1 << 2;
  }
  /**
   * Checks whether flag is set in bitfield.
   *
   * @param bitfield Bitfield to query against.
   *
   * @return [[true]] if bit set; [[false]] otherwise
   */
  export function hasDrawOrderDidChangeBit(bitfield: number) {
    return (bitfield & (1 << 3)) == 1 << 3;
  }
  /**
   * Checks whether flag is set in bitfield.
   *
   * @param bitfield Bitfield to query against.
   *
   * @return [[true]] if bit set; [[false]] otherwise
   */
  export function hasRenderOrderDidChangeBit(bitfield: number) {
    return (bitfield & (1 << 4)) == 1 << 4;
  }
  /**
   * Checks whether flag is set in bitfield.
   *
   * @param bitfield Bitfield to query against.
   *
   * @return [[true]] if bit set; [[false]] otherwise
   */
  export function hasVertexPositionsDidChangeBit(bitfield: number) {
    return (bitfield & (1 << 5)) == 1 << 5;
  }
  /**
   * Checks whether flag is set in bitfield.
   *
   * @param bitfield Bitfield to query against.
   *
   * @return [[true]] if bit set; [[false]] otherwise
   */
  export function hasBlendColorDidChangeBit(bitfield: number) {
    return (bitfield & (1 << 6)) == 1 << 6;
  }
}

function allocateMemory(size: number) {
  const ptr = Live2DCubismCore._csm.malloc(size);
  if (!ptr) {
    return null;
  }
  return new Uint8Array(CubismCoreModule.HEAPU8.buffer, ptr, size);
}
