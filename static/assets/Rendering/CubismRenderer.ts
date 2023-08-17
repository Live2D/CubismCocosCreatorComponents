/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import {
  CCFloat,
  CCInteger,
  Component,
  director,
  Enum,
  Material,
  math,
  Mesh,
  MeshRenderer,
  Texture2D,
  _decorator,
} from 'cc';
import CubismDrawable from '../Core/CubismDrawable';
import CubismShaderVariables from '../Rendering/CubismShaderVariables';
import CubismSortingMode from '../Rendering/CubismSortingMode';
import CubismMaskProperties from '../Rendering/Masking/CubismMaskProperties';
import CubismMeshPrimitive from './CubismMeshPrimitive';
import { EditorUtils, isImporter } from '../Utils';
import type IStructLike from '../IStructLike';
import CubismRenderController from './CubismRenderController';
const { ccclass, property, requireComponent, executeInEditMode } = _decorator;

export namespace CubismRendererInEditorSymbols {
  export const onControllerSortingOrderDidChange = Symbol.for('onControllerSortingOrderDidChange');
  export const onControllerSortingModeDidChange = Symbol.for('onControllerSortingModeDidChange');
  export const onControllerDepthOffsetDidChange = Symbol.for('onControllerDepthOffsetDidChange');
}

/** Wrapper for drawing CubismDrawables. */
@ccclass('CubismRenderer')
@requireComponent(MeshRenderer)
@executeInEditMode
export default class CubismRenderer extends Component {
  //#region LocalSortingOrder
  /** LocalSortingOrder backing field. */
  @property({ type: CCInteger, serializable: true, visible: false })
  private _localSortingOrder: number = 0;

  /** Local sorting order. */
  @property({ type: CCInteger, visible: true })
  public get localSortingOrder() {
    return this._localSortingOrder;
  }
  public set localSortingOrder(value) {
    // Return early if same value given.
    if (value == this._localSortingOrder) {
      return;
    }

    // Store value.
    this._localSortingOrder = value;

    // Apply it.
    this.applySorting();
  }
  //#endregion

  //#region Color
  /** Color backing field. */
  @property({ serializable: true, visible: false })
  private _color: Readonly<math.Color> = math.Color.WHITE.clone();

  /** Color. */
  @property({ visible: true })
  public get color(): Readonly<math.Color> {
    return this._color;
  }
  public set color(value: Readonly<math.Color>) {
    // Return early if same value given.
    if (this._color.equals(value)) {
      return;
    }

    // Store value.
    this._color = value;

    // Apply color.
    this.applyVertexColors();
  }
  //#endregion

  //#region OverwriteFlagForDrawableMultiplyColors
  /** {@link overwriteFlagForDrawableMultiplyColors} backing field. */
  @property({ serializable: true, visible: false })
  private _isOverwrittenDrawableMultiplyColors: boolean = false;

  /** Whether to overwrite with multiply color from the model. */
  public get overwriteFlagForDrawableMultiplyColors(): boolean {
    return this._isOverwrittenDrawableMultiplyColors;
  }
  public set overwriteFlagForDrawableMultiplyColors(value: boolean) {
    this._isOverwrittenDrawableMultiplyColors = value;
  }
  //#endregion

  //#region LastIsUseUserMultiplyColor
  public _lastIsUseUserMultiplyColor: boolean = false;

  /** Last {@link overwriteFlagForDrawableMultiplyColors}. */
  public get lastIsUseUserMultiplyColor(): boolean {
    return this._lastIsUseUserMultiplyColor;
  }
  public set lastIsUseUserMultiplyColor(value: boolean) {
    this._lastIsUseUserMultiplyColor = value;
  }
  //#endregion

  //#region OverwriteFlagForDrawableScreenColor
  /** {@link overwriteFlagForDrawableScreenColor} backing field. */
  @property({ serializable: true, visible: false })
  private _isOverwrittenDrawableScreenColor: boolean = false;

  /** Whether to overwrite with screen color from the model. */
  public get overwriteFlagForDrawableScreenColor(): boolean {
    return this._isOverwrittenDrawableScreenColor;
  }
  public set overwriteFlagForDrawableScreenColor(value: boolean) {
    this._isOverwrittenDrawableScreenColor = value;
  }
  //#endregion

