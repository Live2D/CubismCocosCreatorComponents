/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { animation, AnimationClip, CCInteger, JsonAsset, _decorator, __private } from 'cc';
import CubismParameter from '../../Core/CubismParameter';
import CubismPart from '../../Core/CubismPart';
import CubismRenderController from '../../Rendering/CubismRenderController';
import CubismEyeBlinkController from '../CubismEyeBlinkController';
import CubismMouthController from '../MouthMovement/CubismMouthController';
import JsonParseUtils from './JsonParseUtils';
import type CubismPose3Json from './CubismPose3Json';
import type IStructLike from '../../IStructLike';
import { ArrayExtensions } from '../../Utils';
const { ccclass, property } = _decorator;
const { asArray, asBoolean, asNumber, asString } = JsonParseUtils;

interface RealKeyframeValue {
  value: number;
  rightTangent: number;
  rightTangentWeight: number;
  leftTangent: number;
  leftTangentWeight: number;
}

namespace RealKeyframeValue {
  export function instantiate(value: number) {
    return {
      value: value,
      rightTangent: 0,
      rightTangentWeight: 0,
      leftTangent: 0,
      leftTangentWeight: 0,
    };
  }
}

type RealKeyframe = __private._cocos_core_curves_keyframe_curve__KeyFrame<RealKeyframeValue>;

/** Delegate */
type SegmentParser = (segments: number[], result: RealKeyframe[], position: number) => number;

//#region Json Object Types

@ccclass('CubismMotion3Json.SerializableMeta')
/** Motion meta info. (struct) */
export class SerializableMeta implements IStructLike<SerializableMeta> {
  /** Duration in seconds. */
  public readonly duration: number;

  /** Framerate in seconds. */
  public readonly fps: number;

  /** True if motion is looping. */
  public readonly loop: boolean;

  /** Number of curves. */
  public readonly curveCount: number;

  /** Total number of curve segments. */
  public readonly totalSegmentCount: number;

  /** Total number of curve points. */
  public readonly totalPointCount: number;

  /** True if beziers are restricted. */
  public readonly areBeziersRestricted: boolean;

  /** Total number of UserData. */
  public readonly userDataCount: number;

  /** Total size of UserData in bytes. */
  public readonly totalUserDataSize: number;

  /** [Optional] Time of the Fade-In for easing in seconds. */
  public readonly fadeInTime: number;

  /** [Optional] Time of the Fade-Out for easing in seconds. */
  public readonly fadeOutTime: number;

  public constructor(
    args: {
      duration?: number;
      fps?: number;
      loop?: boolean;
      curveCount?: number;
      totalSegmentCount?: number;
      totalPointCount?: number;
      areBeziersRestricted?: boolean;
      userDataCount?: number;
      totalUserDataSize?: number;
      fadeInTime?: number;
      fadeOutTime?: number;
    } = {}
  ) {
    this.duration = args.duration ?? 0;
    this.fps = args.fps ?? 0;
    this.loop = args.loop ?? false;
    this.curveCount = args.curveCount ?? 0;
    this.totalSegmentCount = args.totalSegmentCount ?? 0;
    this.totalPointCount = args.totalPointCount ?? 0;
    this.areBeziersRestricted = args.areBeziersRestricted ?? false;
    this.userDataCount = args.userDataCount ?? 0;
    this.totalUserDataSize = args.totalUserDataSize ?? 0;
    this.fadeInTime = args.fadeInTime ?? -1.0;
    this.fadeOutTime = args.fadeOutTime ?? -1.0;
  }

