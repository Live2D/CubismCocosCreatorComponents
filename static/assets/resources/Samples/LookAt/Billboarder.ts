/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, Component, Camera, renderer, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Billboarder')
export class Billboarder extends Component {
  /**
   * Camera to face.
   */
  @property({ type: Camera })
  public cameraToFace: Camera | null = null;

  /**
   * Called by Cocos Creator. Updates facing.
   * @param deltaTime
   * @returns
   */
  public update(deltaTime: number) {
    if (this.cameraToFace == null) {
      return;
    }
    const { worldPosition } = this.node;
    const { worldPosition: cameraPos, rotation: cameraRot } = this.cameraToFace.node;
    const up = Vec3.transformQuat(new Vec3(), Vec3.UP, cameraRot);
    if (this.cameraToFace.projection == renderer.scene.CameraProjection.ORTHO) {
      const forward = Vec3.transformQuat(new Vec3(), Vec3.FORWARD, cameraRot);
      const p = Vec3.subtract(new Vec3(), worldPosition, forward);
      this.node.lookAt(p, up);
    } else {
      this.node.lookAt(cameraPos, up);
    }
  }
}
