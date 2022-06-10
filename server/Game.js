const Fighter = require('./Fighter.js')
const BillGates = require('./fighters/BillGates.js')
const Bazooka = require('./fighters/Bazooka.js')
const CFG = require('./serverConfig.js')

class Game {

    player1Socket
    player2Socket
    fighters = []
    buildings = []
    time
    lastSendDataTimestamp = 0
    static modelTypes = { BillGates, Bazooka }

    /**
     * Rozpoczyna grę z podanym czasem rozgrywki
     * @param {WebSocket.socket} player1Socket 
     * @param {WebSocket.socket} player2Socket 
     * @param {number} time 
     */
    constructor(player1Socket, player2Socket, time) {
        this.player1Socket = player1Socket
        this.player2Socket = player2Socket
        this.time = time
        setImmediate(() => this.render())
    }

    render() {
        setImmediate(() => this.render())
        // Set immediate działa ponad 1000 razy na sekunde co nie jest zbyt optymalne
        // Ten if sprawia, że obliczenia i wysłanie na serwer będzie się wykonywać co określony czas (CFG.POLLING_INTERVAL)
        if (this.lastSendDataTimestamp + CFG.POLLING_INTERVAL < Date.now()) {
            // Zresetowanie daty, żeby znowu poczekał chwile przed kolejnym wysłaniem danych
            this.lastSendDataTimestamp = Date.now()
            // Jako że serwer robi obliczenia wcześniej niż obraz jest renderowany na kliencie,
            // to wszystko wysyłane na klienta musi mieć ustalony czas w którym ma sie wykonać czyli timestamp
            const gameData = {
                events: [], // Eventy mają swój własny timestamp, wszystkie są wsadzane tutaj
                data: [], // Data, czyli pozycja i rotacja fighterów
                timestamp: Date.now() + CFG.SERVER_DELAY // Timestamp do data
            }
            const lgt = this.fighters.length
            for (let i = 0; i < lgt; i++) {
                this.fighters[i].calculateTarget(this.fighters.filter(a => a.player !== this.fighters[i].player)) // Obliczenia
                gameData.events.push(...this.fighters[i].getEvents()) // Pushowanie eventów
                gameData.data.push(this.fighters[i].data) // Pushowanie rotacji i pozycji
            }
            this.player1Socket.send(JSON.stringify({ event: 'gamedata', body: gameData })) // Wysłanie informacji do graczy
            this.player2Socket.send(JSON.stringify({ event: 'gamedata', body: gameData }))
            this.fighters = this.fighters.filter(a => !a.toDelete) // Usunięcie martwych fighterów
        }
    }

    /**
     * Dodaje model do gry
     * @param {string} name 
     * @param {string} modelType 
     * @param {number} player 
     * @param {number} x 
     * @param {number} z 
     * @param {number} rotation 
     */
    addModel(name, modelType, player, x, z, rotation) {
        const model = new Game.modelTypes[modelType](name, player, x, z, rotation) // Szuka modelu po nazwie i tworzy go
        this.fighters.push(model)
    }

}


module.exports = Game