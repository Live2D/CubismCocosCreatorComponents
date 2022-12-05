/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, Component, Node, director, game, Director } from 'cc';
import CubismDrawable from './CubismDrawable';
import CubismParameter from './CubismParameter';
import CubismPart from './CubismPart';
import ArrayExtensionMethods from './ArrayExtensionMethods';
import CubismCanvasInformation from './CubismCanvasInformation';
import CubismParameterStore from '../Framework/CubismParameterStore';
import CubismTaskableModel from './CubismTaskableModel';
import CubismMoc from './CubismMoc';
import type CubismDynamicDrawableData from './CubismDynamicDrawableData';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

type Action = () => void;

interface IModelUpdateFunctions {
  add(func: Action): void;
  remove(func: Action): void;
}

interface IDynamicDrawableDataEvent {
  add(func: DynamicDrawableDataHandler): void;
  remove(func: DynamicDrawableDataHandler): void;
}

class ModelUpdateFunctions implements IModelUpdateFunctions {
  private functions = Array<Action>(0);

  public add(func: Action): void {
    this.functions.push(func);
  }

  public remove(func: Action): void {
    this.functions = this.functions.filter((value) => value != func);
  }

  public invoke(): void {
    for (let i = 0; i < this.functions.length; i++) {
      this.functions[i]();
    }
  }
}

// TODO: CubismDontMoveOnReimport
/**
 * Runtime Cubism model.
 *
 * **Sealed class.**
 */
@ccclass('CubismModel')
@executeInEditMode
export default class CubismModel extends Component {
  // #region Events

  protected _onDynamicDrawableData: DynamicDrawableDataEvent = new DynamicDrawableDataEvent();

  /** Event triggered if new CubismDynamicDrawableData is available for instance. */
  public get onDynamicDrawableData(): IDynamicDrawableDataEvent {
    return this._onDynamicDrawableData;
  }

  // #endregion

  // #region Factory Methods

  /**
   * Instantiates a CubismMoc.
   * @param moc3 Cubism moc to instantiate.
   * @returns Instance.
   */
  public static instantiateFrom(moc: CubismMoc): CubismModel | null {
    // Create model.
    const node = new Node('Model');
    const modelComp = node.addComponent(CubismModel);

    // Initialize it by resetting it.
    modelComp.reset(moc);
    return modelComp;
  }

  // #endregion

  /**
   * Resets a CubismMoc reference in CubismModel.
   * @param model Target Cubism model.
   * @param moc Cubism moc to reset.
   */
  public resetMocReference(model: CubismModel, moc: CubismMoc): void {
    model.moc = moc;
  }

  /** Moc backing field. */
  @property({ type: CubismMoc, serializable: true, visible: true })
  private _moc: CubismMoc | null = null;

  /** Moc the instance was instantiated from. */
  public get moc(): CubismMoc | null {
    return this._moc;
  }
  private set moc(value: CubismMoc | null) {
    this._moc = value;
  }

  private _taskableModel: CubismTaskableModel | null = null;
  private get taskableModel(): CubismTaskableModel | null {
    return this._taskableModel;
  }
  private set taskableModel(value: CubismTaskableModel | null) {
    this._taskableModel = value;
  }

  /** Parameters backing field. */
  @property({ serializable: false, visible: false })
  private _parameters: Array<CubismParameter> | null = null;

  /** Drawables of model. */
  public get parameters(): Array<CubismParameter> | null {
    if (this._parameters == null) {
      this.revive();
    }
    return this._parameters;
  }
  private set parameters(value: Array<CubismParameter> | null) {
    this._parameters = value;
  }

  /** Parts backing field. */
  @property({ serializable: false, visible: false })
  private _parts: Array<CubismPart> | null = null;
  /** Drawables of model. */
  public get parts(): Array<CubismPart> | null {
    if (this._parts == null) {
      this.revive();
    }
    return this._parts;
  }
  private set parts(value: Array<CubismPart> | null) {
    this._parts = value;
  }

  /** Drawables backing field. */
  @property({ serializable: false, visible: false })
  private _drawables: Array<CubismDrawable> | null = null;
  /** Drawables of model. */
  public get drawables(): Array<CubismDrawable> | null {
    if (this._drawables == null) {
      this.revive();
    }
    return this._drawables;
  }
  private set drawables(value: Array<CubismDrawable> | null) {
    this._drawables = value;
  }

  /** CanvasInformation backing field. */
  @property({ serializable: false, visible: false })
  private _canvasInformation: CubismCanvasInformation | null = null;
  /** Canvas information of model. */
  public get canvasInformation(): CubismCanvasInformation | null {
    if (this._canvasInformation == null) {
      this.revive();
    }

    return this._canvasInformation;
  }
  private set canvasInformation(value: CubismCanvasInformation | null) {
    this._canvasInformation = value;
  }

