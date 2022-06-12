'use strict'

class Hunter extends Fighter {

    /**
     * @param {object} data 
     */
    constructor(data) {
        const obj = Model.materials.find(a => a.name === 'Hunter')
        super(data.name, data.player, { x: data.position.x, y: obj.defaultY, z: data.position.z }, data.rotation, obj.cost, obj.hp, obj.attack, obj.attackSpeed, obj.startTime, obj.scale, obj.modelGeometry, obj.modelMap, obj.weaponGeometry, obj.weaponMap)
        this.createClips()
    }

    /**
     * Ładuje animacje modelu
     */
    createClips() {
        this.clips = {
            attack: [this.modelMixer.clipAction("attack").setLoop(THREE.LoopOnce), this.weaponMixer.clipAction("attack").setLoop(THREE.LoopOnce)],
            run: [this.modelMixer.clipAction("run").setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction("run").setLoop(THREE.LoopRepeat)],
            taunt: [this.modelMixer.clipAction("taunt").setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction("taunt").setLoop(THREE.LoopRepeat)],
            death: [this.modelMixer.clipAction("crdeath").setLoop(THREE.LoopOnce)]
        }
    }

}