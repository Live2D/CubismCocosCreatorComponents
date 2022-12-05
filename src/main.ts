/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

const { Path } = Editor.Utils;
module.paths.push(Path.join(Editor.App.path, 'node_modules'));

import { readFileSync, writeFileSync, statSync, existsSync, mkdirSync } from 'fs';

const ENABLE = 'Enable';
const DISABLE = 'Disable';

class Live2DCubismSDKSettings {
  private static readonly settingsDir = Path.join(Editor.Project.path, 'Live2DCubismSDKSettings');
  private static readonly settingsFile = Path.join(
    Live2DCubismSDKSettings.settingsDir,
    'settings.json'
  );
  private shouldImportAsOriginalWorkflow: boolean = true;
  private shouldClearAnimationCurves: boolean = false;
  private constructor(json?: any) {
    if (json) {
      this.shouldImportAsOriginalWorkflow = json?.shouldImportAsOriginalWorkflow ?? true;
      this.shouldClearAnimationCurves = json?.shouldClearAnimationCurves ?? false;
    }
  }
  public static initialize(): void {
    if (Live2DCubismSDKSettings.loadSettings()) {
      return;
    }
    Live2DCubismSDKSettings.writeSettingsFile();
  }
  public static loadSettings() {
    const { settingsDir, settingsFile } = Live2DCubismSDKSettings;
    const fileStat = existsSync(settingsFile) ? statSync(settingsFile) : null;
    if (fileStat?.isFile()) {
      const str = readFileSync(settingsFile, 'utf8');
      const json = JSON.parse(str);
      Live2DCubismSDKSettings._instance = new Live2DCubismSDKSettings(json);
      return true;
    }
    return false;
  }
  public static writeSettingsFile() {
    const { settingsDir, settingsFile } = Live2DCubismSDKSettings;
    const dirStat = existsSync(settingsDir) ? statSync(settingsDir) : null;
    if (dirStat == null || !dirStat.isDirectory()) {
      mkdirSync(settingsDir);
    }
    writeFileSync(settingsFile, JSON.stringify(Live2DCubismSDKSettings._instance));
  }
  private static _instance: Live2DCubismSDKSettings = new Live2DCubismSDKSettings();

  public static get shouldImportAsOriginalWorkflow() {
    return Live2DCubismSDKSettings._instance.shouldImportAsOriginalWorkflow;
  }
  public static set shouldImportAsOriginalWorkflow(value: boolean) {
    Live2DCubismSDKSettings._instance.shouldImportAsOriginalWorkflow = value;
    Live2DCubismSDKSettings.writeSettingsFile();
  }
  public static toggleShouldImportAsOriginalWorkflow() {
    const { _instance: instance } = Live2DCubismSDKSettings;
    instance.shouldImportAsOriginalWorkflow = !instance.shouldImportAsOriginalWorkflow;
    Live2DCubismSDKSettings.writeSettingsFile();
  }

  public static get shouldClearAnimationCurves() {
    return Live2DCubismSDKSettings._instance.shouldClearAnimationCurves;
  }
  public static set shouldClearAnimationCurves(value: boolean) {
    Live2DCubismSDKSettings._instance.shouldClearAnimationCurves = value;
    Live2DCubismSDKSettings.writeSettingsFile();
  }
  public static toggleShouldClearAnimationCurves() {
    const { _instance: instance } = Live2DCubismSDKSettings;
    instance.shouldClearAnimationCurves = !instance.shouldClearAnimationCurves;
    Live2DCubismSDKSettings.writeSettingsFile();
  }
}

export namespace methods {
  export function getShouldImportAsOriginalWorkflow(): boolean {
    return Live2DCubismSDKSettings.shouldImportAsOriginalWorkflow;
  }
  export function setShouldImportAsOriginalWorkflow(value: boolean): void {
    Live2DCubismSDKSettings.shouldImportAsOriginalWorkflow = value;
  }
  export async function showShouldImportAsOriginalWorkflowSettingDialog(): Promise<void> {
    let state = Live2DCubismSDKSettings.shouldImportAsOriginalWorkflow ? ENABLE : DISABLE;
    const returnValue = await Editor.Dialog.info(`Should import as OriginalWorkflow: ${state}`, {
      buttons: [ENABLE, DISABLE],
    });
    switch (returnValue.response) {
      case 0:
        if (!Live2DCubismSDKSettings.shouldImportAsOriginalWorkflow) {
          Live2DCubismSDKSettings.shouldImportAsOriginalWorkflow = true;
        }
        break;
      case 1:
        if (Live2DCubismSDKSettings.shouldImportAsOriginalWorkflow) {
          Live2DCubismSDKSettings.shouldImportAsOriginalWorkflow = false;
        }
        break;
      default:
        Live2DCubismSDKSettings.shouldImportAsOriginalWorkflow = false;
        break;
    }
    await showSettingsViewDialog();
  }

  export function getShouldClearAnimationCurves(): boolean {
    return Live2DCubismSDKSettings.shouldClearAnimationCurves;
  }
  export function setShouldClearAnimationCurves(value: boolean): void {
    Live2DCubismSDKSettings.shouldClearAnimationCurves = value;
  }
  export async function showShouldClearAnimationCurvesSettingDialog(): Promise<void> {
    let state = Live2DCubismSDKSettings.shouldClearAnimationCurves ? ENABLE : DISABLE;
    const returnValue = await Editor.Dialog.info(`Should clear animation curves: ${state}`, {
      buttons: [ENABLE, DISABLE],
    });
    switch (returnValue.response) {
      case 0:
        if (!Live2DCubismSDKSettings.shouldClearAnimationCurves) {
          Live2DCubismSDKSettings.shouldClearAnimationCurves = true;
        }
        break;
      case 1:
        if (Live2DCubismSDKSettings.shouldClearAnimationCurves) {
          Live2DCubismSDKSettings.shouldClearAnimationCurves = false;
        }
        break;
      default:
        Live2DCubismSDKSettings.shouldClearAnimationCurves = false;
        break;
    }
    await showSettingsViewDialog();
  }

  export async function showSettingsViewDialog(): Promise<void> {
    const shouldImportAsOriginalWorkflowState =
      Live2DCubismSDKSettings.shouldImportAsOriginalWorkflow ? ENABLE : DISABLE;
    const shouldClearAnimationCurvesState = Live2DCubismSDKSettings.shouldClearAnimationCurves
      ? ENABLE
      : DISABLE;
    await Editor.Dialog.info(
      `Should import as OriginalWorkflow: ${shouldImportAsOriginalWorkflowState}\n` +
        `Should clear animation curves: ${shouldClearAnimationCurvesState}`,
      {
        buttons: ['OK'],
      }
    );
  }
}

export function load() {
  console.log('cubism sdk extensions load.');
  Live2DCubismSDKSettings.initialize();
}

export function unload() {
  console.log('cubism sdk extensions unload.');
}
