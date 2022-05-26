import * as THREE from '../libs/three.js'
import Tile from './Tile.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer();
const tiles = new THREE.Object3D();
const loader = new THREE.JSONLoader();

const status = {
    gaming: false,
}

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
    //zmiana proporcji sceny przy zmianie wielkości okna przeglądarki
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
            const color = (i + j) % 2 === 0 ? 0x12ff23 : 0xaaffaa
            const tile = new Tile(`t${i}${j}`, size, color)
            tile.position.x = (j * size) - (size * (w / 2) - size / 2);
            tile.position.z = (i * size) - (size * (h / 2) - size / 2) - 80;
            tiles.add(tile)
        }
    }
    scene.add(tiles)
}

const start = () => {
    status.gaming = true
    loader.load('models/model.json', (geometry) => {
        meshModel = new THREE.Mesh(geometry, modelMaterial)
        meshModel.name = "name";
        meshModel.scale.set(100, 100, 100); // ustaw skalę modelu
        scene.add(meshModel);

        // tutaj animacje z punktu 9

    });

}

export {
    initialize,
    start,
    status
}