/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

const { Path } = Editor.Utils;

module.paths.push(Path.join(Editor.App.path, 'node_modules'));

import { IPanelThis } from '@builder/build-plugin';
import { ICubismLookController, IInputDump } from '../../Dump/Input/InputDumpInterface';
import TagName from '../TagName';
import {
  HTMLObjectFieldElement,
  InspectorComponentGuiHelper,
  requestSetProperty,
  selectAddEnumListToOptions,
} from '../Utils';

export const template = '';
export const $ = {};

export async function update(this: IPanelThis, dump: IInputDump<ICubismLookController>) {
  const root = this.$this.shadowRoot;
  if (root == null) {
    return;
  }

  const createElement = root.ownerDocument.createElement.bind(root.ownerDocument);
  const nSection = createElement('SECTION');
  nSection.id = 'main';

  const helper = new UI(nSection, dump.value);
  helper.blendMode();
  helper.center();
  helper.damping();
  helper.target();

  const oSection = root.getElementById('main');
  if (oSection) {
    root.replaceChild(nSection, oSection);
  } else {
    root.appendChild(nSection);
  }
}

export function ready(this: IPanelThis) {}
export function close(this: IPanelThis) {}

class UI extends InspectorComponentGuiHelper {
  protected override values: ICubismLookController;

  public constructor(parent: HTMLElement, values: ICubismLookController) {
    super(parent);
    this.values = values;
  }

  public blendMode(): void {
    const { blendMode, node } = this.values;
    const prop = this.createPropBase('Blend Mode');
    const content = this.create(TagName.UI_SELECT);
    content.slot = 'content';
    selectAddEnumListToOptions(content, blendMode.enumList);
    content.value = blendMode.value.toFixed(0);
    content.addEventListener('confirm', async (_event) => {
      await requestSetProperty(node.value.uuid, blendMode.path, {
        value: content.value != null ? Number.parseInt(content.value) : 0,
        type: blendMode.type,
      });
    });
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }

  public center(): void {
    const { center, node } = this.values;
    const prop = this.createPropBase('Center');
    const content = this.create(TagName.UI_NODE);
    content.slot = 'content';
    if (center.value.uuid.length > 0) {
      content.value = center.value.uuid;
    }
    content.addEventListener('confirm', async (_event) => {
      await requestSetProperty(node.value.uuid, center.path, {
        value: { uuid: content.value ?? '' },
        type: center.type,
      });
    });
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }

  public damping(): void {
    const { damping, node } = this.values;
    const prop = this.createPropBase('Damping');
    const content = this.create(TagName.UI_NUM_INPUT);
    content.slot = 'content';
    content.preci = 20;
    content.step = 0.001;
    content.min = Number.MIN_SAFE_INTEGER;
    content.max = Number.MAX_SAFE_INTEGER;
    content.value = damping.value;
    content.addEventListener('confirm', async (_) => {
      await requestSetProperty(node.value.uuid, damping.path, {
        value: content.value,
        type: damping.type,
      });
    });
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }

  public target(): void {
    const { targetAsset: asset, targetComponent: comp, targetNode: node } = this.values;
    const { uuid: nUuid } = this.values.node.value;
    const { Type } = HTMLObjectFieldElement;
    const value =
      comp.value.uuid.length > 0
        ? { uuid: comp.value.uuid, type: Type.component }
        : node.value.uuid.length > 0
        ? { uuid: node.value.uuid, type: Type.node }
        : asset.value.uuid.length > 0
        ? { uuid: asset.value.uuid, type: Type.asset }
        : null;

    const prop = this.createPropBase('Target');
    const objectField = this.create('cubism-object-field');
    if (value != null) {
      objectField.value = { uuid: value.uuid, type: value.type };
    }
    objectField.slot = 'content';
    objectField.addEventListener('confirm', async (event) => {
      const { Type } = HTMLObjectFieldElement;
      const { detail } = event as CustomEvent<HTMLObjectFieldElement.Type>;
      const { value } = objectField;
      switch (detail) {
        case Type.component:
          await requestSetProperty(nUuid, comp.path, {
            value: { uuid: value?.uuid ?? '' },
            type: 'cc.Component',
          });
          break;
        case Type.node:
          await requestSetProperty(nUuid, node.path, {
            value: { uuid: value?.uuid ?? '' },
            type: 'cc.Node',
          });
          break;
        case Type.asset:
          await requestSetProperty(nUuid, asset.path, {
            value: { uuid: value?.uuid ?? '' },
            type: 'cc.Asset',
          });
          break;
        default:
          const _: never = detail;
          console.error('Property value error.');
          break;
      }
    });
    prop.appendChild(objectField);
    this.parent.appendChild(prop);
  }
}
