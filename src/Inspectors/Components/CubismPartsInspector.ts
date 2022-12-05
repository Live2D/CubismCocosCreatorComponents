/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

const { Path } = Editor.Utils;

module.paths.push(Path.join(Editor.App.path, 'node_modules'));

import { IPanelThis } from '@builder/build-plugin';
import type IQueryNodeResult from '../../Dump/Query/IQueryNodeResult';
import TagName from '../TagName';
import { getComponentPath, requestSetProperty } from '../Utils';
import type { IGetPartsResult } from '../../../static/assets/Framework/CubismPartsInspector';
import { ICubismPartsInspector, IInputDump } from '../../Dump/Input/InputDumpInterface';

export const template = '';
export const $ = {};

export async function update(this: IPanelThis, dump: IInputDump<ICubismPartsInspector>) {
  const getPartsResult = (await Editor.Message.request('scene', 'execute-component-method', {
    uuid: dump.value.uuid.value,
    name: 'getParts',
    args: [],
  })) as IGetPartsResult | null;
  if (getPartsResult == null) {
    return;
  }
  const { parts } = getPartsResult;

  const root = this.$this.shadowRoot;
  if (root == null) {
    return;
  }

  const createElement = root.ownerDocument.createElement.bind(root.ownerDocument);
  const nSection = createElement('SECTION');
  nSection.id = 'main';

  for (let i = 0; i < parts.length; i++) {
    const { nodeUuid, componentUuid, opacity, displayName } = parts[i];
    const nodeProxy = (await Editor.Message.request(
      'scene',
      'query-node',
      nodeUuid
    )) as IQueryNodeResult;
    const path = getComponentPath(nodeProxy, componentUuid);
    if (path == null) {
      console.error('Find Component path failed.');
      continue;
    }

    const prop = createElement(TagName.UI_PROP);
    prop.setAttribute('dump', 'Float');

    const label = createElement(TagName.UI_LABEL);
    label.innerText = displayName;
    label.slot = 'label';

    const slider = createElement(TagName.UI_SLIDER);
    slider.setAttribute('value', opacity.toFixed(20));
    slider.setAttribute('step', '0.001');
    slider.setAttribute('min', '0');
    slider.setAttribute('max', '1');
    slider.slot = 'content';

    slider.addEventListener('confirm', async (_event) => {
      const value = (Reflect.get(slider, 'value') ?? 0) as number;
      requestSetProperty(nodeUuid, `${path}.opacityInEditor`, { value: value, type: 'Float' });
    });

    prop.append(label, slider);
    nSection.appendChild(prop);
  }

  const oSection = root.getElementById('main');
  if (oSection) {
    root.replaceChild(nSection, oSection);
  } else {
    root.appendChild(nSection);
  }
}

export function ready(this: IPanelThis) {}
export function close(this: IPanelThis) {}
