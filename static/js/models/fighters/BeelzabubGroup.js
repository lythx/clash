'use strict'

class BeelzabubGroup extends FightersGroup {

    gap = 4
    count = 4

    /**
     * @param {object} data 
     */
    constructor(data) {
        super()
        this.name = data.name
        const obj = Model.materials.find(a => a.name === 'Beelzabub')
        for (let i = 0; i < this.count; i++) {
            for (let j = 0; j < this.count; j++) {
                const pos = {
                    x: data.position.x + ((this.gap * i) - ((this.gap * this.count) / 2)),
                    y: obj.defaultY,
                    z: data.position.z + ((this.gap * j) - ((this.gap * this.count) / 2))
                }
                this.add(new Beelzabub({ name: `${data.name}${i}${j}`, player: data.player, position: pos, rotation: data.rotation }))
            }
        }
    }

    /**
     * Ustawia pozycje wszystkich członków grupy
     * @param {object} position 
     */
    setPosition(position) {
        let n = 0
        for (let i = 0; i < this.count; i++) {
            for (let j = 0; j < this.count; j++) {
                this.children[n].position.x = position.x + ((this.gap * i) - ((this.gap * this.count) / 2))
                this.children[n++].position.z = position.z + ((this.gap * j) - ((this.gap * this.count) / 2))
            }
        }
    }

}