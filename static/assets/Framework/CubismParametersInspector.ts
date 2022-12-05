/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, Component } from 'cc';
import ComponentExtensionMethods from '../Core/ComponentExtensionMethods';
import CubismDisplayInfoParameterName from './CubismDisplayInfoParameterName';

@_decorator.ccclass('CubismParametersInspector')
export default class CubismParametersInspector extends Component {
  /**
   * Editor(Inspector) で 情報を取得するための実装
   * @returns
   */
  private getParameters(): IGetParametersResult | null {
    const cubismModel = ComponentExtensionMethods.findCubismModel(this);
    if (cubismModel == null) {
      console.error('Find CubismModel failed.');
      return null;
    }

    const parametersSource = cubismModel.parameters;
    if (parametersSource == null) {
      console.error('CubismModel.parameters is null.');
      return null;
    }
    const parameters = new Array<ISerializedParameter>(parametersSource.length);
    for (let i = 0; i < parametersSource.length; i++) {
      let displayName: string | undefined;
      const diParamName = parametersSource[i].getComponent(CubismDisplayInfoParameterName);
      if (diParamName != null) {
        displayName = diParamName.displayName;
        if (!displayName) {
          displayName = diParamName.parameterName;
        }
      }
      if (!displayName) {
        displayName = parametersSource[i].id;
      }

      parameters[i] = {
        nodeUuid: parametersSource[i].node.uuid,
        componentUuid: parametersSource[i].uuid,
        id: parametersSource[i].id,
        minimumValue: parametersSource[i].minimumValue,
        maximumValue: parametersSource[i].maximumValue,
        defaultValue: parametersSource[i].defaultValue,
        value: parametersSource[i].value,
        displayName: displayName,
      };
    }
    return { cubismModel: cubismModel.uuid, parameters: parameters };
  }
}

export interface IGetParametersResult {
  /** uuid */
  cubismModel: string;
  parameters: ISerializedParameter[];
}

export interface ISerializedParameter {
  nodeUuid: string;
  componentUuid: string;
  id: string;
  minimumValue: number;
  maximumValue: number;
  defaultValue: number;
  value: number;
  displayName: string;
}
