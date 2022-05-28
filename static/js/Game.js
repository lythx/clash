'use strict'

class Game {

    static scene = new THREE.Scene();
    static camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    static renderer = new THREE.WebGLRenderer();
    static tiles = new THREE.Object3D();
    static clock = new THREE.Clock();
    static raycaster = new Raycaster()
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

    /**
     * Stawia fightera przeciwnika po odebraniu informacji z socketa 
     */
    static async opponentFighter(data) {
        const fighterClass = this.fighterClasses.find(a => a.name === data.className)
        const fighter = new fighterClass(this.player === 1 ? 2 : 1, data.name)
        await fighter.load()
        fighter.position.x = data.x
        fighter.position.z = data.z
        fighter.place(data.timestamp)
        this.scene.add(fighter)
        Model.models.push(fighter)
    }

    static setupListeners() {
        window.onkeydown = async (e) => {
            //jeśli kliknięty klawisz to od 1 do 4
            if (e.key.match(/[1-4]/)) {
                if (this.selected) { //usunięcie poprzedniego wyboru ze sceny 
                    this.scene.remove(this.selected)
                    this.selected = null
                }
                //tu trzeba bedzie zmienić bo jak bedziemy mieć rotacje to e.key nie bedzie dzialal ale to pozniej
                const fighter = new this.fighterClasses[e.key](this.player, `p${this.player}t${Date.now()}`) //nazwa to p[numer gracza]t[unixowe milisekundy]
                await fighter.load()
                fighter.select() //podświetlenie na zielono
                this.scene.add(fighter)
                this.selected = fighter //ustawinie klasowej zmiennej na nowo utworzony model
            }
        }
        window.onmousemove = (e) => {
            if (!this.selected) //jeśli żaden model nie jest wybrany nic sie bue dzuehe
                return
            const intersects = this.raycaster.get(e, this.tiles.children) //raycaster na plansze
            if (intersects.length === 0) { //jeśli kursor nie jest na planszy to model sie nie wyswietla
                this.selected.position.x = 5000 //możliwe da sie to lepiej zrobic niż dawać pozycje na taką żeby był giga daleko XD
                this.selected.position.z = 5000
            }
            else { //jeśli kursor jest na planszy to model wyświetla sie nad wskazywanym przez kursor polem planszy
                const pos = intersects[0].object.position
                this.selected.position.x = pos.x
                this.selected.position.z = pos.z
            }
        }
        window.onclick = (e) => {
            if (!this.selected) //jeśli żaden model nie jest wybrany nic sie nie dzieje
                return
            const intersects = this.raycaster.get(e, this.tiles.children) //raycaster na plansze
            if (intersects.length === 0) { //jeśli kursor nie jest na planszy to wybrany model sie resetuje
                this.scene.remove(this.selected)
                this.selected = null
            }
            else { //jeśli kursor jest na planszy to stawiamy model (pozycja jest już dobrze ustalona przez window.onmouemove)
                const pos = intersects[0].object.position
                const timestamp = Date.now() + 2000
                Model.models.push(this.selected)
                this.selected.place(timestamp)
                //wysłanie informacji o modelu do przeciwnika
                Net.newFighter(this.selected.name, this.selected.constructor.name, pos.x, pos.z, timestamp)
                this.selected = null
            }
        }
    }
}
