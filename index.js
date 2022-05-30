const express = require('express')
const app = express()
const PORT = 3000
const WebSocket = require('ws')
const Datastore = require('nedb')

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
//     name: "BillGates",
//     hp: "100",
//     attack: "30",
//     cost: "5",
//     model: 'mats/billgates/tris.js',
//     modelMap: "mats/billgates/map.png",
//     weapon: "mats/billgates/weapon.js",
//     weaponMap: "mats/billgates/weapon.png"
// };
// coll1.insert(doc, function (err, newDoc) {
//     console.log("dodano dokument (obiekt):")
//     console.log(newDoc)
// });
const timer = new Timer();
const players = []
let gameRunning = false
let p1Socket
let p2Socket

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
            sendMessage(player === 1 ? 2 : 1, JSON.stringify(data))
            break
    }
}

/**
 * Wysyła socketem wiadomość do danego gracza
 */
const sendMessage = (player, message) => {
    if (player === 1)
        p1Socket.send(message)
    else
        p2Socket.send(message)
}

const wss = new WebSocket.Server({ server });

wss.on('connection', (socket) => {
    coll1.find({}, function (err, docs) {
        socket.send(JSON.stringify({ //wysłanie graczowi modeli i danych postaci po połączeniu
            event: 'database',
            body: docs
        }));
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
                //wysłanie do drugiego gracza rozpoczęcia gry (nie trzeba sendMessage() bo mamy tu socket 2 gracza)
                socket.send(JSON.stringify({ event: 'start' }))
                //wysłanie do pierwszego gracza rozpoczęcia gry
                sendMessage(1, JSON.stringify({ event: 'start' }))
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
            if (p2Socket) {
                p2Socket.terminate() //rozłączenie socketa 2
                p2Socket = null
            }
        }
    })
})
