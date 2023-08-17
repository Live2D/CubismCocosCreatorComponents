/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import {
  _decorator,
  CCFloat,
  CCInteger,
  Enum,
  CCObject,
  Camera,
  math,
  Node,
  Component,
  Asset,
} from 'cc';
import CubismRenderer, { CubismRendererInEditorSymbols as InEditorSymbols } from './CubismRenderer';
import CubismSortingMode from './CubismSortingMode';
import CubismUpdateExecutionOrder from '../Framework/CubismUpdateExecutionOrder';
import CubismUpdateController from '../Framework/CubismUpdateController';
import ObjectExtensionMethods from '../Framework/ObjectExtensionMethods';
import ICubismUpdatable from '../Framework/ICubismUpdatable';
import CoreComponentExtensionMethods from '../Core/ComponentExtensionMethods';
import FrameworkComponentExtensionMethods from '../Framework/ComponentExtensionMethods';
import ICubismDrawOrderHandler from './ICubismDrawOrderHandler';
import ICubismOpacityHandler from './ICubismOpacityHandler';
import ICubismBlendColorHandler from './ICubismBlendColorHandler';
import type CubismModel from '../Core/CubismModel';
import type CubismDynamicDrawableData from '../Core/CubismDynamicDrawableData';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('CubismRenderController')
@executeInEditMode
export default class CubismRenderController extends Component implements ICubismUpdatable {
  //#region Opacity
  /**
   * Model opacity.
   *
   * This is turned into a field to be available to AnimationClips...
   */
  @property({ type: CCFloat, serializable: true, visible: true })
  public opacity: number = 1;
  //#endregion

  //#region LastOpacity
  /** {@link lastOpacity} backing field. */
  @property({ type: CCFloat, serializable: true, visible: true })
  private _lastOpacity: number = 0;
  /** Last model opacity. */
  public get lastOpacity() {
    return this._lastOpacity;
  }
  public set lastOpacity(value) {
    this._lastOpacity = value;
  }
  //#endregion

  //#region OverwriteFlagForModelMultiplyColors
  /** {@link overwriteFlagForModelMultiplyColors} backing field. */
  @property({ serializable: true, visible: false })
  private _isOverwrittenModelMultiplyColors: boolean = false;
  /** Whether to overwrite with multiply color from the model. */
  public get overwriteFlagForModelMultiplyColors(): boolean {
    return this._isOverwrittenModelMultiplyColors;
  }
  public set overwriteFlagForModelMultiplyColors(value: boolean) {
    this._isOverwrittenModelMultiplyColors = value;
  }
  //#endregion

  //#region OverwriteFlagForModelScreenColors
  /** {@link overwriteFlagForModelScreenColors} backing field. */
  @property({ serializable: true, visible: false })
  private _isOverwrittenModelScreenColors: boolean = false;
  /** Whether to overwrite with screen color from the model. */
  public get overwriteFlagForModelScreenColors(): boolean {
    return this._isOverwrittenModelScreenColors;
  }
  public set overwriteFlagForModelScreenColors(value: boolean) {
    this._isOverwrittenModelScreenColors = value;
  }
  //#endregion

  //#region ModelMultiplyColor
  /** {@link modelMultiplyColor} backing field. */
  @property({ serializable: true, visible: false })
  private _modelMultiplyColor: Readonly<math.Color> = math.Color.WHITE.clone();
  // Multiply colors used throughout the model.
  public get modelMultiplyColor(): Readonly<math.Color> {
    return this._modelMultiplyColor;
  }
  public set modelMultiplyColor(value: Readonly<math.Color>) {
    this._modelMultiplyColor = value;
  }
  //#endregion

  //#region ModelScreenColor
  /** {@link modelScreenColor} backing field. */
  @property({ serializable: true, visible: false })
  private _modelScreenColor: Readonly<math.Color> = new math.Color(0, 0, 0, 0);
  public get modelScreenColor(): Readonly<math.Color> {
    return this._modelScreenColor;
  }
  public set modelScreenColor(value: Readonly<math.Color>) {
    this._modelScreenColor = value;
  }
  //#endregion

  //#region SortingLayer
  public get sortingLayer(): string {
    throw new Error('Method not implemented.');
    // return UnityEngine.SortingLayer.IDToName(this.sortingLayerId);
    return '';
  }
  public set sortingLayer(value) {
    throw new Error('Method not implemented.');
    // this.sortingLayerId = UnityEngine.SortingLayer.NameToID(value);
  }
  //#endregion

