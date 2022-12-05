/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CCBoolean, CCInteger, Component, game, math, _decorator } from 'cc';
import ComponentExtensionMethods from '../../Core/ComponentExtensionMethods';
import CubismParameterBlendMode from '../CubismParameterBlendMode';
import CubismParameterExtensionMethods from '../CubismParameterExtensionMethods';
import CubismUpdateController from '../CubismUpdateController';
import CubismUpdateExecutionOrder from '../CubismUpdateExecutionOrder';
import ICubismUpdatable from '../ICubismUpdatable';
import CubismFadeMath from '../MotionFade/CubismFadeMath';
import CubismExpressionList from './CubismExpressionList';
import CubismPlayingExpression from './CubismPlayingExpression';
import type CubismModel from '../../Core/CubismModel';
const { ccclass, property } = _decorator;

@ccclass('CubismExpressionController')
export default class CubismExpressionController extends Component implements ICubismUpdatable {
  //#region variable

  /** Expressions data list. */
  @property({ type: CubismExpressionList, serializable: true, visible: true })
  public expressionsList: CubismExpressionList | null = null;

  /** CubismModel cache. */
  private _model: CubismModel | null = null;

  /** Playing expressions index. */
  @property({ type: CCInteger, serializable: true, visible: true })
  public currentExpressionIndex: number = -1;

  /** Playing expressions. */
  private _playingExpressions = new Array<CubismPlayingExpression>();

  /** Last playing expressions index. */
  private _lastExpressionIndex: number = -1; // int

  @property({ serializable: true, visible: false })
  private _hasUpdateController: boolean = false;

  /** Model has update controller component. */
  public get hasUpdateController() {
    return this._hasUpdateController;
  }
  public set hasUpdateController(value: boolean) {
    this._hasUpdateController = value;
  }

  //#endregion

  /** Add new expression to playing expressions. */
  private startExpression(): void {
    // Fail silently...
    if (this.expressionsList == null || this.expressionsList.cubismExpressionObjects == null) {
      return;
    }

    // Backup expression.
    this._lastExpressionIndex = this.currentExpressionIndex;

    // Set last expression end time
    const playingExpressions = this._playingExpressions;
    if (playingExpressions.length > 0) {
      const playingExpression = playingExpressions[playingExpressions.length - 1];
      playingExpression.expressionEndTime =
        playingExpression.expressionUserTime + playingExpression.fadeOutTime;
      playingExpressions[playingExpressions.length - 1] = playingExpression;
    }

    const expressionsList = this.expressionsList;

    // Fail silently...
    if (
      this.currentExpressionIndex < 0 ||
      this.currentExpressionIndex >= expressionsList.cubismExpressionObjects.length
    ) {
      return;
    }

    if (this._model == null) {
      console.error('CubismExpressionController.startExpression(): model is null.');
      return;
    }

    const palyingExpression = CubismPlayingExpression.create(
      this._model,
      expressionsList.cubismExpressionObjects[this.currentExpressionIndex]
    );

    if (palyingExpression == null) {
      return;
    }

    // Add to PlayingExList.
    playingExpressions.push(palyingExpression);
  }

  /** Called by cubism update controller. Order to invoke OnLateUpdate. */
  public get executionOrder(): number {
    return CubismUpdateExecutionOrder.CUBISM_EXPRESSION_CONTROLLER;
  }

  /** Called by cubism update controller. Needs to invoke OnLateUpdate on Editing. */
  public get needsUpdateOnEditing(): boolean {
    return false;
  }

  /** Called by cubism update manager. */
  public onLateUpdate(): void {
    // Fail silently...
    if (!this.enabled || this._model == null) {
      return;
    }
    // Start expression when current expression changed.
    if (this.currentExpressionIndex != this._lastExpressionIndex) {
      this.startExpression();
    }
    // Update expression
    for (
      let expressionIndex = 0;
      expressionIndex < this._playingExpressions.length;
      ++expressionIndex
    ) {
      const playingExpression = this._playingExpressions[expressionIndex];
      // Update expression user time.
      playingExpression.expressionUserTime += game.deltaTime;
      // Update weight
      const fadeIn =
        Math.abs(playingExpression.fadeInTime) < math.EPSILON
          ? 1.0
          : CubismFadeMath.getEasingSine(
              playingExpression.expressionUserTime / playingExpression.fadeInTime
            );
      const fadeOut =
        Math.abs(playingExpression.expressionEndTime) < math.EPSILON ||
        playingExpression.expressionEndTime < 0.0
          ? 1.0
          : CubismFadeMath.getEasingSine(
              (playingExpression.expressionEndTime - playingExpression.expressionUserTime) /
                playingExpression.fadeOutTime
            );
      playingExpression.weight = fadeIn * fadeOut;
      // Apply value.
      for (let i = 0; i < playingExpression.destinations.length; i++) {
        // Fail silently...
        const destination = playingExpression.destinations[i];
        if (destination == null) {
          continue;
        }
        switch (playingExpression.blend[i]) {
          case CubismParameterBlendMode.Additive:
            CubismParameterExtensionMethods.addToValue(
              destination,
              playingExpression.value[i],
              playingExpression.weight
            );
            break;
          case CubismParameterBlendMode.Multiply:
            CubismParameterExtensionMethods.multiplyValueBy(
              destination,
              playingExpression.value[i],
              playingExpression.weight
            );
            break;
          case CubismParameterBlendMode.Override:
            destination.value =
              destination.value * (1 - playingExpression.weight) +
              playingExpression.value[i] * playingExpression.weight;
            break;
          default:
            // When an unspecified value is set, it is already in addition mode.
            break;
        }
      }
      // Apply update value
      this._playingExpressions[expressionIndex] = playingExpression;
    }

    // Remove expression from playing expressions
    for (
      let expressionIndex = this._playingExpressions.length - 1;
      expressionIndex >= 0;
      --expressionIndex
    ) {
      if (this._playingExpressions[expressionIndex].weight > 0.0) {
        continue;
      }
      // RemoveAt
      for (let i = expressionIndex + 1; i < this._playingExpressions.length; i++) {
        this._playingExpressions[i - 1] = this._playingExpressions[i];
      }
      this._playingExpressions.length -= 1;
    }
  }

  public readonly bindedOnLateUpdate: ICubismUpdatable.CallbackFunction =
    this.onLateUpdate.bind(this);

  //#region Cocos Creator Event Handling

  /** Called by Cocos Creator. */
  protected onEnable(): void {
    this._model = ComponentExtensionMethods.findCubismModel(this);

    // Get cubism update controller.
    this.hasUpdateController = this.getComponent(CubismUpdateController) != null;
  }

  /** Called by Cocos Creator. */
  protected lateUpdate(): void {
    if (!this.hasUpdateController) {
      this.onLateUpdate();
    }
  }

  //#endregion

  public readonly [ICubismUpdatable.SYMBOL]: typeof ICubismUpdatable.SYMBOL =
    ICubismUpdatable.SYMBOL;
}