  //#region LastIsUseUserScreenColor
  public _lastIsUseUserScreenColor: boolean = false;

  /** Last {@link overwriteFlagForDrawableScreenColors}. */
  public get lastIsUseUserScreenColor(): boolean {
    return this._lastIsUseUserScreenColor;
  }
  public set lastIsUseUserScreenColor(value: boolean) {
    this._lastIsUseUserScreenColor = value;
  }
  //#endregion

  //#region MultiplyColor
  /** {@link MultiplyColor} backing field. */
  @property({ serializable: true, visible: false })
  private _multiplyColor: Readonly<math.Color> = math.Color.WHITE.clone();

  public get multiplyColor(): Readonly<math.Color> {
    if (
      this.overwriteFlagForDrawableMultiplyColors ||
      this.renderController?.overwriteFlagForModelMultiplyColors
    ) {
      return this._multiplyColor;
    }
    return this.drawable?.multiplyColor ?? math.Color.WHITE;
  }
  public set multiplyColor(value: Readonly<math.Color>) {
    // Return early if same value given.
    if (this._multiplyColor.equals(value)) {
      return;
    }
    // Store value.
    this._multiplyColor = value != null ? value : math.Color.WHITE.clone();
  }
  //#endregion

  //#region LastMultiplyColor
  public _lastMultiplyColor: Readonly<math.Color> = math.Color.WHITE;
  /** Last Drawable Multiply Color. */
  public get lastMultiplyColor(): Readonly<math.Color> {
    return this._lastMultiplyColor;
  }
  public set lastMultiplyColor(value: Readonly<math.Color>) {
    this._lastMultiplyColor = value;
  }
  //#endregion

  //#region ScreenColor
  /** {@link ScreenColor} backing field. */
  @property({ serializable: true, visible: false })
  private _screenColor: Readonly<math.Color> = new math.Color(0, 0, 0, 0);
  /** Drawable Screen Color. */
  public get screenColor(): Readonly<math.Color> {
    if (
      this.overwriteFlagForDrawableScreenColor ||
      this.renderController?.overwriteFlagForModelScreenColors
    ) {
      return this._screenColor;
    }
    return this.drawable?.screenColor ?? new math.Color(0, 0, 0, 0);
  }
  public set screenColor(value: Readonly<math.Color>) {
    // Return early if same value given.
    if (this._screenColor.equals(value)) {
      return;
    }
    // Store value.
    this._screenColor = value != null ? value : math.Color.BLACK;
  }
  //#endregion

  //#region LastScreenColor
  private _lastScreenColor: Readonly<math.Color> = new math.Color(0, 0, 0, 0);
  /** Last Drawable Screen Color. */
  public get lastScreenColor(): Readonly<math.Color> {
    return this._lastScreenColor;
  }
  public set lastScreenColor(value: Readonly<math.Color>) {
    this._lastScreenColor = value;
  }
  //#endregion

  //#region Material
  /** Material. */
  // @property({ type: Material, visible: true })
  public get material(): Material | null {
    return this.meshRenderer?.material ?? null;
  }
  public set material(value: Material | null) {
    if (this.meshRenderer != null) {
      this.meshRenderer.material = value;
    }
  }
  //#endregion

  //#region MainTexture
  /** MainTexture backing field. */
  @property({ type: Texture2D, serializable: true, visible: false })
  private _mainTexture: Texture2D | null = null;

  /** MeshRenderer's main texture. */
  @property({ type: Texture2D, visible: true })
  public get mainTexture(): Texture2D | null {
    return this._mainTexture;
  }
  public set mainTexture(value: Texture2D | null) {
    // Return early if same value given and main texture is valid.
    if (this._mainTexture == value) {
      return;
    }

    // Store value.
    this._mainTexture = value;

    // Apply it.
    this.applyMainTexture();
  }
  //#endregion

  //#region Meshes
  // @property({ serializable: false, visible: false })
  private _meshes: [CubismMeshPrimitive, CubismMeshPrimitive] = [
    CubismMeshPrimitive.makeEmpty(),
    CubismMeshPrimitive.makeEmpty(),
  ];
  /**
   * Meshes.
   *
   * Double buffering dynamic meshes increases performance on mobile, so we double-buffer them here.
   */
  private get meshes() {
    return this._meshes;
  }
  private set meshes(value) {
    this._meshes = value;
  }
  //#endregion

