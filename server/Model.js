
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

    addEvent(event, data) {
        this.events.unshift({ event, data, timestamp: Date.now() + 50 })
        this.eventIndex++
    }

    getEvents() {
        this.events.length = Math.min(20, this.events.length)
        const ret = []
        const lgt = this.eventIndex
        for (let i = 0; i < lgt; i++) {
            ret.push(this.events)
        }
        this.eventIndex -= lgt
        return ret
    }

    updateAndGetData() {
        return { name: this.name, player: this.player, position: this.position, events: this.getEvents() }
    }

}

module.exports = Model