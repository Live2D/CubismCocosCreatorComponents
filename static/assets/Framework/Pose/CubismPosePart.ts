/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CCInteger, CCString, Component, _decorator } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Tagging component for pose part.
 *
 * **sealed class**
 */
@ccclass('CubismPosePart')
export default class CubismPosePart extends Component {
  @property({ type: CCInteger })
  public groupIndex: number = 0;

  @property({ type: CCInteger })
  public partIndex: number = 0;

  @property({ type: [CCString] })
  public link: string[] = new Array(0);
}
