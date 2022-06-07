'use strict'

class Model {

    name
    position
    player
    rotation
    events = []
    eventIndex = 0

    constructor(name, player, position, rotation) {
        this.name = name
        this.position = Object.assign(position)
        this.player = player
        this.rotation = rotation
    }

    emitEvent(event, data, timestamp) {
        this.events.unshift({ event, data, timestamp })
    }

    getEvents() {
        const ret = [...this.events]
        this.events.length = this.events.length - ret.length
        return ret
    }

    updateAndGetData() {
        return { name: this.name, player: this.player, position: this.position }
    }

}

module.exports = Model