class BillGates extends Fighter {

    constructor(player, x, y, z) {
        const data = Model.modelData.find(a.name === 'BillGates')
        super(player, x, y, z, data.attack, data.hp, data.movementSpeed, data.attackSpeed, data.rotation,
            data.attackRange, data.sightRange, Date.now())
    }

}