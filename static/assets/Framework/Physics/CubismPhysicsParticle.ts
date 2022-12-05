/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, math } from 'cc';
import type IStructLike from '../../IStructLike';
const { property, ccclass } = _decorator;

/** Vertex data of physics. (struct) */
@ccclass('CubismPhysicsParticle')
export default class CubismPhysicsParticle implements IStructLike<CubismPhysicsParticle> {
  /** Initial position. */
  public readonly initialPosition: math.Vec2;
  /** Mobility ratio. */
  @property({ serializable: true })
  public readonly mobility: number = 0;
  /** Delay ratio. */
  @property({ serializable: true })
  public readonly delay: number = 0;
  /** Current acceleration. */
  @property({ serializable: true })
  public readonly acceleration: number = 0;
  /** Length of radius. */
  @property({ serializable: true })
  public readonly radius: number = 0;
  /** Current position. (NonSerialized) */
  @property({ serializable: false })
  public readonly position: math.Vec2 = math.Vec2.ZERO.clone();
  /** Last position. (NonSerialized) */
  @property({ serializable: false })
  public readonly lastPosition: math.Vec2 = math.Vec2.ZERO.clone();
  /** Last gravity. (NonSerialized) */
  @property({ serializable: false })
  public readonly lastGravity: math.Vec2 = math.Vec2.ZERO.clone();
  /** Current force. (NonSerialized) */
  @property({ serializable: false })
  public readonly force: math.Vec2 = math.Vec2.ZERO.clone();
  /** Current velocity. (NonSerialized) */
  @property({ serializable: false })
  public readonly velocity: math.Vec2 = math.Vec2.ZERO.clone();

  public constructor(
    args: {
      initialPosition?: Readonly<math.Vec2>;
      mobility?: number;
      delay?: number;
      acceleration?: number;
      radius?: number;
      position?: Readonly<math.Vec2>;
      lastPosition?: Readonly<math.Vec2>;
      lastGravity?: Readonly<math.Vec2>;
      force?: Readonly<math.Vec2>;
      velocity?: Readonly<math.Vec2>;
    } = {}
  ) {
    const zero = math.Vec2.ZERO.clone();
    this.initialPosition = args.initialPosition?.clone() ?? zero;
    this.mobility = args.mobility ?? 0;
    this.delay = args.delay ?? 0;
    this.acceleration = args.acceleration ?? 0;
    this.radius = args.radius ?? 0;
    this.position = args.position?.clone() ?? zero;
    this.lastPosition = args.lastPosition?.clone() ?? zero;
    this.lastGravity = args.lastGravity?.clone() ?? zero;
    this.force = args.force?.clone() ?? zero;
    this.velocity = args.velocity?.clone() ?? zero;
  }

  public copyWith(
    args: {
      initialPosition?: Readonly<math.Vec2>;
      mobility?: number;
      delay?: number;
      acceleration?: number;
      radius?: number;
      position?: Readonly<math.Vec2>;
      lastPosition?: Readonly<math.Vec2>;
      lastGravity?: Readonly<math.Vec2>;
      force?: Readonly<math.Vec2>;
      velocity?: Readonly<math.Vec2>;
    } = {}
  ): CubismPhysicsParticle {
    return new CubismPhysicsParticle({
      initialPosition: args.initialPosition ?? this.initialPosition,
      mobility: args.mobility ?? this.mobility,
      delay: args.delay ?? this.delay,
      acceleration: args.acceleration ?? this.acceleration,
      radius: args.radius ?? this.radius,
      position: args.position ?? this.position,
      lastPosition: args.lastPosition ?? this.lastPosition,
      lastGravity: args.lastGravity ?? this.lastGravity,
      force: args.force ?? this.force,
      velocity: args.velocity ?? this.velocity,
    });
  }

  public equals(other: CubismPhysicsParticle): boolean {
    return this === other
      ? true
      : this.initialPosition.equals(other.initialPosition) &&
          this.mobility == other.mobility &&
          this.delay == other.delay &&
          this.acceleration == other.acceleration &&
          this.radius == other.radius &&
          this.position.equals(other.position) &&
          this.lastPosition.equals(other.lastPosition) &&
          this.lastGravity.equals(other.lastGravity) &&
          this.force.equals(other.force) &&
          this.velocity.equals(other.velocity);
  }

  public strictEquals(other: CubismPhysicsParticle): boolean {
    return this === other;
  }
}
