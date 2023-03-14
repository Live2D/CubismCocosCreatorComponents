/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, Component, animation, Node, math } from 'cc';
import ICubismUpdatable from './ICubismUpdatable';
import CubismModel from '../Core/CubismModel';
import CubismParameter from '../Core/CubismParameter';
import CubismPart from '../Core/CubismPart';
import CubismUpdateExecutionOrder from './CubismUpdateExecutionOrder';
const { ccclass, property, requireComponent } = _decorator;

class ValueCache<T extends CubismParameter | CubismPart> {
  public ref: T;
  public value: number = Number.NaN;
  public calcValue: number = Number.NaN;
  public constructor(ref: T) {
    this.ref = ref;
  }
}

@ccclass('CubismMotionApplier')
@requireComponent(animation.AnimationController)
@requireComponent(CubismModel)
export default class CubismMotionApplier extends Component implements ICubismUpdatable {
  /** AnimationController cache. */
  private animCtrl: animation.AnimationController | null = null;

  /** Parameters cache. */
  private parameters: Map<string, ValueCache<CubismParameter>> = new Map();

  /** Parts cache. */
  private parts: Map<string, ValueCache<CubismPart>> = new Map();

  public refresh(): void {
    this.animCtrl = this.getComponent(animation.AnimationController);
    if (this.animCtrl == null) {
      console.error('Not found AnimationController.');
      this.enabled = false;
      return;
    }
    const model = this.getComponent(CubismModel);
    if (model == null) {
      console.error('Not found CubismModel.');
      this.enabled = false;
      return;
    }

    const { parameters, parts } = model;

    if (parameters != null) {
      for (let i = 0; i < parameters.length; i++) {
        const path = makePath(parameters[i], model);
        this.parameters.set(path, new ValueCache(parameters[i]));
      }
    }
    if (parts != null) {
      for (let i = 0; i < parts.length; i++) {
        const path = makePath(parts[i], model);
        this.parts.set(path, new ValueCache(parts[i]));
      }
    }
  }

  private valueUpdate(
    clipStatuses: Iterable<Readonly<animation.ClipStatus>>,
    progress: number,
    transProgress: number = 1.0
  ): void {
    for (const clipStatus of clipStatuses) {
      const t = clipStatus.clip.duration * progress;
      for (const track of clipStatus.clip.tracks) {
        const value = getTrackValue(track, t);
        if (!Number.isNaN(value)) {
          this.setCache(track, value, transProgress);
        }
      }
    }
  }

  private setCache(track: animation.Track, value: number, transProgress: number): void {
    let nodePath = '',
      compName = '',
      propName = '';

    for (let i = 0; i < track.path.length; i++) {
      if (track.path.isHierarchyAt(i)) {
        nodePath = track.path.parseHierarchyAt(i);
      } else if (track.path.isComponentAt(i)) {
        compName = track.path.parseComponentAt(i);
      } else if (track.path.isPropertyAt(i)) {
        propName = track.path.parsePropertyAt(i);
      }
    }

    switch (compName) {
      case CubismParameter.prototype.name:
        this.setParameterCache(nodePath, propName, value, transProgress);
        break;
      case CubismPart.prototype.name:
        this.setPartCache(nodePath, propName, value, transProgress);
        break;
      default:
        console.warn('Not supported component.');
        break;
    }
  }

  private setParameterCache(
    nodePath: string,
    propName: string,
    value: number,
    transProgress: number
  ): void {
    if (propName != 'value') {
      console.warn(`Not supported property.`);
      return;
    }
    const cache = this.parameters.get(nodePath);
    if (cache == null) {
      // console.warn(`Not found node. (${nodePath})`);
      return;
    }
    if (Number.isNaN(cache.calcValue)) {
      cache.calcValue = value;
    } else {
      cache.calcValue = math.lerp(cache.calcValue, value, transProgress);
    }
  }

  private setPartCache(
    nodePath: string,
    propName: string,
    value: number,
    transProgress: number
  ): void {
    if (propName != 'opacity') {
      console.warn(`Not supported property.`);
      return;
    }
    const cache = this.parts.get(nodePath);
    if (cache == null) {
      // console.warn(`Not found node. (${nodePath})`);
      return;
    }
    if (Number.isNaN(cache.calcValue)) {
      cache.calcValue = value;
    } else {
      cache.calcValue = math.lerp(cache.calcValue, value, transProgress);
    }
  }

