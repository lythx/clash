'use strict'

const Fighter = require('../Fighter')
const modelData = require('../modelData').data

class Skeleton extends Fighter {

    /**
     * @param {string} name 
     * @param {number} player 
     * @param {number} x 
     * @param {number} z 
     * @param {number} rotation 
     */
    constructor(name, player, x, z, rotation) {
        const data = modelData.find(a => a.name === 'Skeleton') // Stałe dane są ładowane z model data, mp. hp, attack, movementSpeed etc
        super(name, player, { x, y: data.defaultY, z }, data.attack, data.hp, data.movementSpeed, data.attackSpeed, rotation,
            data.attackRange, data.sightRange, data.startTime)
    }

}

module.exports = Skeleton
