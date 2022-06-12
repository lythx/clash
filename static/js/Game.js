'use strict'

class Game {

    static scene = new THREE.Scene();
    static camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 10000);
    static renderer = new THREE.WebGLRenderer();
    static tiles
    static clock = new THREE.Clock();
    static raycaster = new Raycaster()
    static player
    static modelClasses = [BillGates, Bazooka, Chicken, DarthVader, Bauul, Wolf, Hunter, Beelzabub, Skeleton]
    static models = []
    static selected = null
    static events = []
    static gaming = true

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
        const light = new THREE.AmbientLight(0xffffff, 10);
        this.scene.add(light);
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
        const date = Date.now()
        for (let i = 0; i < this.events.length; i++) {
            if (this.events[i].timestamp < date) {
                this.handleEvent(this.events[i].event, this.events[i].data)
                this.events.splice(i, 1)
                i--
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

    /**
     * Rozpoczyna grę 
     * @param {number} player
     */
    static start = async (player) => {
        this.player = player
        if (player == 2) { // Obraca plansze dla drugiego gracza
            this.camera.position.set(-205, 200, -205)
            this.camera.lookAt(0, -110, 0)
        }
        const base1 = new Base(1)
        const base2 = new Base(2)
        this.scene.add(base1)
        this.models.push(base1)
        this.scene.add(base2)
        this.models.push(base2)
        this.setupListeners()
    }

    /**
     * Zapisuje wszystkie eventy wysłane przez serwer
     * @param {object} data 
     */
    static update(data) {
        this.registerEvents({ event: 'gameData', data: data.data, timestamp: data.timestamp }, ...data.events)
    }

    /**
     * Zapisuje podane eventy
     * @param  {...object} events 
     */
    static registerEvents(...events) {
        this.events.push(...events)
    }

    /**
     * Wykonuje akcje zależnie od podanego eventu
     * @param {string} eventName 
     * @param {object} data 
     * @returns 
     */
    static handleEvent(eventName, data) {
        if (!this.gaming)
            return;
        switch (eventName) {
            case 'gameData': { // Updateuje pozycje i rotacje każdego modelu
                for (const e of data) {
                    const model = this.models.find(a => a.name === e.name) // Zalazienie modelu
                    if (model !== undefined) { model.update(e.position, e.rotation) } // Update
                    else {
                        console.warn('MODEL NOT EXISTING HANDLEVENT ERROR')
                    }
                }
                break
            }
            case 'newFighter': { // Dodaje nowego fightera
                const model = this.models.find(a => a.name === data.name)
                if (model === undefined) { // Jeśli nie ma modelu na planszy (model postawił przeciwnik)
                    const ModelClass = this.modelClasses.find(a => a.name === data.className) // Znajduje klasę modelu
                    const model = new ModelClass(data) // Tworzy obiekt modelu
                    this.models.push(model)
                    this.scene.add(model)
                    model.setColor(0xffa500)
                    return
                } // Jeśli model jest na planszy 
                model.setColor(0xffa500) // Ustawia kolor na żółty
                break
            }
            case 'fighterPlaced': { // Ustawia kolor na biały i odpala taunta
                const model = this.models.find(a => a.name === data.name)
                if (model === undefined) {
                    console.warn('MODEL NOT EXISTING FIGHTERPLACED ERROR')
                    return
                }
                model.setColor(0xffffff)
                model.tauntAnimation()
                break
            }
            case 'fighterRun': { // Odpala animacje biegu
                const model = this.models.find(a => a.name === data.name)
                if (model === undefined) {
                    console.warn('MODEL NOT EXISTING FIGHTERRUN ERROR')
                    return
                }
                model.runAnimation()
                break
            }
            case 'fighterAttack': { // Atakuje przeciwnika lub wielu przeciwników
                const model = this.models.find(a => a.name === data.name)
                if (model === undefined) {
                    console.warn('MODEL NOT EXISTING FIGHTERATTACK ERROR')
                    return
                }
                for (const e of data.targets) {
                    const target = this.models.find(a => a.name === e.name)
                    if (target === undefined) {
                        console.warn('TARGET NOT EXISTING FIGHTERATTACK ERROR')
                        return
                    }
                    model.handleAttack(target, e.dmg)
                }
                break
            }
            case 'fighterDeath': { // Śmierć xd
                const model = this.models.find(a => a.name === data.name)
                if (model === undefined) {
                    console.warn('MODEL NOT EXISTING FIGHTERDIE ERROR')
                    return
                }
                model.die()
                this.removeObject(model, 500) // Usunięcie modelu po 500 milisekundach
                break
            }
            case 'endGame': {
                console.log(data);
                this.gaming = false
                const model = this.models.find(a => a.name === 1)
                Net.reset();
                this.camera.position.set(0, 50, 0)
                this.camera.lookAt(125, 20, 125)
                Ui.endGame();
            }
        }
    }

    /**
     * Usuwa obiekt po danym czasie
     * @param {Model} object 
     * @param {number} delay 
     */
    static async removeObject(object, delay) {
        await new Promise((resolve) => setTimeout(resolve, delay))
        this.models = this.models.filter(a => a.name !== object.name)
        this.scene.remove(object)
    }

    /**
     * Ustawia listenery do stawiania fighterów
     */
    static setupListeners() {
        window.onkeydown = async (e) => {
            if (!this.gaming)
                return;
            //jeśli kliknięty klawisz to od 1 do 4
            if (e.key.match(/[1-9]/)) {
                if (this.selected) { //usunięcie poprzedniego wyboru ze sceny 
                    this.scene.remove(this.selected)
                    this.selected = null
                }
                //tu trzeba bedzie zmienić bo jak bedziemy mieć rotacje to e.key nie bedzie dzialal ale to pozniej
                let fighter
                if (e.key === '1')
                    fighter = new BillGates({ name: `p${this.player}t${Date.now()}`, player: this.player, position: { x: 5000, z: 5000 }, rotation: this.player === 1 ? 1.75 * Math.PI : 0.75 * Math.PI }) //nazwa to p[numer gracza]t[unixowe milisekundy]
                else if (e.key === '2')
                    fighter = new Bazooka({ name: `p${this.player}t${Date.now()}`, player: this.player, position: { x: 5000, z: 5000 }, rotation: 1.5 }) //nazwa to p[numer gracza]t[unixowe milisekundy]
                else if (e.key === '3')
                    fighter = new Chicken({ name: `p${this.player}t${Date.now()}`, player: this.player, position: { x: 5000, z: 5000 }, rotation: 0 }) //nazwa to p[numer gracza]t[unixowe milisekundy]
                else if (e.key === '4')
                    fighter = new DarthVader({ name: `p${this.player}t${Date.now()}`, player: this.player, position: { x: 5000, z: 5000 }, rotation: 0 }) //nazwa to p[numer gracza]t[unixowe milisekundy]
                else if (e.key === '5')
                    fighter = new Bauul({ name: `p${this.player}t${Date.now()}`, player: this.player, position: { x: 5000, z: 5000 }, rotation: 0 }) //nazwa to p[numer gracza]t[unixowe milisekundy]
                else if (e.key === '6')
                    fighter = new Wolf({ name: `p${this.player}t${Date.now()}`, player: this.player, position: { x: 5000, z: 5000 }, rotation: 0 }) //nazwa to p[numer gracza]t[unixowe milisekundy]
                else if (e.key === '7')
                    fighter = new Hunter({ name: `p${this.player}t${Date.now()}`, player: this.player, position: { x: 5000, z: 5000 }, rotation: 0 }) //nazwa to p[numer gracza]t[unixowe milisekundy]
                else if (e.key === '8')
                    fighter = new BeelzabubGroup({ name: `p${this.player}t${Date.now()}`, player: this.player, position: { x: 5000, z: 5000 }, rotation: 0 }) //nazwa to p[numer gracza]t[unixowe milisekundy]
                else if (e.key === '9')
                    fighter = new Skeleton({ name: `p${this.player}t${Date.now()}`, player: this.player, position: { x: 5000, z: 5000 }, rotation: 0 }) //nazwa to p[numer gracza]t[unixowe milisekundy]        
                this.selected = fighter //ustawinie klasowej zmiennej na nowo utworzony model
                this.scene.add(fighter)
                const intersects = this.raycaster.get(e, this.tiles.children) //raycaster na plansze
                //jeśli kursor nie jest na planszy lub jest na terenie na którym nie mogą chodzić modele to model sie nie wyswietla
                if (intersects.length === 0 || intersects[0].object.player === 'none') {
                    if (this.selected instanceof FightersGroup) { this.selected.setPosition({ x: 5000, z: 5000 }) }
                    else {
                        this.selected.position.x = 5000 //możliwe da sie to lepiej zrobic niż dawać pozycje na taką żeby był giga daleko XD
                        this.selected.position.z = 5000
                    }
                }
                //jeśli kursor jest na polu gracza to model wyświetla sie nad wskazywanym przez kursor polem na zielono
                else if (this.player === 1 ? intersects[0].object.player === 'p1' : intersects[0].object.player === 'p2') {
                    const pos = intersects[0].object.position
                    if (this.selected instanceof FightersGroup) { this.selected.setPosition(pos) }
                    else {
                        this.selected.position.x = pos.x
                        this.selected.position.z = pos.z
                    }
                    this.selected.setCanPlace(true)
                }
                //jeśli kursor jest na polu przeciwnika lub terenie neutralnym to model wyświetla sie nad wskazywanym przez kursor polem na czerwono
                else if (this.player === 1 ? intersects[0].object.player === 'p2' : intersects[0].object.player === 'p1'
                    || intersects[0].object.player === 'neutral') {
                    const pos = intersects[0].object.position
                    if (this.selected instanceof FightersGroup) { this.selected.setPosition(pos) }
                    else {
                        this.selected.position.x = pos.x
                        this.selected.position.z = pos.z
                    }
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
                if (this.selected instanceof FightersGroup) { this.selected.setPosition({ x: 5000, z: 5000 }) }
                else {
                    this.selected.position.x = 5000 //możliwe da sie to lepiej zrobic niż dawać pozycje na taką żeby był giga daleko XD
                    this.selected.position.z = 5000
                }
            }
            //jeśli kursor jest na polu gracza to model wyświetla sie nad wskazywanym przez kursor polem na zielono
            else if (this.player === 1 ? intersects[0].object.player === 'p1' : intersects[0].object.player === 'p2') {
                const pos = intersects[0].object.position
                if (this.selected instanceof FightersGroup) { this.selected.setPosition(pos) }
                else {
                    this.selected.position.x = pos.x
                    this.selected.position.z = pos.z
                }
                this.selected.setCanPlace(true)
            }
            //jeśli kursor jest na polu przeciwnika lub terenie neutralnym to model wyświetla sie nad wskazywanym przez kursor polem na czerwono
            else if (this.player === 1 ? intersects[0].object.player === 'p2' : intersects[0].object.player === 'p1'
                || intersects[0].object.player === 'neutral') {
                const pos = intersects[0].object.position
                if (this.selected instanceof FightersGroup) { this.selected.setPosition(pos) }
                else {
                    this.selected.position.x = pos.x
                    this.selected.position.z = pos.z
                }
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
                this.selected.setColor(0xffa500)
                if (this.selected instanceof FightersGroup) {
                    for (const e of this.selected.children) {
                        this.models.push(e)
                        Net.newFighter(e.player, e.name, e.constructor.name, e.position.x, e.position.z, e.rotation.y)
                    }
                }
                else {
                    this.models.push(this.selected)
                    Net.newFighter(this.selected.player, this.selected.name, this.selected.constructor.name, pos.x, pos.z, this.selected.rotation.y)
                }
                //wysłanie informacji o modelu do przeciwnika
                this.selected = null
            }
        }
    }
}