  //#region SortingLayerId
  /** {@link sortingLayerId} backing field. */
  @property({ type: CCInteger, serializable: true, visible: true })
  private _sortingLayerId: number = 0;
  /** Sorting layer Id. */
  public get sortingLayerId(): number {
    return this._sortingLayerId;
  }
  public set sortingLayerId(value) {
    if (value == this._sortingLayerId) {
      return;
    }

    this._sortingLayerId = value;

    // Apply sorting layer.
    const renderers = this.renderers;
    if (renderers == null) {
      console.error('CubismRenderController.renderers is null.');
      return;
    }

    for (let i = 0; i < renderers.length; i++) {
      renderers[i].onControllerSortingLayerDidChange(this._sortingLayerId);
    }
  }
  //#endregion

  //#region SortingMode
  /** {@link sortingMode} backing field. */
  @property({ type: Enum(CubismSortingMode), serializable: true, visible: false })
  private _sortingMode: CubismSortingMode = CubismSortingMode.backToFrontZ;

  /** CubismDrawable sorting. */
  @property({ type: Enum(CubismSortingMode), visible: true })
  public get sortingMode(): CubismSortingMode {
    return this._sortingMode;
  }
  public set sortingMode(value) {
    // Return early if same value given.
    if (value == this._sortingMode) {
      return;
    }

    this._sortingMode = value;

    // Flip sorting.
    const renderers = this.renderers;
    if (renderers == null) {
      console.warn('CubismRenderController.renderers is null.');
      return;
    }

    if (!EDITOR) {
      for (let i = 0; i < renderers.length; i++) {
        renderers[i].onControllerSortingModeDidChange(this._sortingMode);
      }
    } else {
      for (let i = 0; i < renderers.length; i++) {
        console.assert(renderers[i][InEditorSymbols.onControllerSortingModeDidChange] != null);
        renderers[i][InEditorSymbols.onControllerSortingModeDidChange](this._sortingOrder);
      }
    }
  }
  //#endregion

  //#region SortingOrder
  /** {@link sortingOrder} backing field. */
  @property({ type: CCInteger, serializable: true, visible: true })
  private _sortingOrder: number = 0;

  /** Order in sorting layer. */
  @property({ type: CCInteger, visible: false, readonly: false })
  public get sortingOrder(): number {
    return this._sortingOrder;
  }
  public set sortingOrder(value: number) {
    // Return early in case same value given.
    if (value == this._sortingOrder) {
      return;
    }

    this._sortingOrder = value;

    // Apply new sorting order.
    const renderers = this.renderers;
    if (renderers == null) {
      console.error('CubismRenderController.renderers is null.');
      return;
    }

    if (!EDITOR) {
      for (let i = 0; i < renderers.length; i++) {
        renderers[i].onControllerSortingOrderDidChange(this._sortingOrder);
      }
    } else {
      for (let i = 0; i < renderers.length; i++) {
        console.assert(renderers[i][InEditorSymbols.onControllerSortingOrderDidChange] != null);
        renderers[i][InEditorSymbols.onControllerSortingOrderDidChange](this._sortingOrder);
      }
    }
  }
  //#endregion

  //#region CameraToFace
  /** [Optional] Camera to face. */
  @property({ type: Camera, serializable: true, visible: true })
  public cameraToFace: Camera | null = null;
  //#endregion

  //#region DrawOrderHandler
  /** {@link drawOrderHandler} backing field. */
  @property({ type: CCObject, serializable: true, visible: false })
  private _drawOrderHandler: Node | ((Component | Asset) & ICubismOpacityHandler) | null = null;

  /** Draw order handler proxy object. */
  @property({ type: CCObject, visible: false })
  public get drawOrderHandler(): Node | ((Component | Asset) & ICubismOpacityHandler) | null {
    return this._drawOrderHandler;
  }
  public set drawOrderHandler(value: Node | ((Component | Asset) & ICubismOpacityHandler) | null) {
    this._drawOrderHandler = ObjectExtensionMethods.toNullUnlessImplementsInterface(
      value,
      ICubismDrawOrderHandler.isImplements
    ) as Node | ((Component | Asset) & ICubismOpacityHandler) | null;
  }
  //#endregion

