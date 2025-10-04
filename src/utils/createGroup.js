import * as THREE from 'three';

export function createGroup(root, groupName, childNames) {
  if (!root || !childNames || childNames.length === 0) return null;

  const group = new THREE.Group();
  group.name = groupName;

  // find and reparent requested objects
  childNames.forEach(name => {
    const child = root.getObjectByName(name);
    if (child) {
      group.attach(child); // reparent while keeping world transform
    } else {
      console.warn(`[createGroup] child "${name}" not found under root`);
    }
  });

  if (group.children.length === 0) {
    console.warn(`[createGroup] No valid children found for group "${groupName}"`);
    return null;
  }

  root.add(group);
  return group;
}
