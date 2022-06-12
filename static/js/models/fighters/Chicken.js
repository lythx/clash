'use strict'

class Chicken extends Fighter {

    /**
     * @param {object} data 
     */
    constructor(data) {
        const obj = Model.materials.find(a => a.name === 'Chicken')
        super(data.name, data.player, { x: data.position.x, y: obj.defaultY, z: data.position.z }, data.rotation, obj.cost, obj.hp, obj.attack, obj.attackSpeed, obj.startTime, obj.scale, obj.modelGeometry, obj.modelMap, obj.weaponGeometry, obj.weaponMap)
        this.createClips()
    }

    /**
     * Ładuje animacje modelu
     */
    createClips() {
        this.clips = {
            attack: [this.modelMixer.clipAction("Attack").setLoop(THREE.LoopOnce)],
            run: [this.modelMixer.clipAction("Run").setLoop(THREE.LoopRepeat)],
            taunt: [this.modelMixer.clipAction("Taunt").setLoop(THREE.LoopRepeat)],
            death: [this.modelMixer.clipAction("crdeath").setLoop(THREE.LoopOnce)]
        }
    }

    async handleAttack(target, dmg) {
        Game.scene.add(new Explosion(15, this.position))
        //Game.scene.add(new Explosion(4, this.position))
        target.handleGetAttacked(dmg)
    }

}
