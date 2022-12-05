/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator, Component } from 'cc';
import ICubismUpdatable from './ICubismUpdatable';
import CubismUpdateExecutionOrder from './CubismUpdateExecutionOrder';
import ComponentExtensionMethods from '../Core/ComponentExtensionMethods';
const { ccclass, executeInEditMode } = _decorator;

type Action = (deltaTime: number) => void;

@ccclass('CubismUpdateController')
@executeInEditMode
export default class CubismUpdateController extends Component {
  private _onLateUpdate: Array<Action> = [];

  public refresh() {
    const model = ComponentExtensionMethods.findCubismModel(this);

    // Fail silently...
    if (model == null) {
      console.error('CubismUpdateController.refresh(): model is null.');
      return;
    }

    // Set delegate.
    let components = model
      .getComponents(Component)
      .filter((value: Component, index: number, array: Component[]) =>
        ICubismUpdatable.isImplements(value)
      ) as Array<ICubismUpdatable & Component>;
    CubismUpdateExecutionOrder.sortByExecutionOrder(components);

    // Set the null value when refreshed UpdateController to avoid duplicated registering.
    this._onLateUpdate = components.map((value, _index, _array) => value.bindedOnLateUpdate);
  }

  protected start() {
    this.refresh();
  }

  protected lateUpdate(deltaTime: number) {
    // Cubism late update.
    this._onLateUpdate.forEach((element) => {
      element(deltaTime);
    });
  }
}
