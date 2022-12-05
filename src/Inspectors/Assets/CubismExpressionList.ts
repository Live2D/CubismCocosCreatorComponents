/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

const { Path } = Editor.Utils;

module.paths.push(Path.join(Editor.App.path, 'node_modules'));

import { IPanelThis } from '@builder/build-plugin';
import { readFileSync } from 'fs';
import { Asset, Meta } from '../InspectorInterface';
import TagName from '../TagName';

export const template = ``;
export const $ = {};

export function update(this: IPanelThis, assetList: Asset[], metaList: Meta[]) {
  console.info('update');
  const root = this.$this.shadowRoot;
  if (root == null) {
    return;
  }
  const createElement = root.ownerDocument.createElement.bind(root.ownerDocument);
  const nSection = createElement('SECTION');
  nSection.id = 'main';

  const asset = assetList[0];
  const json = JSON.parse(readFileSync(asset.file, 'utf8'));
  const cubismExpressionObjects = Array.isArray(json.cubismExpressionObjects)
    ? CubismExpressionObjectUuids.instantiateFromJson(json.cubismExpressionObjects)
    : null;
  if (cubismExpressionObjects == null) {
    // Error
    return;
  }

  if (assetList.length > 1) {
    const p = createElement('p');
    p.innerText = 'Can not edit multiple objects.';
    nSection.appendChild(p);
  } else {
    for (let i = 0; i < cubismExpressionObjects.length; i++) {
      const uuid = cubismExpressionObjects[i];

      const prop = createElement(TagName.UI_PROP);
      prop.setAttribute('dump', 'cc.Asset');
      prop.setAttribute('readonly', 'true');

      const label = createElement(TagName.UI_LABEL);
      label.slot = 'label';
      label.innerText = `${i}`;

      const assetField = createElement(TagName.UI_ASSET);
      assetField.slot = 'content';
      assetField.setAttribute('droppable', 'CubismExpressionData');
      assetField.setAttribute('placeholder', 'CubismExpressionData');
      assetField.setAttribute('value', uuid);
      assetField.setAttribute('readonly', '');

      prop.append(label, assetField);

      nSection.appendChild(prop);
    }
  }
  const oSection = root.getElementById('main');
  if (oSection != null) {
    root.replaceChild(nSection, oSection);
  } else {
    root.appendChild(nSection);
  }
}

export function ready(this: IPanelThis) {
  console.info('ready');
  const root = this.$this.shadowRoot;
  // root?.addEventListener('confirm', confirmdEventListener);
}
function confirmdEventListener(this: EventTarget, event: Event & { path?: HTMLElement[] }) {
  console.info(this);
  console.info(event);
  const path = event.path;
  if (path == null) {
    return;
  }
  console.info(getIndex.call(path[0]));
}

export function close(this: IPanelThis) {
  console.info('close');
}

function getIndex(this: HTMLElement) {
  return this.getAttribute('value');
}

namespace CubismExpressionObjectUuids {
  export function instantiateFromJson(arr: any[]): string[] | null {
    const result = new Array<string>(arr.length);
    for (let i = 0; i < result.length; i++) {
      const uuid =
        typeof arr[i] == 'string' && Editor.Utils.UUID.isUUID(arr[i])
          ? (arr[i] as string)
          : undefined;
      if (uuid == null) {
        return null;
      }
      result[i] = uuid;
    }
    return result;
  }
}
