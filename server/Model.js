
class Model {

    static idCount = 0

    id
    x
    y
    z
    player

    constructor(player, x, y, z) {
        this.id = Model.idCount++
        this.x = x
        this.y = y
        this.z = z
        this.player = player
    }

    updateAndGetData() {
        return { id: this.id, player: this.player, position: this.position }
    }

}

module.exports = Model