  //#region FrontMesh
  // @property({ serializable: false, visible: false })
  private _frontMesh: number = 0;
  /** Index of front buffer mesh. */
  private get frontMesh() {
    return this._frontMesh;
  }
  private set frontMesh(value) {
    this._frontMesh = value;
  }
  //#endregion

  //#region BackMesh
  // @property({ serializable: false, visible: false })
  private _backMesh: number = 0;
  /** Index of back buffer mesh. */
  private get backMesh() {
    return this._backMesh;
  }
  private set backMesh(value) {
    this._backMesh = value;
  }
  //#endregion

  //#region Mesh
  /** Mesh */
  @property({ type: Mesh, visible: true, readonly: true })
  public get mesh() {
    return this.meshes[this.frontMesh];
  }
  //#endregion

  //#region MeshRenderer
  /** MeshRenderer backing field. */
  // @property({ serializable: false, visible: false })
  private _meshRenderer: MeshRenderer | null = null;
  public get meshRenderer(): MeshRenderer | null {
    return this._meshRenderer;
  }
  //#endregion

  //#region Drawable
  /** {@link CubismDrawable} */
  private _drawable: CubismDrawable | null = null;

  /** {@link CubismRenderController} */
  private get drawable(): CubismDrawable | null {
    return this._drawable;
  }
  private set drawable(value: CubismDrawable | null) {
    this._drawable = value;
  }
  //#endregion

  //#region RenderController
  private _renderController: CubismRenderController | null = null;

  /** {@link CubismRenderController} */
  private get renderController(): CubismRenderController | null {
    return this._renderController;
  }
  private set renderController(value: CubismRenderController | null) {
    this._renderController = value;
  }
  //#endregion

  //#region Interface For CubismRenderController

  //#region SortingMode
  /** SortingMode backing field. */
  @property({ type: Enum(CubismSortingMode), serializable: true, visible: false })
  private _sortingMode: CubismSortingMode = CubismSortingMode.backToFrontZ;

  /** Sorting mode. */
  @property({ type: Enum(CubismSortingMode), visible: false })
  private get sortingMode() {
    return this._sortingMode;
  }
  private set sortingMode(value) {
    this._sortingMode = value;
  }
  //#endregion

  //#region SortingOrder
  /** SortingOrder backing field. */
  @property({ type: CCInteger, serializable: true, visible: false })
  private _sortingOrder: number = 0;
  /** Sorting mode. */
  private get sortingOrder() {
    return this._sortingOrder;
  }
  private set sortingOrder(value) {
    this._sortingOrder = value;
  }
  //#endregion

  //#region RenderOrder
  /** RenderOrder backing field. */
  @property({ type: CCInteger, serializable: true, visible: false })
  private _renderOrder: number = 0;

  /** Sorting mode. */
  private get renderOrder() {
    return this._renderOrder;
  }
  private set renderOrder(value) {
    this._renderOrder = value;
  }
  //#endregion

  //#region DepthOffset
  /** DepthOffset backing field. */
  @property({ type: CCFloat, serializable: true, visible: false })
  private _depthOffset: number = math.EPSILON;
  /** Offset to apply in case of depth sorting. */
  private get depthOffset() {
    return this._depthOffset;
  }
  private set depthOffset(value) {
    this._depthOffset = value;
  }
  //#endregion

  //#region Opacity
  /** Opacity backing field. */
  @property({ type: CCFloat, serializable: true, visible: false })
  private _opacity: number = 0;
  /** Opacity. */
  private get opacity(): number {
    return this._opacity;
  }
  private set opacity(value: number) {
    this._opacity = value;
  }
  //#endregion

  //#region CertexColors
  @property({ serializable: true, visible: false })
  private _vertexColors: math.Color[] | null = null;
  /** Buffer for vertex colors. */
  private get vertexColors(): math.Color[] | null {
    return this._vertexColors;
  }
  private set vertexColors(value: math.Color[] | null) {
    this._vertexColors = value;
  }
  //#endregion

  //#region LastSwap
  // @property({ serializable: false, visible: false })
  private _lastSwap: SwapInfo = SwapInfo.DEFAULT;
  /** Allows tracking of what vertex data was updated last swap. */
  private get lastSwap() {
    return this._lastSwap;
  }
  private set lastSwap(value) {
    this._lastSwap = value;
  }
  //#endregion

