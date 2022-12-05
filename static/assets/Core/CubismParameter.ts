/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, Component, Node, CCFloat } from 'cc';
import type { Model, Parameters } from '../CubismCore';
import type CubismModel from './CubismModel';
const { ccclass, property, executeInEditMode } = _decorator;

// TODO: CubismDontMoveOnReimport
/**
 * Single {@link CubismModel} parameter.
 *
 * **Sealed class**
 */
@ccclass('CubismParameter')
@executeInEditMode
export default class CubismParameter extends Component {
  //#region Factory Methods

  /**
   * Creates drawables for a {@link CubismModel}.
   * @param model Handle to unmanaged model.
   * @returns Drawables root.
   */
  public static createParameters(model: Model): Node {
    const root = new Node('Parameters');

    // Create parameters.
    const parameters = model.parameters;
    const buffer = new Array<CubismParameter | null>(parameters!.count);

    for (let i = 0; i < buffer.length; i++) {
      const proxy = new Node();
      buffer[i] = proxy.addComponent(CubismParameter);
      root.addChild(proxy);
      buffer[i]!.reset(model, i);
    }
    return root;
  }

  //#endregion

  private _unmanagedParameters: Parameters | null = null;
  /** Unmanaged parameters from unmanaged model. */
  private get unmanagedParameters(): Parameters | null {
    return this._unmanagedParameters;
  }
  private set unmanagedParameters(value: Parameters | null) {
    this._unmanagedParameters = value;
  }

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
    return this.unmanagedParameters?.ids[this.unmanagedIndex] ?? '';
  }

  /** Minimum value. */
  get minimumValue(): number {
    return this.unmanagedParameters?.minimumValues[this.unmanagedIndex] ?? 0;
  }

  /** Maximum value. */
  get maximumValue(): number {
    return this.unmanagedParameters?.maximumValues[this.unmanagedIndex] ?? 0;
  }

  /** Default value. */
  get defaultValue(): number {
    return this.unmanagedParameters?.defaultValues[this.unmanagedIndex] ?? 0;
  }

  /** Current value. */
  @property({ type: CCFloat, serializable: true, visible: true, readonly: false })
  public value: number = 0;

  /** Editor Only, For operation from inspector. */
  private _model: CubismModel | null = null;

  /** Editor Only, For operation from inspector. */
  @property({ type: CCFloat, visible: true, readonly: false })
  private set valueInEditor(value: number) {
    if (this.value !== value) {
      this.value = value;
      this._model?.forceUpdateNow();
    }
  }

  /**
   * Revives the instance.
   * @param model Handle to unmanaged model.
   */
  public revive(model: Model): void {
    this.unmanagedParameters = model.parameters ?? null;
  }

  /**
   * Restores instance to initial state.
   * @param model Handle to unmanaged model.
   * @param index Position in unmanaged arrays.
   */
  private reset(model: Model, index: number): void {
    this.revive(model);
    this.unmanagedIndex = index;
    this.node.name = this.id;
    this.value = this.defaultValue;
  }
}
