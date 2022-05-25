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
    document.getElementById('login').onclick = async () => {
        const name = document.getElementById('name').value
        const data = await NET.login(name)
        if (data.status === 'OK') {
            displayStatus(name)
            waitForOpponent()
            //tu fetchować czy drugi gracz sie zalogował na setintervalu
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
    //tu trzeba jeszcze jakiś napis wyświetlić typu 'oczekiwanie na przeciwnika'
}

export {
    initialize
}
