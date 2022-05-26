class Game {

    static scene = new THREE.Scene();
    static camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    static renderer = new THREE.WebGLRenderer();
    static tiles = new THREE.Object3D();
    static loader = new THREE.JSONLoader();

    /**
     * Generuje scene i plansze
     */
    static initialize = () => {
        this.renderer.setClearColor(0x333333);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("root").append(this.renderer.domElement);
        this.camera.position.set(0, 70, 120)
        this.camera.lookAt(this.scene.position)
        this.scene.add(new THREE.AxesHelper(1000))
        requestAnimationFrame(() => this.render())
        this.generateBoard()
        //zmiana proporcji sceny przy zmianie wielkości okna przeglądarki
        window.onresize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    static render = () => {
        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Generuje plansze
     */
    static generateBoard = () => {
        const size = 10;
        const h = 26
        const w = 14
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                const color = (i + j) % 2 === 0 ? 0x12ff23 : 0xaaffaa
                const tile = new Tile(`t${i}${j}`, size, color)
                tile.position.x = (j * size) - (size * (w / 2) - size / 2);
                tile.position.z = (i * size) - (size * (h / 2) - size / 2) - 80;
                this.tiles.add(tile)
            }
        }
        this.scene.add(this.tiles)
    }

    static start = () => {
        STATE.gaming = true
        const material = new THREE.MeshBasicMaterial(
            {
                map: new THREE.TextureLoader().load("../models/billgates/billywork.png"), // dowolny plik png, jpg
                morphTargets: true // ta własność odpowiada za możliwość animowania materiału modelu
            });
        this.loader.load('../models/billgates/tris.js', (geometry) => {
            const mesh = new THREE.Mesh(geometry, material)
            mesh.name = "name";
            mesh.scale.set(0.4, 0.4, 0.4); // ustaw skalę modelu
            this.scene.add(mesh);

            // tutaj animacje z punktu 9

        });

    }

}
