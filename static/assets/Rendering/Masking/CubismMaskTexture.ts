/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Asset, assetManager, CCInteger, Game, game, RenderTexture, _decorator } from 'cc';
import CubismMaskCommandBuffer from './CubismMaskCommandBuffer';
import CubismMaskTilePool from './CubismMaskTilePool';
import { ArrayExtensions, isImporter, MathExtensions } from '../../Utils';
import CubismMaskTile from './CubismMaskTile';
import type ICubismMaskTextureCommandSource from './ICubismMaskTextureCommandSource';
import type ICubismMaskCommandSource from './ICubismMaskCommandSource';
import type IStructLike from '../../IStructLike';
import { EDITOR } from 'cc/env';
const { ccclass, property } = _decorator;

/**
 * Texture for rendering masks.
 *
 * ScriptableObject
 * [CreateAssetMenu(menuName = "Live2D Cubism/Mask Texture")]
 */
@ccclass('CubismMaskTexture')
export default class CubismMaskTexture extends Asset implements ICubismMaskCommandSource {
  // #region Conversion

  /**
   * Converts a CubismMaskTexture to a Texture.
   * @returns Value to convert.
   */
  public getTextureReference() {
    return this.renderTexture;
  }

  // #endregion

  public static initGlobalMaskTexture() {
    game.once(Game.EVENT_GAME_INITED, () => {
      assetManager.loadBundle('Live2DCubismBuiltinResource', (error, bundle) => {
        if (error != null) {
          console.error(error);
        } else {
          bundle.load<CubismMaskTexture>('GlobalMaskTexture', (error, asset) => {
            if (error != null) {
              console.error(error);
            } else {
              // CubismMaskTexture._globalMaskTexture = asset;
            }
          });
        }
      });
    });
  }

  private static _globalMaskTexture: CubismMaskTexture | null = null;

  /** The global mask texture. */
  public static get globalMaskTexture(): CubismMaskTexture | null {
    return CubismMaskTexture._globalMaskTexture;
  }

  /** Size backing field. */
  @property({ type: CCInteger, serializable: true, visible: false })
  private _size: number = 1024;

  /** Texture size in pixels. */
  public get size() {
    return this._size;
  }
  public set size(value) {
    // Return early if same value given.
    if (value == this._size) {
      return;
    }
    // Fail silently if not power-of-two.
    if (!MathExtensions.isPowerOfTwo(value)) {
      return;
    }
    // Apply changes.
    this._size = value;
    this.refreshRenderTexture();
  }

  /** Channel count. */
  public get channels(): number {
    return 4;
  }

  /** Subdivisions backing field. */
  @property({ type: CCInteger, serializable: true, visible: false })
  private _subdivisions: number = 3;

  /** Subdivision level. */
  public get subdivisions() {
    return this._subdivisions;
  }
  public set subdivisions(value) {
    if (value == this._subdivisions) {
      return;
    }
    // Apply changes.
    this._subdivisions = value;
    this.refreshRenderTexture();
  }

  private _tilePool: CubismMaskTilePool | null = null;
  /** Tile pool 'allocator'. */
  private get tilePool() {
    return this._tilePool;
  }
  private set tilePool(value) {
    this._tilePool = value;
  }

  /** RenderTexture backing field. */
  private _renderTexture: RenderTexture | null = null;

  /** RenderTexture to draw on. */
  private get renderTexture(): RenderTexture | null {
    if (this._renderTexture == null) {
      this.refreshRenderTexture();
    }
    return this._renderTexture;
  }
  private set renderTexture(value: RenderTexture | null) {
    this._renderTexture = value;
  }

  private _sources = new Array<SourcesItem>(0);
  /** Sources. */
  private get sources() {
    return this._sources;
  }
  private set sources(value) {
    this._sources = value;
  }

  /** True if instance is revived. */
  private get isRevived(): boolean {
    return this.tilePool != null;
  }

  /** True if instance contains any sources. */
  private get containsSources(): boolean {
    return this.sources != null && this.sources.length > 0;
  }

  // #region Interface For ICubismMaskSources

  /**
   * Add source of masks for drawing.
   * @param source
   */
  public addSource(source: ICubismMaskTextureCommandSource): void {
    // Make sure instance is valid.
    this.tryRevive();
    // Initialize container if necessary.
    if (this.sources == null) {
      this.sources = new Array<SourcesItem>();
    }
    // Return early if source already exists.
    else if (this.sources.findIndex((value, index, obj) => value.source == source) != -1) {
      return;
    }
    // Register source.
    if (this.tilePool == null) {
      console.warn('CubismMaskTexture.tilePool is null.');
      return;
    }
    const tiles = this.tilePool.acquireTiles(source.getNecessaryTileCount());
    if (tiles == null) {
      console.warn('CubismMaskTexture.tilePool.acquireTiles() failed.');
      return;
    }
    const item = new SourcesItem({ source: source, tiles: tiles });
    this.sources.push(item);
    // Apply tiles to source.
    source.setTiles(item.tiles);
  }

  /**
   * Remove source of masks
   * @param source
   */
  public removeSource(source: ICubismMaskTextureCommandSource): void {
    // Return early if empty.
    if (!this.containsSources) {
      return;
    }
    const itemIndex = this.sources.findIndex((value, index, obj) => {
      return value.source == source;
    });
    // Return if source is invalid.
    if (itemIndex == -1) {
      return;
    }
    // Return tiles and deregister source.
    if (this.tilePool == null) {
      console.warn('CubismMaskTexture.tilePool is null.');
      return;
    }
    this.tilePool.returnTiles(this.sources[itemIndex].tiles);
    this.sources.splice(itemIndex, 1);
  }

