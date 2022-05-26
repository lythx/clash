class BillGates extends Model {

    constructor(texture, model, name) {
        super(texture, model, name)
    }

    run() {
        const clip = this.mixer.clipAction("run").setLoop(THREE.LoopRepeat)
        clip.play()
    }

    attack() {
        const clip = this.mixer.clipAction("run").setLoop(THREE.LoopOnce)
        clip.play()
    }
}
