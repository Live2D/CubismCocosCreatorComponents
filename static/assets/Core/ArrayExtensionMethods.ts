/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { math } from 'cc';
import type { Model } from '../CubismCore';
import type CubismDrawable from './CubismDrawable';
import type CubismDynamicDrawableData from './CubismDynamicDrawableData';
import type CubismParameter from './CubismParameter';
import type CubismPart from './CubismPart';

/** Extension for Cubism related arrays. */
namespace ArrayExtensionMethods {
  // #region Parameters

  /**
   * Finds a {@link CubismParameter} by its ID.
   * @param self Container.
   * @param id ID to match.
   * @returns Parameter on success; null otherwise.
   */
  export function findByIdFromParameters(
    self: readonly CubismParameter[],
    id: string
  ): CubismParameter | null {
    for (let i = 0; i < self.length; ++i) {
      if (self[i].id != id) {
        continue;
      }
      return self[i];
    }
    return null;
  }

  /**
   * Revives (and sorts) CubismParameters.
   * @param self Container.
   * @param model TaskableModel to unmanaged model.
   * @returns
   */
  export function reviveParameters(self: CubismParameter[], model: Model) {
    if (model == null) {
      return;
    }

    self.sort((a, b) => a.unmanagedIndex - b.unmanagedIndex);

    for (let i = 0; i < self.length; ++i) {
      self[i].revive(model);
    }
  }

  /**
   * Writes opacities to unmanaged model.
   * @param self Source buffer.
   * @param model
   * @returns
   */
  export function writeToModelFromParameters(self: readonly CubismParameter[], model: Model) {
    // Get address.
    const values = model.parameters.values;

    // Push.
    for (let i = 0; i < self.length; i++) {
      values[self[i].unmanagedIndex] = self[i].value;
    }
  }

  /**
   * Writes opacities to unmanaged model.
   * @param self Source buffer.
   * @param model
   * @returns
   */
  export function readFromParameters(self: readonly CubismParameter[], model: Model) {
    if (model.parameters?.values == null) {
      return;
    }

    // Get address.
    const values = model.parameters.values;

    // Pull.
    for (let i = 0; i < self.length; i++) {
      self[i].value = values[self[i].unmanagedIndex];
    }
  }

  // #endregion

  // #region Parts

  /**
   * Finds a CubismPart by its ID.
   * @param self this.
   * @param id ID to match.
   * @returns Part if found; null otherwise.
   */
  export function findByIdFromParts(self: readonly CubismPart[], id: string): CubismPart | null {
    for (let i = 0; i < self.length; ++i) {
      if (self[i].id != id) {
        continue;
      }

      return self[i];
    }

    return null;
  }

  /**
   * Revives (and sorts) CubismParts.
   * @param self Container.
   * @param model TaskableModel to unmanaged model.
   */
  export function reviveParts(self: CubismPart[], model: Model) {
    if (model == null) {
      return;
    }

    self.sort((a, b) => a.unmanagedIndex - b.unmanagedIndex);

    for (let i = 0; i < self.length; ++i) {
      self[i].revive(model);
    }
  }

  /**
   * Writes opacities to unmanaged model.
   * @param self Source buffer.
   * @param model
   * @returns
   */
  export function writeToModelFromParts(self: CubismPart[], model: Model) {
    // Get address.
    const opacities = model.parts.opacities;

    // Push.
    for (let i = 0; i < self.length; i++) {
      opacities[self[i].unmanagedIndex] = self[i].opacity;
    }
  }

  // #endregion

  // #region Drawables

  /**
   * Finds a CubismDrawable by its ID.
   * @param self this.
   * @param id ID to match.
   * @returns Part if found; null otherwise.
   */
  export function findByIdFromDrawables(
    self: readonly CubismDrawable[],
    id: string
  ): CubismDrawable | null {
    for (let i = 0; i < self.length; ++i) {
      if (self[i].id != id) {
        continue;
      }

      return self[i];
    }

    return null;
  }

  /**
   * Revives (and sorts) CubismDrawables.
   * @param self Container.
   * @param model TaskableModel to unmanaged model.
   */
  export function reviveDrawables(self: CubismDrawable[], model: Model) {
    if (model == null) {
      return;
    }

    self.sort((a, b) => a.unmanagedIndex - b.unmanagedIndex);

    for (let i = 0; i < self.length; ++i) {
      self[i].revive(model);
    }
  }

  /**
   * Reads new data from a model.
   * @param self Buffer to write to.
   * @param model Unmanaged model to read from.
   */
  export function readFromArrayCubismDynamicDrawableData(
    self: readonly CubismDynamicDrawableData[],
    unmanagedModel: Model
  ) {
    const drawables = unmanagedModel.drawables;
    const flags = drawables.dynamicFlags;
    const opacities = drawables.opacities;
    const drawOrders = drawables.drawOrders;
    const renderOrders = drawables.renderOrders;
    const vertexPositions = drawables.vertexPositions;
    const multiplyColors = drawables.multiplyColors;
    const screenColors = drawables.screenColors;

    // Pull data.
    for (let i = 0; i < self.length; i++) {
      const data = self[i];

      data.flags = flags[i];
      data.opacity = opacities[i];
      data.drawOrder = drawOrders[i];
      data.renderOrder = renderOrders[i];
      // Read vertex positions only if necessary.
      if (!data.areVertexPositionsDirty) {
        continue;
      }
      // Copy vertex positions.
      for (let j = 0; j < data.vertexPositions.length; j++) {
        data.vertexPositions[j] = new math.Vec3(
          vertexPositions[i][j * 2 + 0],
          vertexPositions[i][j * 2 + 1]
        );
      }

      if (!data.isBlendColorDirty) {
        continue;
      }

      const rgbaIndex = i * 4;
      data.multiplyColor = new math.Color(
        multiplyColors[rgbaIndex] * 255,
        multiplyColors[rgbaIndex + 1] * 255,
        multiplyColors[rgbaIndex + 2] * 255,
        multiplyColors[rgbaIndex + 3] * 255
      );
      data.screenColor = new math.Color(
        screenColors[rgbaIndex] * 255,
        screenColors[rgbaIndex + 1] * 255,
        screenColors[rgbaIndex + 2] * 255,
        screenColors[rgbaIndex + 3] * 255
      );
    }
    // Clear dynamic flags.
    drawables.resetDynamicFlags();
  }
}
export default ArrayExtensionMethods;
