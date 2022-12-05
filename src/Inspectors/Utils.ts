/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import TagName from './TagName';
import type IQueryNodeResult from '../Dump/Query/IQueryNodeResult';
import type { IEnumItem, IInputDumpValueBase } from '../Dump/Input/InputDumpInterface';

export function getComponentPath(self: IQueryNodeResult, uuid: string): string | null {
  const comps = self.__comps__;
  for (let i = 0; i < comps.length; i++) {
    if (comps[i].value.uuid.value == uuid) {
      return '__comps__.' + i;
    }
  }
  return null;
}

export interface IProperty {
  default: any;
  extends: [];
  group: { id: string; name: string };
  name: string;
  path: string;
  readonly: boolean;
  type: string;
  value: any;
  visible: boolean;
}

export function createPropBase(create: CreateElementFunction, name: string) {
  const prop = create(TagName.UI_PROP) as HTMLUiPropElement;
  const label = create(TagName.UI_LABEL);
  label.slot = 'label';
  label.innerText = name;
  prop.appendChild(label);
  return prop;
}

export function selectAddEnumListToOptions(select: HTMLElement, enumList: IEnumItem[]): void {
  const createElement = select.ownerDocument.createElement.bind(select.ownerDocument);
  for (let i = 0; i < enumList.length; i++) {
    const option = createElement('option');
    option.setAttribute('value', enumList[i].value.toFixed(0));
    option.innerText = enumList[i].name;
    select.appendChild(option);
  }
}

export async function requestSetProperty(
  uuid: string,
  path: string,
  dump: { value: { uuid: string }; type: 'cc.Asset' | 'cc.Node' | 'cc.Component' }
): Promise<boolean>;
export async function requestSetProperty(
  uuid: string,
  path: string,
  dump: { value: number; type: 'Float' | 'Enum' }
): Promise<boolean>;
export async function requestSetProperty(
  uuid: string,
  path: string,
  dump: { value: any; type: string }
): Promise<boolean>;
export async function requestSetProperty(
  uuid: string,
  path: string,
  dump: { value: any; type: string }
): Promise<boolean> {
  return Editor.Message.request('scene', 'set-property', {
    uuid: uuid,
    path: path,
    dump: dump,
  });
}

export function getIntegerValue(target: object): number | undefined {
  const value = Reflect.get(target, 'value');
  return Number.isInteger(value) ? value : undefined;
}
export function getFloatValue(target: object): number | undefined {
  const value = Reflect.get(target, 'value');
  return Number.isFinite(value) ? value : undefined;
}
export function getStringValue(target: object): string | undefined {
  const value = Reflect.get(target, 'value');
  return typeof value == 'string' ? value : undefined;
}

export type CreateElementFunction = {
  <K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options?: ElementCreationOptions | undefined
  ): HTMLElementTagNameMap[K];
  <K extends keyof HTMLElementDeprecatedTagNameMap>(
    tagName: K,
    options?: ElementCreationOptions | undefined
  ): HTMLElementDeprecatedTagNameMap[K];
  (tagName: string, options?: ElementCreationOptions | undefined): HTMLElement;
  (tagName: 'webview'): Electron.WebviewTag;
};

const styleSheet = new CSSStyleSheet();
styleSheet.insertRule(`:host { display: flex; flex-direction: column; }`);
styleSheet.insertRule(`ui-tab { display: block; margin-bottom: 10px; align-self: flex-start; }`);
styleSheet.insertRule(
  `ui-component, ui-node, ui-asset { display: none; flex-basis: auto; align-self: stretch; }`
);
styleSheet.insertRule(`ui-tab[value="0"] ~ ui-component { display: block; }`);
styleSheet.insertRule(`ui-tab[value="1"] ~ ui-node { display: block; }`);
styleSheet.insertRule(`ui-tab[value="2"] ~ ui-asset { display: block; }`);

const TAB_LABELS = ['Component', 'Node', 'Asset'];

export class HTMLObjectFieldElement extends HTMLElement {
  private tab: HTMLUiTabElement | null = null;
  private component: HTMLElement | null = null;
  private node: HTMLElement | null = null;
  private asset: HTMLElement | null = null;

  private _selected: HTMLObjectFieldElement.Type = HTMLObjectFieldElement.Type.component;
  public get selected(): HTMLObjectFieldElement.Type {
    return this._selected;
  }
  public set selected(value: HTMLObjectFieldElement.Type) {
    this._selected = value;
    if (this.isConnected) {
      this.tab!.value = value;
    }
  }

  private _value: { uuid: string; type: HTMLObjectFieldElement.Type } | null = null;
  public get value() {
    return this._value;
  }
  public set value(value) {
    if (value == null) {
      this._value = null;
    } else {
      this._value = { uuid: value.uuid, type: value.type };
      Object.freeze(this._value);
    }
  }

