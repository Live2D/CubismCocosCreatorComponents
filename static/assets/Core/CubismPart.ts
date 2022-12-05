/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, Component, Node, CCFloat } from 'cc';
import type { Model, Parts } from '../CubismCore';
import type CubismModel from './CubismModel';
const { ccclass, property } = _decorator;

// TODO: CubismDontMoveOnReimport
/**
 * Single CubismModel part.
 *
 * **Sealed class.**
 */
@ccclass('CubismPart')
export default class CubismPart extends Component {
  //#region Factory Methods

  /**
   * Creates parts for a {@link CubismModel}.
   * @param model Handle to unmanaged model.
   * @returns Parts root.
   */
  public static createParts(model: Model): Node {
    const _root = new Node('Parts');

    // Create parts.
    const _parts = model.parts;
    const _buffer = new Array<CubismPart>(_parts!.count);

    for (let i = 0; i < _buffer.length; ++i) {
      const _proxy = new Node();
      _buffer[i] = _proxy.addComponent(CubismPart);
      _root.addChild(_proxy);
      _buffer[i].reset(model, i);
    }
    return _root;
  }

  //#endregion

  /** Unmanaged parts from unmanaged model. */
  private unmanagedParts: Parts | null = null;

  /** {@link unmanagedIndex} backing field. */
  @property({ serializable: true, visible: false })
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
    return this.unmanagedParts?.ids[this.unmanagedIndex] ?? '';
  }

  /** Current opacity. */
  @property({ type: CCFloat, serializable: true, visible: false })
  public opacity: number = 0;

  /** Editor Only, For operation from inspector. */
  private _model: CubismModel | null = null;

  /** Editor Only, For operation from inspector. */
  @property({ type: CCFloat, visible: true, readonly: false })
  private set opacityInEditor(value: number) {
    if (this.opacity !== value) {
      this.opacity = value;
      this._model?.forceUpdateNow();
    }
  }

  /**
   * Revives instance.
   * @param model TaskableModel to unmanaged unmanagedModel.
   */
  public revive(model: Model): void {
    this.unmanagedParts = model.parts ?? null;
  }

  /**
   * Restores instance to initial state.
   * @param model TaskableModel to unmanaged unmanagedModel.
   * @param index Position in unmanaged arrays.
   */
  public reset(model: Model, index: number) {
    this.revive(model);
    this._unmanagedIndex = index;
    this.node.name = this.id;
    this.opacity = this.unmanagedParts!.opacities[index];
  }
}
