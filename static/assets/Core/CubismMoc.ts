/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Asset, _decorator } from 'cc';
import { Moc } from '../CubismCore';
const { ccclass, property } = _decorator;

/**
 * Cubism moc asset.
 *
 * **Sealed class.**
 */
@ccclass('CubismMoc')
export default class CubismMoc extends Asset {
  // #region Factory Methods

  /**
   * Checks consistency of a moc.
   * @param mocByte Source.
   * @returns `true` if Moc is valid; `false` otherwise.
   */
  public hasMocConsistency(mocByte: ArrayBuffer): boolean {
    return Moc.hasMocConsistency(mocByte) === 1 ? true : false;
  }

  /**
   * Creates a CubismMoc asset from raw bytes.
   * @param moc3 Source.
   * @returns Instance.
   */
  public static createFrom(moc3: ArrayBuffer): CubismMoc {
    let moc = new CubismMoc();
    moc._bytes = moc3;
    return moc;
  }

  // #endregion

  /** Bytes backing field. */
  private _bytes!: ArrayBuffer;

  /** Raw moc bytes. */
  public get bytes() {
    return this._bytes;
  }
  private set bytes(value) {
    this._bytes = value;
  }

  /** Raw moc bytes. */
  public get _nativeAsset(): ArrayBuffer {
    return this._bytes;
  }
  private set _nativeAsset(value: ArrayBuffer) {
    this._bytes = value;
  }

  @property({ serializable: false, visible: false })
  private _unmanagedMoc: Moc | null = null;
  private get unmanagedMoc() {
    return this._unmanagedMoc;
  }
  private set unmanagedMoc(value) {
    this._unmanagedMoc = value;
  }

  @property({ serializable: false, visible: false })
  private referenceCount: number = 0;

  // True if instance is revived.
  public get isRevived(): boolean {
    return this.unmanagedMoc != null;
  }

  /**
   * Acquires native handle.
   * @returns Valid handle on success; IntPtr.Zero otherwise.
   */
  public acquireUnmanagedMoc(): Moc | null {
    this.referenceCount++;

    this.revive();

    return this.unmanagedMoc;
  }

  /** Releases native handle. */
  public releaseUnmanagedMoc(): void {
    this.referenceCount--;
    // Release instance of unmanaged moc in case the instance isn't referenced any longer.
    if (this.referenceCount == 0) {
      this.unmanagedMoc?._release();
      this.unmanagedMoc = null;
    }
    // Deal with invalid reference counts.
    else if (this.referenceCount < 0) {
      this.referenceCount = 0;
    }
  }

  /** Revives instance without acquiring it. */
  private revive(): void {
    // Return if already revived.
    if (this.isRevived) {
      return;
    }

    // Return if no bytes are available.
    if (this.bytes.byteLength <= 0) {
      return;
    }

    // Try revive.
    this.unmanagedMoc = Moc.fromArrayBuffer(this.bytes);
  }

  public validate() {
    return !!this._bytes;
  }
}
