const express = require('express')
const app = express()
const PORT = 3000

app.use(express.static('static'))
app.use(express.json())

const players = ['janiarz']
let gameRunning = false
let status = 'waiting'

class Timer {
    moveTime
    stop = true
    startTimer = () => {
        if (!this.stop)
            return
        this.stop = false
        this.moveTime = 30
        let lastDate = Date.now()
        const render = () => {
            if (this.stop)
                return
            if (this.moveTime === -1) {
                handleTimeEnd()
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
        this.moveTime = 30
    }

    stopTimer = () => {
        this.stop = true
    }

    getMoveTime = () => {
        return this.moveTime
    }
}

app.post('/addlogin', (req, res) => {
    if (players.length > 1) {
        res.send(JSON.stringify({ status: 'TOO MANY LOGGED IN' }))
        return
    }
    if (players[0] === req.body.name) {
        res.send(JSON.stringify({ status: 'NAME TAKEN' }))
        return
    }
    players.push(req.body.name)
    if (players.length == 2) {
        gameRunning = true
        status = 'start'
    }
    res.send(JSON.stringify({
        status: 'OK',
        player: players.length
    }))
})

app.post('/reset', (req, res) => {
    players.length = 0
    gameRunning = false
    res.send({ status: 'OK' })
})

app.post('/status', (req, res) => {
    const player = req.body.player
    if (!gameRunning) {
        res.send(JSON.stringify({ status: 'waiting' }))
    }
    else {
        res.send(JSON.stringify({ status: 'running' }))
    }
})

app.listen(PORT, () => {
    console.log(`server start on port ${PORT}`)
})

