/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

const { Path } = Editor.Utils;

module.paths.push(Path.join(Editor.App.path, 'node_modules'));

import { IPanelThis } from '@builder/build-plugin';
import { ICubismRenderer, IInputDump } from '../../Dump/Input/InputDumpInterface';
import TagName from '../TagName';
import { InspectorComponentGuiHelper } from '../Utils';

export const template = ``;
export const $ = {};

export async function update(this: IPanelThis, dump: IInputDump<ICubismRenderer>) {
  const root = this.$this.shadowRoot;
  if (root == null) {
    return;
  }
  const nSection = root.ownerDocument.createElement('SECTION');
  nSection.id = 'main';

  const helper = new UI(nSection, dump.value);
  helper.overwriteFlagDrawableMultiplyColor();
  helper.overwriteFlagDrawableScreenColor();
  helper.color();
  helper.multiplyColor();
  helper.screenColor();
  helper.material();
  helper.mainTexture();
  helper.localOrder();

  const oSection = root.getElementById('main');
  if (oSection) {
    root.replaceChild(nSection, oSection);
  } else {
    root.appendChild(nSection);
  }
}

export function ready(this: any) {}
export function close(this: any) {}

async function setProperty(uuid: string, path: string, dump: { value: any; type: string }) {
  return Editor.Message.request('scene', 'set-property', {
    uuid: uuid,
    path: path,
    dump: dump,
  });
}

class UI extends InspectorComponentGuiHelper {
  protected override values: ICubismRenderer;

  public constructor(parent: HTMLElement, values: ICubismRenderer) {
    super(parent);
    this.values = values;
  }

  public overwriteFlagDrawableMultiplyColor() {
    const { _isOverwrittenDrawableMultiplyColors: multiplyColor, node } = this.values;
    const prop = this.createPropBase('OverwriteFlagDrawableMultiplyColor');
    const content = this.create(TagName.UI_CHECKBOX);
    content.slot = 'content';
    content.value = multiplyColor.value;
    content.addEventListener('confirm', async (_) => {
      await setProperty(node.value.uuid, multiplyColor.path, {
        value: content.value,
        type: multiplyColor.type,
      });
    });
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }

  public overwriteFlagDrawableScreenColor() {
    const { _isOverwrittenDrawableScreenColor: screenColor, node } = this.values;
    const prop = this.createPropBase('OverwriteFlagDrawableScreenColor');
    const content = this.create(TagName.UI_CHECKBOX);
    content.slot = 'content';
    content.value = screenColor.value;
    content.addEventListener('confirm', async (_) => {
      await setProperty(node.value.uuid, screenColor.path, {
        value: content.value,
        type: screenColor.type,
      });
    });
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }

  public color() {
    const { color, node } = this.values;
    const prop = this.createPropBase('Color');
    const content = this.create(TagName.UI_COLOR);
    content.slot = 'content';
    const { r, g, b, a } = color.value;
    content.value = [r, g, b, a];
    content.addEventListener('confirm', async (_) => {
      const { value: v } = content;
      const dValue = v ? { r: v[0], g: v[1], b: v[2], a: v[3] } : { r, g, b, a };
      await setProperty(node.value.uuid, color.path, {
        value: dValue,
        type: color.type,
      });
    });
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }

  public multiplyColor() {
    const { _multiplyColor, node } = this.values;
    const prop = this.createPropBase('MultiplyColor');
    const content = this.create(TagName.UI_COLOR);
    content.slot = 'content';
    const { r, g, b, a } = _multiplyColor.value;
    content.value = [r, g, b, a];
    content.addEventListener('confirm', async (_) => {
      const { value: v } = content;
      const dValue = v ? { r: v[0], g: v[1], b: v[2], a: v[3] } : { r, g, b, a };
      await setProperty(node.value.uuid, _multiplyColor.path, {
        value: dValue,
        type: _multiplyColor.type,
      });
    });
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }

  public screenColor() {
    const { _screenColor, node } = this.values;
    const prop = this.createPropBase('ScreenColor');
    const content = this.create(TagName.UI_COLOR);
    content.slot = 'content';
    const { r, g, b, a } = _screenColor.value;
    content.value = [r, g, b, a];
    content.addEventListener('confirm', async (_) => {
      const { value: v } = content;
      const dValue = v ? { r: v[0], g: v[1], b: v[2], a: v[3] } : { r, g, b, a };
      await setProperty(node.value.uuid, _screenColor.path, {
        value: dValue,
        type: _screenColor.type,
      });
    });
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }

  public material() {
    const { material, node } = this.values;
    const prop = this.createPropBase('Material');
    const content = this.create(TagName.UI_ASSET);
    content.slot = 'content';
    content.droppable = 'cc.Material';
    content.value = material.value.uuid;
    content.addEventListener('confirm', async (_event) => {
      await setProperty(node.value.uuid, material.path, {
        value: { uuid: content.value ?? '' },
        type: material.type,
      });
    });

    prop.appendChild(content);
    this.parent.appendChild(prop);
  }

  public mainTexture() {
    const { mainTexture, node } = this.values;
    const prop = this.createPropBase('Main Texture');
    const content = this.create(TagName.UI_ASSET);
    content.slot = 'content';
    content.droppable = 'cc.Texture2D';
    content.value = mainTexture.value.uuid;
    content.addEventListener('confirm', async (_event) => {
      await setProperty(node.value.uuid, mainTexture.path, {
        value: { uuid: content.value ?? '' },
        type: mainTexture.type,
      });
    });
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }

  public localOrder() {
    const { localSortingOrder, node } = this.values;
    const prop = this.createPropBase('Local Order');
    const content = this.create(TagName.UI_NUM_INPUT);
    content.slot = 'content';
    content.preci = 0;
    content.step = 1;
    content.min = Number.MIN_SAFE_INTEGER;
    content.max = Number.MAX_SAFE_INTEGER;
    content.value = localSortingOrder.value;
    content.addEventListener('confirm', async (_event) => {
      await setProperty(node.value.uuid, localSortingOrder.path, {
        value: content.value,
        type: localSortingOrder.type,
      });
    });
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }
}
