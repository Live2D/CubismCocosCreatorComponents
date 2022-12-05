/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

namespace JsonParseUtils {
  export function parse(value: string) {
    try {
      return JSON.parse(value);
    } catch {}
    return null;
  }
  export function isBoolean(value: any): value is boolean {
    return typeof value == 'boolean';
  }
  export function isNumber(value: any): value is number {
    return typeof value == 'number';
  }
  export function isString(value: any): value is string {
    return typeof value == 'string';
  }
  export function isObject(value: any): value is object {
    return typeof value == 'object' && value != null;
  }

  export function asBoolean(value: any): boolean | undefined {
    return isBoolean(value) ? value : undefined;
  }
  export function asNumber(value: any): number | undefined {
    return isNumber(value) ? value : undefined;
  }
  export function asString(value: any): string | undefined {
    return isString(value) ? value : undefined;
  }
  export function asObject(value: any): object | undefined {
    return isObject(value) ? value : undefined;
  }
  export function asArray(value: any): any[] | undefined {
    return Array.isArray(value) ? value : undefined;
  }

  export function getBoolean(obj: object, key: PropertyKey): boolean | undefined {
    const value = Reflect.get(obj, key);
    if (isBoolean(value)) {
      return value;
    }
    return undefined;
  }
  export function getNumber(obj: object, key: PropertyKey): number | undefined {
    const value = Reflect.get(obj, key);
    if (isNumber(value)) {
      return value;
    }
    return undefined;
  }
  export function getString(obj: object, key: PropertyKey): string | undefined {
    const value = Reflect.get(obj, key);
    if (isString(value)) {
      return value;
    }
    return undefined;
  }
  export function getObject(obj: object, key: PropertyKey): object | undefined {
    const value = Reflect.get(obj, key);
    if (isObject(value)) {
      return value;
    }
    return undefined;
  }
  export function getArray(obj: object, key: PropertyKey): any[] | undefined {
    const value = Reflect.get(obj, key);
    if (Array.isArray(value)) {
      return value;
    }
    return undefined;
  }
  export function arrayedInstantiateFromJson<T>(
    inData: unknown,
    func: (json: any) => T | undefined
  ): T[] | undefined {
    if (!Array.isArray(inData)) {
      return undefined;
    }
    const outData = new Array<T>(inData.length);
    for (let i = 0; i < inData.length; i++) {
      const input = func(inData[i]);
      if (input == null) {
        return undefined;
      }
      outData[i] = input;
    }
    return outData;
  }
}
export default JsonParseUtils;
