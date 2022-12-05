/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CCFloat, _decorator } from 'cc';
import CubismPosePart from './CubismPosePart';
import CubismPart from '../../Core/CubismPart';
import type IStructLike from '../../IStructLike';
const { ccclass, property } = _decorator;

/** */
@ccclass('CubismPoseData')
export default class CubismPoseData implements IStructLike<CubismPoseData> {
  /** Cubism pose part. */
  @property({ type: CubismPosePart })
  public readonly posePart: CubismPosePart | null = null;
  /** Cubism part cache. */
  @property({ type: CubismPart })
  public readonly part: CubismPart | null = null;
  /** Link parts cache. */
  @property({ type: [CubismPart] })
  public readonly linkParts: (CubismPart | null)[] = new Array(0);
  /** Cubism part opacity. */
  @property({ type: CCFloat })
  public readonly opacity: number = 0;

  public constructor(
    args: {
      posePart?: CubismPosePart | null;
      part?: CubismPart | null;
      linkParts?: (CubismPart | null)[] | null;
      opacity?: number;
    } = {}
  ) {
    this.posePart = args.posePart ?? null;
    this.part = args.part ?? null;
    this.linkParts = args.linkParts ?? new Array(0);
    this.opacity = args.opacity ?? 0;
  }

  public copyWith(
    args: {
      posePart?: CubismPosePart | null;
      part?: CubismPart | null;
      linkParts?: (CubismPart | null)[] | null;
      opacity?: number;
    } = {}
  ): CubismPoseData {
    return new CubismPoseData({
      posePart: args.posePart !== undefined ? args.posePart : this.posePart,
      part: args.part !== undefined ? args.part : this.part,
      linkParts: args.linkParts ?? this.linkParts,
      opacity: args.opacity ?? this.opacity,
    });
  }

  public equals(other: CubismPoseData): boolean {
    return this === other
      ? true
      : this.posePart == other.posePart &&
          this.part == other.part &&
          this.linkParts == other.linkParts &&
          this.opacity == other.opacity;
  }

  public strictEquals(other: CubismPoseData): boolean {
    return this === other;
  }
}
