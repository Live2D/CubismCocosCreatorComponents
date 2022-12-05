/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import {
  Component,
  Camera,
  MeshRenderer,
  CCObject,
  director,
  Node,
  renderer,
  _decorator,
  math,
  Layers,
} from 'cc';
import CubismMaskTexture from './CubismMaskTexture';
import type CubismRenderer from '../CubismRenderer';
import type ICubismMaskCommandSource from './ICubismMaskCommandSource';
import { EDITOR } from 'cc/env';
const { ccclass, executeInEditMode, disallowMultiple, requireComponent } = _decorator;

/** Singleton buffer for Cubism mask related draw commands. */
@ccclass('CubismMaskCommandBuffer')
@disallowMultiple
@requireComponent([Camera])
@executeInEditMode
export default class CubismMaskCommandBuffer extends Component {
  private static _instance: CubismMaskCommandBuffer | null = null;
  public static get instance(): CubismMaskCommandBuffer {
    if (!CubismMaskCommandBuffer._instance) {
      CubismMaskCommandBuffer.initialize();
    }
    return CubismMaskCommandBuffer._instance!;
  }

  private static _sources: ICubismMaskCommandSource[] = new Array<ICubismMaskCommandSource>();

  /** Draw command sources. */
  private static get sources() {
    return this._sources;
  }
  private static set sources(value) {
    this._sources = value;
  }

  private static _buffer: Map<CubismRenderer, MeshRenderer> = new Map();

  /** Command buffer. */
  public static get buffer() {
    return this._buffer;
  }
  private static set buffer(value) {
    this._buffer = value;
  }

  /** True if Sources are empty. */
  private static get containsSources(): boolean {
    return this.sources.length > 0;
  }

  /** Makes sure class is initialized for static usage. */
  private static initialize(): void {
    // Initialize containers.

    // Spawn update proxy.
    const proxyName: string = 'cubism_MaskCommandBuffer';
    let proxy: Node | null = null;
    // @ts-ignore
    const persistRootNodes: object = director._persistRootNodes;
    if (EDITOR) {
      for (const key in persistRootNodes) {
        const obj = Reflect.get(persistRootNodes, key) as Node;
        if (obj.name == proxyName) {
          director.removePersistRootNode(obj);
        }
      }
    }
    for (const key in persistRootNodes) {
      const obj = Reflect.get(persistRootNodes, key);
      if (obj.name == proxyName) {
        proxy = obj;
        break;
      }
    }
    if (proxy == null) {
      proxy = new Node(proxyName);
      director.addPersistRootNode(proxy);
      CubismMaskCommandBuffer._instance = proxy.addComponent(CubismMaskCommandBuffer);
      console.assert(CubismMaskCommandBuffer._instance);
    }
    proxy.hideFlags = PROXY_HIDE_FLAGS;
  }

  /**
   * Registers a new draw command source.
   * @param source Source to add.
   */
  public static addSource(source: ICubismMaskCommandSource): void {
    // Make sure singleton is initialized.
    CubismMaskCommandBuffer.initialize();

    // Prevent same source from being added twice.
    if (this.sources.includes(source)) {
      return;
    }

    // Add source and force refresh.
    this.sources.push(source);
  }

  /**
   * Deregisters a draw command source.
   * @param source Source to remove.
   */
  public static removeSource(source: ICubismMaskCommandSource): void {
    // Make sure singleton is initialized.
    CubismMaskCommandBuffer.initialize();

    // Remove source and force refresh.
    let index = 0;
    for (let i = 0; i < this.sources.length; i++) {
      if (this.sources[i] != source) {
        this.sources[index] = this.sources[i];
        index++;
      }
    }
    this.sources.length = index;
  }
  public static readonly metadataPropertySymbol: symbol = Symbol.for(
    'CubismMaskCommandBufferMetadata'
  );

  /** Forces the command buffer to be refreshed. */
  private static refreshCommandBuffer(): void {
    // Clear buffer.
    if (!CubismMaskCommandBuffer.instance) {
      console.warn(`CubismMaskCommandBuffer.instance is null.`);
      return;
    }
    const renderers = CubismMaskCommandBuffer.instance.getComponentsInChildren(MeshRenderer);
    for (let i = 0; i < renderers.length; i++) {
      const meta: CubismMaskCommandBufferMetadata | undefined = Reflect.get(
        renderers[i],
        CubismMaskCommandBuffer.metadataPropertySymbol
      );
      if (meta) {
        meta.enabled = false;
      }
    }

    // Enqueue sources.
    for (let i = 0; i < this.sources.length; i++) {
      this.sources[i].addToCommandBuffer(CubismMaskCommandBuffer.instance);
    }

    for (let i = 0; i < renderers.length; i++) {
      const meta: CubismMaskCommandBufferMetadata | undefined = Reflect.get(
        renderers[i],
        CubismMaskCommandBuffer.metadataPropertySymbol
      );
      if (meta) {
        renderers[i].enabled = meta.enabled;
      }
    }
  }

  private _camera: Camera | null = null;
  public get camera(): Camera {
    return this._camera!;
  }

  // #region Cocos Creator Event Handling
  protected onLoad() {
    console.info('CubismMaskCommandBuffer.onLoad()');
    let camera = this.getComponent(Camera);
    if (camera == null) {
      camera = this.addComponent(Camera);
    }
    console.assert(camera);
    camera = camera!;
    camera.priority = Number.MIN_SAFE_INTEGER;
    this.node.layer = userLayer19 | (EDITOR ? Layers.Enum.EDITOR : 0);
    camera.projection = renderer.scene.CameraProjection.ORTHO;
    camera.visibility = userLayer19 | (EDITOR ? Layers.Enum.EDITOR : 0);
    camera.clearFlags = Camera.ClearFlag.SOLID_COLOR;
    camera.clearColor = new math.Color(0, 0, 0, 0);
    camera.orthoHeight = 1;
    camera.near = -0.5;
    camera.far = 0.5;

    // TODO: HACK
    // Ignore SceneView camera
    if (EDITOR) {
      // @ts-ignore
      cce.Camera._camera.visibility &= ~userLayer19;
    }

    const targetTexture = CubismMaskTexture.globalMaskTexture?.getTextureReference() ?? null;
    if (targetTexture == null) {
      console.error(
        'CubismMaskCommandBuffer.onLoad(): CubismMaskTexture.globalMaskTexture is null.'
      );
      return;
    }
    camera.targetTexture = targetTexture;
    console.assert(camera.targetTexture);
    this._camera = camera;
  }

  /** Executes Buffer. */
  protected lateUpdate(dt: number): void {
    const scene = director.getScene();
    if (scene == null) {
      console.error('director.getScene() failed.');
      return;
    }
    if (scene.renderScene == null) {
      console.error('director.getScene().renderScene is null.');
      return;
    }

    if (!CubismMaskCommandBuffer.containsSources) {
      return;
    }

    // Refresh and execute buffer.
    CubismMaskCommandBuffer.refreshCommandBuffer();
  }

  // #endregion
}

export class CubismMaskCommandBufferMetadata {
  enabled: boolean = false;
  cubismRenderer: CubismRenderer | null = null;
  meshRenderer: MeshRenderer | null = null;
}

const userLayer19 = 0x00080000; // 0x00080000

const PROXY_HIDE_FLAGS =
  CCObject.Flags.DontSave |
  CCObject.Flags.EditorOnly |
  CCObject.Flags.DontDestroy |
  CCObject.Flags.HideInHierarchy;
