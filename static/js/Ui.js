'use strict'

class Ui {

    static playerName

    static loading = (() => {
        const l = document.createElement('div')
        l.classList.add('lds-ring')
        l.innerHTML = `<div></div><div></div><div></div><div></div>`
        return l
    })()

    /**
     * Ustawia tekst wyświetlany w lewym górnym rogu ui
     * @param {string} str
     */
    static status = (str) => {
        document.getElementById('lefttop').innerHTML = str
    }

    /**
     * Ustawia number wyświetlony na timerze
     * @param {number} n
     */
    static timer = (n) => {
        document.getElementById('righttop').innerHTML = Number(n)
    }

    /**
     * Wyświetla ekran ładowania podczas czekania na zalogowanie sie przeciwnika
     * @param {string} player
     */
    static awaitStart = (playerName) => {
        this.playerName = playerName
        document.getElementById('loginwrap').remove()
        const cover = document.getElementById('cover')
        cover.appendChild(this.loading)
        this.status(`Witaj ${this.playerName}, oczekiwanie na drugiego gracza`)
        //tu trzeba jeszcze jakiś napis wyświetlić typu 'oczekiwanie na przeciwnika'
    }

    /**
     * Zmiania status i tworzy dolny pasek UI
     */
    static start = () => {
        const cover = document.getElementById('cover')
        cover.remove()
        this.status(`Witaj ${this.playerName}, gra rozpoczęta`)
        let bottom = document.getElementById('bottom')
        bottom.style.display = "initial"
        document.getElementById('model1').innerHTML = '1 - Billgats'
        document.getElementById('model2').innerHTML = '2 - Bazooka'
        document.getElementById('model3').innerHTML = '3 - Chicken'
        document.getElementById('model4').innerHTML = '4 - DarthVader'
    }

}
