
class Model {

    static modelTypeList = []
    static modelData = []
    static idCount = 0

    id
    x
    y
    z
    player

    constructor(player, x, y, z) {
        this.id = idCount++
        this.x = x
        this.y = y
        this.z = z
        this.player = player
    }

    static loadModelData(data) {
        for (const e of data) {
            this.modelData.push({ attack: e.attack, hp: e.hp, speed: e.speed, attackSpeed: e.attackSpeed })
        }
    }

    updateAndGetData() {
        return { id: this.id, player: this.player, position: this.position }
    }

}

module.exports = Model