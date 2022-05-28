'use strict'

class Model extends THREE.Group {

    static models = []
    static loader = new THREE.JSONLoader();
    textureLoader = new THREE.TextureLoader()
    tween
    static materials = (() => {
        const arr = []
        const data = [{
            name: 'BillGates', model: '../mats/billgates/tris.js', modelMap: "../mats/billgates/map.png", weapon: "../mats/billgates/weapon.js", weaponMap: "../mats/billgates/weapon.png"
        }]
        for (const e of data) { //data bedzie brana potem z bazy danych
            const obj = {}
            obj.name = e.name
            obj.modelMap = e.modelMap
            this.loader.load(e.model, (geometry) => {
                obj.modelGeometry = geometry
            });
            obj.weaponMap = e.weaponMap
            this.loader.load(e.weapon, (geometry) => {
                obj.weaponGeometry = geometry
            });
            arr.push(obj)
        }
        return arr
    })()

    async _load(name) {
        const obj = Model.materials.find(a => a.name === name)
        let modelMaterial
        await new Promise((resolve) => {
            modelMaterial = new THREE.MeshBasicMaterial(
                {
                    map: this.textureLoader.load(obj.modelMap, () => { resolve() }),
                    morphTargets: true //to jest potrzebne do animacji
                });
        })
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