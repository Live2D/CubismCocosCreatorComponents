/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

export namespace ProjectModules {
  interface ModuleMap {
    'Core/CubismMoc': typeof import('../static/assets/Core/CubismMoc');
    'Core/ComponentExtensionMethods': typeof import('../static/assets/Core/ComponentExtensionMethods');
    'Framework/CubismDisplayInfoParameterName': typeof import('../static/assets/Framework/CubismDisplayInfoParameterName');
    'Framework/CubismDisplayInfoPartName': typeof import('../static/assets/Framework/CubismDisplayInfoPartName');
    'Framework/MotionFade/CubismFadeMotionData': typeof import('../static/assets/Framework/MotionFade/CubismFadeMotionData');
    'Framework/MotionFade/CubismFadeMotionList': typeof import('../static/assets/Framework/MotionFade/CubismFadeMotionList');
    'Framework/Expression/CubismExpressionData': typeof import('../static/assets/Framework/Expression/CubismExpressionData');
    'Framework/Expression/CubismExpressionList': typeof import('../static/assets/Framework/Expression/CubismExpressionList');
    'Framework/Json/CubismMotion3Json': typeof import('../static/assets/Framework/Json/CubismMotion3Json');
    'Framework/Json/CubismModel3Json': typeof import('../static/assets/Framework/Json/CubismModel3Json');
    'Framework/Json/CubismExp3Json': typeof import('../static/assets/Framework/Json/CubismExp3Json');
    'Rendering/Masking/CubismMaskTexture': typeof import('../static/assets/Rendering/Masking/CubismMaskTexture');
  }
  type Modules = { [P in keyof ModuleMap]?: ModuleMap[P] };

  const BASE_URL = 'db://live2d_cubismsdk_cocoscreator/';
  const modules: Modules = {};

  export async function getModule<K extends keyof ModuleMap>(path: K): Promise<ModuleMap[K]> {
    const module = modules[path];
    if (module != null) {
      return module as ModuleMap[K];
    }

    const imported = (await Editor.Module.importProjectModule(
      `${BASE_URL}${path}.ts`
    )) as ModuleMap[K];
    modules[path] = imported;
    return imported;
  }
}
