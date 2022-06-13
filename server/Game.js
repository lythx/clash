'use strict'

const BillGates = require('./fighters/BillGates.js')
const Bazooka = require('./fighters/Bazooka.js')
const Base = require('./Base.js')
const Chicken = require('./fighters/Chicken.js')
const DarthVader = require('./fighters/DarthVader.js')
const Bauul = require('./fighters/Bauul.js')
const Wolf = require('./fighters/Wolf.js')
const Hunter = require('./fighters/Hunter.js')
const Beelzabub = require('./fighters/Beelzabub.js')
const Skeleton = require('./fighters/Skeleton.js')
const Timer = require('./Timer.js')
const CFG = require('./ServerConfig.js')

class Game {

    player1Socket
    player2Socket
    models = []
    timer
    player1Name
    player2Name
    lastSendDataTimestamp = 0
    static modelTypes = { BillGates, Bazooka, Chicken, DarthVader, Bauul, Wolf, Hunter, Beelzabub, Skeleton }
    gaming = true
    db

    /**
     * Rozpoczyna grę z podanym czasem rozgrywki
     * @param {WebSocket.socket} player1Socket 
     * @param {WebSocket.socket} player2Socket 
     * @param {number} time 
     * @param {string} player1Name
     * @param {string} player2Name
     * @param {Nedb} db
     */
    constructor(player1Socket, player2Socket, time, player1Name, player2Name, db) {
        this.player1Socket = player1Socket
        this.player2Socket = player2Socket
        this.timer = new Timer(time)
        this.timer.start()
        this.timer.onEnd(() => {
            this.handleTimerEnd()
        })
        this.db = db
        this.player1Name = player1Name
        this.player2Name = player2Name
        this.models.push(new Base(1))
        this.models.push(new Base(2))
        setImmediate(() => this.render())
    }

    render() {
        if (this.gaming === false)
            return
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
                timestamp: Date.now() + CFG.SERVER_DELAY, // Timestamp do data
                time: this.timer.time
            }
            const lgt = this.models.length
            for (let i = 0; i < lgt; i++) {
                this.models[i].calculateTarget(this.models.filter(a => a.player !== this.models[i].player)) // Obliczenia
                gameData.events.push(...this.models[i].getEvents()) // Pushowanie eventów
                gameData.data.push(this.models[i].data) // Pushowanie rotacji i pozycji
            }
            this.player1Socket.send(JSON.stringify({ event: 'gamedata', body: gameData })) // Wysłanie informacji do graczy
            this.player2Socket.send(JSON.stringify({ event: 'gamedata', body: gameData }))
            this.models = this.models.filter(a => !a.toDelete) // Usunięcie martwych fighterów
            const endGame = gameData.events.find(a => a.event === 'endGame')
            if (endGame !== undefined) {
                this.endGame(endGame.data.loser)
            }
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
        this.models.push(model)
    }

    /**
     * Kończy gre i wysyła wynik do bazy danych
     * @param {number} loser 
     */
    endGame(loser) {
        const base1hp = this.models.find(a => a.name === 'Base1').hp
        const base2hp = this.models.find(a => a.name === 'Base2').hp
        this.gaming = false
        const doc = {
            winner: loser === 1 ? this.player2Name : this.player1Name,
            loser: loser === 1 ? this.player1Name : this.player2Name,
            hp: [base1hp, base2hp].sort((a, b) => b - a).map(a => {
                if (a < 0) { return 0 }
                else { return a }
            }).join(':'),
            time: this.timer.maxTime - this.timer.time,
            date: new Date()
        }
        this.db.insert(doc, function (err, newDoc) {
            console.log("koniec gry:")
            console.log(newDoc)
        });
    }

    /**
     * Kończy gre ze względu na brak czasu
     */
    handleTimerEnd() {
        const base1 = this.models.find(a => a.name === 'Base1')
        const base2 = this.models.find(a => a.name === 'Base2')
        if (base1.hp >= base2.hp) {
            base1.emitEvent('endGame', { loser: 2 }, Date.now() + CFG.SERVER_DELAY) // Wysłanie ewentu w przypadku śmierci
        }
        else {
            base2.emitEvent('endGame', { loser: 1 }, Date.now() + CFG.SERVER_DELAY) // Wysłanie ewentu w przypadku śmierci
        }
    }
}

module.exports = Game