const Fighter = require('./Fighter.js')
const BillGates = require('./fighters/BillGates.js')
const Bazooka = require('./fighters/Bazooka.js')
const CFG = require('./ServerConfig.js')

class Game {

    player1Socket
    player2Socket
    fighters = []
    buildings = []
    time
    lastSendDataTimestamp = 0
    static modelTypes = { BillGates, Bazooka }

    constructor(player1Socket, player2Socket, time) {
        this.player1Socket = player1Socket
        this.player2Socket = player2Socket
        this.time = time
        setImmediate(() => this.render())
    }

    render() {
        setImmediate(() => this.render())
        if (this.lastSendDataTimestamp + CFG.POLLING_INTERVAL < Date.now()) {
            this.lastSendDataTimestamp = Date.now()
            const lgt = this.fighters.length
            const gameData = {
                events: [],
                data: [],
                timestamp: Date.now() + CFG.SERVER_DELAY
            }
            for (let i = 0; i < lgt; i++) {
                this.fighters[i].calculateTarget(this.fighters.filter(a => a.player !== this.fighters[i].player))
                gameData.events.push(...this.fighters[i].getEvents())
                gameData.data.push(this.fighters[i].data)
            }
            this.player1Socket.send(JSON.stringify({ event: 'gamedata', body: gameData }))
            this.player2Socket.send(JSON.stringify({ event: 'gamedata', body: gameData }))
            this.fighters = this.fighters.filter(a => !a.toDelete)
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