  public copyWith(
    args: {
      duration?: number;
      fps?: number;
      loop?: boolean;
      curveCount?: number;
      totalSegmentCount?: number;
      totalPointCount?: number;
      areBeziersRestricted?: boolean;
      userDataCount?: number;
      totalUserDataSize?: number;
      fadeInTime?: number;
      fadeOutTime?: number;
    } = {}
  ): SerializableMeta {
    return new SerializableMeta({
      duration: args.duration ?? this.duration,
      fps: args.fps ?? this.fps,
      loop: args.loop ?? this.loop,
      curveCount: args.curveCount ?? this.curveCount,
      totalSegmentCount: args.totalSegmentCount ?? this.totalSegmentCount,
      totalPointCount: args.totalPointCount ?? this.totalPointCount,
      areBeziersRestricted: args.areBeziersRestricted ?? this.areBeziersRestricted,
      userDataCount: args.userDataCount ?? this.userDataCount,
      totalUserDataSize: args.totalUserDataSize ?? this.totalUserDataSize,
      fadeInTime: args.fadeInTime ?? this.fadeInTime,
      fadeOutTime: args.fadeOutTime ?? this.fadeOutTime,
    });
  }

  public equals(other: SerializableMeta): boolean {
    return this === other
      ? true
      : this.duration == other.duration &&
          this.fps == other.fps &&
          this.loop == other.loop &&
          this.curveCount == other.curveCount &&
          this.totalSegmentCount == other.totalSegmentCount &&
          this.totalPointCount == other.totalPointCount &&
          this.areBeziersRestricted == other.areBeziersRestricted &&
          this.userDataCount == other.userDataCount &&
          this.totalUserDataSize == other.totalUserDataSize &&
          this.fadeInTime == other.fadeInTime &&
          this.fadeOutTime == other.fadeOutTime;
  }

  public strictEquals(other: SerializableMeta): boolean {
    return this === other;
  }

  /**
   * **Required properties**
   * - Duration
   * - Fps
   * - CurveCount
   * - TotalSegmentCount
   * - TotalPointCount
   *
   * **Optional properties**
   * - Loop
   * - AreBeziersRestricted
   * - FadeInTime
   * - FadeOutTime
   * - UserDataCount
   * - TotalUserDataSize
   * @param json
   * @returns
   */
  public static instantiateFromJson(json: any): SerializableMeta | undefined {
    if (json == null) {
      return undefined;
    }
    const duration = asNumber(json.Duration);
    const fps = asNumber(json.Fps);
    const curveCount = asNumber(json.CurveCount);
    const totalSegmentCount = asNumber(json.TotalSegmentCount);
    const totalPointCount = asNumber(json.TotalPointCount);
    if (
      duration === undefined ||
      fps === undefined ||
      curveCount === undefined ||
      totalSegmentCount === undefined
    ) {
      return undefined;
    }

    const loop = asBoolean(json.Loop);
    const areBeziersRestricted = asBoolean(json.AreBeziersRestricted);
    const fadeInTime = asNumber(json.FadeInTime);
    const fadeOutTime = asNumber(json.FadeOutTime);
    const userDataCount = asNumber(json.UserDataCount);
    const totalUserDataSize = asNumber(json.TotalUserDataSize);

    return new SerializableMeta({
      duration: duration,
      fps: fps,
      loop: loop,
      areBeziersRestricted: areBeziersRestricted,
      curveCount: curveCount,
      totalSegmentCount: totalSegmentCount,
      totalPointCount: totalPointCount,
      userDataCount: userDataCount,
      totalUserDataSize: totalUserDataSize,
      fadeInTime: fadeInTime,
      fadeOutTime: fadeOutTime,
    });
  }
}

@ccclass('CubismMotion3Json.SerializableCurve')
export class SerializableCurve implements IStructLike<SerializableCurve> {
  /** Target type. */
  public readonly target: string;

  /** Id within target. */
  public readonly id: string;

  /** Flattened curve segments. */
  public readonly segments: Array<number>;

  /** [Optional] Time of the overall Fade-In for easing in seconds. */
  public readonly fadeInTime: number;

  /** [Optional] Time of the overall Fade-Out for easing in seconds. */
  public readonly fadeOutTime: number;

  public constructor(
    args: {
      target?: string;
      id?: string;
      segments?: Array<number>;
      fadeInTime?: number;
      fadeOutTime?: number;
    } = {}
  ) {
    this.target = args.target ?? '';
    this.id = args.id ?? '';
    this.segments = args.segments ?? new Array(0);
    this.fadeInTime = args.fadeInTime ?? -1.0;
    this.fadeOutTime = args.fadeOutTime ?? -1.0;
  }

