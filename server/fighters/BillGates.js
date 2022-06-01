
const Fighter = require('../Fighter.js')

class BillGates extends Fighter {

    constructor(player, x, z, rotation) {
        const data = Model.modelData.find(a.name === 'BillGates')
        super(player, x, data.defaultY, z, data.attack, data.hp, data.movementSpeed, data.attackSpeed, rotation,
            data.attackRange, data.sightRange, Date.now())
    }

}

module.exports = BillGates
