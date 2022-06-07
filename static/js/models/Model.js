'use strict'

class Model extends THREE.Group {

    static loader = new THREE.JSONLoader();
    textureLoader = new THREE.TextureLoader()
    static materials

    player

    constructor(name, player, position, rotation) {
        super()
        this.name = name
        this.player = player
        this.position.set(position.x, position.y, position.z)
        this.rotation.y = rotation
    }

    //geometry każdego modelu jest ładowane od razu żeby nie trzeba było go ładować potem
    //material nie może być tak ładowany bo wtedy kolory sie psują
    static loadMaterials(data) {
        const arr = []
        for (const e of data) {
            const obj = {
                name: e.name,
                cost: e.cost,
                hp: e.hp,
                attack: e.attack,
                attackSpeed: e.attackSpeed,
                startTime: e.startTime,
                scale: e.scale,
                defaultY: e.defaultY,
                modelMap: e.modelMap,
                weaponMap: e.weaponMap,
                attackAnimation: e.attackAnimation,
                runAnimation: e.runAnimation,
                tauntAnimation: e.tauntAnimation,
                deathAnimation: e.deathAnimation
            }
            this.loader.load(e.model, (geometry) => { //ładowanie geometrii
                obj.modelGeometry = geometry
            });
            this.loader.load(e.weapon, (geometry) => { //ładowanie geometrii
                obj.weaponGeometry = geometry
            });
            arr.push(obj)
        }
        this.materials = arr
    }

    setColor(hex) {
        for (const e of this.children)
            e.material.color.setHex(hex)
    }
}