  public copyWith(
    args: {
      target?: string;
      id?: string;
      segments?: Array<number>;
      fadeInTime?: number;
      fadeOutTime?: number;
    } = {}
  ): SerializableCurve {
    return new SerializableCurve({
      target: args.target ?? this.target,
      id: args.id ?? this.id,
      segments: args.segments ?? this.segments,
      fadeInTime: args.fadeInTime ?? this.fadeInTime,
      fadeOutTime: args.fadeOutTime ?? this.fadeOutTime,
    });
  }

  public equals(other: SerializableCurve): boolean {
    return this === other
      ? true
      : this.target == other.target &&
          this.id == other.id &&
          ArrayExtensions.isEquals((x, y) => x == y, this.segments, other.segments) &&
          this.fadeInTime == other.fadeInTime &&
          this.fadeOutTime == other.fadeOutTime;
  }

  public strictEquals(other: SerializableCurve): boolean {
    return this === other;
  }

  /**
   * **Required properties**
   * - Target
   * - Id
   * - Segments
   *
   * **Optional properties**
   * - FadeInTime
   * - FadeOutTime
   * @param json
   * @returns
   */
  public static instantiateFromJson(json: any): SerializableCurve | undefined {
    if (json == null) {
      return undefined;
    }
    const target = asString(json.Target);
    const id = asString(json.Id);
    const tempSegments = asArray(json.Segments);
    if (target === undefined || id === undefined || tempSegments === undefined) {
      return undefined;
    }
    const segments = new Array<number>(tempSegments.length);
    for (let i = 0; i < tempSegments.length; i++) {
      const num = asNumber(tempSegments[i]);
      if (num === undefined) {
        return undefined;
      }
      segments[i] = num;
    }

    const fadeInTime = asNumber(json.FadeInTime);
    const fadeOutTime = asNumber(json.FadeOutTime);

    return new SerializableCurve({
      target: target,
      id: id,
      segments: segments,
      fadeInTime: fadeInTime,
      fadeOutTime: fadeOutTime,
    });
  }
}

@ccclass('CubismMotion3Json.SerializableUserData')
export class SerializableUserData implements IStructLike<SerializableUserData> {
  /** Time in seconds. */
  public readonly time: number;
  /** Content of user data. */
  public readonly value: string;

  public constructor(args: { time?: number; value?: string } = {}) {
    this.time = args.time ?? 0;
    this.value = args.value ?? '';
  }

  public copyWith(args: { time?: number; value?: string } = {}): SerializableUserData {
    return new SerializableUserData({
      time: args.time ?? this.time,
      value: args.value ?? this.value,
    });
  }

  public equals(other: SerializableUserData): boolean {
    return this === other ? true : this.time == other.time && this.value == other.value;
  }

  public strictEquals(other: SerializableUserData): boolean {
    return this === other;
  }

  /**
   * **Required properties**
   * - Time
   * - Value
   * @param json
   * @returns
   */
  public static instantiateFromJson(json: any): SerializableUserData | undefined {
    if (json == null) {
      return undefined;
    }
    const time = asNumber(json.Time);
    const value = asString(json.Value);
    if (time === undefined || value === undefined) {
      return undefined;
    }
    return new SerializableUserData({
      time: time,
      value: value,
    });
  }
}

export namespace SerializableMeta {
  export const DEFAULT = new SerializableMeta();
}

export namespace SerializableCurve {
  export const DEFAULT = new SerializableCurve();
}

export namespace SerializableUserData {
  export const DEFAULT = new SerializableUserData();
}
//#endregion

/**
 * Contains Cubism motion3.json data.
 *
 * **Sealed class.**
 */
@ccclass('CubismMotion3Json')
export default class CubismMotion3Json {
  private constructor() {}

  //#region Load Methods

  /**
   * Loads a motion3.json asset.
   * @param motion3Json motion3.json to deserialize.
   * @returns Deserialized motion3.json on success; null otherwise.
   */
  public static loadFrom(motion3Json: string): CubismMotion3Json | null {
    const json = JsonParseUtils.parse(motion3Json);
    if (!json) {
      return null;
    }
    return this.loadFromJson(json);
  }

