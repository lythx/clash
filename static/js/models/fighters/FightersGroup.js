'use strict'

class FightersGroup extends THREE.Object3D {

    canPlace

    /**
     * Używane podczas stawiania fighterów, przy false zmienia kolor modelu na czerwony, a true na zielony
     * @param {boolean} canPlace 
     */
    setCanPlace(canPlace) {
        this.canPlace = canPlace
        for (const e of this.children) {
            e.setCanPlace(0x00ff00)
        }
    }

    /**
     * Ustawia kolor wszystkim elementom obiektu
     * @param {number} hex 
     */
    setColor(hex) {
        console.log(this.position)
        console.log(this.children[0].position)
        for (const e of this.children)
            e.setColor(hex)
    }

    setPosition(position) { }
}