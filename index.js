const express = require('express')
const app = express()
const PORT = 3000
const WebSocket = require('ws')

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

const timer = new Timer();
const players = []
let gameRunning = false
let p1socket
let p2socket
let sendToP1 = () => { }
let sendToP2 = () => { }

const server = app.listen(PORT, () => {
    console.log(`server start on port ${PORT}`)
})

const handleP1Message = (message) => {
    console.log(message.toString())
}

const handleP2Message = (message) => {
    console.log(message.toString())
}

const wss = new WebSocket.Server({ server });

wss.on('connection', (socket) => {
    socket.on('message', (message) => {
        const data = JSON.parse(message.toString())
        if (data.event === 'login') {
            if (players.length === 0) {
                socket.on('message', (message) => { handleP1Message(message) })
                sendToP1 = (message) => { socket.send(message) }
                players.push(data.body.name)
                socket.send(JSON.stringify({
                    event: 'login', body: {
                        status: 'OK',
                        player: players.length,
                        name: data.body.name
                    }
                }))
            }
            else if (players.length === 1) {
                if (players[0] === data.body.name) {
                    socket.send(JSON.stringify({
                        event: 'login', body: {
                            status: 'NAME TAKEN'
                        }
                    }))
                    return
                }
                socket.on('message', (message) => { handleP2Message(message) })
                sendToP2 = (message) => { socket.send(message) }
                players.push(data.body.name)
                socket.send(JSON.stringify({
                    event: 'login', body: {
                        status: 'OK',
                        player: players.length,
                        name: data.body.name
                    }
                }))
                socket.send(JSON.stringify({ event: 'start' }))
                sendToP1(JSON.stringify({ event: 'start' }))
            }
            else {
                socket.send(JSON.stringify({
                    event: 'login', body: {
                        status: 'TOO MANY PLAYERS'
                    }
                }))
            }
        }
        else if (data.event === 'reset') {
            timer.resetTimer()
            players.length = 0
            gameRunning = false
            if (p1socket) {
                p1socket.terminate()
                sendToP1 = null
                p1socket = null
            }
            if (p2socket) {
                p2socket.terminate()
                sendToP2 = null
                p2socket = null
            }
        }
    })
})