  // #endregion

  private tryRevive(): void {
    // Return early if already revived.
    if (this.isRevived) {
      return;
    }
    this.refreshRenderTexture();
  }

  private reinitializeSources(): void {
    // Reallocate tiles if sources exist.
    if (this.containsSources) {
      if (this.tilePool == null) {
        console.warn('CubismMaskTexture.tilePool is null.');
        return;
      }
      for (let i = 0; i < this.sources.length; i++) {
        let source = this.sources[i];
        if (source.source == null) {
          console.warn('CubismMaskTexture.sources[i].source is null.');
          return;
        }
        const tiles = this.tilePool.acquireTiles(source.source.getNecessaryTileCount());
        if (tiles == null) {
          console.warn('CubismMaskTexture.tilePool.acquireTiles() failed.');
          return;
        }
        source.source.setTiles(tiles);
        this.sources[i] = source.copyWith({ source: source.source, tiles: tiles });
      }
    }
  }

  private refreshRenderTexture(): void {
    // Recreate render texture.
    this._renderTexture = new RenderTexture();
    this._renderTexture.initialize({
      width: this.size,
      height: this.size,
      name: 'CubismMaskTextureInstance',
    });
    // Recreate allocator.
    this.tilePool = new CubismMaskTilePool(this.subdivisions, this.channels);
    // Reinitialize sources.
    this.reinitializeSources();
  }

  //#region Cocos Creator Event Handling

  /** Initializes instance. */
  public onLoaded(): void {
    super.onLoaded();
    CubismMaskTexture._globalMaskTexture = this;
    if (EDITOR) {
      const key = Symbol.for('CubismMaskTexture.globalMaskTexture');
      const global = globalThis as unknown as {
        [key]: CubismMaskTexture | undefined;
      };
      global[key] = this;
    }

    CubismMaskCommandBuffer.addSource(this);
  }

  public static reviveInEditor(): void {
    console.info('reviveInEditor');
    if (EDITOR) {
      const key = Symbol.for('CubismMaskTexture.globalMaskTexture');
      const global = globalThis as unknown as {
        [key]: CubismMaskTexture | undefined;
      };
      if (global[key]) {
        CubismMaskTexture._globalMaskTexture = global[key];
      }
    }
  }

  /** Finalizes instance. */
  public destroy(): boolean {
    CubismMaskTexture._globalMaskTexture = null;
    CubismMaskCommandBuffer.removeSource(this);
    const ret = super.destroy();
    return ret;
  }

  //#endregion

  // #region ICubismMaskCommandSource

  /**
   * Called to enqueue source.
   * @param buffer Buffer to enqueue in.
   */
  public addToCommandBuffer(buffer: CubismMaskCommandBuffer): void {
    // Return early if empty.
    if (!this.containsSources) {
      return;
    }
    // Enqueue render target.
    for (let i = 0; i < this.sources.length; i++) {
      this.sources[i].source?.addToCommandBuffer(buffer);
    }
  }
  // #endregion

  private constructor(size?: number, subdivisions?: number) {
    super();
    // Parameters cannot be given during deserialization, so none of the parameters in the constructor may be present
    // The build process removes the same data as the default value.
    // So if no parameters are passed in and no data is restored, the default values on the class are used
    if (size !== undefined) {
      this._size = size;
    }
    if (subdivisions !== undefined) {
      this._subdivisions = subdivisions;
    }
  }

  public static generateCubismMaskTexture(
    size: number = 512,
    subdivisions: number = 3
  ): CubismMaskTexture | null {
    // Fail silently if not power-of-two.
    if (!MathExtensions.isPowerOfTwo(size)) {
      return null;
    }
    return new CubismMaskTexture(size, subdivisions);
  }
}

// #region Source Item

/** Source of masks and its tiles (struct) */
class SourcesItem implements IStructLike<SourcesItem> {
  /** SourcesItem instance. */
  public readonly source: ICubismMaskTextureCommandSource | null;
  /** Tiles assigned to the instance. */
  public readonly tiles: Array<CubismMaskTile>;

  public constructor(
    args: { source?: ICubismMaskTextureCommandSource | null; tiles?: Array<CubismMaskTile> } = {}
  ) {
    this.source = args.source ?? null;
    this.tiles = args.tiles ?? new Array(0);
  }

  public copyWith(
    args: { source?: ICubismMaskTextureCommandSource | null; tiles?: Array<CubismMaskTile> } = {}
  ): SourcesItem {
    return new SourcesItem({
      source: args.source !== undefined ? args.source : this.source,
      tiles: args.tiles ?? this.tiles,
    });
  }

  public equals(other: SourcesItem): boolean {
    return this === other
      ? true
      : this.source === other.source &&
          ArrayExtensions.isEquals(CubismMaskTile.isEquals, this.tiles, other.tiles);
  }

  public strictEquals(other: SourcesItem): boolean {
    return this === other;
  }
}

// #endregion

// 他の処理が実行される前に CubismMaskCommandBuffer を展開するため GlobalMaskTexture をロードします。
if (!EDITOR) {
  CubismMaskTexture.initGlobalMaskTexture();
} else {
  if (!isImporter()) {
    const maskTex = await Editor.Message.request(
      'asset-db',
      'query-uuid',
      'db://live2d_cubismsdk_cocoscreator/resources/GlobalMaskTexture.asset'
    );
    CubismMaskTexture.reviveInEditor();
    if (!CubismMaskTexture.globalMaskTexture) {
      console.info('loadAny');
      assetManager.loadAny(maskTex, null, (error, asset: CubismMaskTexture) => {
        if (error) {
          console.error(error);
        }
      });
    }
  }
}
