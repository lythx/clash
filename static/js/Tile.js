'use strict'

class Tile extends THREE.Mesh {

    color

    constructor(name, size, color) {
        super()
        this.color = color
        this.name = name
        this.geometry = new THREE.BoxGeometry(size, 5, size);
        this.material = new THREE.MeshBasicMaterial({
            color
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material)
    }

}