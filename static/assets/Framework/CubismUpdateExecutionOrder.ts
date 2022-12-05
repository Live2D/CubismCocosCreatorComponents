/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator } from 'cc';
import ICubismUpdatable from './ICubismUpdatable';

namespace CubismUpdateExecutionOrder {
  export const CUBISM_FADE_CONTROLLER = 100;
  export const CUBISM_PARAMETER_STORE_SAVE_PARAMETERS = 150;
  export const CUBISM_POSE_CONTROLLER = 200;
  export const CUBISM_EXPRESSION_CONTROLLER = 300;
  export const CUBISM_EYE_BLINK_CONTROLLER = 400;
  export const CUBISM_MOUTH_CONTROLLER = 500;
  export const CUBISM_HARMONIC_MOTION_CONTROLLER = 600;
  export const CUBISM_LOOK_CONTROLLER = 700;
  export const CUBISM_PHYSICS_CONTROLLER = 800;
  export const CUBISM_RENDER_CONTROLLER = 10000;
  export const CUBISM_MASK_CONTROLLER = 10100;

  export function sortByExecutionOrder(updatables: Array<ICubismUpdatable>) {
    updatables.sort(CubismUpdateExecutionOrder.compareByExecutionOrder);
  }

  export function compareByExecutionOrder(a: ICubismUpdatable, b: ICubismUpdatable): number {
    return a.executionOrder - b.executionOrder;
  }
}
export default CubismUpdateExecutionOrder;
