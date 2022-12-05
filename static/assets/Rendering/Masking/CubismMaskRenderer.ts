/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Material, math, MeshRenderer, Node, renderer } from 'cc';
import CubismDrawable from '../../Core/CubismDrawable';
import CubismShaderVariables from '../CubismShaderVariables';
import CubismMaskCommandBuffer, {
  CubismMaskCommandBufferMetadata,
} from './CubismMaskCommandBuffer';
import type CubismRenderer from '../CubismRenderer';
import type CubismMaskTile from './CubismMaskTile';
import type CubismMaskTransform from './CubismMaskTransform';
import { CubismBounds as Bounds } from '../../Core/CubismGeometry';
import CubismResources from '../../Framework/CubismResources';

const userLayer19 = 0x00080000; // 0x00080000

/**
 * Renders out a single Cubism mask.
 *
 * Note that - depending on the model - multiple CubismMaskRenderer might be assigned to a single CubismDrawable.
 */
export default class CubismMaskRenderer {
  /** Mask properties. */
  private _maskTile: Readonly<math.Vec4> = math.Vec4.ZERO.clone();

  /** Mask properties. */
  private _maskTransform: Readonly<math.Vec4> = math.Vec4.ZERO.clone();

  private _mainRenderer: CubismRenderer | null = null;
  /** Main renderer. */
  private get mainRenderer() {
    return this._mainRenderer;
  }
  private set mainRenderer(value) {
    this._mainRenderer = value;
  }

  private _maskMaterial: Material | null = null;
  /** Mask material. */
  private get maskMaterial() {
    return this._maskMaterial;
  }
  private set maskMaterial(value) {
    this._maskMaterial = value;
  }

  private _maskCullingMaterial: Material | null = null;
  /** Mask culling material. */
  private get maskCullingMaterial() {
    return this._maskCullingMaterial;
  }
  private set maskCullingMaterial(value) {
    this._maskCullingMaterial = value;
  }

  private _isCulling: boolean = false;
  /** Culling setting. */
  private get isCulling() {
    return this._isCulling;
  }
  private set isCulling(value) {
    this._isCulling = value;
  }

  /** Bounds of {@link CubismRenderer.mesh}. */
  public get meshBounds(): Bounds {
    const mesh = this._mainRenderer!.mesh;
    return mesh.calculateBounds();
  }

  // #region Ctors

  /** Initializes fields. */
  public constructor() {
    this.maskMaterial = CubismResources.getMaskMaterial();
    this.maskCullingMaterial = CubismResources.getMaskCullingMaterial();
  }

  // #endregion

  // #region Interface For CubismMaskMaskedJunction

  /**
   * Sets the CubismRenderer to reference.
   * @param value Value to set.
   * @returns Instance.
   */
  public setMainRenderer(value: CubismRenderer): CubismMaskRenderer {
    this.mainRenderer = value;

    this.isCulling = !this.mainRenderer.node.getComponent(CubismDrawable)?.isDoubleSided;

    return this;
  }

  /**
   * Sets CubismMaskTile.
   * @param value Value to set.
   * @returns Instance.
   */
  public setMaskTile(value: CubismMaskTile): CubismMaskRenderer {
    this._maskTile = value.toVec4();
    return this;
  }

  /**
   * Sets CubismMaskTransform.
   * @param value Value to set.
   * @returns Instance.
   */
  public setMaskTransform(value: CubismMaskTransform): CubismMaskRenderer {
    this._maskTransform = value.toVec4();
    return this;
  }

  /**
   * Enqueues
   * @param buffer
   * @returns Buffer to enqueue in.
   */
  public addToCommandBuffer(buffer: CubismMaskCommandBuffer): void {
    // Lazily fetch drawable texture and mesh.
    const mainRenderer = this.mainRenderer;
    if (mainRenderer == null) {
      console.error('CubismMaskRenderer.addToCommandBuffer(): mainRenderer is null.');
      return;
    }
    let mainTexture = mainRenderer.mainTexture;
    let mesh = mainRenderer.mesh;
    if (mainTexture == null) {
      console.error('CubismMaskRenderer.addToCommandBuffer(): mainRenderer.mainTexture is null.');
      return;
    }
    if (mesh == null) {
      console.error('CubismMaskRenderer.addToCommandBuffer(): mainRenderer.mesh is null.');
      return;
    }

    if (mainRenderer.meshRenderer == null) {
      console.error('CubismMaskRenderer.addToCommandBuffer(): mainRenderer.meshRenderer is null.');
      return;
    }
    if (mainRenderer.meshRenderer.material == null) {
      console.error(
        'CubismMaskRenderer.addToCommandBuffer(): mainRenderer.meshRenderer.material is null.'
      );
      return;
    }
    console.assert(this.maskMaterial);

    const sym = CubismMaskCommandBuffer.metadataPropertySymbol;
    function findRenderer(renderers: MeshRenderer[]) {
      for (let i = 0; i < renderers.length; i++) {
        const meta: CubismMaskCommandBufferMetadata | undefined = Reflect.get(renderers[i], sym);
        if (meta && meta.cubismRenderer == mainRenderer) {
          return meta;
        }
      }
      return undefined;
    }
    if (!CubismMaskCommandBuffer.instance) {
      console.warn(`CubismMaskCommandBuffer.instance is null.`);
      return;
    }
    const maskRenderers = CubismMaskCommandBuffer.instance.getComponentsInChildren(MeshRenderer);
    let meta: CubismMaskCommandBufferMetadata | undefined = findRenderer(maskRenderers);
    if (!meta) {
      meta = new CubismMaskCommandBufferMetadata();
      const isCulling = !mainRenderer.node.getComponent(CubismDrawable)?.isDoubleSided;
      const node = new Node(mainRenderer.node.name);
      buffer.node.addChild(node);
      node.layer = userLayer19;
      meta.cubismRenderer = mainRenderer;
      meta.meshRenderer = node.addComponent(MeshRenderer);
      const maskMaterial = isCulling ? this.maskMaterial! : this.maskMaterial!;
      meta.meshRenderer.setMaterial(maskMaterial, 0);
      CubismMaskCommandBuffer.buffer.set(mainRenderer, meta.meshRenderer);
    }
    const maskRenderer = meta.meshRenderer!;
    const maskMaterial = maskRenderer.getMaterial(0);
    console.assert(maskMaterial);

    const material = new renderer.MaterialInstance({ parent: maskMaterial! });
    material.setProperty(CubismShaderVariables.mainTexture, mainTexture);
    material.setProperty(CubismShaderVariables.maskTile, this._maskTile);
    material.setProperty(CubismShaderVariables.maskTransform, this._maskTransform);
    maskRenderer.setMaterialInstance(material, 0);
    console.assert(maskRenderer);
    maskRenderer.mesh = mesh.createMesh();
    meta.enabled = true;
    Reflect.set(maskRenderer, sym, meta);
    maskRenderer.enabled = true;
  }
  // #endregion;
}