  private calcCache(layerWeight: number): void {
    this.parameters.forEach((cache, _key, _map) => {
      if (Number.isNaN(cache.value)) {
        cache.value = cache.calcValue;
      } else if (!Number.isNaN(cache.calcValue)) {
        cache.value = math.lerp(cache.value, cache.calcValue, layerWeight);
      }
      cache.calcValue = Number.NaN;
    });
    this.parts.forEach((cache, _key, _map) => {
      if (Number.isNaN(cache.value)) {
        cache.value = cache.calcValue;
      } else if (!Number.isNaN(cache.calcValue)) {
        cache.value = math.lerp(cache.value, cache.calcValue, layerWeight);
      }
      cache.calcValue = Number.NaN;
    });
  }

  private applyValues(): void {
    this.parameters.forEach((cache, _key, _map) => {
      if (!Number.isNaN(cache.value)) {
        cache.ref.value = cache.value;
      }
      cache.value = Number.NaN;
    });
    this.parts.forEach((cache, _key, _map) => {
      if (!Number.isNaN(cache.value)) {
        cache.ref.opacity = cache.value;
      }
      cache.value = Number.NaN;
    });
  }

  private onLateUpdate(deltaTime: number): void {
    const { animCtrl: ctrl } = this;
    if (ctrl == null) {
      return;
    }
    if (ctrl.graph == null) {
      return;
    }
    if (!ctrl.isValid) {
      console.warn('AnimationController invalid.');
      return;
    }

    for (let i = 0; i < ctrl.layerCount; i++) {
      const currentStateStatus = ctrl.getCurrentStateStatus(i);
      if (currentStateStatus == null) {
        console.warn('CurrentStateStatus is null.');
        continue;
      }
      const currentClipStatuses = ctrl.getCurrentClipStatuses(i);
      this.valueUpdate(currentClipStatuses, currentStateStatus.progress);

      const currentTransition = ctrl.getCurrentTransition(i); // 遷移中なら有効な値
      if (currentTransition != null) {
        const nextStateStatus = ctrl.getNextStateStatus(i);
        if (nextStateStatus == null) {
          console.warn('NextStateStatus is null.');
        } else {
          const transProgress =
            currentTransition.duration == 0
              ? 1.0
              : currentTransition.time / currentTransition.duration;
          const nextClipStatuses = ctrl.getNextClipStatuses(i);
          this.valueUpdate(nextClipStatuses, nextStateStatus.progress, transProgress);
        }
      }
      this.calcCache(ctrl.getLayerWeight(i));
    }
    this.applyValues();
  }

  /** Called by Cocos Creator. Makes sure cache is initialized. */
  protected start() {
    // Initialize cache.
    this.refresh();
  }

  /** Called by Cocos Creator. Updates controller. */
  protected lateUpdate(deltaTime: number) {
    if (!this.hasUpdateController) {
      this.onLateUpdate(deltaTime);
    }
  }

  /** ICubismUpdatable Binded callback function. */
  public bindedOnLateUpdate: ICubismUpdatable.CallbackFunction = this.onLateUpdate.bind(this);

  public get executionOrder(): number {
    return CubismUpdateExecutionOrder.CUBISM_MOTION_APPLIER;
  }

  public get needsUpdateOnEditing(): boolean {
    return false;
  }

  @property({ serializable: true, visible: false })
  private _hasUpdateController: boolean = false;

  /** Model has update controller component. */
  public get hasUpdateController() {
    return this._hasUpdateController;
  }
  public set hasUpdateController(value: boolean) {
    this._hasUpdateController = value;
  }

  /** ICubismUpdatable metadata */
  [ICubismUpdatable.SYMBOL]: typeof ICubismUpdatable.SYMBOL = ICubismUpdatable.SYMBOL;
}

function getTrackValue(track: animation.Track, time: number): number {
  for (const channel of track.channels()) {
    const evaluated = channel.curve.evaluate(time);
    if (typeof evaluated === 'number') {
      return evaluated;
    }
    break;
  }
  return Number.NaN;
}

function makePath(comp: CubismParameter | CubismPart, model: CubismModel): string {
  let current = comp.node;
  let name = '';
  do {
    name = current.name + '/' + name;
    if (!Node.isNode(current.parent)) {
      break;
    }
    current = current.parent;
  } while (current != model.node);
  return name.slice(0, -1);
}
