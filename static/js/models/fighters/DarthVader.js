'use strict'

class DarthVader extends Fighter {

    /**
     * @param {object} data 
     */
    constructor(data) {
        const obj = Model.materials.find(a => a.name === 'DarthVader')
        super(data.name, data.player, { x: data.position.x, y: obj.defaultY, z: data.position.z }, data.rotation, obj.cost, obj.hp, obj.attack, obj.attackSpeed, obj.startTime, obj.scale, obj.modelGeometry, obj.modelMap, obj.weaponGeometry, obj.weaponMap)
        this.createClips()
    }

    /**
     * Ładuje animacje modelu
     */
    createClips() {
        this.clips = {
            attack: [this.modelMixer.clipAction("Attack").setLoop(THREE.LoopOnce), this.weaponMixer.clipAction("Attack").setLoop(THREE.LoopOnce)],
            run: [this.modelMixer.clipAction("Run").setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction("Run").setLoop(THREE.LoopRepeat)],
            taunt: [this.modelMixer.clipAction("Salute").setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction("Salute").setLoop(THREE.LoopRepeat)],
            death: [this.modelMixer.clipAction("Crdeath").setLoop(THREE.LoopOnce)]
        }
    }

}