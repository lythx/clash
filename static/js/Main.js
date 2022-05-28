'use strict'

window.onload = () => {
    //generowanie sceny i planszy
    Game.initialize()
    //listener przycisku login
    document.getElementById('login').onclick = async () => {
        const name = document.getElementById('name').value
        const data = await Net.login(name)
        if (data.status === 'OK') {
            Ui.status(name)
            Ui.awaitStart(name)
            getStatus(data.player)
        }
        else if (data.status === 'NAME TAKEN') {
            Ui.status('Już jest taki gracz')
        }
        else if (data.status === 'TOO MANY LOGGED IN') {
            Ui.status('Maksymalna liczba graczy')
        }
    }
    //listener przycisku reset
    document.getElementById('reset').onclick = () => Net.reset()
}

/**
 * Fetchuje status danego gracza z servera co pół sekundy
 */
const getStatus = (player) => {
    setInterval(async () => {
        const data = await Net.status(player)
        if (data.status === 'running') {
            if (!STATE.gaming) {
                Game.start(player)
                Ui.start()
            }
            Ui.timer(data.time)
        }
        //tu robic zmiany w game i ui zależnie od statusu
    }, 500)
}