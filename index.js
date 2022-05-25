const express = require('express')
const app = express()
const PORT = 3000

app.use(express.static('static'))
app.use(express.json())

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

const handleTimeEnd = () => {
    winner = playerMove === 1 ? 2 : 1
    gameRunning = false
}

let players = []
let lastMove = {}
let playerMove = 1
let winner
let checkerIds
let newMove = false
let gameRunning = false
const timer = new Timer()

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
    res.send(JSON.stringify({
        status: 'OK',
        player: players.length
    }))
})

app.post('/reset', (req, res) => {
    players = []
    lastMove = {}
    playerMove = 1
    winner = null
    checkerIds = null
    gameRunning = false
    newMove = false
    res.send({ status: 'OK' })
})

app.post('/getplayercount', (req, res) => {
    res.send(JSON.stringify({ count: players.length }))
})

app.post('/sendmove', (req, res) => {
    timer.resetTimer()
    newMove = true
    lastMove = { checkerId: req.body.checkerId, steps: req.body.steps }
    playerMove = playerMove === 1 ? 2 : 1
    checkerIds = req.body.checkerIds
    const checkerColors = req.body.checkerColors
    if (checkerColors.every(row => {
        return !row.some(a => a === 1)
    })) {
        winner = 2
        gameRunning = false
    }
    else if (checkerColors.every(row => {
        return !row.some(a => a === 2)
    })) {
        winner = 1
        gameRunning = false
    }
    res.send(JSON.stringify({ status: 'OK' }))
})

app.post('/getstatus', (req, res) => {
    if (req.body.player === winner) {
        res.send(JSON.stringify({ status: 'win' }))
        return
    }
    if (winner) {
        res.send(JSON.stringify({ status: 'lose' }))
        return
    }
    if (!gameRunning) {
        res.send(JSON.stringify({ status: 'game cancelled' }))
        return
    }
    if (req.body.player !== playerMove) {
        res.send(JSON.stringify({ status: 'opponent', time: timer.getMoveTime() }))
        return
    }
    if (req.body.player === playerMove && !newMove) {
        res.send(JSON.stringify({ status: 'you', time: timer.getMoveTime() }))
        return
    }
    if (req.body.player === playerMove) {
        newMove = false
        res.send(JSON.stringify({ status: 'yourturn', checkerId: lastMove.checkerId, steps: lastMove.steps, checkerIds }))
    }
})

app.post('/startgame', (req, res) => {
    if (gameRunning) {
        res.send(JSON.stringify({ status: 'already running' }))
        return
    }
    gameRunning = true
    timer.startTimer()
    lastMove = {}
    newMove = false
    playerMove = 1
    winner = null
    checkerIds = null
    res.send(JSON.stringify({ status: 'OK' }))
})

app.listen(PORT, () => {
    console.log(`server start on port ${PORT}`)
})

