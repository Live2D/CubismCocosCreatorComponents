/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Model } from '../CubismCore';
import ArrayExtensionMethods from './ArrayExtensionMethods';
import CubismDynamicDrawableData from './CubismDynamicDrawableData';
import CubismTaskQueue from './CubismTaskQueue';
import type CubismMoc from './CubismMoc';
import type CubismParameter from './CubismParameter';
import type CubismPart from './CubismPart';
import type ICubismTask from './ICubismTask';
import type CubismModel from './CubismModel';

/**
 * 'Atomic' {@link CubismModel} update task.
 *
 * **Sealed class**
 */
export default class CubismTaskableModel implements ICubismTask {
  // #region Constructor

  /**
   * Initializes instance.
   * @param moc Moc unmanaged model was instantiated from.
   * @param unmanagedModel
   * @param dynamicDrawableData
   */
  public static instantiate(
    moc: CubismMoc,
    unmanagedModel: Model,
    dynamicDrawableData: CubismDynamicDrawableData[]
  ) {
    return new CubismTaskableModel(moc, unmanagedModel, dynamicDrawableData);
  }

  private constructor(
    moc: CubismMoc,
    unmanagedModel: Model,
    dynamicDrawableData: CubismDynamicDrawableData[]
  ) {
    this._moc = moc;
    this._unmanagedModel = unmanagedModel;
    this._dynamicDrawableData = dynamicDrawableData;
    this._shouldReleaseUnmanaged = false;
  }

  // #endregion

  // #region Factory Methods

  /**
   * Creates a CubismTaskableModel from a CubismMoc.
   * @param moc Moc source.
   * @returns Instance.
   */
  public static createTaskableModel(moc: CubismMoc): CubismTaskableModel | null {
    // Instantiate unmanaged model.
    const unmanagedMoc = moc.acquireUnmanagedMoc();
    console.assert(unmanagedMoc != null);
    const unmanagedModel = Model.fromMoc(unmanagedMoc!);
    if (unmanagedModel == null) {
      console.error('Model.fromMoc() faileed.');
      return null;
    }
    const dynamicDrawableData = CubismDynamicDrawableData.createData(unmanagedModel);
    return new CubismTaskableModel(moc, unmanagedModel, dynamicDrawableData);
  }

  // #endregion

  private _unmanagedModel: Model | null;
  /**
   * Handle to unmanaged model.
   *
   * CubismUnmanagedModel
   */
  public get unmanagedModel(): Model | null {
    return this._unmanagedModel;
  }
  private set unmanagedModel(value) {
    this._unmanagedModel = value;
  }

  private _moc: CubismMoc;
  /** CubismMoc the model was instantiated from. */
  public get moc(): CubismMoc {
    return this._moc;
  }
  private set moc(value) {
    this._moc = value;
  }

  private _dynamicDrawableData = new Array<CubismDynamicDrawableData>(0);
  /** Buffer to write dynamic data to. */
  public get dynamicDrawableData(): Array<CubismDynamicDrawableData> {
    return this._dynamicDrawableData;
  }
  private set dynamicDrawableData(value) {
    this._dynamicDrawableData = value;
  }

  /** True if task is currently executing. */
  public get isExecuting(): boolean {
    return this.state == TaskState.enqueued || this.state == TaskState.executing;
  }

  /** True if did run to completion at least once. */
  public get didExecute(): boolean {
    return this.state == TaskState.executed;
  }

  /** True if unmanaged model and moc should be released. */
  private _shouldReleaseUnmanaged: boolean;
  public get shouldReleaseUnmanaged(): boolean {
    return this._shouldReleaseUnmanaged;
  }
  public set shouldReleaseUnmanaged(value: boolean) {
    this._shouldReleaseUnmanaged = value;
  }

  /**
   * Tries to read parameters into a buffer.
   * @param parameters Buffer to write to.
   * @returns true on success; false otherwise.
   */
  public tryReadParameters(parameters: Array<CubismParameter>): boolean {
    if (this.unmanagedModel == null) {
      console.error('CubismTaskableModel.tryReadParameters(): unmanagedModel is null.');
      return false;
    }
    if (this.state == TaskState.executed) {
      ArrayExtensionMethods.readFromParameters(parameters, this.unmanagedModel);
      return true;
    }
    return false;
  }

  /**
   * Tries to write parameters to a buffer.
   * @param parameters Buffer to read from.
   * @param parts true on success; false otherwise.
   */
  public tryWriteParametersAndParts(
    parameters: Array<CubismParameter>,
    parts: Array<CubismPart>
  ): boolean {
    if (this.unmanagedModel == null) {
      console.error('CubismTaskableModel.tryWriteParametersAndParts(): unmanagedModel is null.');
      return false;
    }

    // シングルスレッド調整のため常にtrue
    // if (this.state != TaskState.executing) {
    ArrayExtensionMethods.writeToModelFromParameters(parameters, this.unmanagedModel);
    ArrayExtensionMethods.writeToModelFromParts(parts, this.unmanagedModel);
    return true;
    // }
    // return false;
  }

  /** Dispatches the task for (maybe async) execution. */
  public update() {
    if (this.state == TaskState.enqueued || this.state == TaskState.executing) {
      return;
    }

    // Update state.
    this.state = TaskState.enqueued;

    CubismTaskQueue.enqueue(this);
  }

  /**
   * Forces the task to run now to completion.
   * @returns
   */
  public updateNow(): boolean {
    if (this.state == TaskState.enqueued || this.state == TaskState.executing) {
      return false;
    }

    // Update state.
    this.state = TaskState.enqueued;

    // Run execution directly.
    this.execute();

    return true;
  }

  /** Releases unmanaged resource. */
  public releaseUnmanaged(): void {
    console.info('CubismTaskableModel.releaseUnmanaged()');
    this.shouldReleaseUnmanaged = true;

    if (this.state == TaskState.enqueued || this.state == TaskState.executing) {
      return;
    }

    this.onReleaseUnmanaged();
    this.shouldReleaseUnmanaged = false;
  }

  /** Runs the task. */
  public execute(): void {
    if (this.unmanagedModel == null) {
      console.error('CubismTaskableModel.unmanagedModel is null.');
      return;
    }

    this.state = TaskState.executing;

    // Update native backend.
    this.unmanagedModel.update();

    // Get results.
    ArrayExtensionMethods.readFromArrayCubismDynamicDrawableData(
      this._dynamicDrawableData,
      this.unmanagedModel
    );

    this.state = TaskState.executed;

    // Release native if requested.
    if (this.shouldReleaseUnmanaged) {
      this.onReleaseUnmanaged();
    }
  }

  /** Actually releases native resource(s). */
  private onReleaseUnmanaged(): void {
    if (this.unmanagedModel == null) {
      console.warn('CubismTaskableModel.unmanagedModel is null.');
      return;
    }

    this.unmanagedModel.release();
    this.moc.releaseUnmanagedMoc();
    this.unmanagedModel = null;
  }

  // #region Threading

  private _state: TaskState = TaskState.idle;
  /** Internal state. */
  private get state() {
    return this._state;
  }
  private set state(value) {
    this._state = value;
  }
  // #endregion
}

/** Task states. */
enum TaskState {
  /** Idle state. */
  idle,
  /** Waiting-for-execution state. */
  enqueued,
  /** Executing state. */
  executing,
  /** Executed state. */
  executed,
}
