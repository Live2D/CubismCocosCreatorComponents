/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { JsonAsset, _decorator } from 'cc';
import type IStructLike from '../../IStructLike';
import JsonParseUtils from './JsonParseUtils';
const { asArray, asNumber, asString } = JsonParseUtils;

/**
 * Handles pose from pose3.json.
 *
 * **Sealed class.**
 */
class CubismPose3Json {
  private constructor() {}

  /**
   * Loads a pose3.json.
   * @param pose3Json pose3.json to deserialize.
   * @returns Deserialized pose3.json on success; null otherwise.
   */
  public static loadFrom(pose3Json: string): CubismPose3Json | null {
    const json = JsonParseUtils.parse(pose3Json);
    if (!json) {
      return null;
    }
    return CubismPose3Json.loadFromJson(json);
  }

  /**
   * Loads a pose3.json asset.
   * @param pose3JsonAsset pose3.json asset to deserialize.
   * @returns Deserialized pose3.json asset on success; null otherwise.
   */
  public static loadFromJsonAsset(pose3JsonAsset: JsonAsset): CubismPose3Json | null {
    return pose3JsonAsset.json == null ? null : CubismPose3Json.loadFromJson(pose3JsonAsset.json);
  }

  public static loadFromJson(json: any): CubismPose3Json | null {
    if (json == null) {
      return null;
    }
    const type = asString(json.Type);
    const groups = CubismPose3Json.parseGroups(json.Groups);
    if (type === undefined || groups == undefined) {
      return null;
    }
    const fadeInTime = asNumber(json.FadeInTime) ?? 0.5;

    let ret = new CubismPose3Json();
    ret.type = type;
    ret.groups = groups;
    ret.fadeInTime = fadeInTime;
    return ret;
  }

  private static parseGroups(src: any): CubismPose3Json.SerializablePoseGroup[][] | undefined {
    const obj = asArray(src);
    if (obj == null) {
      return undefined;
    }
    let groups = Array<CubismPose3Json.SerializablePoseGroup[]>(obj.length);
    for (let i = 0; i < groups.length; i++) {
      const group = JsonParseUtils.arrayedInstantiateFromJson(
        obj[i],
        CubismPose3Json.SerializablePoseGroup.instantiateFromJson
      );
      if (group == null) {
        return undefined;
      }
      groups[i] = group;
    }
    return groups;
  }
  //#region Json Data

  /** The type of cubism pose. */
  public type: string = '';

  /** [Optional] Time of the Fade-in for easing in seconds.. */
  public fadeInTime: number = 0;

  /** Array of Groups. */
  public groups: CubismPose3Json.SerializablePoseGroup[][] | null = null;

  //#endregion
}

//#region Json Helpers
namespace CubismPose3Json {
  /** (struct) */
  export class SerializablePoseGroup implements IStructLike<SerializablePoseGroup> {
    /** The part id of group. */
    public id: string = '';

    /** The link part ids. */
    public link: string[] = new Array(0);

    public constructor(args: { id?: string; link?: string[] } = {}) {
      this.id = args.id ?? '';
      this.link = args.link ?? new Array(0);
    }

    public copyWith(args: { id?: string; link?: string[] } = {}): SerializablePoseGroup {
      return new SerializablePoseGroup({ id: args.id ?? this.id, link: args.link ?? this.link });
    }

    public equals(other: SerializablePoseGroup): boolean {
      return this === other ? true : this.id == other.id && this.link == other.link;
    }

    public strictEquals(other: SerializablePoseGroup): boolean {
      return this === other;
    }

    public static instantiateFromJson(json: any): SerializablePoseGroup | undefined {
      const id = asString(json.Id);
      if (id === undefined) {
        return undefined;
      }
      const link = JsonParseUtils.arrayedInstantiateFromJson(json.Link, asString);
      return new SerializablePoseGroup({ id: id, link: link });
    }
  }
}

//#endregion

export default CubismPose3Json;
