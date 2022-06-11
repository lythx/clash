'use strict'

class Model extends THREE.Group {

    static loader = new THREE.JSONLoader();
    textureLoader = new THREE.TextureLoader()
    static materials

    player

    /**
     * 
     * @param {string} name 
     * @param {number} player 
     * @param {object} position 
     * @param {number} rotation 
     */
    constructor(name, player, position, rotation) {
        super()
        this.name = name
        this.player = player
        this.position.set(position.x, position.y, position.z)
        this.rotation.y = rotation
    }

    /**
     * Geometry każdego modelu jest ładowane od razu żeby nie trzeba było go ładować potem.
     * Material nie może być tak ładowany bo wtedy kolory sie psują
     * @param {object} data 
     */
    static loadMaterials(data) {
        const arr = []
        for (const e of data) {
            const obj = { // Zapisywanie danych każdego typu modelu do obiektu
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
            this.loader.load(e.model, (geometry) => { // Ładowanie geometrii
                console.log(geometry.animations);
                console.log(e.name);
                obj.modelGeometry = geometry // Zapisywanie załadowanej geometrii do obiektu
            });
            this.loader.load(e.weapon, (geometry) => { // Ładowanie geometrii broni
                obj.weaponGeometry = geometry // Zapisywanie załadowanej geometrii do obiektu  broni
            });
            arr.push(obj)
        }
        this.materials = arr
    }

    /**
     * Ustawia kolor wszystkim elementom obiektu
     * @param {number} hex 
     */
    setColor(hex) {
        for (const e of this.children)
            e.material.color.setHex(hex)
    }
}