  /** Parameter store cache. */
  protected _parameterStore: CubismParameterStore | null = null;

  /** True if instance is revived. */
  public get isRevived(): boolean {
    return this.taskableModel != null;
  }

  private get canRevive(): boolean {
    return this._moc != null;
  }

  /** Model update functions for player loop. */
  @property({ serializable: false, visible: false })
  private static _modelUpdateFunctions: ModelUpdateFunctions = new ModelUpdateFunctions();

  private static get modelUpdateFunctions(): IModelUpdateFunctions {
    return this._modelUpdateFunctions;
  }

  private wasAttachedModelUpdateFunction: boolean = false;

  private _wasJustEnabled: boolean = false;
  /** True on the frame the instance was enabled. */
  private get wasJustEnabled() {
    return this._wasJustEnabled;
  }
  private set wasJustEnabled(value) {
    this._wasJustEnabled = value;
  }

  private _lastTick: number = 0;
  /** Frame number last update was done. */
  private get lastTick() {
    return this._lastTick;
  }
  private set lastTick(value) {
    this._lastTick = value;
  }

  /** Revives instance. */
  private revive() {
    // Return if already revive.
    if (this.isRevived) {
      return;
    }

    // Return if revive isn't possible.
    if (this.moc == null) {
      console.error('CubismModel.revive(): this.moc is null.');
      return;
    }

    const model = CubismTaskableModel.createTaskableModel(this.moc);

    if (model == null) {
      console.error('CubismModel.revive(): CubismTaskableModel.createTaskableModel() failed.');
      return;
    }

    this.taskableModel = model;

    // Revive proxies.
    this.parameters = this.getComponentsInChildren(CubismParameter);
    if (this.taskableModel != null) {
      ArrayExtensionMethods.reviveParameters(this.parameters, model.unmanagedModel!);
    }
    this.parts = this.getComponentsInChildren(CubismPart);
    if (this.taskableModel != null) {
      ArrayExtensionMethods.reviveParts(this.parts, model.unmanagedModel!);
    }

    // Editor Only, For operation from inspector.
    if (EDITOR) {
      if (this.taskableModel != null) {
        this.parameters.forEach((e) => {
          Reflect.set(e, '_model', this);
        });
        this.parts.forEach((e) => {
          Reflect.set(e, '_model', this);
        });
      }
    }

    this.drawables = this.getComponentsInChildren(CubismDrawable);
    if (this.taskableModel != null) {
      ArrayExtensionMethods.reviveDrawables(this.drawables, model.unmanagedModel!);
    }

    if (model.unmanagedModel == null) {
      console.error('CubismModel.revive(): this.taskableModel.unmanagedModel is null.');
      return;
    }
    this.canvasInformation = CubismCanvasInformation.instantiate(model.unmanagedModel);
    this._parameterStore = this.getComponent(CubismParameterStore);
  }

  /**
   * Initializes instance for first use.
   * @param moc Moc to instantiate from.
   */
  private reset(moc: CubismMoc) {
    this.moc = moc;
    this.name = moc.name;
    this.taskableModel = CubismTaskableModel.createTaskableModel(moc);

    if (this.taskableModel == null) {
      console.error('CubismModel.reset(): CubismTaskableModel.createTaskableModel() failed.');
      return;
    }
    console.assert(this.taskableModel.unmanagedModel != null);
    const unmanagedModel = this.taskableModel.unmanagedModel!;

    // Create and initialize proxies.
    const parameters = CubismParameter.createParameters(unmanagedModel);
    const parts = CubismPart.createParts(unmanagedModel);
    const drawables = CubismDrawable.createDrawables(unmanagedModel);

    this.node.addChild(parameters);
    this.node.addChild(parts);
    this.node.addChild(drawables);

    this.parameters = parameters.getComponentsInChildren(CubismParameter);
    this.parts = parts.getComponentsInChildren(CubismPart);
    this.drawables = drawables.getComponentsInChildren(CubismDrawable);

    this.canvasInformation = CubismCanvasInformation.instantiate(unmanagedModel!);
  }

  /** Forces update. */
  public forceUpdateNow(): void {
    this.wasJustEnabled = true;
    this.lastTick = -1;

    this.revive();

    this.onModelUpdate();
  }

  /** Calls model update functions for player loop. */
  private static onModelsUpdate(): void {
    if (CubismModel._modelUpdateFunctions != null) {
      CubismModel._modelUpdateFunctions.invoke();
    }
  }

