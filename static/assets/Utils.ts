/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { game, geometry, math, Mesh, Node, utils } from 'cc';

export function isNullOrEmpty(value: string | null) {
  return value == null || value.length <= 0;
}

export namespace ArrayExtensions {
  export function fromVec3Array(source: ArrayLike<math.IVec3Like>) {
    const result = new Array<number>(source.length * 3);
    for (let i = 0; i < source.length; i++) {
      result[i * 3 + 0] = source[i].x;
      result[i * 3 + 1] = source[i].y;
      result[i * 3 + 2] = source[i].z;
    }
    return result;
  }

  export function isEquals<T>(
    equalityCompareFunc: (x: T, y: T) => boolean,
    a: T[],
    b: T[]
  ): boolean {
    if (a.length != b.length) {
      return false;
    }
    return a.every((e, i, _a) => equalityCompareFunc(e, b[i]));
  }
}

export namespace MeshExtensions {
  export function calculateBounds(value: Mesh) {
    const positions = utils.readMesh(value).positions;
    const min = {
      x: positions[0],
      y: positions[1],
      z: positions[2],
    };
    const max = {
      x: min.x,
      y: min.y,
      z: min.z,
    };
    for (let i = 1; i < positions.length / 3; i++) {
      const x = positions[i * 3 + 0];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      min.x = x < min.x ? x : min.x;
      min.y = y < min.y ? y : min.y;
      min.z = z < min.z ? z : min.z;
      max.x = x > max.x ? x : max.x;
      max.y = y > max.y ? y : max.y;
      max.z = z > max.z ? z : max.z;
    }
    const o = { x: 0, y: 0, z: 0 };
    math.Vec3.lerp(o, min, max, 0.5);
    return new geometry.AABB(o.x, o.y, o.z, max.x - min.x, max.y - min.y, max.z - min.z);
  }
}

export namespace MathExtensions {
  export function isPowerOfTwo(value: number) {
    return math.nextPow2(value) == value;
  }
  export function nextPowerOfTwo(value: number) {
    return math.nextPow2(value);
  }
  export function closestPowerOfTwo(value: number) {
    const next = math.nextPow2(value);
    const half = next / 2;
    const prevDiff = value - half;
    const nextDiff = next - value;
    if (prevDiff <= nextDiff) {
      return half;
    }
    return next;
  }

  export namespace Float {
    // https://github.com/Unity-Technologies/UnityCsReference/blob/0a2eeb7a72710d89cccdb6aeee8431d27ee99cd1/Runtime/Export/Math/Mathf.cs#L307
    /**
     *
     * @param current
     * @param target
     * @param currentVelocity
     * @param smoothTime
     * @param maxSpeed
     * @param deltaTime
     * @returns result and currentVelocity
     */
    export function smoothDamp(
      current: number,
      target: number,
      currentVelocity: number,
      smoothTime: number,
      maxSpeed?: number,
      deltaTime?: number
    ): [number, number] {
      maxSpeed ??= Number.POSITIVE_INFINITY;
      deltaTime ??= game.deltaTime;

      // Based on Game Programming Gems 4 Chapter 1.10
      smoothTime = Math.max(0.0001, smoothTime);
      const omega = 2 / smoothTime;

      const x = omega * deltaTime;
      const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      let change = current - target;
      const originalTo = target;

      // Clamp maximum speed
      const maxChange = maxSpeed * smoothTime;
      change = math.clamp(change, -maxChange, maxChange);
      target = current - change;

      const temp = (currentVelocity + omega * change) * deltaTime;
      currentVelocity = (currentVelocity - omega * temp) * exp;
      let output = target + (change + temp) * exp;

      // Prevent overshooting
      if (originalTo - current > 0.0 == output > originalTo) {
        output = originalTo;
        currentVelocity = (output - originalTo) / deltaTime;
      }
      return [output, currentVelocity];
    }
  }