  //#region DrawOrderHandlerInterface
  /** {@link drawOrderHandlerInterface} backing field. */
  @property({ serializable: false, visible: false })
  private _drawOrderHandlerInterface: ICubismDrawOrderHandler | null = null;

  /** Listener for draw order changes. */
  private get drawOrderHandlerInterface(): ICubismDrawOrderHandler | null {
    if (this._drawOrderHandlerInterface == null) {
      if (this.drawOrderHandler == null) {
        return null;
      }
      this._drawOrderHandlerInterface = ObjectExtensionMethods.getInterface(
        this.drawOrderHandler,
        ICubismDrawOrderHandler.isImplements
      ) as ICubismDrawOrderHandler;
    }
    return this._drawOrderHandlerInterface;
  }
  //#endregion

  //#region OpacityHandler
  /** {@link opacityHandler} backing field. */
  @property({ type: CCObject, serializable: true, visible: false })
  private _opacityHandler: Node | ((Component | Asset) & ICubismOpacityHandler) | null = null;

  /** Opacity handler proxy object. */
  @property({ type: CCObject, visible: false })
  public get opacityHandler(): Node | ((Component | Asset) & ICubismOpacityHandler) | null {
    return this._opacityHandler;
  }
  public set opacityHandler(value: Node | ((Component | Asset) & ICubismOpacityHandler) | null) {
    this._opacityHandler = ObjectExtensionMethods.toNullUnlessImplementsInterface(
      value,
      ICubismOpacityHandler.isImplements
    ) as Node | ((Component | Asset) & ICubismOpacityHandler) | null;
  }
  //#endregion

  //#region OpacityHandlerInterface
  /** {@link opacityHandlerInterface} backing field. */
  @property({ serializable: false, visible: false })
  private _opacityHandlerInterface: ICubismOpacityHandler | null = null;

  /** Listener for opacity changes. */
  private get opacityHandlerInterface(): ICubismOpacityHandler | null {
    if (this._opacityHandlerInterface == null) {
      if (this.opacityHandler == null) {
        return null;
      }
      this._opacityHandlerInterface = ObjectExtensionMethods.getInterface(
        this.opacityHandler,
        ICubismOpacityHandler.isImplements
      ) as ICubismOpacityHandler;
    }
    return this._opacityHandlerInterface;
  }
  //#endregion

  //#region MultiplyColorHandler
  /** {@link multiplyColorHandler} backing field. */
  @property({ type: CCObject, visible: false })
  private _multiplyColorHandler: Node | ((Component | Asset) & ICubismBlendColorHandler) | null =
    null;
  public get multiplyColorHandler():
    | Node
    | ((Component | Asset) & ICubismBlendColorHandler)
    | null {
    return this._multiplyColorHandler;
  }
  public set multiplyColorHandler(
    value: Node | ((Component | Asset) & ICubismBlendColorHandler) | null
  ) {
    this._multiplyColorHandler = value;
  }
  //#endregion

  //#region MultiplyColorHandlerInterface
  /** {@link multiplyColorHandlerInterface} backing field. */
  @property({ serializable: false, visible: false })
  private _multiplyColorHandlerInterface: ICubismBlendColorHandler | null = null;

  /** Listener for blend color changes. */
  private get multiplyColorHandlerInterface(): ICubismBlendColorHandler | null {
    if (this._multiplyColorHandlerInterface == null) {
      if (this.multiplyColorHandler == null) {
        return null;
      }
      this._multiplyColorHandlerInterface = ObjectExtensionMethods.getInterface(
        this.multiplyColorHandler,
        ICubismBlendColorHandler.isImplements
      );
    }
    return this._multiplyColorHandlerInterface;
  }
  //#endregion

  //#region ScreenColorHandler
  /** {@link screenColorHandler} backing field. */
  @property({ type: CCObject, visible: false })
  private _screenColorHandler: Node | ((Component | Asset) & ICubismBlendColorHandler) | null =
    null;
  public get screenColorHandler(): Node | ((Component | Asset) & ICubismBlendColorHandler) | null {
    return this._screenColorHandler;
  }
  public set screenColorHandler(
    value: Node | ((Component | Asset) & ICubismBlendColorHandler) | null
  ) {
    this._screenColorHandler = value;
  }
  //#endregion

  //#region ScreenColorHandlerInterface
  /** {@link screenColorHandlerInterface} backing field. */
  @property({ serializable: false, visible: false })
  private _screenColorHandlerInterface: ICubismBlendColorHandler | null = null;

