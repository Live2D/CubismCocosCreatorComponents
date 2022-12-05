/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

const { Path } = Editor.Utils;

module.paths.push(Path.join(Editor.App.path, 'node_modules'));

import { IPanelThis } from '@builder/build-plugin';
import { ICubismUserDataTag, IInputDump } from '../../Dump/Input/InputDumpInterface';
import TagName from '../TagName';
import { InspectorComponentGuiHelper } from '../Utils';

export const template = ``;
export const $ = {};

export async function update(this: IPanelThis, dump: IInputDump<ICubismUserDataTag>) {
  const root = this.$this.shadowRoot;
  if (root == null) {
    return;
  }
  const nSection = root.ownerDocument.createElement('SECTION');
  nSection.id = 'main';

  const helper = new UI(nSection, dump.value);
  helper.value();

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
  protected override values: ICubismUserDataTag;

  public constructor(parent: HTMLElement, values: ICubismUserDataTag) {
    super(parent);
    this.values = values;
  }

  public value() {
    const { value, node } = this.values;
    const prop = this.createPropBase('Value');
    const content = this.create(TagName.UI_TEXTAREA);
    content.slot = 'content';
    content.value = value.value;
    content.addEventListener('confirm', async (_) => {
      await setProperty(node.value.uuid, value.path, {
        value: content.value,
        type: value.type,
      });
    });
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }
}