  //#region ThisSwap
  // @property({ serializable: false, visible: false })
  private _thisSwap: SwapInfo = SwapInfo.DEFAULT;
  /** Allows tracking of what vertex data will be swapped. */
  private get thisSwap() {
    return this._thisSwap;
  }
  private set thisSwap(value) {
    this._thisSwap = value;
  }
  //#endregion

  /** Editor Inspector 表示用 */
  @property({ type: CCFloat, serializable: true })
  private _priorityInEditor: number = 0;

  /**
   * Swaps mesh buffers.
   *
   * Make sure to manually call this method in case you changed the Color.
   */
  public swapMeshes() {
    // Perform internal swap.
    this.backMesh = this.frontMesh;
    this.frontMesh = this.frontMesh == 0 ? 1 : 0;

    let mesh = this.meshes[this.frontMesh];

    // Update colors.
    if (this.vertexColors != null) {
      mesh.setColors(this.vertexColors);
    }

    // Update swap info.
    this.lastSwap = this.thisSwap;

    this.resetSwapInfoFlags();

    // Importer動作処理の場合は実行しない。
    if (isImporter()) {
      return;
    }
    const scene = director.getScene();
    if (scene == null) {
      console.error('CubismRenderer.swapMeshes(): director.getScene() failed.');
      return;
    }
    const renderScene = scene.renderScene;
    if (renderScene == null) {
      console.error('CubismRenderer.swapMeshes(): renderScene is null.');
      return;
    }
    if (this.meshRenderer == null) {
      console.error('CubismRenderer.swapMeshes(): meshRenderer is null.');
      return;
    }
    this.meshRenderer.mesh = mesh.createMesh();
  }

  /** Updates visibility. */
  public updateVisibility() {
    if (this.meshRenderer) {
      if (this.lastSwap.didBecomeVisible) {
        this.meshRenderer.enabled = true;
      } else if (this.lastSwap.didBecomeInvisible) {
        this.meshRenderer.enabled = false;
      }
    }
    this.resetVisibilityFlags();
  }

  /** Updates render order. */
  public updateRenderOrder() {
    if (this.lastSwap.newRenderOrder) {
      this.applySorting();
    }

    this.resetRenderOrderFlag();
  }

  /**
   * Updates sorting layer.
   * @param newSortingLayer New sorting layer.
   */
  public onControllerSortingLayerDidChange(newSortingLayer: number): void {
    // TODO: meshRenderer.sortingLayerID
    // this.meshRenderer.sortingLayerID = newSortingLayer;
  }

  /**
   * Updates sorting mode.
   * @param newSortingMode New sorting mode.
   */
  public onControllerSortingModeDidChange(newSortingMode: CubismSortingMode): void {
    this.sortingMode = newSortingMode;
    this.applySorting();
  }

  /** In editor method. */
  [CubismRendererInEditorSymbols.onControllerSortingModeDidChange](
    newSortingMode: CubismSortingMode
  ) {
    EditorUtils.applyComponentProperty(
      this.node.uuid,
      this.uuid,
      'sortingMode',
      newSortingMode,
      'Enum'
    ).then(() => this.applySorting());
  }

  /**
   * Updates sorting order.
   * @param newSortingOrder New sorting order.
   */
  public onControllerSortingOrderDidChange(newSortingOrder: number): void {
    this.sortingOrder = newSortingOrder;
    this.applySorting();
  }

  /** In editor method. */
  [CubismRendererInEditorSymbols.onControllerSortingOrderDidChange](newSortingOrder: number) {
    EditorUtils.applyComponentProperty(
      this.node.uuid,
      this.uuid,
      'sortingOrder',
      newSortingOrder,
      'Float'
    ).then(() => this.applySorting());
  }

  /**
   * Updates depth offset.
   * @param newDepthOffset
   */
  public onControllerDepthOffsetDidChange(newDepthOffset: number): void {
    this.depthOffset = newDepthOffset;

    this.applySorting();
  }

  /** In editor method. */
  [CubismRendererInEditorSymbols.onControllerDepthOffsetDidChange](newDepthOffset: number) {
    EditorUtils.applyComponentProperty(
      this.node.uuid,
      this.uuid,
      'depthOffset',
      newDepthOffset,
      'Float'
    ).then(() => this.applySorting());
  }

