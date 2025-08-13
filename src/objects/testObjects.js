import * as THREE from 'three';
import { color } from 'three/tsl';

const testGroup = new THREE.Group();

const testBed = new THREE.Mesh (
    new THREE.BoxGeometry(3,1,4),
    new THREE.MeshStandardMaterial({color: 0x00000})
);
testBed.translateX(2.5);
testBed.translateZ(-2);
testBed.translateY(0.5);

const testTable = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1.5, 1.5),
    new THREE.MeshStandardMaterial({color: 0x000ff})
);
testTable.translateX(-2.5);
testTable.translateZ(3);
testTable.translateY(0.75);

const testWardrobe = new THREE.Mesh(
    new THREE.BoxGeometry(1, 4, 2.5),
    new THREE.MeshStandardMaterial({color: 0xff0000 })
);
testWardrobe.translateX(-2.5);
testWardrobe.translateZ(1);
testWardrobe.translateY(2);

const testDrawers = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2.5, 1),
    new THREE.MeshStandardMaterial({color: 0x000ff})
);
testDrawers.translateX(-2.5);
testDrawers.translateZ(-3.5);
testDrawers.translateY(1.25);

const testDesk = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1.5, 2.7),
    new THREE.MeshStandardMaterial({color: 0x008000})
);
testDesk.translateX(-2.5);
testDesk.translateZ(-1.65);
testDesk.translateY(0.75);

const testTopShelf = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 3),
    new THREE.MeshStandardMaterial({color: 0xff0000 })
);
testTopShelf.translateX(-2.5);
testTopShelf.translateZ(-1.65);
testTopShelf.translateY(3);
testTopShelf.rotateX(-Math.PI/8);

const testWindow = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2.5, 1),
    new THREE.MeshStandardMaterial({color: 0xffffff})
);
testWindow.translateX(0);
testWindow.translateZ(-4.25);
testWindow.translateY(3);

const testSideTable = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({color: 0x000ff})
);
testSideTable.translateX(4.5);
testSideTable.translateZ(-3.5);
testSideTable.translateY(1);

const testCarpet = new THREE.Mesh(
    new THREE.BoxGeometry(4,0.25,3),
    new THREE.MeshStandardMaterial({color: 0xFD9193})
)
testCarpet.translateX(2);
testCarpet.translateZ(2);
testCarpet.translateY(0.125);

testGroup.add(
    testBed, testTable, testWardrobe,
    testDrawers, testDesk, testTopShelf,    
    testWindow, testSideTable, testCarpet
);

export default testGroup;

