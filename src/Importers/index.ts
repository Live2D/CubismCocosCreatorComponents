/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import CubismMocImporter from './Internals/CubismMocImporter';
import CubismModel3JsonImporter from './Internals/CubismModel3JsonImporter';
import CubismMaskTextureImporter from './Internals/CubismMaskTextureImporter';
import CubismExp3JsonImporter from './Internals/CubismExp3JsonImporter';
import CubismMotion3JsonImporter from './Internals/CubismMotion3JsonImporter';
import CubismExpressionDataImporter from './Internals/CubismExpressionDataImporter';
import CubismExpressionListImporter from './Internals/CubismExpressionListImporter';
import CubismFadeMotionDataImporter from './Internals/CubismFadeMotionDataImporter';
import CubismFadeMotionListImporter from './Internals/CubismFadeMotionListImporter';

export function load() {}

export function unload() {}

export namespace methods {
  export function registerCubismModel3JsonImporter() {
    return register(['.json'], CubismModel3JsonImporter);
  }
  export function registerCubismExp3JsonImporter() {
    return register(['.json'], CubismExp3JsonImporter);
  }
  export function registerCubismMotion3JsonImporter() {
    return register(['.json'], CubismMotion3JsonImporter);
  }

  export function registerCubismMocImporter() {
    return register(['.moc3'], CubismMocImporter);
  }

  export function registerCubismExpressionDataImporter() {
    return register(['.asset'], CubismExpressionDataImporter);
  }
  export function registerCubismExpressionListImporter() {
    return register(['.asset'], CubismExpressionListImporter);
  }
  export function registerCubismFadeMotionDataImporter() {
    return register(['.asset'], CubismFadeMotionDataImporter);
  }
  export function registerCubismFadeMotionListImporter() {
    return register(['.asset'], CubismFadeMotionListImporter);
  }
  export function registerCubismMaskTextureImporter() {
    return register(['.asset'], CubismMaskTextureImporter);
  }

  function register(extname: string[], importer: new (...args: any[]) => object) {
    return { extname: extname, importer: importer };
  }
}
