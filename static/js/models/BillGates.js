'use strict'

class BillGates extends Model {

    name
    x
    z

    constructor(player, name) {
        super(player)
        this.name = name
    }

    async load() {
        await this._load('../models/billgates/tris.js', "../models/billgates/map.png")
        await this._load('../models/billgates/weapon.js', "../models/billgates/weapon.png")
        this.children[0].rotation.y = 90 * (Math.PI / 180)
        this.children[0].position.y = 20
        this.children[0].scale.set(0.4, 0.4, 0.4)
        this.children[1].rotation.y = 90 * (Math.PI / 180)
        this.children[1].position.y = 20
        this.children[1].scale.set(0.4, 0.4, 0.4)
        Model.models.push(this)
    }

    setPosition(x, z) {
        this.x = x
        this.z = z
        this.children[0].position.x = x
        this.children[0].position.z = z
        this.children[1].position.x = x
        this.children[1].position.z = z
    }


}
