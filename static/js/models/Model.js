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
            this.loader.load(e.model, (geometry) => { // Ładowanie geometrii
                e.modelGeometry = geometry // Zapisywanie załadowanej geometrii do obiektu
            });
            this.loader.load(e.weapon, (geometry) => { // Ładowanie geometrii broni
                e.weaponGeometry = geometry // Zapisywanie załadowanej geometrii do obiektu  broni
            });
            arr.push(e)
        }
        this.materials = arr
    }

}