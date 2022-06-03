'use strict'

class Fighter extends Model {

    movementTween
    events = []

    constructor(className, name, player, position, rotation) {
        super(className, name, player, position, rotation)
    }

    update(events, rotation, targetPosition, targetPositionTravelTime) {
        this.events.push(...events)
        const timestamp = Date.now()
        for (const e of events.find(a => a.timestamp < timestamp))
            this.handleEvents(e.eventType, e.data)
        this.events.push(events)
        this.rotation.y = rotation
        this.move(targetPosition, targetPositionTravelTime)
    }

    move(targetPosition, targetPositionTravelTime) {
        this?.movementTween.stop()
        this.movementTween = new TWEEN.Tween(this.position)
            .to(targetPosition, targetPositionTravelTime)
            .start()
    }

    handleEvents(event, data) {
        switch (event) {
            case 'attack':
                //animacja ataku
                break
            case 'getAttacked':
                this.handleGetAttacked(data.attackValue)
                break
            case 'death':
                this.die()
                break
        }
    }

    attack() {
        this.playAnimation(this.attackAnimation)
    }

    handleGetAttacked(attackValue) {
        this.hp -= attackValue
    }

    die() {
        this.playAnimation(this.deathAnimation)
    }
}