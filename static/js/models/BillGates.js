class BillGates extends Model {

    constructor(name) {
        super(name)
    }

    async load() {
        await this._load('../models/billgates/tris.js', "../models/billgates/billywork.png")
        this.mesh.rotation.y = 270 * (Math.PI / 180);
        this.mesh.position.y = 20
        this.mesh.scale.set(0.4, 0.4, 0.4)
    }

    run() {
        console.log(this.mixer)
        const clip = this.mixer.clipAction("run").setLoop(THREE.LoopRepeat)
        clip.play()
    }

    attack() {
        const clip = this.mixer.clipAction("run").setLoop(THREE.LoopOnce)
        clip.play()
    }

    rotate(degrees) {
        this.mesh.rotation.y = degrees * (Math.PI / 180);
    }
}
