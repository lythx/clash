'use strict'

class Game {

    static scene = new THREE.Scene();
    static camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 10000);
    static renderer = new THREE.WebGLRenderer();
    static tiles
    static clock = new THREE.Clock();
    static raycaster = new Raycaster()
    static player
    static modelClasses = [BillGates]
    static models = []
    static selected = null
    static events = []

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
        this.tiles = new Board().tiles
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
        const eventsLgt = this.events.length
        for (let i = 0; i < eventsLgt; i++) {
            if (this.events[i].timestamp < Date.now()) {
                this.handleEvent(this.events[i].event, this.events[i].data)
                this.events.splice(i, 1)
            }
        }
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
            if (obj !== undefined)
                obj.update(e)
        }
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

    static registerEvent(event) {
        this.events.push(event)
    }

    static handleEvent(eventName, data) {
        console.log(eventName)
        switch (eventName) {
            case 'newFighter':
                const model = this.models.find(a => a.name === data.name)
                console.log(model)
                if (model === undefined) {
                    const ModelClass = this.modelClasses.find(a => a.name === data.className)
                    const model = new ModelClass(data)
                    this.models.push(model)
                    this.scene.add(model)
                } else {
                    model.place()
                }
        }
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
                const fighter = new BillGates({ name: `p${this.player}t${Date.now()}`, player: this.player, position: { x: 5000, z: 5000 }, rotation: 0 }) //nazwa to p[numer gracza]t[unixowe milisekundy]
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
                this.models.push(this.selected)
                //wysłanie informacji o modelu do przeciwnika
                Net.newFighter(this.selected.player, this.selected.name, this.selected.constructor.name, pos.x, pos.z, this.selected.rotation.y)
                this.selected = null
            }
        }
    }
}
