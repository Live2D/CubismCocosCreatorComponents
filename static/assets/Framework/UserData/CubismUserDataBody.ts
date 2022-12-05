/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { _decorator } from 'cc';
import type IStructLike from '../../IStructLike';
const { ccclass, property } = _decorator;

/** Body of user data. */
@ccclass('CubismUserDataBody')
class CubismUserDataBody implements IStructLike<CubismUserDataBody> {
  /** Id. */
  @property({ serializable: true })
  public readonly id: string = '';

  /** Value. */
  @property({ serializable: true })
  public readonly value: string = '';

  public constructor(
    args: {
      id?: string;
      value?: string;
    } = {}
  ) {
    this.id = args.id ?? '';
    this.value = args.value ?? '';
  }

  public copyWith(
    args: {
      id?: string;
      value?: string;
    } = {}
  ): CubismUserDataBody {
    return new CubismUserDataBody({ id: args.id ?? this.id, value: args.value ?? this.value });
  }

  public equals(other: CubismUserDataBody): boolean {
    return this === other ? true : this.id == other.id && this.value == other.value;
  }

  public strictEquals(other: CubismUserDataBody): boolean {
    return this === other;
  }
}

namespace CubismUserDataBody {
  export const DEFAULT = new CubismUserDataBody();
}
export default CubismUserDataBody;
