'use strict'

class Net {

    static socket
    static player

    /**
     * Ustawia listenery socketa
     */
    static initialize() {
        this.socket = new WebSocket('ws://localhost:3000')
        this.socket.addEventListener('message', (message) => {
            const data = JSON.parse(message.data.toString())
            switch (data.event) {
                //odpowiedź na logowanie
                case 'database':
                    Model.loadMaterials(data.body)
                    break
                case 'login':
                    if (data.body.status === 'OK') {
                        this.player = data.body.player
                        Ui.status(data.body.name)
                        Ui.awaitStart(data.body.name)
                    }
                    else if (data.body.status === 'NAME TAKEN') {
                        Ui.status('Już jest taki gracz')
                    }
                    else if (data.body.status === 'TOO MANY PLAYERS') {
                        Ui.status('Maksymalna liczba graczy')
                    }
                    break
                //wysyłane po zalogowaniu sie drugiego gracza do obu graczy
                case 'start':
                    Game.start(this.player)
                    Ui.start()
                    break
                //wysyłane do przeciwnika kiedy gracz postawi fightera
                case 'fighter':
                    Game.opponentFighter(data.body)
            }
        })
    }

    /**
     * Logowanie na serwerze
     */
    static login = async (name) => {
        const body = { name }
        this.socket.send(JSON.stringify({ event: 'login', body }))
    }

    /**
     * Resetuje gre na serwerze
     */
    static reset = async () => {
        this.socket.send(JSON.stringify({ event: 'reset' }))
    }

    /**
     * Wysyła informacje o nowym fighterze na serwer
     */
    static newFighter(name, className, x, z, timestamp) {
        this.socket.send(JSON.stringify({ event: 'fighter', body: { name, className, x, z, timestamp } }))
    }
}
