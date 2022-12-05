/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

export interface IInputDump<T extends IInputDumpValueBase> {
  cid: string;
  editor: {
    help: string;
    icon: string;
    inspector: string;
    _showTick: boolean;
  };
  extends: string[];
  groups: unknown;
  path: string;
  readonly: boolean;
  type: string;
  value: T;
  visible: boolean;
}

export interface IInputDumpValueBase {
  enabled: any;
  name: any;
  node: any;
  uuid: any;
  __editorExtras__: unknown;
  __prefab: unknown;
  __scriptAsset: unknown;
  _enabled: unknown;
  _name: unknown;
  _objFlags: unknown;
}

interface IUuidValue {
  uuid: string;
}

interface IColorValue {
  a: number;
  r: number;
  g: number;
  b: number;
}

interface TypeMap {
  Boolean: boolean;
  Float: number;
  Integer: number;
  String: string;
  Enum: number;
  CCClass: IUuidValue;
  'cc.Color': IColorValue;
  'cc.Node': IUuidValue;
  'cc.Mesh': IUuidValue;
  'cc.Material': IUuidValue;
  'cc.Texture2D': IUuidValue;
  'cc.Camera': IUuidValue;
}

export interface IMember<T extends keyof TypeMap> {
  extends: string[];
  group?: { id: string; name: string };
  name: string;
  path: string;
  readonly: boolean;
  type: string;
  value: TypeMap[T];
  visible: boolean;
}

export interface IProperty<T extends keyof TypeMap> extends IMember<T> {
  default: TypeMap[T];
}

export interface IAccessorProperty<T extends keyof TypeMap> extends IMember<T> {}

export interface IEnumProperty extends IProperty<'Enum'> {
  enumList: IEnumItem[];
}
export interface IEnumAccessorProperty extends IAccessorProperty<'Enum'> {
  enumList: IEnumItem[];
}
export interface IEnumItem {
  name: string;
  value: number;
}

export interface IClassArray<T extends string> {
  default: any[] | null;
  elementTypeData: {
    default: unknown | null;
    group: string;
    readonly: boolean;
    type: unknown;
    value: unknown | null;
    visible: boolean;
  };
  extends: [];
  group: { id: string; name: string };
  groups: object;
  isArray: true;
  name: string;
  path: string;
  readonly: boolean;
  type: 'Array';
  value: IClassArrayElement<T>[] | null;
  visible: boolean;
}

export interface IClassArrayElement<T extends string> {
  default: { uuid: string } | null;
  extends: string[];
  group: { id: string; name: string };
  name: string;
  path: string;
  readonly: boolean;
  type: T;
  value: { uuid: string } | null;
  visible: boolean;
}

/**
 *
 */
export interface ICubismUserDataTag extends IInputDumpValueBase {
  value: IAccessorProperty<'String'>;
  _body: IProperty<'String'>;
  _value: IProperty<'String'>;
}

export interface ICubismRenderer extends IInputDumpValueBase {
  mesh: IProperty<'cc.Mesh'>;
  color: IProperty<'cc.Color'>;
  material: IProperty<'cc.Material'>;
  mainTexture: IProperty<'cc.Texture2D'>;
  localSortingOrder: IProperty<'Integer'>;
  sortingMode: IProperty<'Enum'>;
  _isOverwrittenDrawableMultiplyColors: IProperty<'Boolean'>;
  _isOverwrittenDrawableScreenColor: IProperty<'Boolean'>;
  _multiplyColor: IProperty<'cc.Color'>;
  _screenColor: IProperty<'cc.Color'>;
}

export interface ICubismRenderController extends IInputDumpValueBase {
  cameraToFace: IProperty<'cc.Camera'>;
  opacity: IProperty<'Float'>;
  sortingMode: IEnumAccessorProperty;
  sortingOrder: IAccessorProperty<'Integer'>;
  drawOrderHandler: unknown;
  drawOrderHandlerAsset: IAccessorProperty<'CCClass'>;
  drawOrderHandlerComponent: IAccessorProperty<'CCClass'>;
  drawOrderHandlerNode: IAccessorProperty<'cc.Node'>;
  opacityHandler: unknown;
  opacityHandlerAsset: IAccessorProperty<'CCClass'>;
  opacityHandlerComponent: IAccessorProperty<'CCClass'>;
  opacityHandlerNode: IAccessorProperty<'cc.Node'>;
  depthOffset: IProperty<'Float'>;

  _depthOffset: IProperty<'Float'>;
  _drawOrderHandler: unknown;
  _drawOrderHandlerInterface: unknown;
  _hasUpdateController: IProperty<'Boolean'>;
  _lastOpacity: IProperty<'Float'>;
  _opacityHandler: unknown;
  _renderers: IClassArray<'CubismRenderer'>;
  _sortingMode: IEnumProperty;
  _sortingOrder: IProperty<'Integer'>;
  _isOverwrittenModelMultiplyColors: IProperty<'Boolean'>;
  _isOverwrittenModelScreenColors: IProperty<'Boolean'>;
}

export interface ICubismLookController extends IInputDumpValueBase {
  blendMode: IEnumProperty;
  target: unknown;
  targetComponent: IProperty<'CCClass'>;
  targetNode: IProperty<'cc.Node'>;
  targetAsset: IProperty<'CCClass'>;
  center: IAccessorProperty<'cc.Node'>;
  damping: IProperty<'Float'>;
  _target: unknown;
}

export interface ICubismParametersInspector extends IInputDumpValueBase {}

export interface ICubismPartsInspector extends IInputDumpValueBase {}