  public constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  private connectedCallback() {
    const { Type, generateValueChangeEvent } = HTMLObjectFieldElement;
    const create = this.ownerDocument.createElement.bind(this.ownerDocument);

    const { shadowRoot } = this;
    if (shadowRoot == null) {
      return;
    }

    // 実装されているはずだがビルドエラーになるため ts-ignore
    // @ts-ignore
    shadowRoot.adoptedStyleSheets = [styleSheet];

    const tab = create(TagName.UI_TAB) as HTMLUiTabElement;
    for (let i = 0; i < TAB_LABELS.length; i++) {
      const button = create(TagName.UI_BUTTON);
      button.innerText = TAB_LABELS[i];
      tab.appendChild(button);
    }
    tab.value = this.selected;
    tab.addEventListener('confirm', (_) => {
      this._selected = tab.value;
    });
    this.tab = shadowRoot.appendChild(tab);

    const comp = create(TagName.UI_COMPONENT) as HTMLUiComponentElement;
    comp.droppable = 'cc.Component';
    if (this.value?.type === Type.component) {
      comp.value = this.value.uuid;
    }
    comp.addEventListener('confirm', this.generateEventListenerFunc(comp, Type.component));
    this.component = shadowRoot.appendChild(comp);

    const node = create(TagName.UI_NODE) as HTMLUiNodeElement;
    node.droppable = 'cc.Node';
    if (this.value?.type === Type.node) {
      node.value = this.value.uuid;
    }
    node.addEventListener('confirm', this.generateEventListenerFunc(node, Type.node));
    this.node = shadowRoot.appendChild(node);

    const asset = create(TagName.UI_ASSET) as HTMLUiAssetElement;
    asset.droppable = 'cc.Asset';
    if (this.value?.type === Type.asset) {
      asset.value = this.value.uuid;
    }
    asset.addEventListener('confirm', this.generateEventListenerFunc(asset, Type.asset));
    this.asset = shadowRoot.appendChild(asset);
  }

  private disconnectedCallback() {
    const { shadowRoot } = this;
    if (shadowRoot == null) {
      return;
    }
    while (shadowRoot.firstChild != null) {
      shadowRoot.removeChild(shadowRoot.firstChild);
    }
  }

  private generateEventListenerFunc(
    target: HTMLUiComponentElement,
    type: HTMLObjectFieldElement.Type
  ) {
    return function (
      this: {
        self: HTMLObjectFieldElement;
        target: HTMLUiComponentElement;
        type: HTMLObjectFieldElement.Type;
      },
      event: Event
    ) {
      const { self, target, type } = this;
      const backup = self.value;
      if (target.value) {
        self._value = { uuid: target.value, type: type };
      } else {
        self._value = null;
      }
      const cancel = self.dispatchEvent(
        HTMLObjectFieldElement.generateValueChangeEvent(event, type)
      );
      if (event.cancelable && !cancel) {
        self._value = backup;
        event.preventDefault();
      }
    }.bind({ self: this, target: target, type: type });
  }

  private static generateValueChangeEvent(
    event: Event,
    detail: HTMLObjectFieldElement.Type
  ): CustomEvent {
    return new CustomEvent('confirm', {
      bubbles: event.bubbles,
      cancelable: event.cancelable,
      composed: event.composed,
      detail: detail,
    });
  }
}

customElements.define('cubism-object-field', HTMLObjectFieldElement);

export namespace HTMLObjectFieldElement {
  export enum Type {
    component,
    node,
    asset,
  }
}

export abstract class InspectorGuiHelper {
  protected parent: HTMLElement;
  public constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  protected create(
    tagName: 'cubism-object-field',
    options?: ElementCreationOptions | undefined
  ): HTMLObjectFieldElement;
  protected create<K extends keyof CocosHTMLElementTagNameMap>(
    tagName: K,
    options?: ElementCreationOptions | undefined
  ): CocosHTMLElementTagNameMap[K];
  protected create<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options?: ElementCreationOptions | undefined
  ): HTMLElementTagNameMap[K];
  protected create<K extends keyof HTMLElementDeprecatedTagNameMap>(
    tagName: K,
    options?: ElementCreationOptions | undefined
  ): HTMLElementDeprecatedTagNameMap[K];
  protected create(tagName: string, options?: ElementCreationOptions | undefined): HTMLElement;
  protected create(tagName: 'webview'): Electron.WebviewTag;
  protected create(tagName: string, options?: ElementCreationOptions | undefined): any {
    return this.parent.ownerDocument.createElement(tagName, options);
  }

  protected createPropBase(name: string): HTMLUiPropElement {
    const prop = this.create(TagName.UI_PROP) as HTMLUiPropElement;
    const label = this.create(TagName.UI_LABEL);
    label.slot = 'label';
    label.innerText = name;
    prop.appendChild(label);
    return prop;
  }
}

export abstract class InspectorComponentGuiHelper extends InspectorGuiHelper {
  protected abstract values: IInputDumpValueBase;

  public constructor(parent: HTMLElement) {
    super(parent);
  }
}

export interface IElementCreator {
  createElement(
    tagName: 'cubism-object-field',
    options?: ElementCreationOptions | undefined
  ): HTMLObjectFieldElement;
  createElement<K extends keyof CocosHTMLElementTagNameMap>(
    tagName: K,
    options?: ElementCreationOptions | undefined
  ): CocosHTMLElementTagNameMap[K];
  createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options?: ElementCreationOptions | undefined
  ): HTMLElementTagNameMap[K];
  createElement<K extends keyof HTMLElementDeprecatedTagNameMap>(
    tagName: K,
    options?: ElementCreationOptions | undefined
  ): HTMLElementDeprecatedTagNameMap[K];
  createElement(tagName: string, options?: ElementCreationOptions | undefined): HTMLElement;
  createElement(tagName: 'webview'): Electron.WebviewTag;
}