  /**
   * Register the model update function into the player loop.
   *
   * Unity における PreLateUpdate の位置で実行できるイベントがないため
   * Unity における onRenderObject と同程度の実行タイミング {@link Director.EVENT_AFTER_DRAW} で
   * {@link CubismModel.onModelsUpdate} が実行されるよう実装
   */
  public static registerCallbackFunction(): void {
    // Prepare the function for using player loop.
    director.off(Director.EVENT_AFTER_DRAW, CubismModel.onModelsUpdate);
    director.on(Director.EVENT_AFTER_DRAW, CubismModel.onModelsUpdate);
  }

  /**
   * Called by Cocos Creator. Triggers this to update.
   * @param deltaTime
   */
  protected update(deltaTime: number) {
    if (!this.wasAttachedModelUpdateFunction) {
      CubismModel._modelUpdateFunctions.add(this.bindedOnModelUpdateFunc);
      this.wasAttachedModelUpdateFunction = true;
    }

    // Return on first frame enabled.
    if (this.wasJustEnabled) {
      return;
    }

    // Return unless revived.
    if (!this.isRevived) {
      return;
    }

    if (this.taskableModel == null) {
      console.error('CubismModel.update(): this.taskableModel is null.');
      return;
    }

    if (this.parameters == null) {
      console.error('CubismModel.update(): this.parameters is null.');
      return;
    }

    // Return if backend is ticking.
    if (!this.taskableModel.didExecute) {
      return;
    }

    // Sync parameters back.
    this.taskableModel.tryReadParameters(this.parameters);

    // restore last frame parameters value and parts opacity.
    if (this._parameterStore != null) {
      this._parameterStore.restoreParameters();
    }

    // Trigger event.
    if (this.onDynamicDrawableData == null) {
      return;
    }

    this._onDynamicDrawableData.invoke(this, this.taskableModel.dynamicDrawableData);
  }

  /** Update model states. */
  private onModelUpdate(): void {
    // Return unless revived.
    if (!this.isRevived) {
      return;
    }

    // Return if already ticked this frame.
    const frameCount = director.getTotalFrames();

    if (this.lastTick == frameCount /* && Application.isPlaying*/) {
      return;
    }
    this.lastTick = frameCount;

    if (this.taskableModel == null) {
      console.warn('CubismModel.taskableModel is null.');
      return;
    }
    if (this.parameters == null) {
      console.error('CubismModel.update(): this.parameters is null.');
      return;
    }
    if (this.parts == null) {
      console.error('CubismModel.update(): this.parts is null.');
      return;
    }

    // Try to sync parameters and parts (without caring whether task is executing or not).
    this.taskableModel.tryWriteParametersAndParts(this.parameters, this.parts);

    // Return if task is executing.
    // シングルスレッド調整のため常にfalse
    // if (this.taskableModel.isExecuting) {
    //   return;
    // }

    // Force blocking update on first frame enabled.
    if (this.wasJustEnabled) {
      // Force sync update.
      this.taskableModel.updateNow();

      // Unset condition.
      this.wasJustEnabled = false;

      // Fetch results by calling own 'Update()'.
      this.update(game.deltaTime);

      return;
    }

    // Enqueue update task.
    this.taskableModel.update();
  }

  /** Called by Cocos Creator. Revives instance. */
  protected onEnable(): void {
    this.wasJustEnabled = true;
    this.revive();
  }
  protected onDisable(): void {
    if (this.wasAttachedModelUpdateFunction) {
      CubismModel.modelUpdateFunctions.remove(this.bindedOnModelUpdateFunc);
      this.wasAttachedModelUpdateFunction = false;
    }
  }

  /** Called by Cocos Creator. Releases unmanaged memory. */
  protected onDestroy(): void {
    if (!this.isRevived) {
      return;
    }
    this.taskableModel = null;
  }

  /** Called by Cocos Creator. Triggers onEnable. */
  private onValidate(): void {
    this.onEnable();
  }

  /**
   * コールバック登録用 onLoad にて初期化されます。
   * @param sender
   * @param data
   */
  protected bindedOnModelUpdateFunc: () => void = this.onModelUpdate.bind(this);
}

/**
 * Handler for CubismDynamicDrawableData.
 * @param sender Model the dymanic data applies to.
 * @param data New data.
 */
type DynamicDrawableDataHandler = (
  sender: CubismModel,
  data: Array<CubismDynamicDrawableData>
) => void;

class DynamicDrawableDataEvent implements IDynamicDrawableDataEvent {
  private functions = Array<DynamicDrawableDataHandler>(0);

  public add(func: DynamicDrawableDataHandler): void {
    this.functions.push(func);
  }

  public remove(func: DynamicDrawableDataHandler): void {
    this.functions = this.functions.filter((value) => value != func);
  }

  public invoke(sender: CubismModel, data: Array<CubismDynamicDrawableData>): void {
    for (let i = 0; i < this.functions.length; i++) {
      this.functions[i](sender, data);
    }
  }
}

CubismModel.registerCallbackFunction();
