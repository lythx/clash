'use strict'

const Fighter = require('../Fighter')
const modelData = require('../modelData').data
const TWEEN = require('@tweenjs/tween.js')

class Bauul extends Fighter {

    /**
     * @param {string} name 
     * @param {number} player 
     * @param {number} x 
     * @param {number} z 
     * @param {number} rotation 
     */
    constructor(name, player, x, z, rotation) {
        const data = modelData.find(a => a.name === 'Bauul') // Stałe dane są ładowane z model data, mp. hp, attack, movementSpeed etc
        super(name, player, { x, y: data.defaultY, z }, data.attack, data.hp, data.movementSpeed, data.attackSpeed, rotation,
            data.attackRange, data.sightRange, data.startTime)
    }

    /**
     * Tu wykonywane są wszystkie obliczenia i wybierany jest cel fightera.
     * Stąd też wołane są funkcje do atakowania poruszania sie i obracania
     * Tego typa obchodzą tylko bazy 
     * @param {Model[]} targets 
     */
    calculateTarget(targets) {
        if (this.dead === true) { // Tu jak jest martwy to go ustawia do usuniecia, bo jak sie usunie od razu jak umrze to dzieją sie dziwne rzeczy
            this.toDelete = true
            return
        }
        TWEEN.update() // Update tweena tuż przed obliczeniami z pozycją
        if (!this.ready) // Jak nie jest ready to nie szuka targeta bo ma nic nie robić
            return
        if (this.player === 1 && this.position.x + this.position.z < this.objectiveTriggers[this.currentObjectiveIndex]) // Sprawdzanie czy osiągnął cel
            this.currentObjectiveIndex++ // Jeśli tak to ustawia kolejny cel
        else if (this.player === 2 && this.position.x + this.position.z > this.objectiveTriggers[this.currentObjectiveIndex]) // Drugi gracz idzie w drugą strone wiec odwrotnie
            this.currentObjectiveIndex++
        let target = null
        let minDistance = null
        //Sprawdzenie czy jakiś przeciwnik jest w zasięgu ataku
        for (const t of targets) {
            if (!t.name.startsWith('Base')) { continue } // Tego typa obchodzą tylko bazy 
            //wzór na sprawdzenie zasięgu sqrt((x2-x1)^2 + (y2-y1)^2) < r (zasięg jest okręgiem)
            const distance = Math.sqrt((t.position.x - this.position.x) * (t.position.x - this.position.x) + (t.position.z - this.position.z) * (t.position.z - this.position.z))
            // Jeśli jakiś przeciwnik jest w zasięgu ataku to zapisuje go w zmiennej
            // Jeśli znaleziono już jakiegoś przeciwnika ale dystans do nowego przeciwnika jest krótszy to nadpisuje przeciwnika
            if (distance < this.attackRange * this.attackRange && (minDistance > distance || minDistance === null)) {
                target = t
                minDistance = distance // Ustawienie najmniejszego znalezionego dystansu
            }
        }
        if (target !== null) { // Jeśli jakiś przeciwnik jest w zasięgu ataku 
            this.rotate({ x: target.position.x, z: target.position.z }) // Obraca sie w jego kierunku
            this.attackEnemy(target, targets) // Atakuje go
            return
        }
        for (const o of this.objectives[this.currentObjectiveIndex]) {
            const distance = Math.sqrt((o.x - this.position.x) * (o.x - this.position.x) + (o.z - this.position.z) * (o.z - this.position.z))
            if (minDistance > distance || minDistance === null) {
                target = o
                minDistance = distance
            }
        }
        this.rotate(target)
        this.move(target)
    }
}

module.exports = Bauul