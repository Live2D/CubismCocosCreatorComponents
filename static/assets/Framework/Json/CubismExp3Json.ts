/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { JsonAsset, _decorator } from 'cc';
import IStructLike from '../../IStructLike';
import JsonParseUtils from './JsonParseUtils';
const { ccclass } = _decorator;
const { asNumber, asString } = JsonParseUtils;

/**
 * Cubism exp3.json data.
 *
 * **Sealed class.**
 */
export default class CubismExp3Json {
  private constructor() {}

  /**
   * Loads a exp3.json asset.
   * @param exp3Json exp3.json to deserialize.
   * @returns Deserialized exp3.json on success; null otherwise.
   */
  public static loadFrom(exp3Json: string): CubismExp3Json | null {
    const json = JsonParseUtils.parse(exp3Json);
    if (!json) {
      return null;
    }
    return this.loadFromJson(json);
  }

  /**
   * Loads a exp3.json asset.
   * @param exp3JsonAsset exp3.json to deserialize.
   * @returns Deserialized exp3.json on success; null otherwise.
   */
  public static loadFromJsonAsset(exp3JsonAsset: JsonAsset): CubismExp3Json | null {
    if (exp3JsonAsset.json != null) {
      return this.loadFromJson(exp3JsonAsset.json);
    }
    return null;
  }

  /**
   * **Required properties**
   * - Type
   * - Parameters
   *
   * **Optional properties**
   * - FadeInTime
   * - FadeOutTime
   * @param json
   * @returns
   */
  public static loadFromJson(json: any): CubismExp3Json | null {
    const type = asString(json.Type);
    const parameters = JsonParseUtils.arrayedInstantiateFromJson(
      json.Parameters,
      SerializableExpressionParameter.instantiateFromJson
    );
    const fadeInTime = asNumber(json.FadeInTime);
    const fadeOutTime = asNumber(json.FadeOutTime);
    if (type === undefined || parameters === undefined) {
      return null;
    }
    const result = new CubismExp3Json();
    result.type = type;
    result.parameters = parameters;
    result.fadeInTime = fadeInTime ?? 0;
    result.fadeOutTime = fadeOutTime ?? 0;
    return result;
  }

  // #region Json Data
  /** Expression Type */
  public type: string = '';

  /** Expression FadeInTime */
  public fadeInTime: number = 1.0;

  /** Expression FadeOutTime */
  public fadeOutTime: number = 1.0;

  /** Expression Parameters */
  public parameters: Array<SerializableExpressionParameter> = new Array(0);

  // #endregion
}

// #region Json Helpers

/** Expression Parameter (struct) */
@ccclass('SerializableExpressionParameter')
export class SerializableExpressionParameter
  implements IStructLike<SerializableExpressionParameter>
{
  /** Expression Parameter Id */
  public readonly id: string;
  /** Expression Parameter Value */
  public readonly value: number;
  /** Expression Parameter Blend Mode */
  public readonly blend: string;

  public constructor(args: { id?: string; value?: number; blend?: string } = {}) {
    this.id = args.id ?? '';
    this.value = args.value ?? 0;
    this.blend = args.blend ?? '';
  }

  public copyWith(
    args: { id?: string | null; value?: number; blend?: string | null } = {}
  ): SerializableExpressionParameter {
    return new SerializableExpressionParameter({
      id: args.id ?? this.id,
      value: args.value ?? this.value,
      blend: args.blend ?? this.blend,
    });
  }

  public equals(other: SerializableExpressionParameter): boolean {
    throw this === other
      ? true
      : this.id == other.id && this.value == other.value && this.blend == other.blend;
  }

  public strictEquals(other: SerializableExpressionParameter): boolean {
    return this === other;
  }

  /**
   * **Required properties**
   * - Id
   * - Value
   *
   * **Optional properties**
   * - Blend
   * @param json
   * @returns
   */
  public static instantiateFromJson(json: any): SerializableExpressionParameter | undefined {
    const id = asString(json.Id);
    const value = asNumber(json.Value);
    if (id === undefined || value === undefined) {
      return;
    }
    const blend = asString(json.Blend);
    return new SerializableExpressionParameter({
      id: id,
      value: value,
      blend: blend,
    });
  }
}
export namespace SerializableExpressionParameter {
  export const DEFAULT = new SerializableExpressionParameter();
}
// #endregion
