/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { js, JsonAsset, math } from 'cc';
import CubismPhysicsOutput from '../Physics/CubismPhysicsOutput';
import CubismPhysicsParticle from '../Physics/CubismPhysicsParticle';
import CubismPhysicsSourceComponent from '../Physics/CubismPhysicsSourceComponent';
import CubismPhysicsInput from '../Physics/CubismPhysicsInput';
import CubismPhysicsNormalization, {
  CubismPhysicsNormalizationTuplet,
} from '../Physics/CubismPhysicsNormalization';
import CubismPhysicsRig from '../Physics/CubismPhysicsRig';
import CubismPhysicsSubRig from '../Physics/CubismPhysicsSubRig';
import JsonParseUtils from './JsonParseUtils';
import type IStructLike from '../../IStructLike';
import { ArrayExtensions } from '../../Utils';
const { asBoolean, asNumber, asString } = JsonParseUtils;

/** **Sealed class.** */
class CubismPhysics3Json {
  private constructor() {}

  /**
   * Loads a physics3.json asset.
   * @param physics3Json physics3.json to deserialize.
   * @returns Deserialized physics3.json on success; null otherwise.
   */
  public static loadFrom(physics3Json: string): CubismPhysics3Json | null {
    const json = JsonParseUtils.parse(physics3Json);
    if (!json) {
      return null;
    }
    return CubismPhysics3Json.loadFromJson(json);
  }

  /**
   * Loads a physics3.json asset.
   * @param physics3JsonAsset motion3.json to deserialize.
   * @returns Deserialized physics3.json on success; null otherwise.
   */
  public static loadFromJsonAsset(physics3JsonAsset: JsonAsset): CubismPhysics3Json | null {
    if (physics3JsonAsset.json == null) {
      return null;
    }
    return CubismPhysics3Json.loadFromJson(physics3JsonAsset.json);
  }

  public static loadFromJson(json: any): CubismPhysics3Json | null {
    const { SerializableMeta, SerializablePhysicsSettings } = CubismPhysics3Json;
    let result = new CubismPhysics3Json();
    if (!js.isNumber(json.Version)) {
      return null;
    }
    result.version = json.Version;
    if (json.Meta != null) {
      const meta = SerializableMeta.instantiateFromJson(json.Meta);
      if (meta != null) {
        result.meta = meta;
      }
    }
    if (Array.isArray(json.PhysicsSettings)) {
      const physicsSettings = JsonParseUtils.arrayedInstantiateFromJson(
        json.PhysicsSettings as Array<any>,
        SerializablePhysicsSettings.instantiateFromJson
      );
      if (physicsSettings != null) {
        result.physicsSettings = physicsSettings;
      }
    }

    return result;
  }

  public toRig(): CubismPhysicsRig {
    let instance = new CubismPhysicsRig();
    instance.gravity = new math.Vec2(
      this.meta.effectiveForces.gravity.x,
      this.meta.effectiveForces.gravity.y
    );
    instance.wind = new math.Vec2(
      this.meta.effectiveForces.wind.x,
      this.meta.effectiveForces.wind.y
    );

    if (this.physicsSettings != null) {
      if (this.physicsSettings.length != this.meta.physicsSettingCount) {
        console.warn(
          'CubismPhysics3Json.toRig(): PhysicsSettings.Length and Meta.PhysicsSettingCount are unequaled.'
        );
        console.warn(
          'this.physicsSettings.length: %d, this.meta.physicsSettingCount: %d',
          this.physicsSettings.length,
          this.meta.physicsSettingCount
        );
        console.warn(this.physicsSettings);
      }
      instance.subRigs = new Array<CubismPhysicsSubRig | null>(this.physicsSettings.length);

      for (var i = 0; i < instance.subRigs.length; i++) {
        const subRig = new CubismPhysicsSubRig();
        const physicsSetting = this.physicsSettings[i];

        if (physicsSetting.input != null) {
          subRig.input = this.readInput(physicsSetting.input);
        }
        if (physicsSetting.output != null) {
          subRig.output = this.readOutput(physicsSetting.output);
        }
        if (physicsSetting.vertices != null) {
          subRig.particles = this.readParticles(physicsSetting.vertices);
        }
        if (physicsSetting.normalization != null) {
          subRig.normalization = this.readNormalization(physicsSetting.normalization);
        }

        instance.subRigs[i] = subRig;
      }
    }
    return instance;
  }

