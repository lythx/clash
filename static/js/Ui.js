import * as NET from './Net.js'

const loading = (() => {
    let l = document.createElement('div')
    l.classList.add('lds-ring')
    l.innerHTML = `<div></div><div></div><div></div><div></div>`
    return l
})()

/**
 * Dodaje listenery na logowanie i resetowanie
 */
const initialize = () => { 
    document.getElementById('login').onclick = () => {
        const data = await NET.login()
        const name = document.getElementById('name')
        if(data.status === 'OK') {
            if(data.player === 1){
                displayStatus(name)
                waitForOpponent()
            }
        }
    }
    document.getElementById('reset').onclick = () => NET.reset()
}

/**
 * Ustawia tekst wyświetlany w lewym górnym rogu ui
 */
 const displayStatus = (str) => {
    document.getElementById('lefttop').innerHTML = str
}

/**
 * Wyświetla ekran ładowania podczas czekania na zalogowanie sie przeciwnika
 */
const waitForOpponent = (player) => {
    document.getElementById('loginwrap').remove()
    let cover = document.getElementById('cover')
    cover.appendChild(loading)
}

export {
    initialize
}


 