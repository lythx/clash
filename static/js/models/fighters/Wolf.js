//gosciu strzelajacy taki o

'use strict'

class Wolf extends Fighter {

    /**
     * @param {object} data 
     */
    constructor(data) {
        const obj = Model.materials.find(a => a.name === 'Wolf')
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
    async handleAttack(target, dmg) {
        // DMG bedzie taki jak atak tylko w przypadku głownego targetu, a tylko tam tworzymy eksplozje (żeby była tylko jedna)
        if (dmg === this.attack) {
            Game.scene.add(new Explosion(4, target.position))
            // Wybuch przy broni strzelającego
            // Obliczenie kątu pod którym jest obrócony ten co strzela
            let angle = Math.atan2(target.position.z - this.position.z, -(target.position.x - this.position.x)) + (2 * Math.PI)
            if (angle >= 2 * Math.PI) //układ współrzędnych jest tu jakoś dziwnie ustawiony, więc trzeba tak zrobić
                angle -= 2 * Math.PI
            const distance = 15 // Wybuch musi być troche z przodu, taki dystans daje dobry efekt
            // Tu do x dodane 2 bo bron jest troche po prawej stronie
            Game.scene.add(new Explosion(4, { x: (this.position.x - distance * Math.cos(angle)) + 2, y: this.position.y + 8, z: this.position.z + distance * Math.sin(angle) }))
        }
        this.attackAnimation()
        // Opóźnienie dmga żeby zgrał sie z animacją ataku
        await new Promise((resolve) => setTimeout(resolve, this.attackAnimationDelay))
        target.handleGetAttacked(dmg)
    }

}