  /** Listener for blend color changes. */
  private get screenColorHandlerInterface(): ICubismBlendColorHandler | null {
    if (this._screenColorHandlerInterface == null) {
      if (this.screenColorHandler == null) {
        return null;
      }
      this._screenColorHandlerInterface = ObjectExtensionMethods.getInterface(
        this.screenColorHandler,
        ICubismBlendColorHandler.isImplements
      );
    }
    return this._screenColorHandlerInterface;
  }
  //#endregion

  //#region DepthOffset
  /**
   * The value to offset the CubismDrawables by.
   *
   * You only need to adjust this value when using perspective cameras.
   */
  @property({ type: CCFloat, serializable: true, visible: true })
  private _depthOffset: number = 0.00001;

  /** Depth offset used when sorting by depth. */
  @property({ type: CCFloat, visible: false })
  public get depthOffset(): number {
    return this._depthOffset;
  }
  public set depthOffset(value: number) {
    // Return if same value given.
    if (Math.abs(value - this._depthOffset) < math.EPSILON) {
      return;
    }

    // Store value.
    this._depthOffset = value;

    // Apply it.
    const renderers = this.renderers;
    if (renderers == null) {
      console.error('CubismRenderController.renderers is null.');
      return;
    }

    if (!EDITOR) {
      for (let i = 0; i < renderers.length; i++) {
        renderers[i].onControllerDepthOffsetDidChange(this._depthOffset);
      }
    } else {
      for (let i = 0; i < renderers.length; i++) {
        console.assert(renderers[i][InEditorSymbols.onControllerDepthOffsetDidChange] != null);
        renderers[i][InEditorSymbols.onControllerDepthOffsetDidChange](this._depthOffset);
      }
    }
  }
  //#endregion

  //#region Model
  /** Model the controller belongs to. */
  private get model(): CubismModel | null {
    return CoreComponentExtensionMethods.findCubismModel(this);
  }
  //#endregion

  //#region DrawablesRootTransform
  /** DrawablesRootTransform backing field. */
  private _drawablesRootTransform: Node | null = null;

  /** Root transform of all CubismDrawables of the model. */
  private get drawablesRootTransform(): Node | null {
    if (this._drawablesRootTransform == null) {
      const drawables = this.model?.drawables;
      if (drawables != null && drawables.length > 0) {
        this._drawablesRootTransform = drawables[0].node.parent;
      }
    }
    return this._drawablesRootTransform;
  }
  //#endregion

  //#region Renderers
  /** Renderers backing field. */
  @property({ serializable: false, visible: false })
  private _renderers: Array<CubismRenderer> | null = null;

  /** CubismRenderers */
  public get renderers(): Array<CubismRenderer> | null {
    if (this._renderers == null) {
      console.assert(this.model);
      console.assert(this.model!.drawables);
      const drawables = this.model!.drawables!;
      this._renderers = FrameworkComponentExtensionMethods.getComponentsMany(
        drawables,
        CubismRenderer
      );
    }
    return this._renderers;
  }
  private set renderers(value: Array<CubismRenderer> | null) {
    this._renderers = value;
  }
  //#endregion

  //#region HasUpdateController
  @property({ serializable: false, visible: true })
  private _hasUpdateController: boolean = false;
  /** Model has update controller component. */
  public get hasUpdateController() {
    return this._hasUpdateController;
  }
  public set hasUpdateController(value) {
    this._hasUpdateController = value;
  }
  //#endregion

  /** Makes sure all CubismDrawables have CubismRenderers attached to them. */
  private tryInitializeRenderers(): void {
    // Try get renderers.
    let renderers = this.renderers;

    // Create renderers if necesssary.
    if (renderers == null || renderers.length == 0) {
      // Create renders and apply it to backing field...
      const drawables = CoreComponentExtensionMethods.findCubismModel(this)?.drawables ?? null;
      if (drawables == null) {
        return;
      }
      renderers = FrameworkComponentExtensionMethods.addComponentEach(drawables, CubismRenderer);

      // Store renderers.
      this.renderers = renderers;
    }

    // Make sure renderers are initialized.
    for (var i = 0; i < renderers.length; i++) {
      renderers[i].tryInitialize(this);
    }

    // Initialize sorting layer.
    // We set the backing field here directly because we pull the sorting layer directly from the renderer.
    // TODO: MeshRenderer.sortingLayerID 実装待ち
    // this._sortingLayerId = _renderers[0].meshRenderer.sortingLayerID;
  }

