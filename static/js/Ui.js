class Ui {

    playerName

    static loading = (() => {
        const l = document.createElement('div')
        l.classList.add('lds-ring')
        l.innerHTML = `<div></div><div></div><div></div><div></div>`
        return l
    })()

    /**
     * Ustawia tekst wyświetlany w lewym górnym rogu ui
     */
    static status = (str) => {
        document.getElementById('lefttop').innerHTML = str
    }

    static timer = (str) => {
        document.getElementById('righttop').innerHTML = str
    }

    /**
     * Wyświetla ekran ładowania podczas czekania na zalogowanie sie przeciwnika
     */
    static awaitStart = (player) => {
        this.playerName = player
        document.getElementById('loginwrap').remove()
        const cover = document.getElementById('cover')
        cover.appendChild(this.loading)
        this.status(`Witaj ${this.playerName}, oczekiwanie na drugiego gracza`)
        //tu trzeba jeszcze jakiś napis wyświetlić typu 'oczekiwanie na przeciwnika'
    }

    static start = (player) => {
        const cover = document.getElementById('cover')
        cover.remove()
        this.status(`Witaj ${this.playerName}, gra rozpoczęta`)
        let bottom = document.getElementById('bottom')
        bottom.style.display = "initial"
    }

}
