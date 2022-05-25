import * as THREE from '../libs/three.js'
import Tile from './Tile.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer();
const tiles = new THREE.Object3D();

/**
 * Generuje scene i plansze
 */
const initialize = () => {
    renderer.setClearColor(0x333333);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("root").append(renderer.domElement);
    camera.position.set(0, 70, 120)
    camera.lookAt(scene.position)
    scene.add(new THREE.AxesHelper(1000))
    requestAnimationFrame(() => render())
    generateBoard()
    window.onresize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

const render = () => {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

/**
 * Generuje plansze
 */
const generateBoard = () => {
    const size = 10;
    const h = 26
    const w = 14
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            const color = (i + j) % 2 === 0 ? 0x12ff23 : 0xff0000
            const tile = new Tile(`t${i}${j}`, size, color)
            tile.position.x = (j * size) - (size * (w / 2) - size / 2);
            tile.position.z = (i * size) - (size * (h / 2) - size / 2) - 80;
            tiles.add(tile)
        }
    }
    scene.add(tiles)
}

export {
    initialize
}