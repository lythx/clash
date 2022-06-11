'use strict'

class BillGates extends Fighter {

    /**
     * @param {object} data 
     */
    constructor(data) {
        const obj = Model.materials.find(a => a.name === 'BillGates')
        super(data.name, data.player, { x: data.position.x, y: obj.defaultY, z: data.position.z }, data.rotation, obj.cost, obj.hp, obj.attack, obj.attackSpeed, obj.startTime, obj.scale, obj.modelGeometry, obj.modelMap, obj.weaponGeometry, obj.weaponMap)
        this.createClips(obj.attackAnimation, obj.runAnimation, obj.tauntAnimation, obj.deathAnimation)
    }

    /**
     * Ładuje animacje modelu
     * @param {string} attackAnimation 
     * @param {string} runAnimation 
     * @param {string} tauntAnimation 
     * @param {string} deathAnimation 
     */
    createClips(attackAnimation, runAnimation, tauntAnimation, deathAnimation) {
        this.clips = {
            attack: [this.modelMixer.clipAction(attackAnimation).setLoop(THREE.LoopOnce), this.weaponMixer.clipAction(attackAnimation).setLoop(THREE.LoopOnce)],
            run: [this.modelMixer.clipAction(runAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(runAnimation).setLoop(THREE.LoopRepeat)],
            taunt: [this.modelMixer.clipAction(tauntAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(tauntAnimation).setLoop(THREE.LoopRepeat)],
            death: [this.modelMixer.clipAction(deathAnimation).setLoop(THREE.LoopOnce)]
        }
    }

}
