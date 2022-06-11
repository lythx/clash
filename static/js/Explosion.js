'use strict'

class Explosion extends THREE.Mesh {
    constructor(size, pos) {
        super();
        this.geometry = new THREE.SphereGeometry(size, 64, 32);
        this.material = new THREE.MeshLambertMaterial({ color: 0xffff00, opacity: 0.4, transparent: true });
        this.position.set(pos.x, pos.y, pos.z)
        setInterval(() => {
            this.material.opacity -= 0.05
        }, 200)
    }
}