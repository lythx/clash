
const Fighter = require('../Fighter')
const modelData = require('../modelData').data

class BillGates extends Fighter {

    constructor(player, x, z, rotation) {
        const data = modelData.find(a => a.name === 'BillGates')
        super(player, x, data.defaultY, z, data.attack, data.hp, data.movementSpeed, data.attackSpeed, rotation,
            data.attackRange, data.sightRange, data.startTime)
    }

}

module.exports = BillGates
