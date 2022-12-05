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
import { CubismFadeMotionListSerializedAsset } from '../../SerializedAssets/CubismFadeMotionListSerializedAsset';
import { Asset, Meta } from '../InspectorInterface';
import TagName from '../TagName';
import { InspectorGuiHelper } from '../Utils';

export const template = ``;
export const $ = {};

const UTF8 = 'utf8';

export function update(this: IPanelThis, assetList: Asset[], metaList: Meta[]) {
  const root = this.$this.shadowRoot;
  if (root == null) {
    return;
  }

  if (assetList.length != 1) {
    errorMessage(root, 'Multiple edit unsupported.');
    return;
  }

  const { 0: asset } = assetList;

  const json = JSON.parse(readFileSync(asset.file, UTF8));
  const fadeMotionList = CubismFadeMotionListSerializedAsset.instantiateFromJson(json);

  if (fadeMotionList == null) {
    errorMessage(root, 'Parsing error.');
    return;
  }

  const nSection = root.ownerDocument.createElement('SECTION');
  nSection.id = 'main';

  const helper = new UI(nSection, fadeMotionList);

  helper.motionInstanceIds();
  helper.cubismFadeMotionObjects();

  const oSection = root.getElementById('main');
  if (oSection) {
    root.replaceChild(nSection, oSection);
  } else {
    root.appendChild(nSection);
  }
}

export function ready(this: IPanelThis) {}

export function close(this: IPanelThis) {}

function errorMessage(root: ShadowRoot, message: string) {
  const nSection = root.ownerDocument.createElement('SECTION');
  nSection.id = 'main';

  const p = root.ownerDocument.createElement('p');
  p.innerText = message;
  nSection.appendChild(p);

  const oSection = root.getElementById('main');
  if (oSection) {
    root.replaceChild(nSection, oSection);
  } else {
    root.appendChild(nSection);
  }
}

class UI extends InspectorGuiHelper {
  protected values: CubismFadeMotionListSerializedAsset;

  public constructor(parent: HTMLElement, values: CubismFadeMotionListSerializedAsset) {
    super(parent);
    this.values = values;
  }

  public motionInstanceIds(): void {
    const { motionInstanceIds } = this.values;
    const section = this.create(TagName.UI_SECTION);
    section.header = 'Motion Instance Ids';
    for (let i = 0; i < motionInstanceIds.length; i++) {
      const prop = this.createPropBase(`Element ${i}`);
      const content = this.create(TagName.UI_NUM_INPUT);
      content.slot = 'content';
      content.value = motionInstanceIds[i];
      prop.appendChild(content);
      section.appendChild(prop);
    }
    this.parent.appendChild(section);
  }

  public cubismFadeMotionObjects(): void {
    const { cubismFadeMotionObjects } = this.values;
    const section = this.create(TagName.UI_SECTION);
    section.header = 'Cubism Fade Motion Objects';
    for (let i = 0; i < cubismFadeMotionObjects.length; i++) {
      const prop = this.createPropBase(`Element ${i}`);
      const content = this.create(TagName.UI_ASSET);
      content.slot = 'content';
      content.droppable = 'CubismFadeMotionData';
      content.value = cubismFadeMotionObjects[i];
      prop.appendChild(content);
      section.appendChild(prop);
    }
    this.parent.appendChild(section);
  }
}
