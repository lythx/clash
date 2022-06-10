'use strict'

const Fighter = require('../Fighter')
const modelData = require('../modelData').data
const CFG = require('../ServerConfig.js')

class Bazooka extends Fighter {

    attackRadius = 30

    constructor(name, player, x, z, rotation) {
        const data = modelData.find(a => a.name === 'Bazooka')
        super(name, player, { x, y: data.defaultY, z }, data.attack, data.hp, data.movementSpeed, data.attackSpeed, rotation,
            data.attackRange, data.sightRange, data.startTime)
    }

    attackEnemy(target, targets) {
        if (this.lastAttackTimestamp + 5000 > Date.now())
            return
        this.movementTween?.stop()
        this.lastAttackTimestamp = Date.now()
        this.rotate(target.position)
        const impact = target.position
        const hits = []
        for (const t of targets) {
            //wzór na sprawdzenie zasięgu (x2-x1)^2 + (y2-y1)^2 < r^2 (zasięg jest okręgiem)
            const distance = Math.sqrt((t.position.x - impact.x) * (t.position.x - impact.x) + (t.position.z - impact.z) * (t.position.z - impact.z))
            if (distance < this.attackRadius) {
                hits.push({ target: t, attackValue: this.attack * ((this.attackRadius - distance) / this.attackRadius) })
            }
        }
        this.emitEvent('fighterAttack', { name: this.name, targets: [...hits.map(a => ({ name: a.target.name, attackValue: a.attackValue }))] }, Date.now() + CFG.SERVER_DELAY)
        for (const e of hits) {
            e.target.handleGetAttacked(e.attackValue)
        }
    }

}

module.exports = Bazooka
