/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, Component, Node, math, CCInteger, Color } from 'cc';
import { Utils } from '../CubismCore';
import ComponentExtensionMethods from './ComponentExtensionMethods';
import type { Drawables, Model } from '../CubismCore';
import CubismMeshPrimitive from '../Rendering/CubismMeshPrimitive';
const { ccclass, property } = _decorator;

// TODO: CubismDontMoveOnReimport
/**
 * Single CubismModel drawable.
 *
 * **Sealed class.**
 */
@ccclass('CubismDrawable')
export default class CubismDrawable extends Component {
  // #region Factory Methods

  /**
   * Creates drawables for a {@link CubismModel}.
   * @param model Handle to unmanaged model.
   * @returns Drawables root.
   */
  public static createDrawables(model: Model): Node {
    const root = new Node('Drawables');

    // Create parts.
    const drawables = model.drawables;
    const buffer = new Array<CubismDrawable>(drawables.count);

    for (let i = 0; i < buffer.length; ++i) {
      const proxy = new Node();
      buffer[i] = proxy.addComponent(CubismDrawable);
      root.addChild(proxy);
      buffer[i].reset(model, i);
    }
    return root;
  }

  // #endregion

  private _unmanagedDrawables: Drawables | null = null;
  /** Unmanaged drawables from unmanaged model. */
  private get unmanagedDrawables(): Drawables | null {
    return this._unmanagedDrawables;
  }
  private set unmanagedDrawables(value: Drawables | null) {
    this._unmanagedDrawables = value;
  }

  /** {@link unmanagedIndex} backing field. */
  @property({ type: CCInteger, serializable: true, visible: true, readonly: true })
  private _unmanagedIndex: number = -1;

  /** Position in unmanaged arrays. */
  public get unmanagedIndex(): number {
    return this._unmanagedIndex;
  }
  private set unmanagedIndex(value: number) {
    this._unmanagedIndex = value;
  }

  /** Copy of Id. */
  public get id(): string {
    if (this.unmanagedDrawables == null) {
      console.error('CubismDrawable.id: this.unmanagedDrawables is null');
      return '';
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.id: this.index uninitialize.');
      return '';
    }
    return this.unmanagedDrawables.ids[this.unmanagedIndex];
  }

  /** Texture UnmanagedIndex. */
  public get textureIndex(): number {
    if (this.unmanagedDrawables == null) {
      console.error('CubismDrawable.id: this.unmanagedDrawables is null');
      return 0;
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.id: this.index uninitialize.');
      return 0;
    }
    return this.unmanagedDrawables.textureIndices[this.unmanagedIndex];
  }

  /** Copy of the masks. */
  public get masks(): Array<CubismDrawable> {
    if (this.unmanagedDrawables == null) {
      console.error('CubismDrawable.masks: this.unmanagedDrawables is null');
      return new Array<CubismDrawable>(0);
    }
    const model = ComponentExtensionMethods.findCubismModel(this, true);
    if (model == null) {
      console.error('CubismDrawable.masks: ComponentExtensionMethods.findCubismModel() failed.');
      return new Array<CubismDrawable>(0);
    }
    const drawables = model.drawables;
    if (drawables == null) {
      console.error('CubismDrawable.masks: model.drawables is null.');
      return new Array<CubismDrawable>(0);
    }

    const count = this.unmanagedDrawables.maskCounts[this.unmanagedIndex];
    const indices = this.unmanagedDrawables.masks[this.unmanagedIndex];

    // Pull data.
    const buffer = new Array<CubismDrawable>(count);

    for (let i = 0; i < buffer.length; i++) {
      for (let j = 0; j < drawables.length; j++) {
        if (drawables[j].unmanagedIndex != indices[i]) {
          continue;
        }

        buffer[i] = drawables[j];

        break;
      }
    }

    return buffer;
  }

