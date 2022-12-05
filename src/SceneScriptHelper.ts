/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import type { IGetCubismRendererResult } from './SceneScriptFuncResult';

export namespace SceneScriptHelper {
  function executeSceneScript(
    methodName: 'cubismRenderControllerGetCubismRenderers',
    args: [string]
  ): Promise<IGetCubismRendererResult[] | null>;
  function executeSceneScript(methodName: string, args: any[]): Promise<any> {
    return Editor.Message.request('scene', 'execute-scene-script', {
      name: 'live2d_cubismsdk_cocoscreator',
      method: methodName,
      args: args,
    });
  }

  export namespace CubismRenderController {
    /**
     *
     * @param uuid CubismRenderController UUID
     * @returns
     */
    export function getCubismRenderers(uuid: string): Promise<IGetCubismRendererResult[] | null> {
      return executeSceneScript('cubismRenderControllerGetCubismRenderers', [uuid]);
    }
  }
}
export default SceneScriptHelper;