  /**
   * Loads a motion3.json asset.
   * @param motion3JsonAsset motion3.json to deserialize.
   * @returns Deserialized motion3.json on success; null otherwise.
   */
  public static loadFromJsonAsset(motion3JsonAsset: JsonAsset): CubismMotion3Json | null {
    if (motion3JsonAsset.json == null) {
      return null;
    }
    return this.loadFromJson(motion3JsonAsset.json);
  }

  private static loadFromJson(json: any) {
    if (json == null) {
      return null;
    }
    const version = asNumber(json.Version);
    const meta = SerializableMeta.instantiateFromJson(json.Meta);
    const userData =
      JsonParseUtils.arrayedInstantiateFromJson(
        json.UserData,
        SerializableUserData.instantiateFromJson
      ) ?? new Array<SerializableUserData>(0);
    const curves = JsonParseUtils.arrayedInstantiateFromJson(
      json.Curves,
      SerializableCurve.instantiateFromJson
    );
    if (version === undefined || meta === undefined || curves === undefined) {
      return null;
    }

    const asset = new CubismMotion3Json();
    asset.version = version;
    asset.meta = meta;
    asset.userData = userData;
    asset.curves = curves;
    return asset;
  }

  //#endregion

  //#region Json Data

  /** The model3.json format version. */
  @property(CCInteger)
  public version: number = 0;

  /** Motion meta info. */
  @property(SerializableMeta)
  public meta: SerializableMeta = new SerializableMeta();

  /** Curves. */
  @property([SerializableCurve])
  public curves: SerializableCurve[] = new Array(0);

  /** User data. */
  @property([SerializableUserData])
  public userData: SerializableUserData[] = new Array(0);

  /**
   * Converts motion curve segments into Keyframes.
   * @param segments Data to convert.
   * @returns Keyframes.
   */
  public static convertCurveSegmentsToKeyframes(segments: Array<number>): Array<RealKeyframe> {
    // Return early on invalid input.
    if (segments.length < 1) {
      return new Array(0);
    }
    // Initialize container for keyframes.
    const keyframes = new Array<RealKeyframe>(1);
    keyframes[0] = [segments[0], RealKeyframeValue.instantiate(segments[1])];

    // Parse segments.
    for (var i = 2; i < segments.length; ) {
      i = this.parsers(segments[i])(segments, keyframes, i);
    }

    return keyframes;
  }

  /**
   * Converts stepped curves to liner curves.
   * @param curve Data to convert.
   * @param poseFadeInTime
   * @returns Animation curve.
   */
  public static convertSteppedCurveToLinerCurver(
    curve: SerializableCurve,
    poseFadeInTime: number
  ): Array<RealKeyframe> {
    poseFadeInTime = poseFadeInTime < 0 ? 0.5 : poseFadeInTime;

    const segments = curve.segments;
    let segmentsCount = 2;

    for (var index = 2; index < segments.length; index += 3) {
      // if current segment type is stepped and
      // next segment type is stepped or next segment is last segment
      // then convert segment type to liner.
      const currentSegmentTypeIsStepped = curve.segments[index] == 2;
      const currentSegmentIsLast = index == curve.segments.length - 3;
      const nextSegmentTypeIsStepped = currentSegmentIsLast
        ? false
        : curve.segments[index + 3] == 2;
      const nextSegmentIsLast = currentSegmentIsLast
        ? false
        : index + 3 == curve.segments.length - 3;
      if (currentSegmentTypeIsStepped && (nextSegmentTypeIsStepped || nextSegmentIsLast)) {
        segments.length += 3;
        segments[segmentsCount + 0] = 0;
        segments[segmentsCount + 1] = curve.segments[index + 1];
        segments[segmentsCount + 2] = curve.segments[index - 1];
        segments[segmentsCount + 3] = 0;
        segments[segmentsCount + 4] = curve.segments[index + 1] + poseFadeInTime;
        segments[segmentsCount + 5] = curve.segments[index + 2];
        segmentsCount += 6;
      } else if (curve.segments[index] == 1) {
        segments[segmentsCount + 0] = curve.segments[index + 0];
        segments[segmentsCount + 1] = curve.segments[index + 1];
        segments[segmentsCount + 2] = curve.segments[index + 2];
        segments[segmentsCount + 3] = curve.segments[index + 3];
        segments[segmentsCount + 4] = curve.segments[index + 4];
        segments[segmentsCount + 5] = curve.segments[index + 5];
        segments[segmentsCount + 6] = curve.segments[index + 6];
        index += 4;
        segmentsCount += 7;
      } else {
        segments[segmentsCount + 0] = curve.segments[index + 0];
        segments[segmentsCount + 1] = curve.segments[index + 1];
        segments[segmentsCount + 2] = curve.segments[index + 2];
        segmentsCount += 3;
      }
    }

    return CubismMotion3Json.convertCurveSegmentsToKeyframes(segments);
  }

