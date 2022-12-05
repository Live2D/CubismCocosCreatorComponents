/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

const { Path } = Editor.Utils;

module.paths.push(Path.join(Editor.App.path, 'node_modules'));

import { IPanelThis } from '@builder/build-plugin';
import TagName from '../TagName';
import { getComponentPath, IElementCreator, requestSetProperty } from '../Utils';
import { ICubismParametersInspector, IInputDump } from '../../Dump/Input/InputDumpInterface';
import type IQueryNodeResult from '../../Dump/Query/IQueryNodeResult';
import type { IGetParametersResult } from '../../../static/assets/Framework/CubismParametersInspector';

export const template = '';
export const $ = {};

export async function update(this: IPanelThis, dump: IInputDump<ICubismParametersInspector>) {
  const getParametersResult = (await Editor.Message.request('scene', 'execute-component-method', {
    uuid: dump.value.uuid.value,
    name: 'getParameters',
    args: [],
  })) as IGetParametersResult | null;
  if (getParametersResult == null) {
    return;
  }
  const { parameters } = getParametersResult;

  const root = this.$this.shadowRoot;
  if (root == null) {
    return;
  }

  const doc: IElementCreator = root.ownerDocument;
  const nSection = doc.createElement('SECTION');
  nSection.id = 'main';

  for (let i = 0; i < parameters.length; i++) {
    const {
      nodeUuid,
      componentUuid,
      value,
      minimumValue: min,
      maximumValue: max,
      displayName,
    } = parameters[i];
    const nodeProxy = (await Editor.Message.request(
      'scene',
      'query-node',
      nodeUuid
    )) as IQueryNodeResult;
    const path = getComponentPath(nodeProxy, componentUuid);
    if (path == null) {
      console.error('findCompPath failed.');
      continue;
    }

    const prop = doc.createElement(TagName.UI_PROP);
    prop.setAttribute('dump', 'Float');
    const label = doc.createElement(TagName.UI_LABEL);
    label.innerText = displayName;
    label.slot = 'label';

    const slider = doc.createElement(TagName.UI_SLIDER);
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.step = 0.001;
    slider.slot = 'content';

    slider.addEventListener('confirm', async (event: Event) => {
      requestSetProperty(nodeUuid, `${path}.valueInEditor`, { value: slider.value, type: 'Float' });
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
