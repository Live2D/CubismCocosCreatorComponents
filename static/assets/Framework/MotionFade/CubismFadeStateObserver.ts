/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { animation, _decorator } from 'cc';
import CubismFadeMotionList from './CubismFadeMotionList';
import CubismFadePlayingMotion from './CubismFadePlayingMotion';
import type ICubismFadeState from './ICubismFadeState';
import type CubismFadeController from './CubismFadeController';
const { ccclass } = _decorator;

@ccclass('CubismFadeStateObserver')
export default class CubismFadeStateObserver
  extends animation.StateMachineComponent
  implements ICubismFadeState
{
  private _cubismFadeMotionList: CubismFadeMotionList | null = null;
  private _playingMotions: Array<CubismFadePlayingMotion> | null = null;
  private _isDefaulState: boolean = false;
  private _layerIndex: number = 0;
  private _layerWeight: number = 0;
  private _isStateTransitionFinished: boolean = false;
  public getPlayingMotions(): Array<CubismFadePlayingMotion> | null {
    return this._playingMotions;
  }
  public isDefaultState(): boolean {
    return this._isDefaulState;
  }
  public getLayerWeight(): number {
    return this._layerWeight;
  }
  public getStateTransitionFinished(): boolean {
    return this._isStateTransitionFinished;
  }
  public setStateTransitionFinished(isFinished: boolean) {
    this._isStateTransitionFinished = isFinished;
  }
  public stopAnimation(index: number) {
    if (this._playingMotions == null) {
      return;
    }
    this._playingMotions = this._playingMotions.splice(index, 1);
  }
  onEnable() {
    this._isStateTransitionFinished = false;
    if (this._playingMotions == null) {
      this._playingMotions = new Array<CubismFadePlayingMotion>();
    }
  }
  // public override void OnStateEnter(Animator animator, AnimatorStateInfo stateInfo, int layerIndex, AnimatorControllerPlayable controller)
  public onMotionStateEnter(
    animator: animation.AnimationController,
    stateInfo: animation.MotionStateStatus
  ) {
    super.onMotionStateEnter(animator, stateInfo);
    // const fadeController = animator.node.getComponent(CubismFadeController);
    // // Fail silently...
    // if (fadeController == null) {
    //   return;
    // }
    // this._cubismFadeMotionList = fadeController.CubismFadeMotionList;
    // this._layerIndex = layerIndex;
    // this._layerWeight = this._layerIndex == 0 ? 1.0 : animator.GetLayerWeight(this._layerIndex);
    // const animatorClipInfo = controller.GetNextAnimatorClipInfo(layerIndex);
    // this._isDefaulState = animatorClipInfo.Length == 0;
    // if (this._isDefaulState) {
    //   // Get the motion of Default State only for the first time.
    //   animatorClipInfo = controller.GetCurrentAnimatorClipInfo(layerIndex);
    // }
    // // Set playing motions end time.
    // if (
    //   this._playingMotions != null /*To Cocos*/ &&
    //   this._playingMotions.length > 0 &&
    //   this._playingMotions[this._playingMotions.length - 1].Motion != null
    // ) {
    //   const motion = this._playingMotions[this._playingMotions.length - 1];
    //   const time = game.totalTime;
    //   if (motion.Motion != null) {
    //     const newEndTime = time + motion.Motion.FadeOutTime;
    //     motion.EndTime = newEndTime;
    //     while (motion.IsLooping) {
    //       if (motion.StartTime + motion.Motion.MotionLength >= time) {
    //         break;
    //       }
    //       motion.StartTime += motion.Motion.MotionLength;
    //     }
    //   }
    //   this._playingMotions[this._playingMotions.length - 1] = motion;
    // }
    // if (
    //   this._playingMotions != null &&
    //   this._cubismFadeMotionList != null &&
    //   this._cubismFadeMotionList.MotionInstanceIds != null &&
    //   this._cubismFadeMotionList.CubismFadeMotionObjects != null
    // ) {
    //   for (const i = 0; i < animatorClipInfo.Length; ++i) {
    //     const playingMotion = new CubismFadePlayingMotion();
    //     const instanceId = -1;
    //     const events = animatorClipInfo[i].clip.events;
    //     for (const k = 0; k < events.Length; ++k) {
    //       if (events[k].func != 'InstanceId') {
    //         continue;
    //       }
    //       instanceId = events[k].intParameter;
    //       break;
    //     }
    //     const motionIndex = -1;
    //     for (const j = 0; j < this._cubismFadeMotionList.MotionInstanceIds.length; ++j) {
    //       if (this._cubismFadeMotionList.MotionInstanceIds[j] != instanceId) {
    //         continue;
    //       }
    //       motionIndex = j;
    //       break;
    //     }
    //     playingMotion.Motion =
    //       motionIndex == -1
    //         ? null
    //         : this._cubismFadeMotionList?.CubismFadeMotionObjects[motionIndex];
    //     playingMotion.Speed = 1.0;
    //     playingMotion.StartTime = game.totalTime;
    //     playingMotion.FadeInStartTime = game.totalTime;
    //     if (playingMotion.Motion != null) {
    //       playingMotion.EndTime =
    //         playingMotion.Motion.MotionLength <= 0
    //           ? -1
    //           : playingMotion.StartTime + playingMotion.Motion.MotionLength;
    //     }
    //     playingMotion.IsLooping = animatorClipInfo[i].clip.isLooping;
    //     playingMotion.Weight = 0.0;
    //     this._playingMotions.push(playingMotion);
    //   }
    // }[TODO]
  }
  public onMotionStateExit(
    animator: animation.AnimationController,
    stateInfo: animation.MotionStateStatus // public override void OnStateExit(Animator animator, AnimatorStateInfo stateInfo, int layerIndex)
  ) {
    super.onMotionStateExit(animator, stateInfo);
    this._isStateTransitionFinished = true;
  }
}
