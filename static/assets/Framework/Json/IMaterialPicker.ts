/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import type { Material } from 'cc';
import type CubismDrawable from '../../Core/CubismDrawable';
import type CubismModel3Json from './CubismModel3Json';

export default interface IMaterialPicker {
  pick(sender: CubismModel3Json, drawable: CubismDrawable): Material | null;
}
