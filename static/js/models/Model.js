'use strict'

class Model extends THREE.Object3D {

    static models = []
    loader = new THREE.JSONLoader();
    mixers = []
    player
    animations = []

    constructor(player) {
        super()
        this.player = player
    }

    async _load(model, texture) {
        const material = new THREE.MeshBasicMaterial(
            {
                map: new THREE.TextureLoader().load(texture),
                morphTargets: true
            });
        const mesh = await new Promise((resolve) => {
            this.loader.load(model, (geometry) => {
                resolve(new THREE.Mesh(geometry, material))
            });
        })
        this.children.push(mesh)
        const mixer = new THREE.AnimationMixer(mesh)
        this.mixers.push(mixer)
    }

    animate(delta) {
        const lgt = this.mixers.length
        for (let i = 0; i < lgt; i++)
            this.mixers[i].update(delta)
    }

    runAnimation() {
        const lgt = this.mixers.length
        for (let i = 0; i < lgt; i++) {
            const clip = this.mixers[i].clipAction("run").setLoop(THREE.LoopRepeat)
            clip.play()
        }
    }

    attackAnimation() {
        const lgt = this.mixers.length
        for (let i = 0; i < lgt; i++) {
            const clip = this.mixers[i].clipAction("attack").setLoop(THREE.LoopRepeat)
            clip.play()
        }
    }

    attack(model) {
        for (const e of this.animations)
            e.stop()
        this.attackAnimation()
    }

    async go(location) {
        let targetAngle = Math.atan2(location.z, -location.x) + (2.25 * Math.PI)
        if (targetAngle > 2 * Math.PI)
            targetAngle -= 2 * Math.PI
        await new Promise((resolve) => {
            this.animations.push(new TWEEN.Tween(this.children[0].rotation)
                .to({ y: targetAngle }, targetAngle * 600)
                .onUpdate(() => { this.children[1].rotation.y = this.children[0].rotation.y })
                .onComplete(() => { resolve() })
                .start())
        })
        const distance = Math.sqrt(((location.x - this.children[0].position.x) * (location.x - this.children[0].position.x) +
            (location.z - this.children[0].position.z) * (location.z - this.children[0].position.z)))
        return new Promise((resolve) => {
            this.animations.push(new TWEEN.Tween(this.children[0].position)
                .to(location, distance * 75)
                .onUpdate(() => {
                    this.children[1].position.x = this.children[0].position.x
                    this.children[1].position.z = this.children[0].position.z
                    this.x = this.children[0].position.x
                    this.z = this.children[0].position.z
                })
                .onComplete(() => { resolve() })
                .start())
        })
    }



    async target() {
        const models = Model.models.filter(a => a.player !== this.player)
        for (const m of models) {
            if (Math.sqrt((m.x - this.x) * (m.x - this.x)
                + (m.z - this.z) * (m.z - this.z)) < 10) {
                this.attack(m)
                return
            }
        }
        for (const m of models) {
            if (Math.sqrt((m.x - this.x) * (m.x - this.x)
                + (m.z - this.z) * (m.z - this.z)) < 600) {
                this.go({ x: m.x, z: m.z })
                return
            }
        }
    }
}