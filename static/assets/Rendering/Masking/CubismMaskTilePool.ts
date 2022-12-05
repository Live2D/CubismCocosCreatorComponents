/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import CubismMaskTile from './CubismMaskTile';

/** Virtual pool allocator for CubismMaskTiles. */
export default class CubismMaskTilePool {
  private _subdivisions: number = 0;

  /** Level of subdivisions. */
  private get subdivisions() {
    return this._subdivisions;
  }
  private set subdivisions(value) {
    this._subdivisions = value;
  }

  private _slots: boolean[] = new Array(0);
  /**
   * Pool slots.
   *
   * true slots are in use, false are available slots.
   */
  private get slots() {
    return this._slots;
  }
  private set slots(value) {
    this._slots = value;
  }

  // #region Ctors

  /**
   * Initializes instance.
   * @param subdivisions Number of CubismMaskTexture subdivisions.
   * @param channels Number of CubismMaskTexture color channels.
   */
  public constructor(subdivisions: number, channels: number) {
    this.subdivisions = subdivisions;
    this.slots = new Array<boolean>(Math.pow(4, subdivisions) * channels);
  }

  // #endregion

  /**
   * Acquires tiles.
   * @param count Number of tiles to acquire.
   * @returns Acquired tiles on success; null otherwise.
   */
  public acquireTiles(count: number): Array<CubismMaskTile> | null {
    const result = new Array<CubismMaskTile>(count);
    // Populate container.
    for (let i = 0; i < count; i++) {
      let allocationSuccessful = false;
      for (let j = 0; j < this.slots.length; j++) {
        // Skip occupied slots.
        if (this.slots[j]) {
          continue;
        }
        // Generate tile.
        result[i] = this.toTile(j);
        // Flag slot as occupied.
        this.slots[j] = true;
        // Flag allocation as successful.
        allocationSuccessful = true;
        break;
      }
      // Return as soon as one allocation fails.
      if (!allocationSuccessful) {
        return null;
      }
    }
    // Return on success.
    return result;
  }

  /**
   * Releases tiles.
   * @param tiles Tiles to release.
   */
  public returnTiles(tiles: CubismMaskTile[]): void {
    // Flag slots as available.
    for (var i = 0; i < tiles.length; i++) {
      this.slots[this.toIndex(tiles[i])] = false;
    }
  }

  /**
   * Converts from index to CubismMaskTile.
   * @param index Index to convert.
   * @returns Mask tile matching index.
   */
  private toTile(index: number): CubismMaskTile {
    const { trunc, pow } = Math;
    const tileCounts = trunc(pow(4, this.subdivisions - 1));
    const tilesPerRow = trunc(pow(2, this.subdivisions - 1));
    const tileSize = 1 / tilesPerRow;
    const channel = trunc(index / tileCounts);
    const currentTilePosition = index - channel * tileCounts;
    const column = trunc(currentTilePosition / tilesPerRow);
    const rowId = currentTilePosition % tilesPerRow;
    return new CubismMaskTile({
      channel: channel,
      column: column,
      row: rowId,
      size: tileSize,
    });
  }

  /**
   * Converts from <see cref="CubismMaskTile"/> to index.
   * @param tile Tile to convert.
   * @returns Tile index.
   */
  private toIndex(tile: CubismMaskTile): number {
    const { trunc, pow } = Math;
    const tileCounts = trunc(pow(4, this.subdivisions - 1));
    const tilesPerRow = trunc(pow(2, this.subdivisions - 1));
    return trunc(tile.channel * tileCounts + tile.column * tilesPerRow + tile.row);
  }
}
