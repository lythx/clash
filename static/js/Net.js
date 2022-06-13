'use strict'

class Net {

    static socket
    static player

    /**
     * Ustawia listenery socketa
     */
    static initialize() {
        const HOST = location.origin.replace(/^http/, 'ws')
        this.socket = new WebSocket(HOST)
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
                case 'gamedata':
                    Game.update(data.body)
                    Ui.timer(data.body.time)
                    break
                //wysyłane po zalogowaniu sie drugiego gracza do obu graczy
                case 'start':
                    Game.start(this.player)
                    Ui.start()
                    break
            }
        })
    }

    /**
     * Logowanie na serwerze
     * @param {string} name
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
     * @param {number} player
     * @param {string} name
     * @param {string} className
     * @param {number} x
     * @param {number} z
     * @param {number} rotation
     */
    static newFighter(player, name, className, x, z, rotation) {
        this.socket.send(JSON.stringify({ event: 'fighter', body: { player, name, className, x, z, rotation } }))
    }

}
