'use strict'

const TWEEN = require('@tweenjs/tween.js')
const Model = require('./Model.js')
const CFG = require('./ServerConfig.js')
const modelData = require('./modelData').data

class Base extends Model {

    // Główne cele w grze
    static p1Objectives = [
        [   //wejście na most
            { x: -100, z: 130 }, //lewy most
            { x: 15, z: 15 }, //środkowy most
            { x: 130, z: -100 } //prawy most
        ],
        [   //wyjście z mostu 
            { x: -130, z: 100 }, //lewy most
            { x: -15, z: -15 }, //środkowy most
            { x: 100, z: -130 } //prawy most
        ],
        [{ x: -125, z: -125 }] //baza
    ]
    static p2Objectives = [
        [   //wejście na most
            { x: -130, z: 100 }, //lewy most
            { x: -15, z: -15 }, //środkowy most
            { x: 100, z: -130 } //prawy most
        ],
        [   //wyjście z mostu 
            { x: -95, z: 130 }, //lewy most
            { x: 15, z: 15 }, //środkowy most
            { x: 130, z: -100 } //prawy most
        ],
        [{ x: 125, z: 125 }] //baza
    ]
    // Koordynaty na których cel zostaje uznany za osiągnięty (x+z)
    static p1ObjectiveTriggers = [31, -29]

    attack
    maxHp
    hp
    attackSpeed
    attackRange
    lastAttackTimestamp = 0

    /**
     * @param {number} player 
     * @param {object} position 
     * @param {number} rotation 
     * @param {number} attack 
     * @param {number} hp 
     * @param {number} attackSpeed 
     * @param {number} attackRange 
     */
    constructor(player) {
        const data = modelData.find(a => a.name === 'Base' + player) // Stałe dane są ładowane z model data, np. hp, attack, movementSpeed etc
        super('Base' + player, player, player === 1 ? { x: 125, y: 15, z: 125 } : { x: -125, y: 15, z: -125 }, player === 1 ? 1.75 * Math.PI : 0.75 * Math.PI)
        this.attack = data.attack
        this.maxHp = data.hp
        this.hp = data.hp
        this.attackSpeed = data.attackSpeed
        this.attackRange = data.attackRange
    }

    get data() {
        return {
            name: this.name,
            rotation: this.rotation
        }
    }

    /**
     * Tu wykonywane są wszystkie obliczenia i wybierany jest cel fightera.
     * Stąd też wołane są funkcje do atakowania poruszania sie i obracania
     * @param {Model[]} targets 
     * @returns 
     */
    calculateTarget(targets) {
        TWEEN.update() // Update tweena tuż przed obliczeniami z pozycją
        let target = null
        let minDistance = null
        //Sprawdzenie czy jakiś przeciwnik jest w zasięgu ataku
        for (const t of targets) {
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
        }
    }


    /**
     * Obraca w kierunku danej lokacji
     * @param {object} location 
     */
    rotate(location) {
        //kąt obrotu
        let targetAngle = Math.atan2(location.z - this.position.z, -(location.x - this.position.x)) + (2 * Math.PI)
        if (targetAngle >= 2 * Math.PI) //układ współrzędnych jest tu jakoś dziwnie ustawiony, więc trzeba tak zrobić
            targetAngle -= 2 * Math.PI
        this.rotation = targetAngle
    }

    /**
     * Atakuje przeciwnika
     * @param {Model} target 
     */
    attackEnemy(target) {
        if (this.lastAttackTimestamp + 1000 > Date.now()) // Może atakować tylko co jakiś czas (attack speed)
            return
        this.lastAttackTimestamp = Date.now() // Ustawienie czasu ostatniego ataku
        target.handleGetAttacked(this.attack) // Odpalenie funkcji na "bycie atakowanym" u przeciwnika
        // Wysłanie ewentu z celami ataku (tutaj zawsze jeden cel i taka sama siła ataku, ale w przypadku obszarowego jest inaczej)
        this.emitEvent('fighterAttack', { name: this.name, targets: [{ name: target.name, dmg: this.attack }] }, Date.now() + CFG.SERVER_DELAY)
    }

    /**
     * Funkcja na "bycie atakwanym", odejmuje hp i zabija jeśli hp jest ujemne lub 0
     * @param {number} dmg 
     */
    handleGetAttacked(dmg) {
        this.hp -= dmg
        if (this.hp <= 0) {
            this.emitEvent('endGame', { loser: this.player }, Date.now() + CFG.SERVER_DELAY) // Wysłanie ewentu w przypadku śmierci
        }
    }
}

module.exports = Base