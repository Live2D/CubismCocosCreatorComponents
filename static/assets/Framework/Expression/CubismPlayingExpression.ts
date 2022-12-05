/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CCFloat, CCString, _decorator } from 'cc';
import ArrayExtensionMethods from '../../Core/ArrayExtensionMethods';
import CubismParameter from '../../Core/CubismParameter';
import CubismParameterBlendMode from '../CubismParameterBlendMode';
import type CubismModel from '../../Core/CubismModel';
import type CubismExpressionData from './CubismExpressionData';
const { ccclass, property } = _decorator;

/** The cubism expression data. */
@ccclass('CubismPlayingExpression')
export default class CubismPlayingExpression {
  //#region variable

  /** Expression type. */
  @property({ serializable: true, visible: true })
  public type: string = '';

  /** Expression fade in time. */
  @property({ type: CCFloat, serializable: true, visible: true })
  public fadeInTime: number = 0;

  /** Expression fade out time. */
  @property({ type: CCFloat, serializable: true, visible: true })
  public fadeOutTime: number = 0;

  /** Expression Weight. */
  @property({ type: CCFloat, serializable: true, visible: true, range: [0.0, 1.0, 0.01] })
  public weight: number = 0;

  /** Expression user time. */
  @property({ type: CCFloat, serializable: true, visible: true })
  public expressionUserTime: number = 0;

  /** Expression end time. */
  @property({ type: CCFloat, serializable: true, visible: true })
  public expressionEndTime: number = 0;

  /** Expression parameters cache. */
  @property({ type: [CubismParameter], serializable: true, visible: true })
  public destinations: (CubismParameter | null)[] = new Array(0);

  /** Expression parameter value. */
  @property({ type: [CCFloat], serializable: true, visible: true })
  public value: number[] = new Array();

  /** Expression parameter blend mode. */
  @property({ type: [CubismParameterBlendMode], serializable: true, visible: true })
  public blend: CubismParameterBlendMode[] = new Array();

  //#endregion

  /**
   * Initialize expression data from {@link CubismExpressionData}.
   * @param model model.
   * @param expressionData Source.
   * @returns
   */
  public static create(
    model: CubismModel,
    expressionData: CubismExpressionData
  ): CubismPlayingExpression | null {
    // Fail silently...
    if (model == null || expressionData == null) {
      return null;
    }

    const ret = new CubismPlayingExpression();

    ret.type = expressionData.type;

    ret.fadeInTime = expressionData.fadeInTime < 0.0 ? 1.0 : expressionData.fadeInTime;

    ret.fadeOutTime = expressionData.fadeOutTime < 0.0 ? 1.0 : expressionData.fadeOutTime;

    ret.weight = 0.0;
    ret.expressionUserTime = 0.0;
    ret.expressionEndTime = 0.0;

    let parameterCount = expressionData.parameters.length;
    ret.destinations = new Array<CubismParameter>(parameterCount);
    ret.value = new Array<number>(parameterCount);
    ret.blend = new Array<CubismParameterBlendMode>(parameterCount);

    if (model.parameters == null) {
      console.error('CubismPlayingExpression.create(): parameters is null.');
      return null;
    }
    for (let i = 0; i < parameterCount; i++) {
      ret.destinations[i] = ArrayExtensionMethods.findByIdFromParameters(
        model.parameters,
        expressionData.parameters[i].id
      );
      ret.value[i] = expressionData.parameters[i].value;
      ret.blend[i] = expressionData.parameters[i].blend;
    }
    return ret;
  }
}