  private readInput(source: CubismPhysics3Json.SerializableInput[]): CubismPhysicsInput[] {
    let dataArray = new Array<CubismPhysicsInput>(source.length);
    for (let i = 0; i < dataArray.length; i++) {
      dataArray[i] = new CubismPhysicsInput();
      dataArray[i].sourceId = source[i].source.id;
      dataArray[i].angleScale = 0.0;
      dataArray[i].scaleOfTranslation = math.Vec2.ZERO;
      dataArray[i].weight = source[i].weight;
      if (source[i].type == null) {
        console.warn('source[' + i + '].type is null.');
        dataArray[i].sourceComponent = CubismPhysicsSourceComponent.X;
      } else {
        dataArray[i].sourceComponent =
          CubismPhysicsSourceComponent.purse(source[i].type!) ?? CubismPhysicsSourceComponent.X;
      }
      dataArray[i].isInverted = source[i].reflect;
    }
    return dataArray;
  }

  private readOutput(source: CubismPhysics3Json.SerializableOutput[]): CubismPhysicsOutput[] {
    let dataArray = new Array<CubismPhysicsOutput>(source.length);
    for (var i = 0; i < dataArray.length; i++) {
      dataArray[i] = new CubismPhysicsOutput();
      dataArray[i].destinationId = source[i].destination.id;
      dataArray[i].particleIndex = source[i].vertexIndex;
      dataArray[i].translationScale = math.Vec2.ZERO;
      dataArray[i].angleScale = source[i].scale;
      dataArray[i].weight = source[i].weight;
      if (source[i].type == null) {
        console.warn('source[' + i + '].type is null.');
        dataArray[i].sourceComponent = CubismPhysicsSourceComponent.X;
      } else {
        dataArray[i].sourceComponent =
          CubismPhysicsSourceComponent.purse(source[i].type!) ?? CubismPhysicsSourceComponent.X;
      }
      dataArray[i].isInverted = source[i].reflect;
      dataArray[i].valueBelowMinimum = 0.0;
      dataArray[i].valueExceededMaximum = 0.0;
    }
    return dataArray;
  }

  private readParticles(source: CubismPhysics3Json.SerializableVertex[]): CubismPhysicsParticle[] {
    let dataArray = new Array<CubismPhysicsParticle>(source.length);
    for (var i = 0; i < dataArray.length; i++) {
      dataArray[i] = new CubismPhysicsParticle({
        initialPosition: new math.Vec2(source[i].position.x, source[i].position.y),
        mobility: source[i].mobility,
        delay: source[i].delay,
        acceleration: source[i].acceleration,
        radius: source[i].radius,
        position: math.Vec2.ZERO,
        lastPosition: math.Vec2.ZERO,
        lastGravity: new math.Vec2(0, 1), // DOWN
        force: math.Vec2.ZERO,
        velocity: math.Vec2.ZERO,
      });
    }
    return dataArray;
  }

  private readNormalization(
    source: CubismPhysics3Json.SerializableNormalization
  ): CubismPhysicsNormalization {
    return new CubismPhysicsNormalization({
      position: new CubismPhysicsNormalizationTuplet({
        maximum: source.position.maximum,
        minimum: source.position.minimum,
        defaultValue: source.position.default,
      }),
      angle: new CubismPhysicsNormalizationTuplet({
        maximum: source.angle.maximum,
        minimum: source.angle.minimum,
        defaultValue: source.angle.default,
      }),
    });
  }