  /**
   * Instantiates an AnimationClip.
   * Note this method generates AnimationClip.legacy clips when called at runtime.
   * @param shouldImportAsOriginalWorkflow Should import as original workflow.
   * @param shouldClearAnimationCurves Should clear animation clip curves.
   * @param isCallFormModelJson Is function call form CubismModel3Json.
   * @param poseJson pose3.json asset.
   * @returns The instantiated clip on success; null otherwise.
   */
  public toAnimationClipA(
    shouldImportAsOriginalWorkflow: boolean = false,
    shouldClearAnimationCurves: boolean = false,
    isCallFormModelJson: boolean = false,
    poseJson: CubismPose3Json | null = null
  ): AnimationClip {
    // Check béziers restriction flag.
    if (!this.meta.areBeziersRestricted) {
      console.warn(
        'Béziers are not restricted and curves might be off. Please export motions from Cubism in restricted mode for perfect match.'
      );
    }
    // Create animation clip.
    const animationClip = new AnimationClip();

    return this.toAnimationClipB(
      animationClip,
      shouldImportAsOriginalWorkflow,
      shouldClearAnimationCurves,
      isCallFormModelJson,
      poseJson
    );
  }

  /**
   * Instantiates an AnimationClip.
   * Note this method generates AnimationClip.legacy clips when called at runtime.
   * @param animationClip Previous animation clip.
   * @param shouldImportAsOriginalWorkflow Should import as original workflow.
   * @param shouldClearAnimationCurves Should clear animation clip curves.
   * @param isCallFormModelJson Is function call form CubismModel3Json.
   * @param poseJson pose3.json asset.
   * @returns The instantiated clip on success; null otherwise.
   */
  public toAnimationClipB(
    animationClip: AnimationClip,
    shouldImportAsOriginalWorkflow: boolean = false,
    shouldClearAnimationCurves: boolean = false,
    isCallFormModelJson: boolean = false,
    poseJson: CubismPose3Json | null = null
  ): AnimationClip {
    // Clear curves.
    if (
      shouldClearAnimationCurves &&
      (!shouldImportAsOriginalWorkflow || (isCallFormModelJson && shouldImportAsOriginalWorkflow))
    ) {
      animationClip.clearTracks();
    }

    animationClip.sample = this.meta.fps;

    // Convert curves.
    for (let i = 0; i < this.curves.length; i++) {
      const curve = this.curves[i];

      // If should import as original workflow mode, skip add part opacity curve when call not from model3.json.
      if (curve.target == 'PartOpacity' && shouldImportAsOriginalWorkflow && !isCallFormModelJson) {
        continue;
      }

      let relativePath = new animation.TrackPath();
      let animationCurve = CubismMotion3Json.convertCurveSegmentsToKeyframes(curve.segments);

      // Create model binding.
      if (curve.target == 'Model') {
        // Bind opacity.
        if (curve.id == 'Opacity') {
          relativePath = new animation.TrackPath()
            .toComponent(CubismRenderController)
            .toProperty('opacity');
        }
        // Bind eye-blink.
        else if (curve.id == 'EyeBlink') {
          relativePath = new animation.TrackPath()
            .toComponent(CubismEyeBlinkController)
            .toProperty('EyeOpening');
        }

        // Bind lip-sync.
        else if (curve.id == 'LipSync') {
          relativePath = new animation.TrackPath()
            .toComponent(CubismMouthController)
            .toProperty('MouthOpening');
        }
      }

      // Create parameter binding.
      else if (curve.target == 'Parameter') {
        relativePath = new animation.TrackPath()
          .toHierarchy('Parameters/' + curve.id)
          .toComponent(CubismParameter)
          .toProperty('value');
      }

      // Create part opacity binding.
      else if (curve.target == 'PartOpacity') {
        relativePath = new animation.TrackPath()
          .toHierarchy('Parts/' + curve.id)
          .toComponent(CubismPart)
          .toProperty('opacity');

        // original workflow.
        if (shouldImportAsOriginalWorkflow && poseJson != null && poseJson.fadeInTime != 0.0) {
          let track = CubismMotion3Json.convertSteppedCurveToLinerCurver(
            curve,
            poseJson.fadeInTime
          );
        }
      }

      let track = getTrackFromPath(animationClip, relativePath);
      if (!track) {
        track = new animation.RealTrack();
        track.path = relativePath;
        animationClip.addTrack(track);
      }
      track.channel.curve.assignSorted(animationCurve);
    }

    animationClip.duration = this.meta.duration;
    if (this.meta.loop) {
      animationClip.wrapMode = AnimationClip.WrapMode.Loop;
    } else {
      animationClip.wrapMode = AnimationClip.WrapMode.Default;
    }

    if (this.userData.length > 0) {
      for (let i = 0; i < this.userData.length; i++) {
        const params = new Array<string>();
        params.push(this.userData[i].value);
        const frame = this.userData[i].time;
        // 指定frameにeventがなければ新規追加 あれば更新
        const existFrameIndex = animationClip.events.findIndex((v) => v.frame === frame);
        if (existFrameIndex === -1) {
          animationClip.events.push({ frame: frame, func: `CubismMotionEvent`, params: params });
        } else {
          animationClip.events[existFrameIndex] = { frame: frame, func: `CubismMotionEvent`, params: params };
        }
      }
    }

    return animationClip;
  }

