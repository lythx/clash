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
        const leftBottom = document.getElementById('leftbottom')
        leftBottom.style.display = "flex"
        const rightBottom = document.getElementById('rightbottom')
        rightBottom.style.display = "flex"
    }

    /**
     * Renderuje pasek z fighterami dostępnymi do wyboru na dole
     * @param {string[]} fighters 
     */
    static updateFighterBar = (fighters) => {
        fighters = fighters.map(a => {
            if (a.endsWith('Group')) {
                return a.substring(0, a.length - 5)
            }
            else { return a }
        })
        for (const [i, e] of fighters.entries()) {
            const el = document.getElementById(`model${i + 1}`)
            el.style.backgroundImage = `url(/mats/ikony/${e}.jpg)`
        }
    }

    static endGame = (win) => {
        const cover = document.createElement('div')
        cover.id = 'cover'
        document.body.append(cover)
        cover.innerHTML = 'Zwycięzca'
        if (win) {
            this.status(`Gratulacje ${this.playerName}, zwycięstwo`)
        }
        else {
            this.status(`Niestety ${this.playerName}, porażka`)
        }
    }

    /**
     * Updateuje pasek hp na dole
     * @param {number} hp 
     * @param {number} maxHp 
     * @param {number} player 
     */
    static updateHpBar(hp, maxHp, player) {
        const bar = document.getElementById(player === Game.player ? 'myhp' : 'enemyhp')
        bar.style.width = `${(hp / maxHp) * 100}%`
    }

    /**
     * Oznaczna fightera jako wybranego w pasku na dole
     * @param {number} n 
     */
    static selectFighter(n) {
        this.removeSelection()
        const el = document.getElementById(`model${n}`)
        el.style.border = `2px solid var(--orange)`
    }

    /**
     * Likwiduje oznaczenie fightera
     */
    static removeSelection() {
        for (let i = 1; i <= 4; i++) {
            const el = document.getElementById(`model${i}`)
            el.style.border = `1px solid black`
        }
    }

}
