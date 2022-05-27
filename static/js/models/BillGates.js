'use strict'

class BillGates extends Model {

    name
    player
    modelMixer
    weaponMixer

    constructor(player, name) {
        super()
        this.name = name
        this.player = player
    }

    async load() {
        this.modelMixer = new THREE.AnimationMixer(await this._load('../models/billgates/tris.js', "../models/billgates/map.png"))
        this.weaponMixer = new THREE.AnimationMixer(await this._load('../models/billgates/weapon.js', "../models/billgates/weapon.png"))
        this.rotation.y = 90 * (Math.PI / 180)
        this.position.y = 20
        this.scale.set(0.4, 0.4, 0.4)
        Model.models.push(this)
    }

    runAnimation() {
        const modelClip = this.modelMixer.clipAction("run").setLoop(THREE.LoopRepeat)
        const weaponClip = this.weaponMixer.clipAction("run").setLoop(THREE.LoopRepeat)
        modelClip.play()
        weaponClip.play()
    }

    attackAnimation() {
        const modelClip = this.modelMixer.clipAction("attack").setLoop(THREE.LoopRepeat)
        const weaponClip = this.weaponMixer.clipAction("attack").setLoop(THREE.LoopRepeat)
        modelClip.play()
        weaponClip.play()
    }

    animate(delta) {
        this.modelMixer.update(delta)
        this.weaponMixer.update(delta)
    }

    attack(model) {
        this.attackAnimation()
    }

    async target() {
        const models = Model.models.filter(a => a.player !== this.player)
        for (const m of models) {
            if (Math.sqrt((m.position.x - this.position.x) * (m.position.x - this.position.x)
                + (m.position.z - this.position.z) * (m.position.z - this.position.z)) < 10) {
                this.attack(m.position)
                return
            }
        }
        for (const m of models) {
            if (Math.sqrt((m.position.x - this.position.x) * (m.position.x - this.position.x)
                + (m.position.z - this.position.z) * (m.position.z - this.position.z)) < 600) {
                this.go({ x: m.position.x, z: m.position.z })
                return
            }
        }
    }

}
