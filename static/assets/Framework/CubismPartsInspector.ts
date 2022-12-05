/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, Component } from 'cc';
import ComponentExtensionMethods from '../Core/ComponentExtensionMethods';
import CubismDisplayInfoPartName from './CubismDisplayInfoPartName';

@_decorator.ccclass('CubismPartsInspector')
export default class CubismPartsInspector extends Component {
  /**
   * Editor(Inspector) で 情報を取得するための実装
   * @returns
   */
  private getParts(): IGetPartsResult | null {
    const cubismModel = ComponentExtensionMethods.findCubismModel(this);
    if (cubismModel == null) {
      console.error('Find CubismModel failed.');
      return null;
    }

    const partsSource = cubismModel.parts;
    if (partsSource == null) {
      console.error('CubismModel.parts is null.');
      return null;
    }

    const parts = new Array<ISerializedParts>(partsSource.length);
    for (let i = 0; i < partsSource.length; i++) {
      let displayName: string | undefined;
      const diPartName = partsSource[i].getComponent(CubismDisplayInfoPartName);
      if (diPartName != null) {
        displayName = diPartName.displayName;
        if (!displayName) {
          displayName = diPartName.partName;
        }
      }
      if (!displayName) {
        displayName = partsSource[i].id;
      }

      parts[i] = {
        nodeUuid: partsSource[i].node.uuid,
        componentUuid: partsSource[i].uuid,
        id: partsSource[i].id,
        opacity: partsSource[i].opacity,
        displayName: displayName,
      };
    }
    return { cubismModel: cubismModel.uuid, parts: parts };
  }
}

export interface IGetPartsResult {
  /** uuid */
  cubismModel: string;
  parts: ISerializedParts[];
}

export interface ISerializedParts {
  nodeUuid: string;
  componentUuid: string;
  id: string;
  opacity: number;
  displayName: string;
}