  /**
   * Sets the opacity.
   * @param newOpacity New opacity.
   */
  public onDrawableOpacityDidChange(newOpacity: number): void {
    this.opacity = newOpacity;

    this.applyVertexColors();
  }

  /**
   * Updates render order.
   * @param newRenderOrder New render order.
   */
  public onDrawableRenderOrderDidChange(newRenderOrder: number): void {
    this.renderOrder = newRenderOrder;

    this.setNewRenderOrder();
  }

  /**
   * Sets the UnityEngine.Mesh.vertices.
   * @param newVertexPositions Vertex positions to set.
   */
  public onDrawableVertexPositionsDidChange(newVertexPositions: readonly math.Vec3[]): void {
    const mesh = this.mesh;

    // Apply positions and update bounds.
    mesh.setPositions(newVertexPositions);

    // Set swap flag.
    this.setNewVertexPositions();
  }

  /**
   * Sets visibility.
   * @param newVisibility New visibility.
   */
  public onDrawableVisiblityDidChange(newVisibility: boolean): void {
    // Set swap flag if visible.
    if (newVisibility) {
      this.becomeVisible();
    } else {
      this.becomeInvisible();
    }
  }

  /**
   * Sets mask properties.
   * @param newMaskProperties Value to set.
   */
  public onMaskPropertiesDidChange(newMaskProperties: CubismMaskProperties): void {
    const maskTex = newMaskProperties.texture?.getTextureReference() ?? null;
    const maskTile = newMaskProperties.tile.toVec4();
    const maskTransform = newMaskProperties.transform.toVec4();

    const meshRenderer = this.meshRenderer;
    if (meshRenderer == null) {
      console.error('CubismRenderer.onMaskPropertiesDidChange(): meshRenderer is null.');
      return;
    }
    const material = meshRenderer.getMaterialInstance(0);
    if (material == null) {
      console.error('CubismRenderer.onMaskPropertiesDidChange(): material is null.');
      return;
    }
    material.setProperty(CubismShaderVariables.maskTexture, maskTex);
    material.setProperty(CubismShaderVariables.maskTile, maskTile);
    material.setProperty(CubismShaderVariables.maskTransform, maskTransform);
  }

  /**
   * Sets model opacity.
   * @param newModelOpacity Opacity to set.
   */
  public onModelOpacityDidChange(newModelOpacity: number): void {
    // Write property.
    this.meshRenderer?.material?.setProperty(CubismShaderVariables.modelOpacity, newModelOpacity);
  }

  // #endregion

  /** Applies main texture for rendering. */
  private applyMainTexture() {
    // Importer動作処理の場合は実行しない。
    if (isImporter()) {
      return;
    }
    const meshRenderer = this.meshRenderer;
    if (meshRenderer == null) {
      console.error('CubismRenderer.applyMainTexture(): meshRenderer is null.');
      return;
    }
    let material = meshRenderer.getMaterialInstance(0);
    if (material == null) {
      console.error('CubismRenderer.applyMainTexture(): material is null.');
      return;
    }
    material.setProperty(CubismShaderVariables.mainTexture, this.mainTexture);
  }

  /** Applies sorting. */
  private applySorting(): void {
    if (this.meshRenderer == null) {
      console.error('CubismRenderer.applySorting(): this.meshRenderer is null.');
      return;
    }
    // Sort by order.
    if (CubismSortingMode.sortByOrder(this.sortingMode)) {
      this.meshRenderer.priority =
        this.sortingOrder +
        (this.sortingMode == CubismSortingMode.backToFrontOrder
          ? this.renderOrder + this.localSortingOrder
          : -(this.renderOrder + this.localSortingOrder));
      this.node.position = math.Vec3.ZERO;
      this._priorityInEditor = this.meshRenderer.priority;
      return;
    }
    // Sort by depth.
    let offset =
      this.sortingMode == CubismSortingMode.backToFrontZ ? this.depthOffset : -this.depthOffset;
    this.meshRenderer.priority = this.sortingOrder + this.localSortingOrder;
    this._priorityInEditor = this.meshRenderer.priority;
    this.node.position = new math.Vec3(0, 0, this.renderOrder * offset);
  }

