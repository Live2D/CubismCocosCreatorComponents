import {
  _decorator,
  Component,
  RichText,
  Camera,
  geometry,
  input,
  Input,
  EventMouse,
  math,
  game,
} from 'cc';
import CubismModel from '../../Core/CubismModel';
import CubismRaycaster from '../../Framework/Raycasting/CubismRaycaster';
import CubismRaycastHit from '../../Framework/Raycasting/CubismRaycastHit';
const { ccclass, property } = _decorator;

@ccclass('RaycastHitDisplay')
export class RaycastHitDisplay extends Component {
  /** <see cref="CubismModel"/> to cast rays against. */
  @property({ type: CubismModel, serializable: true })
  public model: CubismModel | null = null;

  /** UI element to display results in. */
  @property({ type: RichText, serializable: true })
  public resultsText: RichText | null = null;

  /** <see cref="CubismRaycaster"/> attached to <see cref="Model"/>. */
  @property({ serializable: false })
  private _raycaster: CubismRaycaster | null = null;

  private get raycaster(): CubismRaycaster | null {
    return this._raycaster;
  }
  private set raycaster(value: CubismRaycaster | null) {
    this._raycaster = value;
  }

  /** Buffer for raycast results. */
  private _results: CubismRaycastHit[] = new Array(4);
  private get results(): CubismRaycastHit[] {
    return this._results;
  }
  private set results(value: CubismRaycastHit[]) {
    this._results = value;
  }

  @property({ type: Camera, serializable: true, visible: true })
  private _camera: Camera | null = null;
  private get camera(): Camera | null {
    return this._camera;
  }
  private set camera(value: Camera | null) {
    this._camera = value;
  }

  /** Hit test. */
  private doRaycast(): void {
    const { camera, raycaster, resultsText, results, _mouseDownEventData } = this;
    if (camera == null) {
      return;
    }
    if (raycaster == null) {
      return;
    }
    if (resultsText == null) {
      return;
    }
    if (results == null) {
      return;
    }
    if (_mouseDownEventData == null) {
      return;
    }
    if (game.canvas == null) {
      return;
    }

    const x = _mouseDownEventData.x / game.canvas.width;
    const y = _mouseDownEventData.y / game.canvas.height;

    // Cast ray from pointer position.
    // Input.mousePosition
    const ray = camera.screenPointToRay(
      _mouseDownEventData.x,
      _mouseDownEventData.y,
      new geometry.Ray()
    );
    const hitCount = raycaster.raycast2(ray, this.results);

    // Return early if nothing was hit.
    if (hitCount == 0) {
      resultsText.string = '0\n';
      return;
    }

    // Show results.
    resultsText.string = hitCount + '\n';

    for (let i = 0; i < hitCount; i++) {
      const drawable = results[i].drawable;
      if (drawable != null) {
        resultsText.string += drawable.name + '\n';
      }
    }
  }

  //#region Cocos Creator Event Handling

  /** Called by Cocos Creator. Initializes instance. */
  protected start(): void {
    const { model, resultsText, results } = this;
    if (model == null) {
      return;
    }
    if (resultsText == null) {
      return;
    }
    if (results == null) {
      return;
    }
    this.raycaster = model.getComponent(CubismRaycaster);
    for (let i = 0; i < results.length; i++) {
      results[i] = new CubismRaycastHit();
    }
  }

  private _mouseDownEventData: math.Vec2 | null = null;

  private mouseDownEventHandler(event: EventMouse): void {
    this._mouseDownEventData = event.getLocation(new math.Vec2());
  }

  private bindedMouseDownEventHandler = this.mouseDownEventHandler.bind(this);

  protected onEnable() {
    input.on(Input.EventType.MOUSE_DOWN, this.bindedMouseDownEventHandler, this);
  }

  protected onDisable() {
    input.off(Input.EventType.MOUSE_DOWN, this.bindedMouseDownEventHandler, this);
    this._mouseDownEventData = null;
  }

  /** Called by Cocos Creator. Triggers raycasting. */
  protected update(): void {
    // Return early in case of no user interaction.
    if (this._mouseDownEventData == null) {
      return;
    }
    this.doRaycast();
    this._mouseDownEventData = null;
  }

  //#endregion
}
