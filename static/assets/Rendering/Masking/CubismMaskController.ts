/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Component, _decorator } from 'cc';
import ComponentExtensionMethods from '../../Core/ComponentExtensionMethods';
import CubismUpdateController from '../../Framework/CubismUpdateController';
import CubismUpdateExecutionOrder from '../../Framework/CubismUpdateExecutionOrder';
import ICubismUpdatable from '../../Framework/ICubismUpdatable';
import CubismRenderer from '../CubismRenderer';
import CubismMaskMaskedJunction from './CubismMaskMaskedJunction';
import CubismMaskRenderer from './CubismMaskRenderer';
import CubismMaskTexture from './CubismMaskTexture';
import type CubismDrawable from '../../Core/CubismDrawable';
import type CubismMaskTile from './CubismMaskTile';
import type ICubismMaskTextureCommandSource from './ICubismMaskTextureCommandSource';
import type CubismMaskCommandBuffer from './CubismMaskCommandBuffer';
const { ccclass, property, executeInEditMode } = _decorator;

// TODO: CubismDontMoveOnReimport
/** Controls rendering of Cubism masks. */
@ccclass('CubismMaskController')
@executeInEditMode
export default class CubismMaskController
  extends Component
  implements ICubismMaskTextureCommandSource, ICubismUpdatable
{
  /** MaskTexture backing field. */
  @property({ type: CubismMaskTexture, serializable: true, visible: false })
  private _maskTexture: CubismMaskTexture | null = null;

  /** Mask texture. */
  @property({ type: CubismMaskTexture, visible: true, readonly: true })
  public get maskTexture() {
    // Fall back to global mask texture.
    if (this._maskTexture == null) {
      this._maskTexture = CubismMaskTexture.globalMaskTexture;
    }
    return this._maskTexture;
  }
  public set maskTexture(value) {
    // Return early if same value given.
    if (value == this._maskTexture) {
      return;
    }
    this._maskTexture = value;
    // Try switch mask textures.
    this.onDestroy();
    this.start();
  }

  /** CubismMaskRenderers. */
  private _junctions: CubismMaskMaskedJunction[] | null = null;
  private get junctions() {
    return this._junctions;
  }
  private set junctions(value) {
    this._junctions = value;
  }

  /** True if controller is revived. */
  private get isRevived(): boolean {
    return this.junctions != null;
  }

  /** Model has update controller component. */
  @property({ serializable: true, visible: false })
  private _hasUpdateController: boolean = false;
  public get hasUpdateController() {
    return this._hasUpdateController;
  }
  public set hasUpdateController(value) {
    this._hasUpdateController = value;
  }

  /** Makes sure controller is initialized once. */
  private tryRevive(): void {
    if (this.isRevived) {
      return;
    }
    this.forceRevive();
  }

  /** Initializes Junctions. */
  private forceRevive(): void {
    const model = ComponentExtensionMethods.findCubismModel(this);
    if (model == null) {
      console.warn('ComponentExtensionMethods.findCubismModel() failed.');
      return;
    }
    const drawables = model.drawables;
    if (drawables == null) {
      console.warn('ComponentExtensionMethods.findCubismModel().drawables is null.');
      return;
    }
    // Find mask pairs.
    const pairs = new MasksMaskedsPairs();
    for (var i = 0; i < drawables.length; i++) {
      if (!drawables[i].isMasked) {
        continue;
      }
      // Make sure no leftover null-entries are added as mask.
      const masks = drawables[i].masks.filter((mask) => mask != null);
      if (masks.length == 0) {
        continue;
      }
      pairs.add(drawables[i], masks);
    }

    // Initialize junctions.
    this.junctions = new Array<CubismMaskMaskedJunction>(pairs.entries.length);
    for (var i = 0; i < this.junctions.length; ++i) {
      // Create mask renderers for junction.
      const masks = new Array<CubismMaskRenderer>(pairs.entries[i].masks.length);
      for (var j = 0; j < masks.length; ++j) {
        masks[j] = new CubismMaskRenderer().setMainRenderer(pairs.entries[i].masks[j]);
      }
      // Create junction.
      if (this.maskTexture == null) {
        console.warn('CubismMaskController.maskTexture is null.');
        return;
      }
      this.junctions[i] = new CubismMaskMaskedJunction()
        .setMasks(masks)
        .setMaskeds(pairs.entries[i].maskeds)
        .setMaskTexture(this.maskTexture);
    }
  }

  /** Called by cubism update controller. Order to invoke OnLateUpdate. */
  public get executionOrder(): number {
    return CubismUpdateExecutionOrder.CUBISM_MASK_CONTROLLER;
  }

  /** Called by cubism update controller. Needs to invoke OnLateUpdate on Editing. */
  public get needsUpdateOnEditing(): boolean {
    return true;
  }

  /** Called by cubism update controller. Updates {@link junctions}. */
  public onLateUpdate(): void {
    if (!this.enabled || !this.isRevived) {
      return;
    }
    if (this.junctions == null) {
      console.error('CubismMaskController.junctions is null.');
      return;
    }
    for (let i = 0; i < this.junctions.length; i++) {
      this.junctions[i].update();
    }
  }

  /** ICubismUpdatable Binded callback function. */
  public readonly bindedOnLateUpdate: ICubismUpdatable.CallbackFunction =
    this.onLateUpdate.bind(this);
  /** ICubismUpdatable metadata */
  public readonly [ICubismUpdatable.SYMBOL]: typeof ICubismUpdatable.SYMBOL =
    ICubismUpdatable.SYMBOL;

  // #region Cocos Creator Event Handling

  /** Initializes instance. */
  protected start(): void {
    // Fail silently.
    if (this.maskTexture == null) {
      return;
    }
    this.maskTexture.addSource(this);
    // Get cubism update controller.
    this.hasUpdateController = this.getComponent(CubismUpdateController) != null;
  }

  /** Called by Cocos Creator. */
  protected lateUpdate(): void {
    if (!this.hasUpdateController) {
      this.onLateUpdate();
    }
  }

  /** Finalizes instance. */
  protected onDestroy(): void {
    if (this.maskTexture == null) {
      return;
    }
    this.maskTexture.removeSource(this);
  }

  // #endregion

  // #region ICubismMaskDrawSource

  /**
   * Queries the number of tiles needed by the source.
   * @returns The necessary number of tiles needed.
   */
  public getNecessaryTileCount(): number {
    this.tryRevive();
    const junctions = this.junctions;
    if (junctions == null) {
      console.warn('CubismMaskController.junctions is null.');
      return 0;
    }
    return junctions.length;
  }

  /**
   * Assigns the tiles.
   * @param value Tiles to assign.
   */
  public setTiles(value: CubismMaskTile[]): void {
    const junctions = this.junctions;
    if (junctions == null) {
      console.error('CubismMaskController.junctions is null.');
      return;
    }
    for (let i = 0; i < junctions.length; i++) {
      junctions[i].setMaskTile(value[i]);
    }
  }

  /**
   * Called when source should instantly draw.
   * @param buffer
   */
  public addToCommandBuffer(buffer: CubismMaskCommandBuffer): void {
    const junctions = this.junctions;
    if (junctions == null) {
      console.error('CubismMaskController.junctions is null.');
      return;
    }
    for (let i = 0; i < junctions.length; i++) {
      junctions[i].addToCommandBuffer(buffer);
    }
  }
}

