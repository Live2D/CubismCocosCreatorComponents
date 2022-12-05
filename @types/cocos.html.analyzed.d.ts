/// <reference types='node' />

import * as NodeJSPath from 'path';

declare global {
  export interface HTMLUiAssetElement extends HTMLElement {
    droppable: string | undefined;
    value: string | undefined;
  }
  export interface HTMLUiCheckboxElement extends HTMLElement {
    value: boolean;
  }
  export interface HTMLUiComponentElement extends HTMLElement {
    droppable: string | undefined;
    value: string | undefined;
  }
  export interface HTMLUiCurveElement extends HTMLElement {
    value: IUiCurveValue;
    get config(): IUiCurveConfig | undefined;
    disabled: boolean;
    _config?: IUiCurveConfig;
  }
  export interface HTMLUiInputElement extends HTMLElement {
    value: string | undefined;
    disabled: boolean;
  }
  export interface HTMLUiNodeElement extends HTMLElement {
    droppable: string | undefined;
    value: string | undefined;
  }
  export interface HTMLUiNumInputElement extends HTMLElement {
    value: number;
    step: number;
    preci: number;
    min: number | null;
    max: number | null;
    disabled: boolean;
  }
  export interface HTMLUiPropElement extends HTMLElement {}
  export interface HTMLUiSelectElement extends HTMLElement {
    value: string | undefined;
  }
  export interface HTMLUiColorElement extends HTMLElement {
    value: [number, number, number, number] | null;
  }
  export interface HTMLUiSectionElement extends HTMLElement {
    header: string | undefined;
  }
  export interface HTMLUiSliderElement extends HTMLElement {
    value: number;
    step: number;
    preci: number;
    min: number;
    max: number;
  }
  export interface HTMLUiTabElement extends HTMLElement {
    value: number;
  }
  export interface HTMLUiTextareaElement extends HTMLElement {
    autoheight: boolean;
    disabled: boolean;
    focused: boolean;
    invalid: boolean;
    path: string;
    placeholder: string | null;
    pressed: boolean;
    readonly: boolean;
    value: string;
  }
  interface CocosHTMLElementTagNameMap {
    'ui-asset': HTMLUiAssetElement;
    'ui-button': HTMLElement;
    'ui-checkbox': HTMLUiCheckboxElement;
    'ui-color': HTMLUiColorElement;
    'ui-component': HTMLUiComponentElement;
    'ui-curve': HTMLUiCurveElement;
    'ui-input': HTMLUiInputElement;
    'ui-label': HTMLElement;
    'ui-node': HTMLUiNodeElement;
    'ui-num-input': HTMLUiNumInputElement;
    'ui-prop': HTMLUiPropElement;
    'ui-select': HTMLUiSelectElement;
    'ui-section': HTMLUiSectionElement;
    'ui-slider': HTMLUiSliderElement;
    'ui-tab': HTMLUiTabElement;
    'ui-textarea': HTMLUiTextareaElement;
  }

  export interface IUiCurveConfig {
    negative?: boolean;
    precision: number;
    showPostWrapMode: boolean;
    showPreWrapMode: boolean;
    type: 'hermit';
    xRange: [number, number];
    yRange: [number, number];
  }

  export interface IUiCurveValue {
    // おそらく何らかのカラーネーム 'red' 以外で何が使えるのか不明
    color: string;
    keys: IUiCurveValueKey[];
    multiplier?: number;
    postWrapMode: 0;
    preWrapMode: 0;
  }

  export interface IUiCurveValueKey {
    inTangent: number;
    inTangentWeight: number;
    interpMode: number;
    outTangent: number;
    outTangentWeight: number;
    point: { x: number; y: number };
    tangentWeightMode: number;
    interpMode: 0 | 1 | 2;
  }
}