  /** Copy of vertex positions. */
  public get vertexPositions(): Array<math.Vec3> {
    const drawables = this.unmanagedDrawables;
    if (drawables == null) {
      console.error('CubismDrawable.vertexPositions: this.unmanagedDrawables is null.');
      return new Array(0);
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.vertexUvs: this.index uninitialize.');
      return new Array(0);
    }

    const count = drawables.vertexCounts[this.unmanagedIndex];
    const positions = drawables.vertexPositions[this.unmanagedIndex];

    // Pull data.
    const buffer = new Array<math.Vec3>(count);

    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = new math.Vec3(positions[i * 2 + 0], positions[i * 2 + 1]);
    }

    return buffer;
  }

  /** Copy of vertex texture coordinates. */
  public get vertexUvs(): Array<math.Vec2> {
    const drawables = this.unmanagedDrawables;
    if (drawables == null) {
      console.error('CubismDrawable.vertexUvs: this.unmanagedDrawables is null.');
      return new Array(0);
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.vertexUvs: this.index uninitialize.');
      return new Array(0);
    }

    const count = drawables.vertexCounts[this.unmanagedIndex];
    const uvs = drawables.vertexUvs[this.unmanagedIndex];

    // Pull data.
    var buffer = new Array<math.Vec2>(count);

    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = new math.Vec2(uvs[i * 2 + 0], uvs[i * 2 + 1]);
    }

    return buffer;
  }

  /** Copy of triangle indices. */
  public get indices(): Uint16Array {
    const drawables = this.unmanagedDrawables;
    if (drawables == null) {
      console.error('CubismDrawable.indices: this.unmanagedDrawables is null.');
      return new Uint16Array(0);
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.indices: this.index uninitialize.');
      return new Uint16Array(0);
    }

    const count = drawables.indexCounts[this.unmanagedIndex];
    const indices = drawables.indices[this.unmanagedIndex];

    // Pull data.
    let buffer = new Uint16Array(count);

    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = indices[i];
    }

    return buffer;
  }

  public generateMeshPrimitive(): CubismMeshPrimitive | null {
    const drawables = this.unmanagedDrawables;
    if (drawables == null) {
      console.error('CubismDrawable.generateMeshPrimitive(): this.drawables is null.');
      return null;
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.generateMeshPrimitive(): this.index uninitialize.');
      return null;
    }

    // Get addresses.
    const vertexCount = drawables.vertexCounts[this.unmanagedIndex];
    const positions = drawables.vertexPositions[this.unmanagedIndex];
    const uvs = drawables.vertexUvs[this.unmanagedIndex];
    const indices = drawables.indices[this.unmanagedIndex];

    // Pull data.
    const positionsBuffer = new Array<number>(vertexCount * 3);
    const uvsBuffer = new Array<number>(vertexCount * 2);
    const colorsBuffer = new Array<number>(vertexCount * 4);

    for (let i = 0, j = 0; i < positionsBuffer.length; ) {
      positionsBuffer[i++] = positions[j++];
      positionsBuffer[i++] = positions[j++];
      positionsBuffer[i++] = 0;
    }
    for (let i = 0, j = 0; i < uvsBuffer.length; i++) {
      uvsBuffer[i] = uvs[i];
    }
    for (let i = 0; i < colorsBuffer.length; i++) {
      colorsBuffer[i] = 0;
    }

    const primitive = CubismMeshPrimitive.from(positionsBuffer, uvsBuffer, colorsBuffer);
    primitive?.setIndices(indices);
    return primitive;
  }

  /** True if double-sided. */
  public get isDoubleSided(): boolean {
    const drawables = this.unmanagedDrawables;
    if (drawables == null) {
      console.error('CubismDrawable.isDoubleSided: this.unmanagedDrawables is null.');
      return false;
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.isDoubleSided: this.index uninitialize.');
      return false;
    }
    const flags = drawables.constantFlags[this.unmanagedIndex];

    // Pull data.
    return Utils.hasIsDoubleSidedBit(flags);
  }

  /** True if masking is requested. */
  public get isMasked(): boolean {
    const drawables = this.unmanagedDrawables;
    if (drawables == null) {
      console.error('CubismDrawable.isMasked: this.unmanagedDrawables is null.');
      return false;
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.isMasked: this.index uninitialize.');
      return false;
    }
    return drawables.maskCounts[this.unmanagedIndex] > 0;
  }

  /** True if inverted mask. */
  public get isInverted() {
    const drawables = this.unmanagedDrawables;
    if (drawables == null) {
      console.error('CubismDrawable.isMasked: this.unmanagedDrawables is null.');
      return false;
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.isMasked: this.index uninitialize.');
      return false;
    }
    const flags = drawables.constantFlags[this.unmanagedIndex];

    // Pull data.
    return Utils.hasIsInvertedMaskBit(flags);
  }

  /** True if additive blending is requested. */
  public get blendAdditive() {
    const drawables = this.unmanagedDrawables;
    if (drawables == null) {
      console.error('CubismDrawable.isMasked: this.unmanagedDrawables is null.');
      return false;
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.isMasked: this.index uninitialize.');
      return false;
    }
    const flags = drawables.constantFlags[this.unmanagedIndex];

    // Pull data.
    return Utils.hasBlendAdditiveBit(flags);
  }

  /** True if multiply blending is setd. */
  public get multiplyBlend() {
    const drawables = this.unmanagedDrawables;
    if (drawables == null) {
      console.error('CubismDrawable.isMasked: this.unmanagedDrawables is null.');
      return false;
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.isMasked: this.index uninitialize.');
      return false;
    }
    const flags = drawables.constantFlags[this.unmanagedIndex];

    // Pull data.
    return Utils.hasBlendMultiplicativeBit(flags);
  }

  public get multiplyColor(): Color {
    if (this.unmanagedDrawables == null) {
      console.error('CubismDrawable.multiplyColor: this.unmanagedDrawables is null');
      return Color.WHITE;
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.multiplyColor: this.index uninitialize.');
      return Color.WHITE;
    }
    const index = this.unmanagedIndex * 4;
    const x = this.unmanagedDrawables.multiplyColors[index + 0] * 255;
    const y = this.unmanagedDrawables.multiplyColors[index + 1] * 255;
    const z = this.unmanagedDrawables.multiplyColors[index + 2] * 255;
    const w = this.unmanagedDrawables.multiplyColors[index + 3] * 255; // Cubism Core API リファレンス <https://cubism.live2d.com/sdk-doc/reference/NativeCoreAPIReference_jp_r9.pdf> より Wの値は現在未使用
    return new Color(x, y, z, w);
  }

  public get screenColor(): Color {
    if (this.unmanagedDrawables == null) {
      console.error('CubismDrawable.multiplyColor: this.unmanagedDrawables is null');
      return Color.BLACK;
    }
    if (this.unmanagedIndex == -1) {
      console.error('CubismDrawable.multiplyColor: this.index uninitialize.');
      return Color.BLACK;
    }
    const index = this.unmanagedIndex * 4;
    const x = this.unmanagedDrawables.screenColors[index + 0] * 255;
    const y = this.unmanagedDrawables.screenColors[index + 1] * 255;
    const z = this.unmanagedDrawables.screenColors[index + 2] * 255;
    const w = this.unmanagedDrawables.screenColors[index + 3] * 255; // Cubism Core API リファレンス <https://cubism.live2d.com/sdk-doc/reference/NativeCoreAPIReference_jp_r9.pdf> より Wの値は現在未使用
    return new Color(x, y, z, w);
  }

  /**
   * Revives instance.
   * @param model Handle to unmanaged model.
   */
  public revive(model: Model) {
    this.unmanagedDrawables = model.drawables;
  }

  /**
   * Restores instance to initial state.
   * @param model Handle to unmanaged model.
   * @param index Position in unmanaged arrays.
   */
  reset(model: Model, index: number) {
    this.revive(model);
    this._unmanagedIndex = index;
    this.node.name = this.id;
  }
}
