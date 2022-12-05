/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import type ICubismTask from './ICubismTask';

//#region Delegates

namespace CubismTaskQueue {
  /**
   * Handles ICubismTasks.
   * @param task
   */
  export type CubismTaskHandler = (task: ICubismTask) => void;
}

//#endregion

/** TOOD Document. */
class CubismTaskQueue {
  private constructor() {}
  // #region Events

  /** Event triggered on new {@link ICubismTask} enqueued. */
  public static onTask: CubismTaskQueue.CubismTaskHandler | null = null;

  // #endregion

  /**
   * Enqeues a {@link ICubismTask}.
   * @param task
   * @returns
   */
  public static enqueue(task: ICubismTask): void {
    // Execute task idrectly in case enqueueing isn't enabled.
    if (CubismTaskQueue.onTask == null) {
      task.execute();
      return;
    }
    CubismTaskQueue.onTask(task);
  }
}

export default CubismTaskQueue;
