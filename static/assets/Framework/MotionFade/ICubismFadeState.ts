/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import CubismFadePlayingMotion from './CubismFadePlayingMotion';

export default interface ICubismFadeState {
  getPlayingMotions(): Array<CubismFadePlayingMotion> | null;
  isDefaultState(): boolean;
  getLayerWeight(): number;
  getStateTransitionFinished(): boolean;
  setStateTransitionFinished(isFinished: boolean): void;
  stopAnimation(index: number): void;
}