  /** Offset to use for setting of keyframes. */
  private static get offsetGranularity() {
    return 0.01;
  }

  /** Available segment parsers. */
  private static parsers(id: number): SegmentParser {
    switch (id) {
      case 0:
        return CubismMotion3Json.parseLinearSegment;
      case 1:
        return CubismMotion3Json.parseBezierSegment;
      case 2:
        return CubismMotion3Json.parseSteppedSegment;
      case 3:
        return CubismMotion3Json.parseInverseSteppedSegment;
      default:
        console.warn('CubismMotion3Json.Parsers: Called default case in switch statement.');
        return CubismMotion3Json.parseLinearSegment;
    }
  }

  /** Parses a linear segment. */
  private static parseLinearSegment(
    segments: Array<number>,
    result: Array<RealKeyframe>,
    position: number
  ): number {
    // return position: int
    // Compute slope.
    const length = segments[position + 1] - result[result.length - 1][0];
    const slope = (segments[position + 2] - result[result.length - 1][1].value) / length;

    // Determine tangents.
    const outTangent = slope;
    const inTangent = outTangent;

    // Create keyframes.
    let keyframe: RealKeyframe = [
      result[result.length - 1][0],
      RealKeyframeValue.instantiate(result[result.length - 1][1].value),
    ];
    keyframe[1].leftTangent = result[result.length - 1][1].leftTangent;
    keyframe[1].rightTangent = outTangent;

    result[result.length - 1] = keyframe;

    keyframe = [segments[position + 1], RealKeyframeValue.instantiate(segments[position + 2])];
    keyframe[1].leftTangent = inTangent;
    keyframe[1].rightTangent = 0;

    result.push(keyframe);

    // Update position.
    return position + 3;
  }

