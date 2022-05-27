class Model extends THREE.Object3D {

    loader = new THREE.JSONLoader();
    mixers = []

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
        this.mixers.push(new THREE.AnimationMixer(mesh))
    }

    animate(delta) {
        const lgt = this.mixers.length
        for (let i = 0; i < lgt; i++)
            this.mixers[i].update(delta)
        this.updateMatrixWorld()
    }

    async go(location) {
        let targetAngle = Math.atan2(location.z, -location.x) + (2 * Math.PI)
        if (targetAngle > 2 * Math.PI)
            targetAngle -= 2 * Math.PI
        await new Promise((resolve) => {
            new TWEEN.Tween(this.children[0].rotation)
                .to({ y: targetAngle }, targetAngle * 600)
                .onUpdate(() => { this.children[1].rotation.y = this.children[0].rotation.y })
                .onComplete(() => { resolve() })
                .start()
        })
        const distance = Math.sqrt(((location.x - this.children[0].position.x) * (location.x - this.children[0].position.x) +
            (location.z - this.children[0].position.z) * (location.z - this.children[0].position.z)))
        return new Promise((resolve) => {
            new TWEEN.Tween(this.children[0].position)
                .to(location, distance * 75)
                .onUpdate(() => {
                    this.children[1].position.x = this.children[0].position.x
                    this.children[1].position.z = this.children[0].position.z
                })
                .onComplete(() => { resolve() })
                .start()
        })
    }
}