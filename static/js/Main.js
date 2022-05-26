import * as GAME from './Game.js'
import * as UI from './Ui.js'
import * as NET from './Net.js'

window.onload = () => {
    //generowanie sceny i planszy
    GAME.initialize()
    //listener przycisku login
    document.getElementById('login').onclick = async () => {
        const name = document.getElementById('name').value
        const data = await NET.login(name)
        if (data.status === 'OK') {
            UI.status(name)
            UI.awaitGameStart()
            getStatus(data.player)
        }
    }
    //listener przycisku reset
    document.getElementById('reset').onclick = () => NET.reset()
}

/**
 * Fetchuje status danego gracza z servera co pół sekundy
 */
const getStatus = (player) => {
    setInterval(async () => {
        const data = await NET.status(player)
        //tu robic zmiany w game i ui zależnie od statusu
    }, 500)
}