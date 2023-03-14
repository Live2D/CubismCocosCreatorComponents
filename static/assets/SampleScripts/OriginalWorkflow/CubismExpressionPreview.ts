import { _decorator, Component, Node, EventTouch } from 'cc';
import ComponentExtensionMethods from '../../Core/ComponentExtensionMethods';
import CubismExpressionController from '../../Framework/Expression/CubismExpressionController';
const { ccclass, property } = _decorator;

@ccclass('CubismExpressionPreview')
export default class CubismExpressionPreview extends Component {
  /** ExpressionController to be operated. */
  _expressionController: CubismExpressionController | null = null;

  /** Get expression controller. */
  protected start(): void {
    const model = ComponentExtensionMethods.findCubismModel(this);
    if (model == null) {
      console.assert(model != null);
      return;
    }

    this._expressionController = model.getComponent(CubismExpressionController);
  }

  /**
   * Change facial expression.
   * @param expressionIndex index of facial expression to set.
   */
  public changeExpression(event: EventTouch, customEventData: string): void {
    if (this._expressionController != null) {
      this._expressionController.currentExpressionIndex = Number.parseInt(customEventData);
    }
  }
}
