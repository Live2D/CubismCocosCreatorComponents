/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

module.paths.push(Editor.Utils.Path.join(Editor.App.path, 'node_modules'));
import { reimport } from '@editor/asset-db';
import { statSync } from 'fs';

export function existsFile(path: string): boolean {
  try {
    if (statSync(path).isFile()) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

export async function registerImportTaskIfItCannotBeCoreInitialized(path: string) {
  if (await canCoreInitializeInEditor()) {
    return true;
  }
  window.setImmediate(importTask, path);
  return false;
}

export async function canCoreInitializeInEditor() {
  const wasmFilePath = await Editor.Message.request(
    'asset-db',
    'query-path',
    '2ae9481d-aa06-4cce-ae8e-bcecaf63d82b'
  );
  return wasmFilePath != null;
}

export async function importTask(path: string) {
  if (await registerImportTaskIfItCannotBeCoreInitialized(path)) {
    reimport(path);
  } else {
    window.setImmediate(importTask, path);
  }
}