  /** Uploads mesh vertex colors. */
  public applyVertexColors(): void {
    const vertexColors = this.vertexColors;
    if (vertexColors == null) {
      console.error('applyVertexColors -> this.vertexColors is null.');
      return;
    }
    let color = this.color;
    color = new math.Color(color.r, color.g, color.b, color.a * this.opacity);

    for (let i = 0; i < vertexColors.length; i++) {
      vertexColors[i] = color;
    }

    // Set swap flag.
    this.setNewVertexColors();
  }

  /** Uploads diffuse colors. */
  public applyMultiplyColor(): void {
    if (isImporter()) {
      return;
    }
    // Write property.
    const renderer = this.meshRenderer;
    if (renderer) {
      const material = renderer.getMaterialInstance(0);
      material?.setProperty(CubismShaderVariables.multiplyColor, this.multiplyColor);
    }
  }

  /** Initializes the main texture if possible. */
  private tryInitializeMultiplyColor(): void {
    this.lastIsUseUserMultiplyColor = false;

    this.lastMultiplyColor = this.multiplyColor;

    this.applyMultiplyColor();
  }

  /** Uploads tint colors. */
  public applyScreenColor(): void {
    if (isImporter()) {
      return;
    }
    // Write property.
    const renderer = this.meshRenderer;
    if (renderer) {
      const material = renderer.getMaterialInstance(0);
      material?.setProperty(CubismShaderVariables.screenColor, this.screenColor);
    }
  }

  /** Initializes the main texture if possible. */
  private tryInitializeScreenColor(): void {
    this.lastIsUseUserScreenColor = false;

    this.lastScreenColor = this.screenColor;

    this.applyScreenColor();
  }

  /** Initializes the mesh renderer. */
  private tryInitializeMeshRenderer(): void {
    if (this._meshRenderer == null) {
      this._meshRenderer = this.getComponent(MeshRenderer) ?? this.addComponent(MeshRenderer);

      // Lazily add component.
      if (this._meshRenderer != null) {
        // TODO: Unity における HideFlags.HideInInspector はどれか？
        // this._meshRenderer.hideFlags = CCObject.Flags.; // HideFlags.HideInInspector
        this._meshRenderer.receiveShadow = 0; // false
        this._meshRenderer.shadowCastingMode = 0; // false
        // this._meshRenderer.lightProbeUsage = LightProbeUsage.BlendProbes;
      }
    }
  }

  /** Initializes the mesh if necessary. */
  private tryInitializeMesh(): void {
    // Only create mesh if necessary.
    // HACK 'Mesh.vertex > 0' makes sure mesh is recreated in case of runtime instantiation.
    if (this.mesh.vertexCount > 0) {
      return;
    }

    // Create mesh for attached drawable.
    const drawable = this.getComponent(CubismDrawable);
    if (drawable == null) {
      console.error('CubismRenderer.tryInitializeMesh(): getComponent(CubismDrawable) failed.');
      return;
    }

    for (let i = 0; i < 2; i++) {
      const primitive = drawable.generateMeshPrimitive();
      if (primitive == null) {
        console.error('CubismRenderer.tryInitializeMesh(): generateMeshPrimitive() failed.');
        continue;
      }

      // Store mesh.
      this.meshes[i] = primitive;
    }
  }

  /** Initializes vertex colors. */
  private tryInitializeVertexColor(): void {
    const mesh = this.mesh;
    this.vertexColors = new Array<math.Color>(mesh.vertexCount);
    for (let i = 0; i < this.vertexColors.length; i++) {
      const color = this._color;
      this.vertexColors[i] = new math.Color(color.r, color.g, color.b, color.a * this.opacity);
    }
  }

  /** Initializes the main texture if possible. */
  private tryInitializeMainTexture(): void {
    if (this.mainTexture == null) {
      this.mainTexture = null;
    }
    this.applyMainTexture();
  }

  /** Initializes the mesh renderer. */
  public tryInitialize(renderController: CubismRenderController): void {
    this.drawable = this.getComponent(CubismDrawable);
    this.renderController = renderController;

    this.tryInitializeMeshRenderer();

    this.tryInitializeMesh();
    this.tryInitializeVertexColor();
    this.tryInitializeMainTexture();
    this.tryInitializeMultiplyColor();
    this.tryInitializeScreenColor();

    this.applySorting();
  }

  //#region Swap Info