  /** Updates opacity if necessary. */
  private updateOpacity(): void {
    // Return if same value given.
    if (Math.abs(this.opacity - this.lastOpacity) < math.EPSILON) {
      return;
    }

    // Store value.
    this.opacity = math.clamp01(this.opacity);
    this.lastOpacity = this.opacity;

    // Apply opacity.
    const applyOpacityToRenderers =
      this.opacityHandlerInterface == null || this.opacity > 1 - math.EPSILON;

    if (applyOpacityToRenderers) {
      console.assert(this.renderers != null, 'renderers is null.');
      const renderers = this.renderers!;
      for (let i = 0; i < renderers.length; i++) {
        renderers[i].onModelOpacityDidChange(this.opacity);
      }
    }

    // Call handler.
    if (this.opacityHandlerInterface != null) {
      this.opacityHandlerInterface.onOpacityDidChange(this, this.opacity);
    }
  }

  /** Updates Blend Colors if necessary. */
  private updateBlendColors(): void {
    if (this.renderers == null) {
      return;
    }

    let isMultiplyColorUpdated = false;
    let isScreenColorUpdated = false;
    const newMultiplyColors = new Array<math.Color>(this.renderers.length);
    const newScreenColors = new Array<math.Color>(this.renderers.length);

    for (let i = 0; i < this.renderers.length; i++) {
      const isUseUserMultiplyColor =
        this.renderers[i].overwriteFlagForDrawableMultiplyColors ||
        this.overwriteFlagForModelMultiplyColors;

      if (isUseUserMultiplyColor) {
        // If you switch from a setting that uses the color of the model, revert to the color that was retained.
        if (!this.renderers[i].lastIsUseUserMultiplyColor) {
          this.renderers[i].multiplyColor = this.renderers[i].lastMultiplyColor;
          this.renderers[i].applyMultiplyColor();
          isMultiplyColorUpdated = true;
        } else if (this.renderers[i].lastMultiplyColor != this.renderers[i].multiplyColor) {
          this.renderers[i].applyMultiplyColor();
          isMultiplyColorUpdated = true;
        }

        this.renderers[i].lastMultiplyColor = this.renderers[i].multiplyColor;
      } else if (this.renderers[i].lastIsUseUserMultiplyColor) {
        this.renderers[i].multiplyColor = this.renderers[i].lastMultiplyColor;
        this.renderers[i].applyMultiplyColor();
        isMultiplyColorUpdated = true;
      }

      newMultiplyColors[i] = this.renderers[i].multiplyColor;
      this.renderers[i].lastIsUseUserMultiplyColor = isUseUserMultiplyColor;

      const isUseUserScreenColor =
        this.renderers[i].overwriteFlagForDrawableScreenColor ||
        this.overwriteFlagForModelScreenColors;

      if (isUseUserScreenColor) {
        // If you switch from a setting that uses the color of the model, revert to the color that was retained.
        if (!this.renderers[i].lastIsUseUserScreenColor) {
          this.renderers[i].screenColor = this.renderers[i].lastScreenColor;
          this.renderers[i].applyScreenColor();
          isScreenColorUpdated = true;
        } else if (this.renderers[i].lastScreenColor != this.renderers[i].screenColor) {
          this.renderers[i].applyScreenColor();
          isScreenColorUpdated = true;
        }

        this.renderers[i].lastScreenColor = this.renderers[i].screenColor;
      } else if (this.renderers[i].lastIsUseUserScreenColor) {
        this.renderers[i].screenColor = this.renderers[i].lastScreenColor;
        this.renderers[i].applyScreenColor();
        isScreenColorUpdated = true;
      }

      newScreenColors[i] = this.renderers[i].screenColor;
      this.renderers[i].lastIsUseUserScreenColor = isUseUserScreenColor;
    }

    if (this.multiplyColorHandler != null && isMultiplyColorUpdated) {
      this.multiplyColorHandlerInterface?.onBlendColorDidChange(this, newMultiplyColors);
    }

    if (this.screenColorHandler != null && isScreenColorUpdated) {
      this.screenColorHandlerInterface?.onBlendColorDidChange(this, newScreenColors);
    }
  }

  /** Called by cubism update controller. Order to invoke OnLateUpdate. */
  public get executionOrder() {
    return CubismUpdateExecutionOrder.CUBISM_RENDER_CONTROLLER;
  }

