'use strict'

class Raycaster extends THREE.Raycaster {

    mouseVector = new THREE.Vector2()

    /**
     * Zwraca obiekty na których jest mysz
     * @param {KeyboardEvent} event
     * @param {THREE.Object3D} parent
     */
    get(event, parent) {
        this.mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.setFromCamera(this.mouseVector, Game.camera);
        return this.intersectObjects(parent);
    }
}