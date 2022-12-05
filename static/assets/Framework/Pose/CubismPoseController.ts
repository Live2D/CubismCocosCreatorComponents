/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CCInteger, Component, _decorator } from 'cc';
import ComponentExtensionMethods4Core from '../../Core/ComponentExtensionMethods';
import ComponentExtensionMethods from '../ComponentExtensionMethods';
import CubismPosePart from './CubismPosePart';
import CubismPart from '../../Core/CubismPart';
import CubismUpdateController from '../CubismUpdateController';
import CubismUpdateExecutionOrder from '../CubismUpdateExecutionOrder';
import ArrayExtensionMethods from '../../Core/ArrayExtensionMethods';
import ICubismUpdatable from '../ICubismUpdatable';
import CubismPoseData from './CubismPoseData';
import type CubismModel from '../../Core/CubismModel';
const { ccclass, property } = _decorator;

/**
 * Back opacity threshold.
 */
const BACK_OPACITY_THRESHOLD = 0.15;

/**
 * Cubism pose controller.
 *
 * **Sealed class**
 */
@ccclass('CubismPoseController')
export default class CubismPoseController extends Component implements ICubismUpdatable {
  //#region variable

  /** Default visible pose index. */
  @property({ type: CCInteger })
  public defaultPoseIndex: number = 0;

  /** Cubism model cache. */
  private _model: CubismModel | null = null;

  @property({ visible: false })
  private _hasUpdateController: boolean = false;

  /** Model has update controller component. */
  @property({ visible: false })
  public get hasUpdateController(): boolean {
    return this._hasUpdateController;
  }
  public set hasUpdateController(value: boolean) {
    this._hasUpdateController = value;
  }

  /** Pose data. */
  private _poseData: CubismPoseData[][] = new Array(0);

  //#endregion

  //#region Function

  /** update hidden part opacity. */
  public refresh(): void {
    this._model = ComponentExtensionMethods4Core.findCubismModel(this);

    // Fail silently...
    if (this._model == null) {
      return;
    }

    const { parts } = this._model;
    if (parts == null) {
      console.assert(parts);
      return;
    }

    const tags = ComponentExtensionMethods.getComponentsMany(parts, CubismPosePart);
    for (let i = 0; i < tags.length; i++) {
      const groupIndex = tags[i].groupIndex;
      const partIndex = tags[i].partIndex;

      if (this._poseData == null) {
        this._poseData = new Array(1);
        this._poseData[0] = new Array(0);
      } else if (this._poseData.length <= groupIndex) {
        const start = this._poseData.length;
        this._poseData.length = groupIndex + 1;
        this._poseData.fill(new Array(0), start, groupIndex + 1);
      }
      const arr = this._poseData[groupIndex];
      if (arr.length <= partIndex) {
        const start = arr.length;
        arr.length = partIndex + 1;
        arr.fill(new CubismPoseData(), start, partIndex + 1);
      }

      let data = arr[partIndex];
      data = data.copyWith({ posePart: tags[i], part: tags[i].getComponent(CubismPart) });
      arr[partIndex] = data;

      this.defaultPoseIndex = this.defaultPoseIndex < 0 ? 0 : this.defaultPoseIndex;
      if (partIndex != this.defaultPoseIndex) {
        const { part } = data;
        if (part == null) {
          console.assert(part);
          continue;
        }
        part.opacity = 0.0;
      }

      console.assert(data.part);
      data = data.copyWith({ opacity: data.part?.opacity });
      arr[partIndex] = data;

      if (tags[i].link == null || tags[i].link.length == 0) {
        continue;
      }

      const linkParts = new Array<CubismPart | null>(tags[i].link.length);
      for (let j = 0; j < tags[i].link.length; j++) {
        let linkId = tags[i].link[j];
        const part = ArrayExtensionMethods.findByIdFromParts(parts, linkId);
        linkParts[j] = part;
      }
      data = data.copyWith({ linkParts: linkParts });
      arr[partIndex] = data;
    }

    // Get cubism update controller.
    this.hasUpdateController = this.getComponent(CubismUpdateController) != null;
  }