  /** Sets NewVertexPositions. */
  private setNewVertexPositions(): void {
    this.thisSwap = this.thisSwap.copyWith({ newVertexPositions: true });
  }

  /** Sets NewVertexColors. */
  private setNewVertexColors(): void {
    this.thisSwap = this.thisSwap.copyWith({ newVertexColors: true });
  }

  /** Sets DidBecomeVisible on visible. */
  private becomeVisible(): void {
    this.thisSwap = this.thisSwap.copyWith({ didBecomeVisible: true });
  }

  /** Sets DidBecomeInvisible on invisible. */
  private becomeInvisible(): void {
    this.thisSwap = this.thisSwap.copyWith({ didBecomeInvisible: true });
  }

  /** Sets SetNewRenderOrder. */
  private setNewRenderOrder(): void {
    this.thisSwap = this.thisSwap.copyWith({ newRenderOrder: true });
  }

  /** Resets flags. */
  private resetSwapInfoFlags(): void {
    this.thisSwap = this.thisSwap.copyWith({
      newRenderOrder: false,
      newVertexPositions: false,
      didBecomeVisible: false,
      didBecomeInvisible: false,
    });
  }

  /** Reset visibility flags. */
  private resetVisibilityFlags(): void {
    this.thisSwap = this.thisSwap.copyWith({
      didBecomeVisible: false,
      didBecomeInvisible: false,
    });
  }

  /** Reset render order flag. */
  private resetRenderOrderFlag(): void {
    this.thisSwap = this.thisSwap.copyWith({
      newRenderOrder: false,
    });
  }

  //#endregion

  //#region Cocos Creator Events Handling

  /** Finalizes instance. */
  protected onDestroy(): void {
    // for (let i = 0; i < this.meshes.length; i++) {
    //   DestroyImmediate(this.meshes[i]);
    // }
  }

  //#endregion
}

/** Allows tracking of {@link Mesh} data changed on a swap. (struct) */
class SwapInfo implements IStructLike<SwapInfo> {
  /** Vertex positions were changed. */
  public readonly newVertexPositions: boolean;
  /** Vertex colors were changed. */
  public readonly newVertexColors: boolean;
  /** Visibility were changed to visible. */
  public readonly didBecomeVisible: boolean;
  /** Visibility were changed to invisible. */
  public readonly didBecomeInvisible: boolean;
  /** Render order were changed. */
  public readonly newRenderOrder: boolean;

  public constructor(
    args: {
      newVertexPositions?: boolean;
      newVertexColors?: boolean;
      didBecomeVisible?: boolean;
      didBecomeInvisible?: boolean;
      newRenderOrder?: boolean;
    } = {}
  ) {
    this.newVertexPositions = args.newVertexPositions ?? false;
    this.newVertexColors = args.newVertexColors ?? false;
    this.didBecomeVisible = args.didBecomeVisible ?? false;
    this.didBecomeInvisible = args.didBecomeInvisible ?? false;
    this.newRenderOrder = args.newRenderOrder ?? false;
  }

  public copyWith(
    args: {
      newVertexPositions?: boolean;
      newVertexColors?: boolean;
      didBecomeVisible?: boolean;
      didBecomeInvisible?: boolean;
      newRenderOrder?: boolean;
    } = {}
  ): SwapInfo {
    return new SwapInfo({
      newVertexPositions: args.newVertexPositions ?? this.newVertexPositions,
      newVertexColors: args.newVertexColors ?? this.newVertexColors,
      didBecomeVisible: args.didBecomeVisible ?? this.didBecomeVisible,
      didBecomeInvisible: args.didBecomeInvisible ?? this.didBecomeInvisible,
      newRenderOrder: args.newRenderOrder ?? this.newRenderOrder,
    });
  }

  public equals(other: SwapInfo): boolean {
    return this === other
      ? true
      : this.newVertexPositions == other.newVertexPositions &&
          this.newVertexColors == other.newVertexColors &&
          this.didBecomeVisible == other.didBecomeVisible &&
          this.didBecomeInvisible == other.didBecomeInvisible &&
          this.newRenderOrder == other.newRenderOrder;
  }

  public strictEquals(other: SwapInfo): boolean {
    return this === other;
  }
}

namespace SwapInfo {
  export const DEFAULT = new SwapInfo();
}
