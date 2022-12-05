/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

export default interface IComponentValue {
  enabled: IBooleanAccessor;
  name: IString;
  node: INode;
  uuid: IString;
  __editorExtras__: __editorExtras__;
  __prefab: __prefab;
  __scriptAsset: __scriptAsset;
  _enabled: IBooleanProperty;
  _name: IStringProperty;
  _objFlags: INumberProperty;
}

export type IBooleanAccessor = IBoolean;
export type IBooleanProperty = IBoolean & IName;
export type INumberAccessor = INumber;
export type INumberProperty = INumber & IName;
export type IStringAccessor = IString;
export type IStringProperty = IString & IName;

interface IBoolean {
  default: boolean | null;
  extends: string[];
  readonly: boolean;
  type: 'Boolean';
  value: boolean;
  visible: boolean;
}

interface INumber {
  default: number | string;
  extends: string[];
  readonly: boolean;
  type: 'Number';
  value: number;
  visible: boolean;
}

interface IString {
  default: string | null;
  extends: string[];
  readonly: boolean;
  type: 'String';
  value: string;
  visible: boolean;
}

export interface INode {
  default: null;
  extends: string[];
  name: string;
  readonly: boolean;
  type: 'cc.Node';
  value: { uuid: string };
  visible: boolean;
}

interface IName {
  name: string;
}

interface __editorExtras__ {
  default: unknown; // {}
  name: '__editorExtras__';
  readonly: boolean;
  type: 'Unknown';
  value: unknown; // null
  visible: boolean;
}

interface __prefab {
  default: unknown; // null
  extends: string[];
  name: '__prefab';
  readonly: boolean;
  type: 'cc.CompPrefabInfo';
  fileId: {
    default: string | null;
    extends: string[];
    name: 'fileId';
    readonly: boolean;
    type: 'String';
    value: string;
    visible: boolean;
  };
  value: unknown; // null
  visible: boolean;
}

interface __scriptAsset {
  animatable: boolean;
  displayName: string;
  displayOrder: number;
  extends: string[];
  name: '__scriptAsset';
  readonly: boolean;
  tooltip: string;
  type: 'cc.Script';
  value: { uuid: string };
  visible: boolean;
}
