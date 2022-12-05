/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { JsonAsset } from 'cc';
import CubismUserDataBody from '../UserData/CubismUserDataBody';
import CubismUserDataTargetType from '../UserData/CubismUserDataTargetType';
import JsonParseUtils from './JsonParseUtils';
import type IStructLike from '../../IStructLike';
const { asNumber, asString } = JsonParseUtils;

/**
 * Handles user data from cdi3.json.
 *
 * **Sealed class.**
 */
class CubismUserData3Json {
  private constructor() {}

  /**
   * Loads a cdi3.json asset.
   * @param userData3Json  cdi3.json to deserialize.
   * @returns Deserialized cdi3.json on success; null otherwise.
   */
  public static loadFrom(userData3Json: string): CubismUserData3Json | null {
    const json = JsonParseUtils.parse(userData3Json);
    if (!json) {
      return null;
    }
    return this.loadFromJson(json);
  }

  /**
   * Loads a cdi3.json asset.
   * @param userData3JsonAsset cdi3.json to deserialize.
   * @returns Deserialized cdi3.json on success; null otherwise.
   */
  public static loadFromJsonAsset(userData3JsonAsset: JsonAsset): CubismUserData3Json | null {
    if (!userData3JsonAsset.json) {
      return null;
    }
    return this.loadFromJson(userData3JsonAsset.json);
  }

  public static loadFromJson(json: any) {
    const version = JsonParseUtils.asNumber(json.Version);
    const meta = CubismUserData3Json.SerializableMeta.instantiateFromJson(json.Meta);
    const userData = JsonParseUtils.arrayedInstantiateFromJson(
      json.UserData,
      CubismUserData3Json.SerializableUserData.instantiateFromJson
    );
    if (version === undefined || meta === undefined || userData === undefined) {
      return null;
    }
    const result = new CubismUserData3Json();
    result.version = version;
    result.meta = meta;
    result.userData = userData;
    return result;
  }

  /**
   * Makes CubismUserDataBody array that was selected by CubismUserDataTargetType.
   * @param targetType Target object type.
   * @returns CubismUserDataBody array. Selected by CubismUserDataTargetType.
   */
  public toBodyArray(targetType: CubismUserDataTargetType): CubismUserDataBody[] {
    const userDataList = new Array<CubismUserDataBody>();

    if (this.userData != null) {
      for (let i = 0; i < this.userData.length; i++) {
        const body = new CubismUserDataBody({
          id: this.userData[i].id,
          value: this.userData[i].value,
        });
        switch (targetType) {
          case CubismUserDataTargetType.ArtMesh: {
            // Only drawables.
            if (this.userData[i].target == 'ArtMesh') {
              userDataList.push(body);
            }
            break;
          }
          default: {
            const neverCheck: never = targetType;
            break;
          }
        }
      }
    }
    return userDataList;
  }

  // #region Json Data

  /** Json file format version. */
  public version: number = 0;

  /** Additional data describing physics. */
  public meta: CubismUserData3Json.SerializableMeta = CubismUserData3Json.SerializableMeta.DEFAULT;

  /** Array of user data. */
  public userData: CubismUserData3Json.SerializableUserData[] | null = null;

  // #endregion
}

// #region Json Helpers

namespace CubismUserData3Json {
  /** Additional data describing user data. (struct) */
  export class SerializableMeta implements IStructLike<SerializableMeta> {
    /** Number of user data. */
    public readonly userDataCount: number;
    /** Total number of user data. */
    public readonly totalUserDataCount: number;

    public constructor(
      args: {
        userDataCount?: number;
        totalUserDataCount?: number;
      } = {}
    ) {
      this.userDataCount = args.userDataCount ?? 0;
      this.totalUserDataCount = args.totalUserDataCount ?? 0;
    }

    public copyWith(
      args: {
        userDataCount?: number;
        totalUserDataCount?: number;
      } = {}
    ): SerializableMeta {
      return new SerializableMeta({
        userDataCount: args.userDataCount ?? this.userDataCount,
        totalUserDataCount: args.totalUserDataCount ?? this.totalUserDataCount,
      });
    }

    public equals(other: SerializableMeta): boolean {
      return this === other
        ? true
        : this.userDataCount == other.userDataCount &&
            this.totalUserDataCount == other.totalUserDataCount;
    }
    public strictEquals(other: SerializableMeta): boolean {
      return this === other;
    }

    /**
     * **Required properties**
     * - UserDataCount
     * - TotalUserDataSize
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: any): SerializableMeta | undefined {
      if (json == null) {
        return undefined;
      }
      const userDataCount = asNumber(json.UserDataCount);
      const totalUserDataSize = asNumber(json.TotalUserDataSize);
      if (userDataCount === undefined || totalUserDataSize === undefined) {
        return undefined;
      }
      return new SerializableMeta({
        userDataCount: userDataCount,
        totalUserDataCount: totalUserDataSize,
      });
    }
  }

  /** User data. (struct) */
  export class SerializableUserData implements IStructLike<SerializableUserData> {
    /** Type of target object. */
    public readonly target: string;
    /** Name of target object. */
    public readonly id: string;
    /** Value. */
    public readonly value: string;

    public constructor(
      args: {
        target?: string;
        id?: string;
        value?: string;
      } = {}
    ) {
      this.target = args.target ?? '';
      this.id = args.id ?? '';
      this.value = args.value ?? '';
    }

    public equals(other: SerializableUserData): boolean {
      return this === other
        ? true
        : this.target == other.target && this.id == other.id && this.value == other.value;
    }

    public strictEquals(other: SerializableUserData): boolean {
      return this === other;
    }

    public copyWith(
      args: {
        target?: string;
        id?: string;
        value?: string;
      } = {}
    ): SerializableUserData {
      return new SerializableUserData({
        target: args.target ?? this.target,
        id: args.id ?? this.id,
        value: args.value ?? this.value,
      });
    }

    /**
     * **Required properties**
     * - Target
     * - Id
     * - Value
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: any): SerializableUserData | undefined {
      if (json == null) {
        return undefined;
      }
      const target = asString(json.Target);
      const id = asString(json.Id);
      const value = asString(json.Value);
      if (target === undefined || id === undefined || value === undefined) {
        return undefined;
      }
      return new SerializableUserData({ target: target, id: id, value: value });
    }
  }

  export namespace SerializableUserData {
    export const DEFAULT = new SerializableUserData();
  }

  export namespace SerializableMeta {
    export const DEFAULT = new SerializableMeta();
  }
}

// #endregion

export default CubismUserData3Json;
