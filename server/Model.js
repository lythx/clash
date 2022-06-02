
class Model {

    static idCount = 0

    id
    position
    player

    constructor(player, position) {
        this.id = Model.idCount++
        this.position = Object.assign(position)
        this.player = player
    }

    updateAndGetData() {
        return { id: this.id, player: this.player, position: this.position }
    }

}

module.exports = Model