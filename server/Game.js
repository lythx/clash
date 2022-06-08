const Fighter = require('./Fighter.js')
const BillGates = require('./fighters/BillGates.js')
const CFG = require('./GameConfig.js')

class Game {

    player1Socket
    player2Socket
    fighters = []
    buildings = []
    time
    lastSendDataTimestamp = 0
    static modelTypes = { BillGates }

    constructor(player1Socket, player2Socket, time) {
        this.player1Socket = player1Socket
        this.player2Socket = player2Socket
        this.time = time
        setImmediate(() => this.render())
    }

    render() {
        setImmediate(() => this.render())
        if (this.lastSendDataTimestamp + CFG.POLLING_INTERVAL < Date.now()) {
            const gameData = []
            const fightersLength = this.fighters.length
            for (let i = 0; i < fightersLength; i++) {
                this.fighters[i].calculateTarget(this.fighters.filter(a => a.player !== this.fighters[i].player))
                gameData.push(this.fighters[i].data)
            }
            this.lastSendDataTimestamp = Date.now()
            this.player1Socket.send(JSON.stringify({ event: 'gameevent', body: { event: 'gameData', data: gameData, timestamp: this.lastSendDataTimestamp + CFG.SERVER_DELAY } }))
            this.player2Socket.send(JSON.stringify({ event: 'gameevent', body: { event: 'gameData', data: gameData, timestamp: this.lastSendDataTimestamp + CFG.SERVER_DELAY } }))
        }
        else {
            const fightersLength = this.fighters.length
            for (let i = 0; i < fightersLength; i++) {
                this.fighters[i].calculateTarget(this.fighters.filter(a => a.player !== this.fighters[i].player))
                const events = this.fighters[i].getEvents()
                const lgt = events.length
                for (let i = 0; i < lgt; i++) {
                    this.player1Socket.send(JSON.stringify({ event: 'gameevent', body: events[i] }))
                    this.player2Socket.send(JSON.stringify({ event: 'gameevent', body: events[i] }))
                }
            }
        }
    }

    addModel(name, modelType, player, x, z, rotation) {
        const model = new Game.modelTypes[modelType](name, player, x, z, rotation)
        if (model instanceof Fighter)
            this.fighters.push(model)
        else
            this.buildings.push(model)
    }

}


module.exports = Game