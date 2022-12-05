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
  console.info('update');
  const root = this.$this.shadowRoot;
  if (root == null) {
    return;
  }
  const createElement = root.ownerDocument.createElement.bind(root.ownerDocument);
  const nSection = createElement('SECTION');
  nSection.id = 'main';

  const createProp = (dump: string, name: string) => {
    const prop = createElement(TagName.UI_PROP);
    prop.setAttribute('readonly', 'true');
    prop.setAttribute('dump', dump);

    const label = createElement(TagName.UI_LABEL);
    label.slot = 'label';
    label.innerText = name;

    prop.appendChild(label);

    return prop;
  };

  const createInput = (value: string) => {
    const input = createElement(TagName.UI_INPUT);
    input.slot = 'content';
    input.setAttribute('readonly', '');
    input.setAttribute('value', value);

    return input;
  };

  const createNumInput = (value: string) => {
    const input = createElement(TagName.UI_NUM_INPUT);
    input.slot = 'content';
    input.setAttribute('readonly', '');
    input.setAttribute('step', '0.001');
    input.setAttribute('preci', '20');
    input.setAttribute('min', Number.MIN_SAFE_INTEGER.toFixed(20));
    input.setAttribute('max', Number.MAX_SAFE_INTEGER.toFixed(20));
    input.setAttribute('value', value);
    return input;
  };

  const asset = assetList[0];

  if (assetList.length > 1) {
    const p = createElement('p');
    p.innerText = 'Can not edit multiple objects.';
    nSection.appendChild(p);
  } else {
    const jsonSrc = readFileSync(asset.library['.json'], 'utf8');
    const json = JSON.parse(jsonSrc) as (
      | ICubismExpressionData
      | ISerializableExpressionParameter
    )[];
    const { type, fadeInTime, fadeOutTime, parameters } = json[0] as ICubismExpressionData;

    // Type
    {
      const prop = createProp('String', 'Type');
      const input = createInput(type);
      prop.appendChild(input);
      nSection.appendChild(prop);
    }

    // Fade In Time
    {
      const prop = createProp('Float', 'Fade In Time');
      const input = createNumInput(fadeInTime.toFixed(20));
      prop.appendChild(input);
      nSection.appendChild(prop);
    }

    // Fade Out Time
    {
      const prop = createProp('Float', 'Fade Out Time');
      const input = createNumInput(fadeOutTime.toFixed(20));
      prop.appendChild(input);
      nSection.appendChild(prop);
    }

    for (let i = 0; i < parameters.length; i++) {
      const { id, value, blend } = json[parameters[i].__id__] as ISerializableExpressionParameter;

      const session = createElement(TagName.UI_SECTION);
      session.setAttribute('header', id);
      // session.setAttribute('expand', '');

      // ID
      {
        const prop = createProp('String', 'ID');
        const input = createInput(id);

        prop.appendChild(input);
        session.appendChild(prop);
      }

      // Value
      {
        const prop = createProp('Float', 'Value');
        const input = createNumInput(value.toFixed(20));

        prop.appendChild(input);
        session.appendChild(prop);
      }

      // Blend options
      const options = Array<HTMLElement>(CubismParameterBlendMode.count());
      for (let j = 0; j < options.length; j++) {
        const option = createElement('option');
        option.setAttribute('value', j.toFixed(0));
        option.innerText = CubismParameterBlendMode[j];
        options[j] = option;
      }

      // Blend
      {
        const prop = createProp('Enum', 'Value');
        const select = createElement(TagName.UI_SELECT);
        select.slot = 'content';
        select.setAttribute('readonly', '');

        for (let j = 0; j < options.length; j++) {
          select.appendChild(options[j]);
        }

        select.setAttribute('value', blend.toFixed(0));

        prop.appendChild(select);
        session.appendChild(prop);
      }

      nSection.appendChild(session);
    }
  }

  const oSection = root.getElementById('main');
  if (oSection) {
    root.replaceChild(nSection, oSection);
  } else {
    root.appendChild(nSection);
  }
}

export function ready(this: IPanelThis) {
  console.info('ready');
}

export function close(this: IPanelThis) {
  console.info('close');
}

interface ICubismExpressionData {
  fadeInTime: number;
  fadeOutTime: number;
  parameters: { __id__: number }[];
  type: string;
  __type__: 'CubismExpressionData';
  _name: string;
  _native: string;
  _objFlags: 0;
}

interface ISerializableExpressionParameter {
  blend: number;
  id: string;
  value: number;
  __type__: 'CubismExpressionData.SerializableExpressionParameter';
}

enum CubismParameterBlendMode {
  Override,
  Additive,
  Multiply,
}

namespace CubismParameterBlendMode {
  export function count(): number {
    let length = 0;
    for (let j = 0; CubismParameterBlendMode[j] !== undefined; j++) {
      length = j;
    }
    return length;
  }
}
