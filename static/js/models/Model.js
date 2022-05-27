'use strict'

class Model extends THREE.Group {

    static models = []
    loader = new THREE.JSONLoader();

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
        this.add(mesh)
        return mesh
    }

    async go(location) {
        let targetAngle = Math.atan2(location.z, -location.x) + (2 * Math.PI)
        if (targetAngle > 2 * Math.PI)
            targetAngle -= 2 * Math.PI
        this.rotateY(targetAngle)
        const distance = Math.sqrt(((location.x - this.position.x) * (location.x - this.position.x) +
            (location.z - this.position.z) * (location.z - this.position.z)))
        return new Promise((resolve) => {
            new TWEEN.Tween(this.position)
                .to(location, distance * 75)
                .onComplete(() => { resolve() })
                .start()
        })
    }
}