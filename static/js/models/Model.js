'use strict'

class Model extends THREE.Group {

    static loader = new THREE.JSONLoader();
    textureLoader = new THREE.TextureLoader()
    static materials

    //geometry każdego modelu jest ładowane od razu żeby nie trzeba było go ładować potem
    //material nie może być tak ładowany bo wtedy kolory sie psują
    static loadMaterials(data) {
        const arr = []
        for (const e of data) {
            const obj = {}
            obj.name = e.name
            obj.hp = e.hp
            obj.attack = e.attack
            obj.cost = e.cost
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
        this.materials = arr
    }

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
        return {
            model,
            weapon,
            attack: obj.attack,
            cost: obj.cost,
            attackAnimation: obj.attackAnimation,
            runAnimation: obj.runAnimation,
            deathAnimation: obj.deathAnimation
        }
    }
}