  //#region Json Data

  /** Json file format version. */
  public version: number = 0;

  /** Additional data describing physics. */
  public meta = new CubismPhysics3Json.SerializableMeta();

  /** TODO Document. */
  public physicsSettings: CubismPhysics3Json.SerializablePhysicsSettings[] | null = null;

  //#endregion
}

//#region Json Helpers

namespace CubismPhysics3Json {
  /** 2-component vector. (struct) */
  export class SerializableVector2 implements IStructLike<SerializableVector2> {
    public readonly x: number;
    public readonly y: number;

    public constructor(args: { x?: number; y?: number } = {}) {
      this.x = args.x ?? 0;
      this.y = args.y ?? 0;
    }

    public clone(): SerializableVector2 {
      return new SerializableVector2({ x: this.x, y: this.y });
    }

    public copyWith(x?: number, y?: number): SerializableVector2 {
      return new SerializableVector2({ x: x ?? this.x, y: y ?? this.y });
    }

    /**
     * **Required properties**
     * - X
     * - Y
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: any): SerializableVector2 | undefined {
      if (json == null) {
        return undefined;
      }
      const x = asNumber(json.X);
      const y = asNumber(json.Y);
      if (x === undefined || y === undefined) {
        return undefined;
      }
      return new SerializableVector2({ x: x, y: y });
    }

    public equals(other: SerializableVector2): boolean {
      return this === other ? true : this.x == other.x && this.y == other.y;
    }

    public strictEquals(other: SerializableVector2): boolean {
      return this === other;
    }
  }

  /** Normalized values. (struct) */
  export class SerializableNormalizationValue
    implements IStructLike<SerializableNormalizationValue>
  {
    /** Minimum of normalization. */
    public readonly minimum: number;
    /** Center of normalization range. */
    public readonly default: number;
    /** Maximum of normalization. */
    public readonly maximum: number;

    public constructor(args: { minimum?: number; defaultValue?: number; maximum?: number } = {}) {
      this.minimum = args.minimum ?? 0;
      this.default = args.defaultValue ?? 0;
      this.maximum = args.maximum ?? 0;
    }

    public copyWith(
      args: {
        minimum?: number;
        defaultValue?: number;
        maximum?: number;
      } = {}
    ): SerializableNormalizationValue {
      return new SerializableNormalizationValue({
        minimum: args.minimum ?? this.minimum,
        defaultValue: args.defaultValue ?? this.default,
        maximum: args.maximum ?? this.maximum,
      });
    }

    public equals(other: SerializableNormalizationValue): boolean {
      return this === other
        ? true
        : this.minimum == other.minimum &&
            this.default == other.default &&
            this.maximum == other.maximum;
    }

    public strictEquals(other: SerializableNormalizationValue): boolean {
      return this === other;
    }

    /**
     * **Required properties**
     * - Minimum
     * - Default
     * - Maximum
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: any): SerializableNormalizationValue | undefined {
      if (json == null) {
        return undefined;
      }
      const minimum = asNumber(json.Minimum);
      const defaultValue = asNumber(json.Default);
      const maximum = asNumber(json.Maximum);
      if (minimum === undefined || defaultValue === undefined || maximum === undefined) {
        return undefined;
      }
      return new SerializableNormalizationValue({
        minimum: minimum,
        defaultValue: defaultValue,
        maximum: maximum,
      });
    }
  }

  /** Target parameter of model. (struct) */
  export class SerializableParameter implements IStructLike<SerializableParameter> {
    /** Target type. */
    public readonly target: string;
    /** Parameter ID. */
    public readonly id: string;

    public constructor(args: { target?: string; id?: string } = {}) {
      this.target = args.target ?? '';
      this.id = args.id ?? '';
    }

    public equals(other: SerializableParameter): boolean {
      return this === other ? true : this.target == other.target && this.id == other.id;
    }

    public strictEquals(other: SerializableParameter): boolean {
      return this === other;
    }

    public copyWith(args: { target?: string; id?: string } = {}): SerializableParameter {
      return new SerializableParameter({
        target: args.target !== undefined ? args.target : this.target,
        id: args.id !== undefined ? args.id : this.id,
      });
    }

    /**
     * **Required properties**
     * - Target
     * - Id
     * - Maximum
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: any) {
      if (json == null) {
        return undefined;
      }
      const target = asString(json.Target);
      const id = asString(json.Id);
      if (target === undefined || id === undefined) {
        return undefined;
      }
      return new SerializableParameter({
        target: target,
        id: id,
      });
    }
  }

  /** TODO Document. (struct) */
  export class SerializableInput implements IStructLike<SerializableInput> {
    /** Target parameter. */
    public readonly source: SerializableParameter;
    /** Influence ratio of each kind. */
    public readonly weight: number;
    /** Type of source. */
    public readonly type: string;
    /** TODO Document. */
    public readonly reflect: boolean;

    public constructor(
      args: {
        source?: SerializableParameter;
        weight?: number;
        type?: string;
        reflect?: boolean;
      } = {}
    ) {
      this.source = args.source != null ? args.source : SerializableParameter.DEFAULT;
      this.weight = args.weight ?? 0;
      this.type = args.type ?? '';
      this.reflect = args.reflect ?? false;
    }

    public copyWith(
      args: {
        source?: SerializableParameter;
        weight?: number;
        type?: string;
        reflect?: boolean;
      } = {}
    ): SerializableInput {
      return new SerializableInput({
        source: args.source ?? this.source,
        weight: args.weight ?? this.weight,
        type: args.type ?? this.type,
        reflect: args.reflect ?? this.reflect,
      });
    }

    public equals(other: SerializableInput): boolean {
      return (
        this === other ||
        (this.source.equals(other.source) &&
          this.weight == other.weight &&
          this.type == other.type &&
          this.reflect == other.reflect)
      );
    }

    public strictEquals(other: SerializableInput): boolean {
      return this === other;
    }

    public static isEquals(a: SerializableInput, b: SerializableInput) {
      return a.equals(b);
    }

    /**
     * **Required properties**
     * - Source
     * - Weight
     * - Type
     * - Reflect
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: any): SerializableInput | undefined {
      if (json == null) {
        return undefined;
      }
      const source = SerializableParameter.instantiateFromJson(json.Source);
      const weight = asNumber(json.Weight);
      const type = asString(json.Type);
      const reflect = asBoolean(json.Reflect);
      if (
        source === undefined ||
        weight === undefined ||
        type === undefined ||
        reflect === undefined
      ) {
        return undefined;
      }
      return new SerializableInput({
        source: source,
        weight: weight,
        type: type,
        reflect: reflect,
      });
    }
  }

  /** TODO Document. (struct) */
  export class SerializableOutput implements IStructLike<SerializableOutput> {
    /** Target parameter. */
    public readonly destination: SerializableParameter;
    /** Index of referenced vertex. */
    public readonly vertexIndex: number;
    /** Scale. */
    public readonly scale: number;
    /** Influence ratio of each kind. */
    public readonly weight: number;
    /** Type of destination. */
    public readonly type: string;
    /** TODO Document. */
    public readonly reflect: boolean;

    public constructor(
      args: {
        destination?: SerializableParameter;
        vertexIndex?: number;
        scale?: number;
        weight?: number;
        type?: string;
        reflect?: boolean;
      } = {}
    ) {
      this.destination = args.destination ?? SerializableParameter.DEFAULT;
      this.vertexIndex = args.vertexIndex ?? 0;
      this.scale = args.scale ?? 0;
      this.weight = args.weight ?? 0;
      this.type = args.type ?? '';
      this.reflect = args.reflect ?? false;
    }

    public equals(other: SerializableOutput): boolean {
      return (
        this === other ||
        (this.destination.equals(other.destination) &&
          this.vertexIndex == other.vertexIndex &&
          this.scale == other.scale &&
          this.weight == other.weight &&
          this.type == other.type &&
          this.reflect == other.reflect)
      );
    }

    public strictEquals(other: SerializableOutput): boolean {
      return this === other;
    }

    public copyWith(
      args: {
        destination?: SerializableParameter;
        vertexIndex?: number;
        scale?: number;
        weight?: number;
        type?: string;
        reflect?: boolean;
      } = {}
    ): SerializableOutput {
      return new SerializableOutput({
        destination: args.destination ?? this.destination,
        vertexIndex: args.vertexIndex ?? this.vertexIndex,
        scale: args.scale ?? this.scale,
        weight: args.weight ?? this.weight,
        type: args.type ?? this.type,
        reflect: args.reflect ?? this.reflect,
      });
    }

    public static isEquals(a: SerializableOutput, b: SerializableOutput) {
      return a.equals(b);
    }

    /**
     * **Required properties**
     * - Destination
     * - VertexIndex
     * - Scale
     * - Weight
     * - Type
     * - Reflect
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: any): SerializableOutput | undefined {
      if (json == null) {
        return undefined;
      }
      const destination = SerializableParameter.instantiateFromJson(json.Destination);
      const vertexIndex = asNumber(json.VertexIndex);
      const scale = asNumber(json.Scale);
      const weight = asNumber(json.Weight);
      const type = asString(json.Type);
      const reflect = asBoolean(json.Reflect);
      if (
        destination === undefined ||
        vertexIndex === undefined ||
        scale === undefined ||
        weight === undefined ||
        type === undefined ||
        reflect === undefined
      ) {
        return undefined;
      }
      return new SerializableOutput({
        destination: destination,
        vertexIndex: vertexIndex,
        scale: scale,
        weight: weight,
        type: type,
        reflect: reflect,
      });
    }
  }

  /** Single vertex. (struct) */
  export class SerializableVertex implements IStructLike<SerializableVertex> {
    /** Default position. */
    public position: SerializableVector2;
    /** Mobility. */
    public mobility: number;
    /** Delay ratio. */
    public delay: number;
    /** Acceleration. */
    public acceleration: number;
    /** Length. */
    public radius: number;

    public constructor(
      args: {
        position?: SerializableVector2;
        mobility?: number;
        delay?: number;
        acceleration?: number;
        radius?: number;
      } = {}
    ) {
      this.position = args.position ?? SerializableVector2.DEFAULT;
      this.mobility = args.mobility ?? 0;
      this.delay = args.delay ?? 0;
      this.acceleration = args.acceleration ?? 0;
      this.radius = args.radius ?? 0;
    }

    public equals(other: SerializableVertex): boolean {
      return (
        this === other ||
        (this.position.equals(other.position) &&
          this.mobility == other.mobility &&
          this.delay == other.delay &&
          this.acceleration == other.acceleration &&
          this.radius == other.radius)
      );
    }

    public strictEquals(other: SerializableVertex): boolean {
      return this === other;
    }

    public copyWith(
      args: {
        position?: SerializableVector2;
        mobility?: number;
        delay?: number;
        acceleration?: number;
        radius?: number;
      } = {}
    ): SerializableVertex {
      return new SerializableVertex({
        position: args.position?.clone() ?? this.position.clone(),
        mobility: args.mobility ?? this.mobility,
        delay: args.delay ?? this.delay,
        acceleration: args.acceleration ?? this.acceleration,
        radius: args.radius ?? this.radius,
      });
    }

    public static isEquals(a: SerializableVertex, b: SerializableVertex) {
      return a.equals(b);
    }

    /**
     * **Required properties**
     * - Position
     * - Mobility
     * - Delay
     * - Acceleration
     * - Radius
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: any): SerializableVertex | undefined {
      if (json == null) {
        return undefined;
      }
      const position = SerializableVector2.instantiateFromJson(json.Position);
      const mobility = asNumber(json.Mobility);
      const delay = asNumber(json.Delay);
      const acceleration = asNumber(json.Acceleration);
      const radius = asNumber(json.Radius);
      if (
        position === undefined ||
        mobility === undefined ||
        delay === undefined ||
        acceleration === undefined ||
        radius === undefined
      ) {
        return undefined;
      }
      return new SerializableVertex({
        position: position,
        mobility: mobility,
        delay: delay,
        acceleration: acceleration,
        radius: radius,
      });
    }
  }

  /** Parameter(input value normalized). (struct) */
  export class SerializableNormalization implements IStructLike<SerializableNormalization> {
    /** Normalization value of position. */
    public readonly position: SerializableNormalizationValue;
    /** Normalization value of angle. */
    public readonly angle: SerializableNormalizationValue;

    public constructor(
      args: {
        position?: SerializableNormalizationValue;
        angle?: SerializableNormalizationValue;
      } = {}
    ) {
      this.position = args.position ?? SerializableNormalizationValue.DEFAULT;
      this.angle = args.angle ?? SerializableNormalizationValue.DEFAULT;
    }

    public copyWith(
      args: {
        position?: SerializableNormalizationValue;
        angle?: SerializableNormalizationValue;
      } = {}
    ): SerializableNormalization {
      return new SerializableNormalization({
        position: args.position ?? this.position,
        angle: args.angle ?? this.angle,
      });
    }

    public equals(other: SerializableNormalization): boolean {
      return (
        this === other || (this.position.equals(other.position) && this.angle.equals(other.angle))
      );
    }

    public strictEquals(other: SerializableNormalization): boolean {
      return this === other;
    }

    /**
     * **Required properties**
     * - Position
     * - Angle
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: any): SerializableNormalization | undefined {
      if (json == null) {
        return undefined;
      }
      const position = SerializableNormalizationValue.instantiateFromJson(json.Position);
      const angle = SerializableNormalizationValue.instantiateFromJson(json.Angle);
      if (position === undefined || angle === undefined) {
        return undefined;
      }
      return new SerializableNormalization({
        position: position,
        angle: angle,
      });
    }
  }

  /** Setting of physics calculation. (struct) */
  export class SerializablePhysicsSettings implements IStructLike<SerializablePhysicsSettings> {
    /** TODO Document. */
    public readonly id: string;
    /** Input array. */
    public readonly input: SerializableInput[];
    /** Output array. */
    public readonly output: SerializableOutput[];
    /** Vertices. */
    public readonly vertices: SerializableVertex[];
    /** Normalization parameter of using input. */
    public readonly normalization: SerializableNormalization;

    public constructor(
      args: {
        id?: string;
        input?: SerializableInput[];
        output?: SerializableOutput[];
        vertices?: SerializableVertex[];
        normalization?: SerializableNormalization;
      } = {}
    ) {
      this.id = args.id ?? '';
      this.input = args.input ?? new Array();
      this.output = args.output ?? new Array();
      this.vertices = args.vertices ?? new Array();
      this.normalization = args.normalization ?? SerializableNormalization.DEFAULT;
    }

    public copyWith(
      args: {
        id?: string;
        input?: SerializableInput[];
        output?: SerializableOutput[];
        vertices?: SerializableVertex[];
        normalization?: SerializableNormalization;
      } = {}
    ): SerializablePhysicsSettings {
      return new SerializablePhysicsSettings({
        id: args.id ?? this.id,
        input: args.input ?? this.input,
        output: args.output ?? this.output,
        vertices: args.vertices ?? this.vertices,
        normalization: args.normalization ?? this.normalization,
      });
    }

    public equals(other: SerializablePhysicsSettings): boolean {
      const { isEquals } = ArrayExtensions;
      return (
        this === other ||
        (this.id == other.id &&
          isEquals(SerializableInput.isEquals, this.input, other.input) &&
          isEquals(SerializableOutput.isEquals, this.output, other.output) &&
          isEquals(SerializableVertex.isEquals, this.vertices, other.vertices) &&
          this.normalization.equals(other.normalization))
      );
    }

    public strictEquals(other: SerializablePhysicsSettings): boolean {
      return this === other;
    }

    /**
     * **Required properties**
     * - Id
     * - Input
     * - Vertices
     * - Output
     * - Normalization
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: any): SerializablePhysicsSettings | undefined {
      if (json == null) {
        return undefined;
      }
      const { asString, asArray } = JsonParseUtils;

      const id = asString(json.Id);
      const input = JsonParseUtils.arrayedInstantiateFromJson(
        json.Input,
        SerializableInput.instantiateFromJson
      );
      const output = JsonParseUtils.arrayedInstantiateFromJson(
        json.Output,
        SerializableOutput.instantiateFromJson
      );
      const vertices = JsonParseUtils.arrayedInstantiateFromJson(
        json.Vertices,
        SerializableVertex.instantiateFromJson
      );
      const normalization = SerializableNormalization.instantiateFromJson(json.Normalization);
      if (
        id === undefined ||
        input === undefined ||
        output === undefined ||
        vertices === undefined ||
        normalization === undefined
      ) {
        return undefined;
      }
      return new SerializablePhysicsSettings({
        id: id,
        input: input,
        output: output,
        vertices: vertices,
        normalization: normalization,
      });
    }
  }

  /** Additional data describing physics. (struct) */
  export class SerializableMeta implements IStructLike<SerializableMeta> {
    /** Number of physics settings. */
    public readonly physicsSettingCount: number;
    /** Total number of input parameters. */
    public readonly totalInputCount: number;
    /** Total number of output parameters. */
    public readonly totalOutputCount: number;
    /** Total number of vertices. */
    public readonly totalVertexCount: number;
    /** TODO Document. */
    public readonly effectiveForces: SerializableEffectiveForces;

    public constructor(
      args: {
        physicsSettingCount?: number;
        totalInputCount?: number;
        totalOutputCount?: number;
        totalVertexCount?: number;
        effectiveForces?: SerializableEffectiveForces;
      } = {}
    ) {
      this.physicsSettingCount = args.physicsSettingCount ?? 0;
      this.totalInputCount = args.totalInputCount ?? 0;
      this.totalOutputCount = args.totalOutputCount ?? 0;
      this.totalVertexCount = args.totalVertexCount ?? 0;
      this.effectiveForces = args.effectiveForces ?? SerializableEffectiveForces.DEFAULT;
    }

    public copyWith(
      args: {
        physicsSettingCount?: number;
        totalInputCount?: number;
        totalOutputCount?: number;
        totalVertexCount?: number;
        effectiveForces?: SerializableEffectiveForces;
      } = {}
    ): SerializableMeta {
      return new SerializableMeta({
        physicsSettingCount: args.physicsSettingCount ?? this.physicsSettingCount,
        totalInputCount: args.totalInputCount ?? this.totalInputCount,
        totalOutputCount: args.totalOutputCount ?? this.totalOutputCount,
        totalVertexCount: args.totalVertexCount ?? this.totalVertexCount,
        effectiveForces: args.effectiveForces ?? this.effectiveForces,
      });
    }

    public equals(other: SerializableMeta): boolean {
      return this === other
        ? true
        : this.physicsSettingCount == other.physicsSettingCount &&
            this.totalInputCount == other.totalInputCount &&
            this.totalOutputCount == other.totalOutputCount &&
            this.totalVertexCount == other.totalVertexCount &&
            this.effectiveForces.equals(other.effectiveForces);
    }

    public strictEquals(other: SerializableMeta): boolean {
      return this === other;
    }

    /**
     * **Required properties**
     * - PhysicsSettingCount
     * - TotalInputCount
     * - TotalOutputCount
     * - VertexCount
     * - EffectiveForces
     * - PhysicsDictionary (for Unity 未実装)
     *
     * **Optional properties**
     * - Fps (for Unity 未実装)
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: any): SerializableMeta | undefined {
      if (json == null) {
        return undefined;
      }
      const physicsSettingCount = asNumber(json.PhysicsSettingCount);
      const totalInputCount = asNumber(json.TotalInputCount);
      const totalOutputCount = asNumber(json.TotalOutputCount);
      const vertexCount = asNumber(json.VertexCount);
      const effectiveForces = SerializableEffectiveForces.instantiateFromJson(json.EffectiveForces);
      if (
        physicsSettingCount === undefined ||
        totalInputCount === undefined ||
        totalOutputCount === undefined ||
        vertexCount === undefined ||
        effectiveForces === undefined
      ) {
        return undefined;
      }
      return new SerializableMeta({
        physicsSettingCount: physicsSettingCount,
        totalInputCount: totalInputCount,
        totalOutputCount: totalOutputCount,
        totalVertexCount: vertexCount,
        effectiveForces: effectiveForces,
      });
    }
  }

  /** TODO Document. (struct) */
  export class SerializableEffectiveForces implements IStructLike<SerializableEffectiveForces> {
    /** Gravity. */
    public readonly gravity: SerializableVector2;
    /** Wind. (Not in use) */
    public readonly wind: SerializableVector2;

    public constructor(args: { gravity?: SerializableVector2; wind?: SerializableVector2 } = {}) {
      this.gravity = args.gravity ?? SerializableVector2.DEFAULT;
      this.wind = args.wind ?? SerializableVector2.DEFAULT;
    }

    public copyWith(
      args: { gravity?: SerializableVector2; wind?: SerializableVector2 } = {}
    ): SerializableEffectiveForces {
      return new SerializableEffectiveForces({
        gravity: args.gravity ?? this.gravity,
        wind: args.wind ?? this.wind,
      });
    }

    /**
     * **Required properties**
     * - Gravity
     * - Wind
     * @param json
     * @returns
     */
    public static instantiateFromJson(json: any): SerializableEffectiveForces | undefined {
      if (json == null) {
        return undefined;
      }
      const gravity = SerializableVector2.instantiateFromJson(json.Gravity);
      const wind = SerializableVector2.instantiateFromJson(json.Wind);
      if (gravity === undefined || wind === undefined) {
        return undefined;
      }
      return new SerializableEffectiveForces({ gravity: gravity, wind: wind });
    }

    public equals(other: SerializableEffectiveForces): boolean {
      return this === other || (this.gravity.equals(other.gravity) && this.wind.equals(other.wind));
    }

    public strictEquals(other: SerializableEffectiveForces): boolean {
      return this === other;
    }
  }

  export namespace SerializableVector2 {
    export const DEFAULT = new SerializableVector2();
  }

  export namespace SerializableEffectiveForces {
    export const DEFAULT = new SerializableEffectiveForces();
  }

  export namespace SerializableMeta {
    export const DEFAULT = new SerializableMeta();
  }

  export namespace SerializableNormalizationValue {
    export const DEFAULT = new SerializableNormalizationValue();
  }

  export namespace SerializableParameter {
    export const DEFAULT = new SerializableParameter();
  }

  export namespace SerializableInput {
    export const DEFAULT = new SerializableInput();
  }

  export namespace SerializableVertex {
    export const DEFAULT = new SerializableVertex();
  }

  export namespace SerializableNormalization {
    export const DEFAULT = new SerializableNormalization();
  }

  export namespace SerializablePhysicsSettings {
    export const DEFAULT = new SerializablePhysicsSettings();
  }
}

//#endregion

export default CubismPhysics3Json;
