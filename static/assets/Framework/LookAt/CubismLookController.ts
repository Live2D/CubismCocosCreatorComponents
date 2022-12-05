/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Asset, CCFloat, CCObject, Component, Enum, math, Node, _decorator } from 'cc';
import CoreComponentExtensionMethods from '../../Core/ComponentExtensionMethods';
import CubismParameter from '../../Core/CubismParameter';
import { MathExtensions } from '../../Utils';
import ComponentExtensionMethods from '../ComponentExtensionMethods';
import CubismParameterBlendMode from '../CubismParameterBlendMode';
import CubismParameterExtensionMethods from '../CubismParameterExtensionMethods';
import CubismUpdateController from '../CubismUpdateController';
import CubismUpdateExecutionOrder from '../CubismUpdateExecutionOrder';
import ICubismUpdatable from '../ICubismUpdatable';
import ObjectExtensionMethods from '../ObjectExtensionMethods';
import CubismLookParameter from './CubismLookParameter';
import ICubismLookTarget from './ICubismLookTarget';
const { ccclass, property } = _decorator;
/**
 * Controls {@link CubismLookParameter}s.
 *
 * **Sealed class**
 */
@ccclass('CubismLookController')
export class CubismLookController extends Component implements ICubismUpdatable {
  /** Blend mode. */
  @property({ type: Enum(CubismParameterBlendMode), serializable: true, visible: true })
  public blendMode: CubismParameterBlendMode = CubismParameterBlendMode.Additive;

  /** {@link target} backing field. */
  @property({ type: CCObject, serializable: true, visible: false })
  private _target: ((Component | Asset) & ICubismLookTarget) | Node | null = null;

  /** Target. */
  @property({ type: CCObject, visible: true })
  public get target(): ((Component | Asset) & ICubismLookTarget) | Node | null {
    return this._target;
  }
  public set target(value: ((Component | Asset) & ICubismLookTarget) | Node | null) {
    this._target = ObjectExtensionMethods.toNullUnlessImplementsInterface(
      value,
      ICubismLookTarget.isImplements
    ) as ((Component | Asset) & ICubismLookTarget) | Node | null;
  }

  @property({ type: Component, visible: true })
  private get targetComponent(): (Component & ICubismLookTarget) | null {
    return this._target instanceof Component ? this._target : null;
  }
  private set targetComponent(value: (Component & ICubismLookTarget) | null) {
    this._target = ObjectExtensionMethods.toNullUnlessImplementsInterface(
      value,
      ICubismLookTarget.isImplements
    ) as (Component & ICubismLookTarget) | null;
  }

  @property({ type: Node, visible: true })
  private get targetNode(): Node | null {
    return Node.isNode(this._target) ? this._target : null;
  }
  private set targetNode(value: Node | null) {
    this._target = ObjectExtensionMethods.toNullUnlessImplementsInterface(
      value,
      ICubismLookTarget.isImplements
    ) as Node | null;
  }

  @property({ type: Asset, visible: true })
  private get targetAsset(): (Asset & ICubismLookTarget) | null {
    return this._target instanceof Asset ? this._target : null;
  }
  private set targetAsset(value: (Asset & ICubismLookTarget) | null) {
    this._target = ObjectExtensionMethods.toNullUnlessImplementsInterface(
      value,
      ICubismLookTarget.isImplements
    ) as (Asset & ICubismLookTarget) | null;
  }

  /** TargetInterface backing field. */
  private _targetInterface: ICubismLookTarget | null = null;

  /** Interface of target. */
  private get targetInterface(): ICubismLookTarget | null {
    if (this._targetInterface == null) {
      this._targetInterface =
        this.target == null
          ? null
          : (ObjectExtensionMethods.getInterface(
              this.target,
              ICubismLookTarget.isImplements
            ) as ICubismLookTarget | null);
    }
    return this._targetInterface;
  }

  /** Local center position. */
  @property({ type: Node, serializable: true, visible: true })
  public center: Node | null = null;

  /** Damping to apply. */
  @property({ type: CCFloat, serializable: true, visible: true })
  public damping: number = 0.15;

  private _sources: CubismLookParameter[] = new Array(0);
  /** Source parameters. */
  public get sources(): CubismLookParameter[] {
    return this._sources;
  }
  public set sources(value: CubismLookParameter[]) {
    this._sources = value;
  }