  /** update hidden part opacity. */
  private doFade(): void {
    for (let groupIndex = 0; groupIndex < this._poseData.length; groupIndex++) {
      let appearPartsGroupIndex = -1;
      let appearPartsGroupOpacity = 1.0;

      // Find appear parts group index and opacity.
      const arr = this._poseData[groupIndex];
      for (let i = 0; i < arr.length; i++) {
        const { part } = arr[i];
        if (!part) {
          console.assert(part);
          continue;
        }
        if (part.opacity > arr[i].opacity) {
          appearPartsGroupIndex = i;
          appearPartsGroupOpacity = part.opacity;
          break;
        }
      }

      // Fail silently...
      if (appearPartsGroupIndex < 0) {
        return;
      }

      // Delay disappearing parts groups disappear.
      for (let i = 0; i < arr.length; i++) {
        // Fail silently...
        if (i == appearPartsGroupIndex) {
          continue;
        }

        const { part } = arr[i];
        if (!part) {
          console.assert(part);
          continue;
        }
        let delayedOpacity = part.opacity;
        const backOpacity = (1.0 - delayedOpacity) * (1.0 - appearPartsGroupOpacity);

        // When restricting the visible proportion of the background
        if (backOpacity > BACK_OPACITY_THRESHOLD) {
          delayedOpacity = 1.0 - BACK_OPACITY_THRESHOLD / (1.0 - appearPartsGroupOpacity);
        }

        // Overwrite the opacity if it's greater than the delayed opacity.
        if (part.opacity > delayedOpacity) {
          part.opacity = delayedOpacity;
        }
      }
    }
  }

  /** Copy opacity to linked parts. */
  private copyPartOpacities(): void {
    for (let groupIndex = 0; groupIndex < this._poseData.length; groupIndex++) {
      const arr = this._poseData[groupIndex];
      for (let partIndex = 0; partIndex < arr.length; partIndex++) {
        const { linkParts, part } = arr[partIndex];
        if (!linkParts.length) {
          continue;
        }
        if (!part) {
          console.assert(part);
          continue;
        }
        const opacity = part.opacity;

        for (let linkIndex = 0; linkIndex < linkParts.length; linkIndex++) {
          const linkPart = linkParts[linkIndex];
          if (linkPart) {
            linkPart.opacity = opacity;
          }
        }
      }
    }
  }

  /** Save parts opacity. */
  private savePartOpacities(): void {
    for (let groupIndex = 0; groupIndex < this._poseData.length; groupIndex++) {
      const arr = this._poseData[groupIndex];
      for (let partIndex = 0; partIndex < arr.length; partIndex++) {
        let data = arr[partIndex];
        const { part } = data;
        console.assert(part);
        data.copyWith({ opacity: part?.opacity });
      }
    }
  }

  /** Called by cubism update controller. Order to invoke OnLateUpdate. */
  public get executionOrder(): number {
    return CubismUpdateExecutionOrder.CUBISM_POSE_CONTROLLER;
  }

  /** Called by cubism update controller. Needs to invoke OnLateUpdate on Editing. */
  public get needsUpdateOnEditing() {
    return false;
  }

  /** Called by cubism update manager. Updates controller. */
  public onLateUpdate(): void {
    // Fail silently...
    if (!this.enabled || this._model == null || this._poseData == null) {
      return;
    }

    this.doFade();
    this.copyPartOpacities();
    this.savePartOpacities();
  }

  //#endregion

  //#region Cocos Creator Event Handling

  /** Called by Cocos Creator. Makes sure cache is initialized. */
  protected onEnable(): void {
    this.refresh();
  }

  /** Called by Cocos Creator. */
  protected lateUpdate(): void {
    if (!this.hasUpdateController) {
      this.onLateUpdate();
    }
  }

  //#endregion

  /** ICubismUpdatable Binded callback function. */
  public bindedOnLateUpdate: ICubismUpdatable.CallbackFunction = this.onLateUpdate.bind(this);
  /** ICubismUpdatable metadata */
  public readonly [ICubismUpdatable.SYMBOL]: typeof ICubismUpdatable.SYMBOL =
    ICubismUpdatable.SYMBOL;
}
