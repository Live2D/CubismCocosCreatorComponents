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
import CubismFadeMotionDataAsset from '../../SerializedAssets/CubismFadeMotionDataAsset';
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
  const str = readFileSync(asset.file, UTF8);
  const data = JSON.parse(str);
  const instance = CubismFadeMotionDataAsset.deserializeFromJson(data);
  if (!instance) {
    errorMessage(root, 'Deserialize error.');
    return;
  }

  const nSection = root.ownerDocument.createElement('SECTION');
  nSection.id = 'main';

  const helper = new UI(nSection, instance);
  helper.fadeInTime();
  helper.fadeOutTime();
  helper.parameterIds();
  helper.parameterCurves();
  helper.parameterFadeInTimes();
  helper.parameterFadeOutTimes();
  helper.motionLength();

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
  protected values: CubismFadeMotionDataAsset;

  public constructor(parent: HTMLElement, values: CubismFadeMotionDataAsset) {
    super(parent);
    this.values = values;
  }

  public fadeInTime(): void {
    const { fadeInTime } = this.values;
    const prop = this.createPropBase(`Fade In Time`);
    const content = this.create(TagName.UI_NUM_INPUT);
    content.slot = 'content';
    content.value = fadeInTime;
    content.disabled = true;
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }

  public fadeOutTime(): void {
    const { fadeOutTime } = this.values;
    const prop = this.createPropBase(`Fade Out Time`);
    const content = this.create(TagName.UI_NUM_INPUT);
    content.slot = 'content';
    content.value = fadeOutTime;
    content.disabled = true;
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }

  public parameterIds(): void {
    const { parameterIds } = this.values;
    const section = this.create(TagName.UI_SECTION);
    section.header = 'Parameter Ids';
    for (let i = 0; i < parameterIds.length; i++) {
      const prop = this.createPropBase(`Element ${i}`);
      const content = this.create(TagName.UI_INPUT);
      content.slot = 'content';
      content.value = parameterIds[i];
      content.disabled = true;
      prop.appendChild(content);
      section.appendChild(prop);
    }
    this.parent.appendChild(section);
  }

  public parameterCurves(): void {
    const { internalParameterCurves: curves } = this.values;
    const section = this.create(TagName.UI_SECTION);
    section.header = 'Parameter Curves';
    for (let i = 0; i < curves.length; i++) {
      const prop = this.createPropBase(`Element ${i}`);
      const content = this.create(TagName.UI_CURVE);
      content.slot = 'content';
      const keys = new Array<IUiCurveValueKey>(curves[i].length);
      const k = curves[i].getKeyFrame(0);
      let tMax = k.time;
      let tMin = k.time;
      let vMax = 0;
      let vMin = 0;
      for (let j = 0; j < keys.length; j++) {
        // console.info(curves[i].getKeyFrame(j));
        const { time, value, inTangent, inWeight, outTangent, outWeight } =
          curves[i].getKeyFrame(j);
        tMax = Math.max(tMax, time);
        tMin = Math.min(tMin, time);
        vMax = Math.max(vMax, value);
        vMin = Math.min(vMin, value);
        keys[j] = {
          point: { x: time, y: value },
          inTangent: inTangent,
          inTangentWeight: inWeight,
          outTangent: outTangent,
          outTangentWeight: outWeight,
          interpMode: 2,
          tangentWeightMode: 0,
        };
      }
      // yRange 最小側の指定が負の値の場合初期表示が0の値の位置が中央になるように表示される。
      // ただし、値がいくつであるかは考慮されず、表示範囲は±最大側の絶対値になる。
      // yRange が 0 だと正しく動作しなくなる。
      // yRange が負の値だと負の値側に描画がよるがもはやどういうアルゴリズムで描画範囲を決定しているかわからない。
      // yRange で設定した値が描画スケールの最小となりユーザーが範囲を広げることができない。
      let b = Math.max(Math.abs(vMax), Math.abs(vMin));
      content._config = {
        precision: 4,
        showPostWrapMode: true,
        showPreWrapMode: true,
        type: 'hermit',
        xRange: [tMin, tMax],
        yRange: [vMin < 0 ? -b : 0, b],
      };
      content.value = {
        color: 'red',
        keys: keys,
        multiplier: 1,
        preWrapMode: 0,
        postWrapMode: 0,
      };
      // content.value = curves[i];
      content.disabled = true;
      prop.appendChild(content);
      section.appendChild(prop);
    }
    this.parent.appendChild(section);
  }

  public parameterFadeInTimes(): void {
    const { parameterFadeInTimes } = this.values;
    const section = this.create(TagName.UI_SECTION);
    section.header = 'Parameter Fade In Times';
    for (let i = 0; i < parameterFadeInTimes.length; i++) {
      const prop = this.createPropBase(`Element ${i}`);
      const content = this.create(TagName.UI_NUM_INPUT);
      content.slot = 'content';
      content.value = parameterFadeInTimes[i];
      content.disabled = true;
      prop.appendChild(content);
      section.appendChild(prop);
    }
    this.parent.appendChild(section);
  }

  public parameterFadeOutTimes(): void {
    const { parameterFadeOutTimes } = this.values;
    const section = this.create(TagName.UI_SECTION);
    section.header = 'Parameter Fade Out Times';
    for (let i = 0; i < parameterFadeOutTimes.length; i++) {
      const prop = this.createPropBase(`Element ${i}`);
      const content = this.create(TagName.UI_NUM_INPUT);
      content.slot = 'content';
      content.value = parameterFadeOutTimes[i];
      content.disabled = true;
      prop.appendChild(content);
      section.appendChild(prop);
    }
    this.parent.appendChild(section);
  }

  public motionLength(): void {
    const { motionLength } = this.values;
    const prop = this.createPropBase(`Motion Length`);
    const content = this.create(TagName.UI_NUM_INPUT);
    content.slot = 'content';
    content.value = motionLength;
    content.disabled = true;
    prop.appendChild(content);
    this.parent.appendChild(prop);
  }
}
