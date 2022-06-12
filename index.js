const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const WebSocket = require('ws')
const Datastore = require('nedb')
const Game = require('./server/Game')
const modelData = require('./server/modelData')

app.use(express.static('static'))
app.use(express.json())

class Timer {
    moveTime
    stop = true
    startTimer = () => {
        if (!this.stop)
            return
        this.stop = false
        this.moveTime = 150
        let lastDate = Date.now()
        const render = () => {
            if (this.stop)
                return
            if (this.moveTime === -1) {
                return
            }
            setImmediate(render)
            if (Date.now() - lastDate < 1000)
                return
            lastDate = Date.now()
            this.moveTime--
        }
        setImmediate(render)
    }

    resetTimer = () => {
        this.moveTime = 150
        this.stop = true
    }

    getTime = () => {
        return this.moveTime
    }
}

const coll1 = new Datastore({
    filename: 'kolekcja.db',
    autoload: true
});
// const doc = {
//     name: "DarthVader",
//     cost: 7,
//     hp: 300,
//     attack: 50,
//     movementSpeed: 50,
//     attackSpeed: 1,
//     attackRange: 5,
//     sightRange: 50,
//     defaultY: 15,
//     startTime: 1000,
//     scale: 0.4,
//     attackAnimation: "attack",
//     runAnimation: "run",
//     tauntAnimation: "taunt",
//     deathAnimation: "crdeath",
//     model: 'mats/DarthVader/tris.js',
//     modelMap: "mats/DarthVader/map.png",
//     weapon: "mats/DarthVader/weapon.js",
//     weaponMap: "mats/DarthVader/weapon.png"
// };
// const doc = {
//     name: "Base2",
//     hp: 3000,
//     attack: 70,
//     attackSpeed: 1,
//     attackRange: 20,
//     defaultY: 15,
//     scale: 0.4,
//     attackAnimation: "attack",
//     runAnimation: "run",
//     tauntAnimation: "taunt",
//     deathAnimation: "crdeath",
//     model: 'mats/base1/tris.js',
//     modelMap: "mats/base1/map.png",
//     weapon: "mats/base1/weapon.png",
//     weaponMap: "mats/base1/weapon.png"
// };
// coll1.insert(doc, function (err, newDoc) {
//     console.log("dodano dokument (obiekt):")
//     console.log(newDoc)
// });

let game
const timer = new Timer();
const players = []
let p1Socket

const server = app.listen(PORT, () => {
    console.log(`server start on port ${PORT}`)
})

/**
 * Odbiera wiadomość od jednego z graczy
 */
const handleMessage = (message, player) => {
    const data = JSON.parse(message.toString())
    switch (data.event) {
        case 'fighter':
            game.addModel(data.body.name, data.body.className, data.body.player, data.body.x, data.body.z, 0)
            break
    }
}

const wss = new WebSocket.Server({ server });

wss.on('connection', (socket) => {
    coll1.find({}, function (err, docs) {
        socket.send(JSON.stringify({ //wysłanie graczowi modeli i danych postaci po połączeniu
            event: 'database',
            body: docs
        }));
        modelData.load(docs)
    });
    socket.on('message', (message) => {
        const data = JSON.parse(message.toString())
        //logowanie
        if (data.event === 'login') {
            if (players.length === 0) { //jeśli jest 1 graczem
                //ustawienie odbierania danych socketa na 1 gracza
                socket.on('message', (message) => { handleMessage(message, 1) })
                p1Socket = socket //przypisanie obiektu socketa żeby później można było wysyłać dane
                players.push(data.body.name)
                socket.send(JSON.stringify({ //odpowiedź na udane logowanie pierwszego gracza
                    event: 'login', body: {
                        status: 'OK',
                        player: players.length,
                        name: data.body.name
                    }
                }))
            }
            else if (players.length === 1) {
                if (players[0] === data.body.name) { //jeśli name jest taki sam odsyła błąd i nie dodaje
                    socket.send(JSON.stringify({
                        event: 'login', body: {
                            status: 'NAME TAKEN'
                        }
                    }))
                    return
                }
                //ustawienie odbierania danych socketa na 2 gracza
                socket.on('message', (message) => { handleMessage(message, 2) })
                p2Socket = socket //przypisanie obiektu socketa żeby później można było wysyłać dane
                players.push(data.body.name)
                socket.send(JSON.stringify({ //odpowiedź na udane logowanie drugiego gracza
                    event: 'login', body: {
                        status: 'OK',
                        player: players.length,
                        name: data.body.name
                    }
                }))
                game = new Game(p1Socket, socket, 180)
                //wysłanie do drugiego gracza rozpoczęcia gry (nie trzeba sendMessage() bo mamy tu socket 2 gracza)
                socket.send(JSON.stringify({ event: 'start' }))
                //wysłanie do pierwszego gracza rozpoczęcia gry
                p1Socket.send(JSON.stringify({ event: 'start' }))
            }
            else { //jeśli jest za dużo graczy odesłanie błędu
                socket.send(JSON.stringify({
                    event: 'login', body: {
                        status: 'TOO MANY PLAYERS'
                    }
                }))
            }
        }
        else if (data.event === 'reset') { //reset danych na serwerzee
            timer.resetTimer()
            players.length = 0
            gameRunning = false
            if (p1Socket) {
                p1Socket.terminate() //rozłączenie socketa 1
                p1Socket = null
            }
        }
    })
})
