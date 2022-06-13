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
        document.getElementById('model1').innerHTML = '1 - Billgats'
        document.getElementById('model2').innerHTML = '2 - Bazooka'
        document.getElementById('model3').innerHTML = '3 - Chicken'
        document.getElementById('model4').innerHTML = '4 - DarthVader'
        const rightBottom = document.getElementById('rightbottom')
        rightBottom.style.display = "flex"
    }

    /**
     * Renderuje pasek z fighterami dostępnymi do wyboru na dole
     * @param {string[]} fighters 
     */
    static updateFighterBar = (fighters) => {
        console.log(fighters)
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
        console.log(hp, maxHp)
        console.log(`${maxHp / hp}%`)
        const bar = document.getElementById(player === Game.player ? 'myhp' : 'enemyhp')
        bar.style.width = `${hp / maxHp}%`
    }

}
