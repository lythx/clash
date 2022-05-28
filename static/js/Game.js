'use strict'

class Game {

    static scene = new THREE.Scene();
    static camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    static renderer = new THREE.WebGLRenderer();
    static tiles = new THREE.Object3D();
    static clock = new THREE.Clock();
    static raycaster = new Raycaster()
    static fighters = []
    static player
    static fighterClasses = ['none', BillGates]
    static selected = null

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
        const lgt = Model.models.length
        TWEEN.update()
        for (let i = 0; i < lgt; i++) {
            Model.models[i].animate(delta)
            Model.models[i].target()
        }
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

    /**
     * Rozpoczyna grę 
     */
    static start = async (player) => {
        this.player = player
        STATE.gaming = true
        this.setupListeners()
    }

    static async opponentFighter(data) {
        const fighterClass = this.fighterClasses.find(a => a.name === data.className)
        const fighter = new fighterClass(this.player, data.name)
        await fighter.load()
        fighter.position.x = data.x
        fighter.position.z = data.z
        fighter.place(data.x, data.z, data.timestamp)
        this.scene.add(fighter)
    }

    static setupListeners() {
        window.onkeydown = async (e) => {
            if (e.key.match(/[1-4]/)) {
                if (this.selected) {
                    this.scene.remove(this.selected)
                    this.selected = null
                }
                const fighter = new this.fighterClasses[e.key](this.player, `p${this.player}t${Date.now()}`)
                await fighter.load()
                fighter.select()
                this.scene.add(fighter)
                this.selected = fighter
            }
        }
        window.onmousemove = (e) => {
            if (!this.selected)
                return
            const intersects = this.raycaster.get(e, this.tiles.children)
            if (intersects.length === 0) {
                this.selected.position.x = 5000
                this.selected.position.z = 5000
            }
            else {
                const pos = intersects[0].object.position
                this.selected.position.x = pos.x
                this.selected.position.z = pos.z
            }
        }
        window.onclick = (e) => {
            if (!this.selected)
                return
            const intersects = this.raycaster.get(e, this.tiles.children)
            if (intersects.length === 0) {
                this.scene.remove(this.selected)
                this.selected = null
            }
            else {
                const pos = intersects[0].object.position
                const timestamp = Date.now() + 2000
                this.selected.place(pos.x, pos.z, timestamp)
                this.fighters.push(this.selected)
                Net.newFighter(this.selected.name, this.selected.constructor.name, pos.x, pos.z, timestamp)
                this.selected = null
            }
        }
    }
}