  export namespace Vec2 {
    export function add(a: math.Vec2, b: math.Vec2): math.Vec2 {
      return new math.Vec2(a.x + b.x, a.y + b.y);
    }
    export function subtract(a: math.Vec2, b: math.Vec2): math.Vec2 {
      return new math.Vec2(a.x - b.x, a.y - b.y);
    }
    export function multiplySingle(a: math.Vec2, b: number): math.Vec2 {
      return new math.Vec2(a.x * b, a.y * b);
    }
    export function divideSingle(a: math.Vec2, b: number): math.Vec2 {
      return new math.Vec2(a.x / b, a.y / b);
    }

    // https://github.com/Unity-Technologies/UnityCsReference/blob/0a2eeb7a72710d89cccdb6aeee8431d27ee99cd1/Runtime/Export/Math/Vector2.cs#L289
    /**
     *
     * @param current
     * @param target
     * @param currentVelocity
     * @param smoothTime
     * @param maxSpeed
     * @param deltaTime
     * @returns result and currentVelocity
     */
    export function smoothDamp(
      current: math.Vec2,
      target: math.Vec2,
      currentVelocity: math.Vec2,
      smoothTime: number,
      maxSpeed: number = Number.POSITIVE_INFINITY,
      deltaTime: number = game.deltaTime
    ): [math.Vec2, math.Vec2] {
      currentVelocity = currentVelocity.clone();

      smoothTime = Math.max(0.0001, smoothTime);
      const omega = 2.0 / smoothTime;

      const x = omega * deltaTime;
      const exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);

      let change_x = current.x - target.x;
      let change_y = current.y - target.y;
      const originalTo = target.clone();

      // Clamp maximum speed
      const maxChange = maxSpeed * smoothTime;

      const maxChangeSq = maxChange * maxChange;
      const sqDist = change_x * change_x + change_y * change_y;
      if (sqDist > maxChangeSq) {
        const mag = Math.sqrt(sqDist);
        change_x = (change_x / mag) * maxChange;
        change_y = (change_y / mag) * maxChange;
      }

      target.x = current.x - change_x;
      target.y = current.y - change_y;

      const temp_x = (currentVelocity.x + omega * change_x) * deltaTime;
      const temp_y = (currentVelocity.y + omega * change_y) * deltaTime;

      currentVelocity.x = (currentVelocity.x - omega * temp_x) * exp;
      currentVelocity.y = (currentVelocity.y - omega * temp_y) * exp;

      let output_x = target.x + (change_x + temp_x) * exp;
      let output_y = target.y + (change_y + temp_y) * exp;

      // Prevent overshooting
      const origMinusCurrent_x = originalTo.x - current.x;
      const origMinusCurrent_y = originalTo.y - current.y;
      const outMinusOrig_x = output_x - originalTo.x;
      const outMinusOrig_y = output_y - originalTo.y;

