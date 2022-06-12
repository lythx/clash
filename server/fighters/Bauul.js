//tankowny typek co focusuje wieze imo, tylko ze dalem mu sightrange na 0
//a i tak bije innych gosci po drodze wiec nw o co mu chodzi


const Fighter = require('../Fighter')
const modelData = require('../modelData').data

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

}

module.exports = Bauul