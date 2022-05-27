class BillGates extends Model {

    name

    constructor(name) {
        super()
        this.name = name
    }

    async load() {
        await this._load('../models/billgates/tris.js', "../models/billgates/map.png")
        await this._load('../models/billgates/weapon.js', "../models/billgates/weapon.png")
        this.children[0].rotation.y = 90 * (Math.PI / 180)
        this.children[0].position.y = 20
        this.children[0].scale.set(0.4, 0.4, 0.4)
        this.children[1].rotation.y = 90 * (Math.PI / 180)
        this.children[1].position.y = 20
        this.children[1].scale.set(0.4, 0.4, 0.4)
    }

    run() {
        const lgt = this.mixers.length
        for (let i = 0; i < lgt; i++) {
            const clip = this.mixers[i].clipAction("run").setLoop(THREE.LoopRepeat)
            clip.play()
        }
    }

    attack() {
        const lgt = this.mixers.length
        for (let i = 0; i < lgt; i++) {
            const clip = this.mixers[i].clipAction("attack").setLoop(THREE.LoopOnce)
            clip.play()
        }
    }
}