      if (origMinusCurrent_x * outMinusOrig_x + origMinusCurrent_y * outMinusOrig_y > 0) {
        output_x = originalTo.x;
        output_y = originalTo.y;

        currentVelocity.x = (output_x - originalTo.x) / deltaTime;
        currentVelocity.y = (output_y - originalTo.y) / deltaTime;
      }
      return [new math.Vec2(output_x, output_y), currentVelocity];
    }
  }

  export namespace Vec3 {
    export function subtract(a: math.Vec3, b: math.Vec3): math.Vec3 {
      return new math.Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    // https://github.com/Unity-Technologies/UnityCsReference/blob/0a2eeb7a72710d89cccdb6aeee8431d27ee99cd1/Runtime/Export/Math/Vector3.cs#L97
    export function smoothDamp(
      current: math.Vec3,
      target: math.Vec3,
      currentVelocity: math.Vec3,
      smoothTime: number,
      maxSpeed: number = Number.POSITIVE_INFINITY,
      deltaTime: number = game.deltaTime
    ): [math.Vec3, math.Vec3] {
      currentVelocity = currentVelocity.clone();
      let output_x = 0;
      let output_y = 0;
      let output_z = 0;

      smoothTime = Math.max(0.0001, smoothTime);
      const omega = 2.0 / smoothTime;

      const x = omega * deltaTime;
      const exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);

      let change_x = current.x - target.x;
      let change_y = current.y - target.y;
      let change_z = current.z - target.z;
      let originalTo = target.clone();

      // Clamp maximum speed
      const maxChange = maxSpeed * smoothTime;

      const maxChangeSq = maxChange * maxChange;
      const sqrmag = change_x * change_x + change_y * change_y + change_z * change_z;
      if (sqrmag > maxChangeSq) {
        var mag = Math.sqrt(sqrmag);
        change_x = (change_x / mag) * maxChange;
        change_y = (change_y / mag) * maxChange;
        change_z = (change_z / mag) * maxChange;
      }

      target.x = current.x - change_x;
      target.y = current.y - change_y;
      target.z = current.z - change_z;

      const temp_x = (currentVelocity.x + omega * change_x) * deltaTime;
      const temp_y = (currentVelocity.y + omega * change_y) * deltaTime;
      const temp_z = (currentVelocity.z + omega * change_z) * deltaTime;

      currentVelocity.x = (currentVelocity.x - omega * temp_x) * exp;
      currentVelocity.y = (currentVelocity.y - omega * temp_y) * exp;
      currentVelocity.z = (currentVelocity.z - omega * temp_z) * exp;

      output_x = target.x + (change_x + temp_x) * exp;
      output_y = target.y + (change_y + temp_y) * exp;
      output_z = target.z + (change_z + temp_z) * exp;

      // Prevent overshooting
      let origMinusCurrent_x = originalTo.x - current.x;
      let origMinusCurrent_y = originalTo.y - current.y;
      let origMinusCurrent_z = originalTo.z - current.z;
      let outMinusOrig_x = output_x - originalTo.x;
      let outMinusOrig_y = output_y - originalTo.y;
      let outMinusOrig_z = output_z - originalTo.z;

      if (
        origMinusCurrent_x * outMinusOrig_x +
          origMinusCurrent_y * outMinusOrig_y +
          origMinusCurrent_z * outMinusOrig_z >
        0
      ) {
        output_x = originalTo.x;
        output_y = originalTo.y;
        output_z = originalTo.z;

        currentVelocity.x = (output_x - originalTo.x) / deltaTime;
        currentVelocity.y = (output_y - originalTo.y) / deltaTime;
        currentVelocity.z = (output_z - originalTo.z) / deltaTime;
      }

      return [new math.Vec3(output_x, output_y, output_z), currentVelocity];
    }
  }
}

/**
 * Importerプロセスで実行されているかを返します。
 * 注: global 変数 (window) に AssetDB プロパティ があるかどうかで判定しています。
 * この判定を行うためのAPIが CocosCreator v3.6.2 では現状存在しないための方法となっています。
 *
 * @returns Importerプロセスであるならtrue, そうでないならfalseを返します。
 */
export function isImporter() {
  return Reflect.has(window, 'AssetDB');
}

export namespace EditorUtils {
  //import type IQueryNodeResult from './Dump/Query/IQueryNodeResult';
  export type IQueryNodeResult = any;
  export function getComponentPath(self: IQueryNodeResult, uuid: string): string | null {
    const comps = self.__comps__;
    for (let i = 0; i < comps.length; i++) {
      if (comps[i].value.uuid.value == uuid) {
        return '__comps__.' + i;
      }
    }
    return null;
  }
  export async function applyComponentProperty(
    nodeUuid: string,
    compUuid: string,
    property: string,
    value: number,
    type: 'Integer' | 'Float' | 'Enum'
  ): Promise<void> {
    const tree = await Editor.Message.request('scene', 'query-node', nodeUuid);
    const path = EditorUtils.getComponentPath(tree, compUuid);
    if (path == null) {
      return;
    }
    console.info(`set-property: ${path}.${property}`);
    await Editor.Message.request('scene', 'set-property', {
      uuid: nodeUuid,
      path: `${path}.${property}`,
      dump: { value: value, type: type },
    });
  }
}
