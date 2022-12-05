/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import type IStructLike from '../../IStructLike';
import JsonParseUtils from './JsonParseUtils';
const { asNumber, asString } = JsonParseUtils;

/**
 * Handles display info from cdi3.json.
 *
 * **Sealed class.**
 */
export default class CubismDisplayInfo3Json {
  private constructor() {}

  /**
   * Loads a cdi3.json.
   * @param cdi3Json cdi3.json to deserialize.
   * @returns Deserialized cdi3.json on success; null otherwise.
   */
  public static loadFrom(cdi3Json: string): CubismDisplayInfo3Json | null {
    const json = JsonParseUtils.parse(cdi3Json);
    if (!json) {
      return null;
    }
    return this.loadFromJson(json);
  }

  /**
   * **Required properties**
   * - Version
   * - ParameterGroups
   * - Parts
   *
   * **Optional properties**
   * - Parameters
   *
   * @param json
   * @returns
   */
  public static loadFromJson(json: any): CubismDisplayInfo3Json | null {
    if (json == null) {
      return null;
    }
    const version = asNumber(json.Version);
    const parameterGroups = JsonParseUtils.arrayedInstantiateFromJson(
      json.Parameters,
      SerializableParameterGroups.instantiateFromJson
    );
    const parts = JsonParseUtils.arrayedInstantiateFromJson(
      json.Parts,
      SerializableParts.instantiateFromJson
    );
    if (version === undefined || parameterGroups === undefined || parts === undefined) {
      return null;
    }
    const parameters =
      JsonParseUtils.arrayedInstantiateFromJson(
        json.Parameters,
        SerializableParameters.instantiateFromJson
      ) ?? new Array(0);
    const result = new CubismDisplayInfo3Json();
    result.version = version;
    result.parameterGroups = parameterGroups;
    result.parts = parts;
    result.parameters = parameters;
    return result;
  }

  // #region Json Data

  /** Json file format version. */
  public version: number = 0;

  /** Array of model parameters. */
  public parameters: Array<SerializableParameters> = new Array<SerializableParameters>(0);

  /** Array of ParameterGroups. */
  public parameterGroups: Array<SerializableParameterGroups> =
    new Array<SerializableParameterGroups>(0);

  /** Array of Parts. */
  public parts: Array<SerializableParts> = new Array<SerializableParts>(0);

  // #endregion
}

// #region Json Helpers

/** (struct) */
export class SerializableParameters implements IStructLike<SerializableParameters> {
  /** The ID of the parameter. */
  public readonly id: string;
  /** The Group ID of the parameter. */
  public readonly groupId: string;
  /** The Name of the parameter. */
  public readonly name: string;

  public constructor(
    args: {
      id?: string;
      groupId?: string;
      name?: string;
    } = {}
  ) {
    this.id = args.id ?? '';
    this.groupId = args.groupId ?? '';
    this.name = args.name ?? '';
  }

  public copyWith(
    args: {
      id?: string;
      groupid?: string;
      name?: string;
    } = {}
  ): SerializableParameters {
    return new SerializableParameters({
      id: args.id ?? this.id,
      groupId: args.groupid ?? this.groupId,
      name: args.name ?? this.name,
    });
  }

  public equals(other: SerializableParameters): boolean {
    return this === other
      ? true
      : this.id == other.id && this.groupId == other.groupId && this.name == other.name;
  }

  public strictEquals(other: SerializableParameters): boolean {
    return this === other;
  }

  /**
   * **Required properties**
   * - Id
   * - GroupId
   * - Name
   * @param json
   * @returns
   */
  public static instantiateFromJson(json: any): SerializableParameters | undefined {
    if (json == null) {
      return undefined;
    }
    const id = asString(json.Id);
    const groupId = asString(json.GroupId);
    const name = asString(json.Name);
    if (id === undefined || groupId === undefined || name === undefined) {
      return undefined;
    }
    return new SerializableParameters({
      id: id,
      groupId: groupId,
      name: name,
    });
  }
}

/** (struct) */
export class SerializableParameterGroups implements IStructLike<SerializableParameterGroups> {
  /** The ID of the parameter. */
  public readonly id: string;
  /** The Group ID of the parameter. */
  public readonly groupId: string;
  /** The Name of the parameter. */
  public readonly name: string;

  public constructor(
    args: {
      id?: string;
      groupId?: string;
      name?: string;
    } = {}
  ) {
    this.id = args.id ?? '';
    this.groupId = args.groupId ?? '';
    this.name = args.name ?? '';
  }

  public copyWith(
    args: {
      id?: string;
      groupid?: string;
      name?: string;
    } = {}
  ): SerializableParameterGroups {
    return new SerializableParameterGroups({
      id: args.id ?? this.id,
      groupId: args.groupid ?? this.groupId,
      name: args.name ?? this.name,
    });
  }

  public equals(other: SerializableParameterGroups): boolean {
    return this === other
      ? true
      : this.id == other.id && this.groupId == other.groupId && this.name == other.name;
  }

  public strictEquals(other: SerializableParameterGroups): boolean {
    return this === other;
  }

  /**
   * **Required properties**
   * - Id
   * - GroupId
   * - Name
   * @param json
   * @returns
   */
  public static instantiateFromJson(json: any): SerializableParameterGroups | undefined {
    if (json == null) {
      return undefined;
    }
    const id = asString(json.Id);
    const groupId = asString(json.GroupId);
    const name = asString(json.Name);
    if (id === undefined || groupId === undefined || name === undefined) {
      return undefined;
    }
    return new SerializableParameterGroups({
      id: id,
      groupId: groupId,
      name: name,
    });
  }
}

/** (struct) */
export class SerializableParts implements IStructLike<SerializableParts> {
  /** The ID of the part. */
  public readonly id: string;
  /** The Name of the part. */
  public readonly name: string;

  public constructor(
    args: {
      id?: string;
      name?: string;
    } = {}
  ) {
    this.id = args.id ?? '';
    this.name = args.name ?? '';
  }

  public copyWith(
    args: {
      id?: string;
      name?: string;
    } = {}
  ): SerializableParts {
    return new SerializableParts({
      id: args.id ?? this.id,
      name: args.name ?? this.name,
    });
  }

  public equals(other: SerializableParts): boolean {
    return this === other ? true : this.id == other.id && this.name == other.name;
  }

  public strictEquals(other: SerializableParts): boolean {
    return this === other;
  }

  /**
   * **Required properties**
   * - Id
   * - Name
   * @param json
   * @returns
   */
  public static instantiateFromJson(json: any): SerializableParts | undefined {
    if (json == null) {
      return undefined;
    }
    const id = asString(json.Id);
    const name = asString(json.Name);
    if (id === undefined || name === undefined) {
      return undefined;
    }
    return new SerializableParts({
      id: id,
      name: name,
    });
  }
}
export namespace SerializableParameters {
  export const DEFAULT = new SerializableParameters();
}
export namespace SerializableParameterGroups {
  export const DEFAULT = new SerializableParameterGroups();
}
export namespace SerializableParts {
  export const DEFAULT = new SerializableParts();
}

// #endregion