  /** Called by cubism update controller. Needs to invoke OnLateUpdate on Editing. */
  public get needsUpdateOnEditing(): boolean {
    return true;
  }

  /** Called by cubism update controller. Applies billboarding. */
  public onLateUpdate(): void {
    // Fail silently...
    if (!this.enabled) {
      return;
    }

    // Update opacity if necessary.
    this.updateOpacity();

    // Updates Blend Colors if necessary.
    this.updateBlendColors();

    // Return early in case no camera is to be faced.
    if (this.cameraToFace == null) {
      return;
    }

    const cameraRot = this.cameraToFace.node.getWorldRotation();
    if (EDITOR) {
      const drawRot = this.drawablesRootTransform?.getWorldRotation();
      if (drawRot != null && cameraRot.equals(drawRot)) {
        return;
      }
    }

    // Face camera.
    if (this.drawablesRootTransform != null) {
      this.drawablesRootTransform.setWorldRotation(cameraRot);
    }
  }

  //#region bindedOnLateUpdate
  /** ICubismUpdatable Binded callback function. */
  public readonly bindedOnLateUpdate: ICubismUpdatable.CallbackFunction =
    this.onLateUpdate.bind(this);
  /** ICubismUpdatable metadata */
  public readonly [ICubismUpdatable.SYMBOL]: typeof ICubismUpdatable.SYMBOL =
    ICubismUpdatable.SYMBOL;
  //#endregion

  // #region Cocos Creator Event Handling
  /** Called by Cocos Creator. */
  protected start(): void {
    // Get cubism update controller.
    this.hasUpdateController = this.getComponent(CubismUpdateController) != null;
  }

  /** Called by Cocos Creator. Enables listening to render data updates. */
  protected onEnable(): void {
    // Fail silently.
    if (this.model == null) {
      return;
    }

    // Make sure renderers are available.
    this.tryInitializeRenderers();

    // Register listener.
    this.model.onDynamicDrawableData.add(this.bindedOnDynamicDrawableDataFunc);
  }

  /** Called by Cocos Creator. Disables listening to render data updates. */
  protected onDisable() {
    // Fail silently.
    if (this.model == null) {
      return;
    }

    // Deregister listener.
    this.model.onDynamicDrawableData.remove(this.bindedOnDynamicDrawableDataFunc);
  }
  // #endregion

  // #region Cubism Event Handling

  /** Called by Cocos Creator. */
  protected lateUpdate(deltaTime: number): void {
    if (!this.hasUpdateController) {
      this.onLateUpdate();
    }
  }

