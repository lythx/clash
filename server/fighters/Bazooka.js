'use strict'

const Fighter = require('../Fighter')
const modelData = require('../modelData').data
const CFG = require('../serverConfig.js')

class Bazooka extends Fighter {

    attackRadius = 30

    /**
     * @param {string} name 
     * @param {number} player 
     * @param {number} x 
     * @param {number} z 
     * @param {number} rotation 
     */
    constructor(name, player, x, z, rotation) {
        const data = modelData.find(a => a.name === 'Bazooka') // Stałe dane są ładowane z model data, mp. hp, attack, movementSpeed etc
        super(name, player, { x, y: data.defaultY, z }, data.attack, data.hp, data.movementSpeed, data.attackSpeed, rotation,
            data.attackRange, data.sightRange, data.startTime)
    }

    /**
     * Atak obszarowy w kształcie okręgu, dmg spada im dalej jest przeciwnik
     * @param {Model} target - model w który strzelił
     * @param {Model[]} targets - wszystkie przeciwne modele
     * @returns 
     */
    attackEnemy(target, targets) {
        if (this.lastAttackTimestamp + 5000 > Date.now())
            return
        this.lastAttackTimestamp = Date.now()
        this.movementTween?.stop()
        this.rotate(target.position)
        const impact = target.position // Pozycja w którą strzelił
        const hits = [] // Array z trafionymi przeciwnikami
        for (const t of targets) {
            // Wzór na sprawdzenie zasięgu sqrt((x2-x1)^2 + (y2-y1)^2) < r (zasięg jest okręgiem)
            const distance = Math.sqrt((t.position.x - impact.x) * (t.position.x - impact.x) + (t.position.z - impact.z) * (t.position.z - impact.z))
            if (distance < this.attackRadius) {
                // dmg obliczane na podstawie dystansu od wybuchu
                hits.push({ target: t, dmg: this.attack * ((this.attackRadius - distance) / this.attackRadius) })
            }
        }
        // Wysłanie ewentu ze wszystkimi trafionymi przeciwnikami i ich obrażeniami
        this.emitEvent('fighterAttack', { name: this.name, targets: [...hits.map(a => ({ name: a.target.name, dmg: a.dmg }))] }, Date.now() + CFG.SERVER_DELAY)
        for (const e of hits) { // Atak w obliczeniach po stronie serwera
            e.target.handleGetAttacked(e.dmg)
        }
    }

}

module.exports = Bazooka
