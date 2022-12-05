/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

function getCompressedUuid(name: any) {
  const { v5 } = require('uuid');
  // Generate a UUID with the same name
  // https://tools.ietf.org/html/rfc4122#page-13
  let uuid = v5(name, '5c51b329-9d2b-4e0d-afbd-090999198a9f');
  // @ts-ignore
  uuid = EditorExtends.UuidUtils.compressUuid(uuid, true);
  return uuid;
}

function nodeFileldGenerator(node: any) {
  const nodePath = getNodePath(node);
  const nodeFileld = getCompressedUuid(nodePath);
  return nodeFileld;
}

function compFileldGenerator(comp: any, index: any) {
  const nodePath = getNodePath(comp.node);
  const compPath = nodePath + '/comp' + index;
  const compFileld = getCompressedUuid(compPath);
  return compFileld;
}

function getNodePath(node: any) {
  let nodePath = '';
  // Use node paths to generate fileIDS
  const nodePathArray: any[] = [];
  let nodeltr = node;
  while (nodeltr) {
    // To prevent name collisions, add siblingIndex
    const siblingIndex = nodeltr.getSiblingIndex();
    nodePathArray.push(nodeltr.name + siblingIndex);
    nodeltr = nodeltr.parent;
  }
  nodePath = nodePathArray.reverse().join('/');
  return nodePath;
}
export function generatePrefab(node: any) {
  // @ts-ignore
  const prefab = new cc.Prefab();
  // const dump = getDumpableNode(node, prefab);
  // deep clone, since we dont want the given node changed by codes below
  // node = cc.instantiate(node);
  // @ts-ignore

  // The node path is used to generate the Fileld, which prevents a different Fileld from being generated after each GLTF redirect
  // @ts-ignore
  EditorExtends.PrefabUtils.addPrefabInfo(node, node, prefab, {
    nodeFileldGenerator,
    compFileldGenerator,
  });
  // ↑ここで EditorExtends.PrefabUtils.addPrefabInfo is not a function at Object.generatePrefab [as generate]

  // @ts-ignore
  EditorExtends.PrefabUtils.checkAndStripNode(node);
  prefab.data = node;
  return prefab;
}

// // @ts-ignore
// EditorExtends.PrefabUtils.generate = EditorExtends.PrefabUtils.generate || generatePrefab;
