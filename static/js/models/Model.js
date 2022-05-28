'use strict'

class Model extends THREE.Group {

    static models = []
    static loader = new THREE.JSONLoader();
    textureLoader = new THREE.TextureLoader()
    tween
    //geometry każdego modelu jest ładowane od razu żeby nie trzeba było go ładować potem
    //material nie może być tak ładowany bo wtedy kolory sie psują
    static materials = (() => {
        const arr = []
        const data = [{ //data bedzie brana potem z bazy danych z serwera
            name: 'BillGates', model: '../mats/billgates/tris.js', modelMap: "../mats/billgates/map.png", weapon: "../mats/billgates/weapon.js", weaponMap: "../mats/billgates/weapon.png"
        }]
        for (const e of data) {
            const obj = {}
            obj.name = e.name
            //model
            obj.modelMap = e.modelMap //zapisywanie patha do tekstury
            this.loader.load(e.model, (geometry) => { //ładowanie geometrii
                obj.modelGeometry = geometry
            });
            //broń
            obj.weaponMap = e.weaponMap //zapisywanie patha do tekstury
            this.loader.load(e.weapon, (geometry) => { //ładowanie geometrii
                obj.weaponGeometry = geometry
            });
            arr.push(obj)
        }
        return arr
    })()

    /**
     * Tworzy mesh danego modelu
     */
    async _load(name) {
        const obj = Model.materials.find(a => a.name === name)
        //model
        let modelMaterial
        await new Promise((resolve) => { //ładowanie tekstur jest asynchroniczne wiec trzeba dać Promise
            modelMaterial = new THREE.MeshBasicMaterial(
                {
                    map: this.textureLoader.load(obj.modelMap, () => { resolve() }),
                    morphTargets: true //to jest potrzebne do animacji
                });
        })
        //broń
        let weaponMaterial
        await new Promise((resolve) => {
            weaponMaterial = new THREE.MeshBasicMaterial(
                {
                    map: this.textureLoader.load(obj.weaponMap, () => { resolve() }),
                    morphTargets: true //to jest potrzebne do animacji
                });
        })
        const model = new THREE.Mesh(obj.modelGeometry, modelMaterial)
        const weapon = new THREE.Mesh(obj.weaponGeometry, weaponMaterial)
        return { model, weapon }
    }

    /**
     * Obraca model w kierunku podanej lokacji
     */
    async _rotate(location) {
        //kąt obrotu
        let targetAngle = Math.atan2(location.z - this.position.z, -(location.x - this.position.x)) + (2 * Math.PI)
        if (targetAngle >= 2 * Math.PI) //układ współrzędnych jest tu jakoś dziwnie ustawiony, więc trzeba tak zrobić
            targetAngle -= 2 * Math.PI
        this.rotation.y = targetAngle
    }

    /**
     * Obraca i przesuwa model do danej lokacji
     */
    async _go(location) {
        this._rotate(location)
        //długość drogi (potrzebna do szybkości animacji)
        const distance = Math.sqrt(((location.x - this.position.x) * (location.x - this.position.x) +
            (location.z - this.position.z) * (location.z - this.position.z)))
        this.tween?.stop() //zatrzymanie poprzednich animacji
        this.tween = new TWEEN.Tween(this.position) //animacja
            .to(location, distance * 75)
            .start()
    }
}