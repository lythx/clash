'use strict'

const Fighter = require('../Fighter')
const modelData = require('../modelData').data
const CFG = require('../ServerConfig.js')

class Chicken extends Fighter {

    /**
     * @param {string} name 
     * @param {number} player 
     * @param {number} x 
     * @param {number} z 
     * @param {number} rotation 
     */
    constructor(name, player, x, z, rotation) {
        const data = modelData.find(a => a.name === 'Chicken') // Stałe dane są ładowane z model data, mp. hp, attack, movementSpeed etc
        super(name, player, { x, y: data.defaultY, z }, data.attack, data.hp, data.movementSpeed, data.attackSpeed, rotation,
            data.attackRange, data.sightRange, data.startTime)
    }

    attackEnemy(target) {
        this.movementTween?.stop() // Nie może sie ruszać podczas atakowania
        target.handleGetAttacked(this.attack) // Odpalenie funkcji na "bycie atakowanym" u przeciwnika
        // Wysłanie ewentu z celami ataku (tutaj zawsze jeden cel i taka sama siła ataku, ale w przypadku obszarowego jest inaczej)
        this.emitEvent('fighterAttack', { name: this.name, targets: [{ name: target.name, dmg: this.attack }] }, Date.now() + CFG.SERVER_DELAY)
        this.handleGetAttacked(10000000)
    }

}

module.exports = Chicken