/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Asset, CCFloat, Enum, _decorator } from 'cc';
import CubismParameterBlendMode from '../CubismParameterBlendMode';
import type CubismExp3Json from '../Json/CubismExp3Json';
import type IStructLike from '../../IStructLike';
const { ccclass, property } = _decorator;

/** ExpressionParameter (struct) */
@ccclass('CubismExpressionData.SerializableExpressionParameter')
export class SerializableExpressionParameter
  implements IStructLike<SerializableExpressionParameter>
{
  /** Expression Parameter Id */
  @property({ serializable: true })
  public readonly id: string = '';

  /** Expression Parameter Value */
  @property({ type: CCFloat, serializable: true })
  public readonly value: number = 0;

  /** Expression Parameter Blend Mode */
  @property({ type: Enum(CubismParameterBlendMode), serializable: true })
  public readonly blend: CubismParameterBlendMode = CubismParameterBlendMode.Override;

  public constructor(args: { id?: string; value?: number; blend?: CubismParameterBlendMode } = {}) {
    this.id = args.id ?? '';
    this.value = args.value ?? 0;
    this.blend = args.blend ?? CubismParameterBlendMode.Override;
  }

  public copyWith(
    args: {
      id?: string;
      value?: number;
      blend?: CubismParameterBlendMode;
    } = {}
  ): SerializableExpressionParameter {
    return new SerializableExpressionParameter({
      id: args.id ?? this.id,
      value: args.value ?? this.value,
      blend: args.blend ?? this.blend,
    });
  }

  public equals(other: SerializableExpressionParameter): boolean {
    return this === other;
  }

  public strictEquals(other: SerializableExpressionParameter): boolean {
    return this === other;
  }
}

@ccclass('CubismExpressionData')
class CubismExpressionData extends Asset {
  /** Expression type. */
  @property({ serializable: true })
  public type: string = '';

  /** Expression fade in time. */
  @property({ type: CCFloat, serializable: true })
  public fadeInTime: number = 0;

  /** Expression fade out time. */
  @property({ type: CCFloat, serializable: true })
  public fadeOutTime: number = 0;

  /** Expression Parameters */
  @property({ type: SerializableExpressionParameter, serializable: true })
  public parameters: SerializableExpressionParameter[] = new Array();

  public static createInstance(json: CubismExp3Json): CubismExpressionData {
    const expressionData = new CubismExpressionData();
    return this.createInstance2(expressionData, json);
  }

  public static createInstance2(
    expressionData: CubismExpressionData,
    json: CubismExp3Json
  ): CubismExpressionData {
    expressionData.type = json.type;
    expressionData.fadeInTime = json.fadeInTime;
    expressionData.fadeOutTime = json.fadeOutTime;
    expressionData.parameters = new Array(json.parameters.length);
    for (let i = 0; i < json.parameters.length; i++) {
      let blend: CubismParameterBlendMode;
      switch (json.parameters[i].blend) {
        case 'Add':
          blend = CubismParameterBlendMode.Additive;
          break;
        case 'Multiply':
          blend = CubismParameterBlendMode.Multiply;
          break;
        case 'Overwrite':
          blend = CubismParameterBlendMode.Override;
          break;
        default:
          blend = CubismParameterBlendMode.Additive;
          break;
      }
      expressionData.parameters[i] = new SerializableExpressionParameter({
        id: json.parameters[i].id,
        value: json.parameters[i].value,
        blend: blend,
      });
    }
    return expressionData;
  }
}
export default CubismExpressionData;
