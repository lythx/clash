class Game {

    static scene = new THREE.Scene();
    static camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    static renderer = new THREE.WebGLRenderer();
    static tiles = new THREE.Object3D();
    static clock = new THREE.Clock();
    static models = []

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
        const delta = this.clock.getDelta();
        const lgt = this.models.length
        TWEEN.update()
        for (let i = 0; i < lgt; i++)
            this.models[i].mixer.update(delta)
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
                const color = (i + j) % 2 === 0 ? 0x12ff23 : 0xaafafa
                const tile = new Tile(`t${i}${j}`, size, color)
                tile.position.x = (j * size) - (size * (w / 2) - size / 2);
                tile.position.z = (i * size) - (size * (h / 2) - size / 2) - 80;
                this.tiles.add(tile)
            }
        }
        this.scene.add(this.tiles)
    }

    static start = async () => {
        STATE.gaming = true
        const billGates = new BillGates('bilgats')
        await billGates.load()
        this.scene.add(billGates.mesh)
        this.models.push(billGates)
        billGates.run()
        await billGates.go({ x: 10, y: 20, z: 100 })
    }
}