  private _destinations: (CubismParameter | null)[] = new Array(0);
  /** The actual parameters to apply the source values to. */
  public get destinations(): (CubismParameter | null)[] {
    return this._destinations;
  }
  public set destinations(value: (CubismParameter | null)[]) {
    this._destinations = value;
  }

  private _lastPosition: math.Vec3 = math.Vec3.ZERO.clone();
  /** Position at last frame. */
  public get lastPosition(): math.Vec3 {
    return this._lastPosition;
  }
  public set lastPosition(value: math.Vec3) {
    this._lastPosition = value;
  }

  /** Goal position. */
  private _goalPosition: math.Vec3 = math.Vec3.ZERO.clone();
  public get goalPosition(): math.Vec3 {
    return this._goalPosition;
  }
  public set goalPosition(value: math.Vec3) {
    this._goalPosition = value;
  }

  /** Buffer for Mathf.SmoothDamp(float, float, ref float, float) velocity. */
  private velocityBuffer: math.Vec3 = math.Vec3.ZERO.clone();

  @property({ serializable: true, visible: false })
  private _hasUpdateController: boolean = false;
  /** Model has update controller component. */
  public get hasUpdateController(): boolean {
    return this._hasUpdateController;
  }
  public set hasUpdateController(value: boolean) {
    this._hasUpdateController = value;
  }

  /** Refreshes the controller. Call this method after adding and/or removing {@link CubismLookParameter}s. */
  public refresh(): void {
    const model = CoreComponentExtensionMethods.findCubismModel(this);
    if (model == null) {
      return;
    }
    if (model.parameters == null) {
      return;
    }

    // Catch sources and destinations.

    this.sources = ComponentExtensionMethods.getComponentsMany(
      model.parameters,
      CubismLookParameter
    );
    this.destinations = new Array<CubismParameter>(this.sources.length);

    for (let i = 0; i < this.sources.length; i++) {
      this.destinations[i] = this.sources[i].getComponent(CubismParameter);
    }

    // Get cubism update controller.
    this.hasUpdateController = this.getComponent(CubismUpdateController) != null;
  }

  /** Called by cubism update controller. Order to invoke OnLateUpdate. */
  public get executionOrder(): number {
    return CubismUpdateExecutionOrder.CUBISM_LOOK_CONTROLLER;
  }

  /** Called by cubism update controller. Needs to invoke OnLateUpdate on Editing. */
  public get needsUpdateOnEditing(): boolean {
    return false;
  }

  /** Called by cubism update controller. Updates controller. */
  public onLateUpdate(): void {
    // Return if it is not valid or there's nothing to update.
    if (!this.enabled || this.destinations == null) {
      return;
    }

    // Return early if no target is available or if target is inactive.
    const target = this.targetInterface;

    if (target == null || !target.isActive()) {
      return;
    }
    if (this.center == null) {
      return;
    }

    // Update position.
    let position = this.lastPosition;

    const inverseTransformPoint = this.node.inverseTransformPoint(
      new math.Vec3(),
      target.getPosition()
    );
    this.goalPosition = math.Vec3.subtract(
      new math.Vec3(),
      inverseTransformPoint,
      this.center.position
    );
    if (position != this.goalPosition) {
      const temp = MathExtensions.Vec3.smoothDamp(
        position,
        this.goalPosition,
        this.velocityBuffer,
        this.damping
      );
      position = temp[0];
      this.velocityBuffer = temp[1];
    }

    // Update sources and destinations.
    for (let i = 0; i < this.destinations.length; i++) {
      CubismParameterExtensionMethods.blendToValue(
        this.destinations[i],
        this.blendMode,
        this.sources[i].tickAndEvaluate(position)
      );
    }

    // Store position.
    this.lastPosition = position;
  }

  //#region Cocos Creator Events Handling

  /** Called by Cocos Creator. Makes sure cache is initialized. */
  protected start(): void {
    // Default center if necessary.
    if (this.center == null) {
      this.center = this.node;
    }

    // Initialize cache.
    this.refresh();
  }

  /** Called by Cocos Creator. Updates controller. */
  protected lateUpdate(): void {
    if (!this.hasUpdateController) {
      this.onLateUpdate();
    }
  }

  //#endregion

  public readonly bindedOnLateUpdate: ICubismUpdatable.CallbackFunction =
    this.onLateUpdate.bind(this);
  public readonly [ICubismUpdatable.SYMBOL]: typeof ICubismUpdatable.SYMBOL =
    ICubismUpdatable.SYMBOL;
}
