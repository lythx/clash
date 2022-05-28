'use strict'

window.onload = () => {
    //generowanie sceny i planszy
    Game.initialize()
    //ustawienie listenerów socketa
    Net.initialize()
    //listener przycisku login
    document.getElementById('login').onclick = async () => {
        const name = document.getElementById('name').value
        await Net.login(name)
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