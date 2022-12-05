/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator } from 'cc';
import CubismParameterBlendMode from './CubismParameterBlendMode';
import type CubismParameter from '../Core/CubismParameter';

namespace CubismParameterExtensionMethods {
  export function addToValue(
    parameter: CubismParameter | null,
    value: number,
    weight: number = 1.0
  ) {
    if (parameter == null) {
      return;
    }

    parameter.value += value * weight;
  }

  export function multiplyValueBy(
    parameter: CubismParameter | null,
    value: number,
    weight: number = 1.0
  ) {
    if (parameter == null) {
      return;
    }

    parameter.value *= 1.0 + (value - 1.0) * weight;
  }

  export function blendToValue(
    self: CubismParameter | null,
    mode: CubismParameterBlendMode,
    value: number
  ) {
    if (self == null) {
      return;
    }

    if (mode == CubismParameterBlendMode.Additive) {
      CubismParameterExtensionMethods.addToValue(self, value);

      return;
    }

    if (mode == CubismParameterBlendMode.Multiply) {
      CubismParameterExtensionMethods.multiplyValueBy(self, value);

      return;
    }

    self.value = value;
  }

  export function blendToValueArray(
    self: Array<CubismParameter | null>,
    mode: CubismParameterBlendMode,
    value: number
  ) {
    if (self == null) {
      return;
    }

    if (mode == CubismParameterBlendMode.Additive) {
      for (let i = 0; i < self.length; ++i) {
        if (self[i] != null) {
          CubismParameterExtensionMethods.addToValue(self[i], value);
        }
      }

      return;
    }

    if (mode == CubismParameterBlendMode.Multiply) {
      for (let i = 0; i < self.length; ++i) {
        if (self[i] != null) {
          CubismParameterExtensionMethods.multiplyValueBy(self[i], value);
        }
      }

      return;
    }

    for (let i = 0; i < self.length; ++i) {
      const buff = self[i];

      if (buff != null) {
        buff.value = value;
      }
    }
  }
}
export default CubismParameterExtensionMethods;
