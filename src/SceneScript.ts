/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

const { Path } = Editor.Utils;

module.paths.push(Path.join(Editor.App.path, 'node_modules'));

import { director, Component } from 'cc';
import type CubismRenderController from '../static/assets/Rendering/CubismRenderController';
import type { IGetCubismRendererResult } from './SceneScriptFuncResult';

// Function triggered when the module is loaded
export function load() {}
// Function triggered when the module is unloaded
export function unload() {}

namespace SceneScript {
  function getAllComponentsFromScene(): Component[] | null {
    const scene = director.getScene();
    if (scene == null) {
      return null;
    }
    return scene.getComponentsInChildren(Component);
  }

  export namespace CubismRenderController {
    export async function getCubismRenderers(
      uuid: string
    ): Promise<IGetCubismRendererResult[] | null> {
      const components = getAllComponentsFromScene();
      if (components == null) {
        return null;
      }
      for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        if (comp.uuid == uuid) {
          const ctrl = comp as CubismRenderController;

          if (ctrl.renderers == null) {
            return null;
          }

          const result = new Array<IGetCubismRendererResult>(ctrl.renderers.length);
          for (let j = 0; j < ctrl.renderers.length; j++) {
            const renderer = ctrl.renderers[j];
            result[j] = { node: renderer.node.uuid, component: renderer.uuid };
          }

          return result;
        }
      }

      console.error('Find CubismRenderController failed.');
      return null;
    }
  }
}

export namespace methods {
  export const cubismRenderControllerGetCubismRenderers =
    SceneScript.CubismRenderController.getCubismRenderers;
}