  /** Parses a bezier segment. */
  private static parseBezierSegment(
    segments: Array<number>,
    result: Array<RealKeyframe>,
    position: number
  ): number {
    // Compute tangents.
    const tangentLength = Math.abs(result[result.length - 1][0] - segments[position + 5]) * (1 / 3);

    const outTangent =
      (segments[position + 2] - result[result.length - 1][1].value) / tangentLength;
    const inTangent = (segments[position + 6] - segments[position + 4]) / tangentLength;

    // Create keyframes.
    let keyframe: RealKeyframe = [
      result[result.length - 1][0],
      RealKeyframeValue.instantiate(result[result.length - 1][1].value),
    ];

    keyframe[1].leftTangent = result[result.length - 1][1].leftTangent;
    keyframe[1].rightTangent = outTangent;

    result[result.length - 1] = keyframe;

    keyframe = [segments[position + 5], RealKeyframeValue.instantiate(segments[position + 6])];
    keyframe[1].leftTangent = inTangent;
    keyframe[1].rightTangent = 0;
    result.push(keyframe);

    // Update position.
    return position + 7;
  }

  /** Parses a stepped segment. */
  private static parseSteppedSegment(
    segments: Array<number>,
    result: Array<RealKeyframe>,
    position: number
  ): number {
    // Create keyframe.
    const keyframe: RealKeyframe = [
      segments[position + 1],
      RealKeyframeValue.instantiate(segments[position + 2]),
    ];
    keyframe[1].leftTangent = Number.POSITIVE_INFINITY;
    result.push(keyframe);

    // Update position.
    return position + 3;
  }

  /** Parses a inverse-stepped segment. */
  private static parseInverseSteppedSegment(
    segments: Array<number>,
    result: Array<RealKeyframe>,
    position: number
  ): number {
    // Compute tangents.
    let keyframe = result[result.length - 1];
    const tangent = Math.atan2(
      segments[position + 2] - keyframe[1].value,
      segments[position + 1] - keyframe[0]
    );
    keyframe[1].rightTangent = tangent;
    result[result.length - 1] = keyframe;

    keyframe = [
      keyframe[0] + CubismMotion3Json.offsetGranularity,
      RealKeyframeValue.instantiate(segments[position + 2]),
    ];
    keyframe[1].leftTangent = tangent;
    keyframe[1].rightTangent = 0;
    result.push(keyframe);

    keyframe = [segments[position + 1], RealKeyframeValue.instantiate(segments[position + 2])];
    keyframe[1].leftTangent = 0;
    result.push(keyframe);

    // Update position.
    return position + 3;
  }
}

function getTrackFromPath(
  clip: AnimationClip,
  path: animation.TrackPath
): animation.RealTrack | undefined {
  for (let i = 0; i < clip.tracksCount; i++) {
    const track = clip.getTrack(i);
    if (isEqualsTrackPath(track.path, path) && track instanceof animation.RealTrack) {
      return track;
    }
  }
  return undefined;
}

function isEqualsTrackPath(pathA: animation.TrackPath, pathB: animation.TrackPath) {
  if (pathA.length != pathB.length) {
    return false;
  }
  for (let i = 0; i < pathA.length; i++) {
    if (pathA.isHierarchyAt(i)) {
      if (!pathB.isHierarchyAt(i)) {
        return false;
      }
      if (pathA.parseHierarchyAt(i) != pathB.parseHierarchyAt(i)) {
        return false;
      } else {
        continue;
      }
    }

    if (pathA.isComponentAt(i)) {
      if (!pathB.isComponentAt(i)) {
        return false;
      }
      if (pathA.parseComponentAt(i) != pathB.parseComponentAt(i)) {
        return false;
      } else {
        continue;
      }
    }

    if (pathA.isPropertyAt(i)) {
      if (!pathB.isPropertyAt(i)) {
        return false;
      }
      if (pathA.parsePropertyAt(i) != pathB.parsePropertyAt(i)) {
        return false;
      } else {
        continue;
      }
    }

    if (pathA.isElementAt(i)) {
      if (!pathB.isElementAt(i)) {
        return false;
      }
      if (pathA.parseElementAt(i) != pathB.parseElementAt(i)) {
        return false;
      } else {
        continue;
      }
    }
  }
  return true;
}
