/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import type { Texture2D } from 'cc';
import type CubismDrawable from '../static/assets/Core/CubismDrawable';
import type CubismModel3Json from '../static/assets/Framework/Json/CubismModel3Json';

export default class CubismTexturePickerForImportersOnly {
  private readonly textures: (Texture2D | null)[];
  public constructor(iterable: Iterable<Texture2D | null> | ArrayLike<Texture2D | null>) {
    this.textures = Array.from(iterable);
  }
  private _pick(sender: CubismModel3Json, drawable: CubismDrawable): Promise<Texture2D | null> {
    return Promise.resolve(this.textures[drawable.textureIndex]);
  }
  public pick = this._pick.bind(this);
}
