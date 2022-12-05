/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

export interface Asset {
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

export interface Meta {
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
