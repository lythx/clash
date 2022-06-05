'use strict'

class Game {

    static scene = new THREE.Scene();
    static camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 10000);
    static renderer = new THREE.WebGLRenderer();
    static tiles
    static clock = new THREE.Clock();
    static raycaster = new Raycaster()
    static player
    static modelClasses = ['none', BillGates]
    static models = []
    static selected = null

    /**
     * Generuje scene i plansze
     */
    static initialize = () => {
        this.renderer.setClearColor(0x333333);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("root").append(this.renderer.domElement);
        this.camera.position.set(205, 200, 205)
        this.camera.lookAt(0, -110, 0)
        this.scene.add(new THREE.AxesHelper(1000))
        requestAnimationFrame(() => this.render())
        const board = new Board()
        this.tiles = board.tiles
        this.scene.add(this.tiles)
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
        for (let i = 0; i < lgt; i++) {
            this.models[i].animate(delta)
        }
        this.renderer.render(this.scene, this.camera);
    }

    static update = (data) => {
        for (const e of data) {
            const obj = this.models.find(a => a.name === e.name)
            if (obj === undefined)
                this.addObject(e)
            else
                obj.update(e)
        }
        for (const e of this.models) {
            if (!data.some(a => a.name === e.name))
                this.removeObject(e)
        }
    }

    static addObject(data) {
        const model = new this.modelClasses.find(a => a === data.className)(data)
        this.models.push(model)
    }

    static removeObject(obj) {
        this.models.splice(this.models.indexOf(obj), 1)
        obj.kill()
    }

    /**
     * Rozpoczyna grę 
     */
    static start = async (player) => {
        this.player = player
        if (player == 2) {
            this.camera.position.set(-205, 200, -205)
            this.camera.lookAt(0, -110, 0)
        }
        this.setupListeners()
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
                const fighter = new BillGates({ name: null, player: this.player, position: { x: 5000, z: 5000 }, rotation: 0 }) //nazwa to p[numer gracza]t[unixowe milisekundy]
                this.selected = fighter //ustawinie klasowej zmiennej na nowo utworzony model
                this.scene.add(fighter)
                const intersects = this.raycaster.get(e, this.tiles.children) //raycaster na plansze
                //jeśli kursor nie jest na planszy lub jest na terenie na którym nie mogą chodzić modele to model sie nie wyswietla
                if (intersects.length === 0 || intersects[0].object.player === 'none') {
                    this.selected.position.x = 5000 //możliwe da sie to lepiej zrobic niż dawać pozycje na taką żeby był giga daleko XD
                    this.selected.position.z = 5000
                }
                //jeśli kursor jest na polu gracza to model wyświetla sie nad wskazywanym przez kursor polem na zielono
                else if (this.player === 1 ? intersects[0].object.player === 'p1' : intersects[0].object.player === 'p2') {
                    const pos = intersects[0].object.position
                    this.selected.position.x = pos.x
                    this.selected.position.z = pos.z
                    this.selected.setCanPlace(true)
                }
                //jeśli kursor jest na polu przeciwnika lub terenie neutralnym to model wyświetla sie nad wskazywanym przez kursor polem na czerwono
                else if (this.player === 1 ? intersects[0].object.player === 'p2' : intersects[0].object.player === 'p1'
                    || intersects[0].object.player === 'neutral') {
                    const pos = intersects[0].object.position
                    this.selected.position.x = pos.x
                    this.selected.position.z = pos.z
                    this.selected.setCanPlace(false)
                }
            }
        }
        window.onmousemove = (e) => {
            console.log(this.selected)
            if (!this.selected) //jeśli żaden model nie jest wybrany nic sie bue dzuehe
                return
            const intersects = this.raycaster.get(e, this.tiles.children) //raycaster na plansze
            //jeśli kursor nie jest na planszy lub jest na terenie na którym nie mogą chodzić modele to model sie nie wyswietla
            if (intersects.length === 0 || intersects[0].object.player === 'none') {
                this.selected.position.x = 5000 //możliwe da sie to lepiej zrobic niż dawać pozycje na taką żeby był giga daleko XD
                this.selected.position.z = 5000
            }
            //jeśli kursor jest na polu gracza to model wyświetla sie nad wskazywanym przez kursor polem na zielono
            else if (this.player === 1 ? intersects[0].object.player === 'p1' : intersects[0].object.player === 'p2') {
                const pos = intersects[0].object.position
                this.selected.position.x = pos.x
                this.selected.position.z = pos.z
                this.selected.setCanPlace(true)
            }
            //jeśli kursor jest na polu przeciwnika lub terenie neutralnym to model wyświetla sie nad wskazywanym przez kursor polem na czerwono
            else if (this.player === 1 ? intersects[0].object.player === 'p2' : intersects[0].object.player === 'p1'
                || intersects[0].object.player === 'neutral') {
                const pos = intersects[0].object.position
                this.selected.position.x = pos.x
                this.selected.position.z = pos.z
                this.selected.setCanPlace(false)
            }
        }
        window.onclick = (e) => {
            if (!this.selected) //jeśli żaden model nie jest wybrany nic sie nie dzieje
                return
            const intersects = this.raycaster.get(e, this.tiles.children) //raycaster na plansze
            //jeśli kursor nie jest na planszy lub jest na terenie na którym nie mogą chodzić modele to wybrany model sie resetuje
            if (intersects.length === 0 || intersects[0].object.player === 'none') {
                this.scene.remove(this.selected)
                this.selected = null
            }
            //jeśli kursor jest na planszy i canPlace jest true stawiamy model (pozycja jest już dobrze ustalona przez window.onmouemove)
            else if (this.selected.canPlace) {
                const pos = intersects[0].object.position
                const timestamp = Date.now() + 1000
                this.selected.place(timestamp)
                //wysłanie informacji o modelu do przeciwnika
                Net.newFighter(this.selected.player, this.selected.constructor.name, pos.x, pos.z, this.selected.rotation)
                this.selected = null
            }
        }
    }
}
