class Ui {

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

    /**
     * Wyświetla ekran ładowania podczas czekania na zalogowanie sie przeciwnika
     */
    static awaitStart = () => {
        document.getElementById('loginwrap').remove()
        const cover = document.getElementById('cover')
        cover.appendChild(this.loading)
        //tu trzeba jeszcze jakiś napis wyświetlić typu 'oczekiwanie na przeciwnika'
    }

    static start = () => {
        const cover = document.getElementById('cover')
        cover.remove()
    }

}
