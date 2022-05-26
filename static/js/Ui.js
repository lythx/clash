const loading = (() => {
    let l = document.createElement('div')
    l.classList.add('lds-ring')
    l.innerHTML = `<div></div><div></div><div></div><div></div>`
    return l
})()

/**
 * Ustawia tekst wyświetlany w lewym górnym rogu ui
 */
const status = (str) => {
    document.getElementById('lefttop').innerHTML = str
}

/**
 * Wyświetla ekran ładowania podczas czekania na zalogowanie sie przeciwnika
 */
const awaitGameStart = (player) => {
    document.getElementById('loginwrap').remove()
    let cover = document.getElementById('cover')
    cover.appendChild(loading)
    //tu trzeba jeszcze jakiś napis wyświetlić typu 'oczekiwanie na przeciwnika'
}

const start = () => {
    let cover = document.getElementById('cover')
    cover.remove()
}

export {
    status,
    awaitGameStart,
    start
}
