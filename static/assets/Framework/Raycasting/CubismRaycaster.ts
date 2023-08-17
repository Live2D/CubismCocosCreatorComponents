/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Component, geometry, math, _decorator } from 'cc';
import ComponentExtensionMethods from '../../Core/ComponentExtensionMethods';
import CubismDrawable from '../../Core/CubismDrawable';
import { CubismVector3 as Vector3 } from '../../Core/CubismVector';
import CubismMeshPrimitive from '../../Rendering/CubismMeshPrimitive';
import CubismRenderer from '../../Rendering/CubismRenderer';
import CubismRaycastable from './CubismRaycastable';
import CubismRaycastablePrecision from './CubismRaycastablePrecision';
import CubismRaycastHit from './CubismRaycastHit';
const { ccclass } = _decorator;

/**
 * Allows casting rays against {@link CubismRaycastable}s.
 *
 * **Sealed class**
 */
@ccclass('CubismRaycaster')
export default class CubismRaycaster extends Component {
  /** {@link CubismRenderer}s with {@link CubismRaycastable}s attached. */
  private raycastables: CubismRenderer[] | null = null; // { get; set; }

  /** {@link CubismRaycastablePrecision}s with {@link CubismRaycastable}s attached. */
  private raycastablePrecisions: CubismRaycastablePrecision[] | null = null; // { get; set; }

  /** Refreshes the controller. Call this method after adding and/or removing {@link CubismRaycastable}. */
  private refresh(): void {
    const candidates = ComponentExtensionMethods.findCubismModel(this)?.drawables ?? null;
    if (candidates == null) {
      console.error('CubismRaycaster.refresh(): candidates is null.');
      return;
    }

    // Find raycastable drawables.
    const raycastables = new Array<CubismRenderer>();
    const raycastablePrecisions = new Array<CubismRaycastablePrecision>();

    for (var i = 0; i < candidates.length; i++) {
      // Skip non-raycastables.
      if (candidates[i].getComponent(CubismRaycastable) == null) {
        continue;
      }
      const renderer = candidates[i].getComponent(CubismRenderer);
      console.assert(renderer);
      raycastables.push(renderer!);

      const raycastable = candidates[i].getComponent(CubismRaycastable);
      console.assert(raycastable);
      console.assert(raycastable!.precision);
      raycastablePrecisions.push(raycastable!.precision!);
    }

    // Cache raycastables.
    this.raycastables = raycastables;
    this.raycastablePrecisions = raycastablePrecisions;
  }

  //#region Cocos Creator Event Handling

  /** Called by Cocos Creator. Makes sure cache is initialized. */
  protected start(): void {
    // Initialize cache.
    this.refresh();
  }

  //#endregion

  /**
   * Casts a ray.
   * @param origin The origin of the ray.
   * @param direction The direction of the ray.
   * @param result The result of the cast.
   * @param maximumDistance [Optional] The maximum distance of the ray.
   * @returns
   * true in case of a hit; false otherwise.
   *
   * The numbers of drawables had hit
   */
  public raycast1(
    origin: Vector3,
    direction: Vector3,
    result: CubismRaycastHit[],
    maximumDistance: number = Number.POSITIVE_INFINITY
  ): number {
    return this.raycast2(
      geometry.Ray.create(origin.x, origin.y, origin.z, direction.x, direction.y, direction.z),
      result,
      maximumDistance
    );
  }

  /**
   * Casts a ray.
   * @param ray
   * @param result  The result of the cast.
   * @param maximumDistance [Optional] The maximum distance of the ray.
   * @returns
   * true in case of a hit; false otherwise.
   *
   * The numbers of drawables had hit
   */
  public raycast2(
    ray: geometry.Ray,
    result: CubismRaycastHit[],
    maximumDistance: number = Number.POSITIVE_INFINITY
  ): number {
    // Cast ray against model plane.
    const origin = Vector3.from(ray.o);
    const direction = Vector3.from(ray.d);
    const intersectionInWorldSpace = origin.add(direction.multiplySingle(direction.z / origin.z));
    let intersectionInLocalSpace = Vector3.from(
      this.node.inverseTransformPoint(new math.Vec3(), intersectionInWorldSpace.toBuiltinType())
    );
    intersectionInLocalSpace = intersectionInLocalSpace.copyWith({ z: 0 });
    const distance = intersectionInWorldSpace.magnitude();
    // Return non-hits.
    if (distance > maximumDistance) {
      return 0;
    }
    // Cast against each raycastable.
    let hitCount = 0;
    console.assert(this.raycastables != null);
    const raycastables = this.raycastables!;
    console.assert(this.raycastablePrecisions != null);
    const raycastablePrecisions = this.raycastablePrecisions!;

    for (let i = 0; i < raycastables.length; i++) {
      const raycastable = raycastables[i];
      const raycastablePrecision = raycastablePrecisions[i];
      // Skip inactive raycastables.
      console.assert(raycastable.meshRenderer != null);
      if (!raycastable.meshRenderer!.enabled) {
        continue;
      }
      const bounds = raycastable.mesh.calculateBounds();

      // Skip non hits (bounding box)
      if (!bounds.contains(intersectionInLocalSpace)) {
        continue;
      }

      // Do detailed hit-detection against mesh if requested.
      if (raycastablePrecision == CubismRaycastablePrecision.triangles) {
        if (!this.containsInTriangles(raycastable.mesh, intersectionInLocalSpace)) {
          continue;
        }
      }

      result[hitCount] = new CubismRaycastHit({
        drawable: raycastable.getComponent(CubismDrawable),
        distance: distance,
        localPosition: intersectionInLocalSpace,
        worldPosition: intersectionInWorldSpace,
      });

      ++hitCount;

      // Exit if result buffer is full.
      if (hitCount == result.length) {
        break;
      }
    }

    return hitCount;
  }

  /**
   * Check the point is inside polygons.
   * @param mesh
   * @param inputPosition
   * @returns
   */
  private containsInTriangles(mesh: CubismMeshPrimitive, inputPosition: Vector3): boolean {
    const triangles = mesh.getIndices();
    const positions = mesh.getPositions();
    for (let i = 0; i < triangles.length; i += 3) {
      const vertexPositionA = positions[triangles[i]];
      const vertexPositionB = positions[triangles[i + 1]];
      const vertexPositionC = positions[triangles[i + 2]];

      const crossProduct1 =
        (vertexPositionB.x - vertexPositionA.x) * (inputPosition.y - vertexPositionB.y) -
        (vertexPositionB.y - vertexPositionA.y) * (inputPosition.x - vertexPositionB.x);
      const crossProduct2 =
        (vertexPositionC.x - vertexPositionB.x) * (inputPosition.y - vertexPositionC.y) -
        (vertexPositionC.y - vertexPositionB.y) * (inputPosition.x - vertexPositionC.x);
      const crossProduct3 =
        (vertexPositionA.x - vertexPositionC.x) * (inputPosition.y - vertexPositionA.y) -
        (vertexPositionA.y - vertexPositionC.y) * (inputPosition.x - vertexPositionA.x);

      if (
        (crossProduct1 > 0 && crossProduct2 > 0 && crossProduct3 > 0) ||
        (crossProduct1 < 0 && crossProduct2 < 0 && crossProduct3 < 0)
      ) {
        return true;
      }
    }
    return false;
  }
}