// #region Mask-Masked Pair

/** Pair of masks and masked drawables. (struct) */
export class MasksMaskedsPair {
  /** Mask drawables. */
  public masks: CubismRenderer[];
  /** Masked drawables. */
  public maskeds: CubismRenderer[];

  constructor(args: { masks?: CubismRenderer[]; maskeds?: CubismRenderer[] } = {}) {
    this.masks = args.masks ?? new Array(0);
    this.maskeds = args.maskeds ?? new Array(0);
  }
}

export class MasksMaskedsPairs {
  /** List of MasksMaskedsPair */
  public entries: MasksMaskedsPair[] = new Array<MasksMaskedsPair>();

  /**
   * Add MasksMaskedsPair to the list.
   * @param masked
   * @param masks
   * @returns
   */
  public add(masked: CubismDrawable, masks: CubismDrawable[]): void {
    // Try to add masked to existing mask compound.
    for (let i = 0; i < this.entries.length; i++) {
      let match = this.entries[i].masks.length == masks.length;
      if (!match) {
        continue;
      }
      for (let j = 0; j < this.entries[i].masks.length; j++) {
        if (this.entries[i].masks[j] != masks[j].getComponent(CubismRenderer)) {
          match = false;
          break;
        }
      }
      if (!match) {
        continue;
      }
      const renderer = masked.getComponent(CubismRenderer);
      if (renderer == null) {
        console.warn('masked.getComponent(CubismRenderer) failed.');
        return;
      }
      this.entries[i].maskeds.push(renderer);
      return;
    }
    // Create new pair.
    const renderers = new Array<CubismRenderer>(masks.length);
    for (let i = 0; i < masks.length; i++) {
      const renderer = masks[i].getComponent(CubismRenderer);
      if (renderer == null) {
        console.warn('masks[i].getComponent(CubismRenderer) failed.');
        return;
      }
      renderers[i] = renderer;
    }
    const renderer = masked.getComponent(CubismRenderer);
    if (renderer == null) {
      console.warn('masked.getComponent(CubismRenderer) failed.');
      return;
    }
    this.entries.push(new MasksMaskedsPair({ masks: renderers, maskeds: new Array(renderer) }));
  }
}

// #endregion