  /**
   * Called whenever new render data is available.
   * @param sender Model with new render data.
   * @param data New render data.
   */
  private onDynamicDrawableData(sender: CubismModel, data: Array<CubismDynamicDrawableData>): void {
    // Get drawables.
    const drawables = sender.drawables;
    const renderers = this.renderers;

    if (drawables == null) {
      console.error('sender.drawables is null.');
      return;
    }
    if (renderers == null) {
      console.error('renderers is null.');
      return;
    }

    // Handle render data changes.
    for (let i = 0; i < data.length; i++) {
      // Controls whether mesh buffers are to be swapped.
      let swapMeshes = false;

      // Update visibility if last SwapInfo flag is true.
      renderers[i].updateVisibility();

      // Update render order if last SwapInfo flags is true.
      renderers[i].updateRenderOrder();

      // Skip completely non-dirty data.
      if (!data[i].isAnyDirty) {
        continue;
      }

      // Update visibility.
      if (data[i].isVisibilityDirty) {
        renderers[i].onDrawableVisiblityDidChange(data[i].isVisible);

        swapMeshes = true;
      }

      // Update render order.
      if (data[i].isRenderOrderDirty) {
        renderers[i].onDrawableRenderOrderDidChange(data[i].renderOrder);

        swapMeshes = true;
      }

      // Update opacity.
      if (data[i].isOpacityDirty) {
        renderers[i].onDrawableOpacityDidChange(data[i].opacity);

        swapMeshes = true;
      }

      // Update vertex positions.
      if (data[i].areVertexPositionsDirty) {
        renderers[i].onDrawableVertexPositionsDidChange(data[i].vertexPositions);

        swapMeshes = true;
      }

      // Swap buffers if necessary.
      // [INV] Swapping only half of the meshes might improve performance even. Would that be visually feasible?
      if (swapMeshes) {
        renderers[i].swapMeshes();
      }
    }

    // Pass draw order changes to handler (if available).
    let drawOrderHandler = this.drawOrderHandlerInterface;

    if (drawOrderHandler != null) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].isDrawOrderDirty) {
          drawOrderHandler.onDrawOrderDidChange(this, drawables[i], data[i].drawOrder);
        }
      }
    }

    let isMultiplyColorUpdated = false;
    let isScreenColorUpdated = false;
    const newMultiplyColors = new Array<math.Color>(renderers.length);
    const newScreenColors = new Array<math.Color>(renderers.length);

    for (let i = 0; i < data.length; i++) {
      const isUseModelMultiplyColor = !(
        renderers[i].overwriteFlagForDrawableMultiplyColors ||
        this.overwriteFlagForModelMultiplyColors
      );

      // Skip processing when not using model colors.
      if (data[i].isBlendColorDirty && isUseModelMultiplyColor) {
        renderers[i].applyMultiplyColor();
        isMultiplyColorUpdated = true;
      }

      newMultiplyColors[i] = renderers[i].multiplyColor;
    }

    for (let i = 0; i < data.length; i++) {
      const isUseModelScreenColor = !(
        renderers[i].overwriteFlagForDrawableScreenColor || this.overwriteFlagForModelScreenColors
      );

      // Skip processing when not using model colors.
      if (data[i].isBlendColorDirty && isUseModelScreenColor) {
        renderers[i].applyScreenColor();
        isScreenColorUpdated = true;
      }

      newScreenColors[i] = renderers[i].screenColor;
    }

    // Pass blend color changes to handler (if available).
    const multiplyColorHandlerInterface = this.multiplyColorHandlerInterface;
    const screenColorHandlerInterface = this.screenColorHandlerInterface;

    if (this.multiplyColorHandler != null && isMultiplyColorUpdated) {
      multiplyColorHandlerInterface?.onBlendColorDidChange(this, newMultiplyColors);
    }

    if (this.screenColorHandler != null && isScreenColorUpdated) {
      screenColorHandlerInterface?.onBlendColorDidChange(this, newScreenColors);
    }
  }

  // #endregion

  /**
   *
   * @param sender
   * @param data
   */
  protected bindedOnDynamicDrawableDataFunc = this.onDynamicDrawableData.bind(this);

  //#region Editor Inspector Only

  @property({ type: Component })
  private get opacityHandlerComponent(): (Component & ICubismOpacityHandler) | null {
    return this._opacityHandler instanceof Component ? this._opacityHandler : null;
  }
  private set opacityHandlerComponent(value: (Component & ICubismOpacityHandler) | null) {
    this.opacityHandler = value;
  }
  @property({ type: Asset })
  private get opacityHandlerAsset(): (Asset & ICubismOpacityHandler) | null {
    return this._opacityHandler instanceof Asset ? this._opacityHandler : null;
  }
  private set opacityHandlerAsset(value: (Asset & ICubismOpacityHandler) | null) {
    this.opacityHandler = value;
  }
  @property({ type: Node })
  private get opacityHandlerNode(): Node | null {
    return this._opacityHandler instanceof Node ? this._opacityHandler : null;
  }
  private set opacityHandlerNode(value: Node | null) {
    this.opacityHandler = value;
  }

  @property({ type: Component })
  private get drawOrderHandlerComponent(): (Component & ICubismOpacityHandler) | null {
    return this._drawOrderHandler instanceof Component ? this._drawOrderHandler : null;
  }
  private set drawOrderHandlerComponent(value: (Component & ICubismOpacityHandler) | null) {
    this.drawOrderHandler = value;
  }
  @property({ type: Asset })
  private get drawOrderHandlerAsset(): (Asset & ICubismOpacityHandler) | null {
    return this._drawOrderHandler instanceof Asset ? this._drawOrderHandler : null;
  }
  private set drawOrderHandlerAsset(value: (Asset & ICubismOpacityHandler) | null) {
    this.drawOrderHandler = value;
  }
  @property({ type: Node })
  private get drawOrderHandlerNode(): Node | null {
    return this._drawOrderHandler instanceof Node ? this._drawOrderHandler : null;
  }
  private set drawOrderHandlerNode(value: Node | null) {
    this.drawOrderHandler = value;
  }

  //#endregion
}
