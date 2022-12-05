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
import TagName from '../TagName';

export const template = ``;
export const $ = {};

const POWER_OF_TWO_MAX = 4503599627370496;

interface Asset {
  displayName: string;
  file: string;
  imported: boolean;
  importer: string;
  invalid: boolean;
  isDirectory: boolean;
  library: {
    [extname: string]: string;
  };
  name: string;
  url: string;
  uuid: string;
  visible: boolean;
  subAssets: {
    [id: string]: Asset;
  };
}

interface Meta {
  files: string[];
  imported: boolean;
  importer: string;
  subMetas: {
    [id: string]: Meta;
  };
  userData: {
    [key: string]: any;
  };
  uuid: string;
  ver: string;
}

export function update(this: IPanelThis, assetList: Asset[], metaList: Meta[]) {
  const root = this.$this.shadowRoot;
  if (root == null) {
    return;
  }
  const createElement = root.ownerDocument.createElement.bind(root.ownerDocument);
  const nSection = createElement('SECTION');
  nSection.id = 'main';

  const createProp = (dump: string, name: string) => {
    const prop = createElement(TagName.UI_PROP);
    prop.setAttribute('dump', dump);

    const label = createElement(TagName.UI_LABEL);
    label.slot = 'label';
    label.innerText = name;

    prop.appendChild(label);

    return prop;
  };

  const createButton = (name: string, isDisabled: boolean) => {
    const button = createElement(TagName.UI_BUTTON);
    button.innerText = name;
    if (isDisabled) {
      button.setAttribute('disabled', '');
    }
    return button;
  };

  const asset = assetList[0];

  if (assetList.length > 1) {
    const p = createElement('p');
    p.innerText = 'Can not edit multiple objects.';
    nSection.appendChild(p);
  } else {
    const jsonSrc = readFileSync(asset.file, 'utf8');
    const json = JSON.parse(jsonSrc) as ICubismMaskTexture;

    // Size
    {
      const prop = createProp('Integer', 'Size');
      const input = createElement(TagName.UI_NUM_INPUT);
      input.slot = 'content';
      input.setAttribute('step', '1');
      input.setAttribute('preci', '0');
      input.setAttribute('min', '2');
      input.setAttribute('max', POWER_OF_TWO_MAX.toFixed(0));
      input.setAttribute('value', json.size.toFixed(0));
      input.addEventListener('blur', (ev) => {
        const value = Reflect.get(input, 'value');
        if (typeof value == 'number') {
          const fix = closestPowerOfTwo(value);
          Reflect.set(input, 'value', fix);
          metaList.forEach((element) => {
            if (Reflect.has(element.userData, 'fromInspector')) {
              element.userData['fromInspector'].size = fix;
            } else {
              element.userData['fromInspector'] = { size: fix, subdivisions: json.subdivisions };
            }
          });
          this.dispatch('change');
        }
      });

      prop.appendChild(input);
      nSection.appendChild(prop);
    }

    // Subdivisions
    {
      const prop = createProp('Integer', 'Subdivisions');
      const slider = createElement(TagName.UI_SLIDER);
      slider.slot = 'content';
      slider.setAttribute('step', '1');
      slider.setAttribute('min', '1');
      slider.setAttribute('max', '5');
      slider.setAttribute('value', json.subdivisions.toFixed(0));
      slider.addEventListener('confirm', (ev) => {
        const value = Reflect.get(slider, 'value');
        if (typeof value == 'number') {
          metaList.forEach((element) => {
            if (Reflect.has(element.userData, 'fromInspector')) {
              element.userData['fromInspector'].subdivisions = value;
            } else {
              element.userData['fromInspector'] = { size: json.size, subdivisions: value };
            }
          });
          this.dispatch('change');
        }
      });
      prop.appendChild(slider);
      nSection.appendChild(prop);
    }
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

interface ICubismMaskTexture {
  size: number;
  subdivisions: number;
}

function closestPowerOfTwo(value: number) {
  if (value > POWER_OF_TWO_MAX) {
    return POWER_OF_TWO_MAX;
  }
  if (value < 1) {
    return 1;
  }
  let prev = 1;
  let next = 1;
  while (next < value && next < POWER_OF_TWO_MAX) {
    prev = next;
    next *= 2;
  }

  if (next > POWER_OF_TWO_MAX) {
    return prev;
  }

  return next - value < value - prev ? next : prev;
}
