const TWEEN = require('@tweenjs/tween.js')
const Model = require('./Model.js')
const CFG = require('./ServerConfig.js')

class Fighter extends Model {

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
    static p1ObjectiveTriggers = [31, -29]

    attack
    maxHp
    hp
    movementSpeed
    attackSpeed
    rotation
    attackRange
    sightRange
    startTime
    objectives
    objectiveTriggers
    currentObjectiveIndex = 0
    placed = false
    ready = false
    movementTween
    lastAttackTimestamp = 0
    targetPosition
    targetPositionTravelTime
    dead = false

    constructor(name, player, position, attack, hp, movementSpeed, attackSpeed, rotation, attackRange, sightRange, startTime) {
        const createDate = Date.now()
        super(name, player, position, rotation)
        this.attack = attack
        this.maxHp = hp
        this.hp = hp
        this.movementSpeed = movementSpeed
        this.attackSpeed = attackSpeed
        this.rotation = rotation
        this.attackRange = attackRange
        this.sightRange = sightRange
        this.startTime = startTime
        if (player === 1) {
            this.objectives = Fighter.p1Objectives
            this.objectiveTriggers = Fighter.p1ObjectiveTriggers
        }
        else {
            this.objectives = Fighter.p2Objectives
            this.objectiveTriggers = Fighter.p1ObjectiveTriggers.map(a => -a)
        }
        this.emitEvent(
            'newFighter',
            {
                className: this.constructor.name,
                name: this.name, player: this.player,
                position: this.position,
                hp: this.hp,
                rotation: this.rotation
            },
            createDate + CFG.SERVER_DELAY
        )
        this.awaitReady(createDate)
    }

    get data() {
        return {
            name: this.name,
            position: this.position,
            rotation: this.rotation,
            targetPosition: this.targetPosition
        }
    }

    async awaitReady(createDate) {
        await new Promise((resolve) => {
            const poll = () => {
                if (Date.now() > createDate + 300) {
                    resolve()
                    return
                }
                setImmediate(poll)
            }
            setImmediate(poll)
        })
        this.placed = true
        this.emitEvent('fighterPlaced', { name: this.name }, Date.now() + CFG.SERVER_DELAY)
        await new Promise((resolve) => {
            const poll = () => {
                if (Date.now() > createDate + 300 + this.startTime) {
                    resolve()
                    return
                }
                setImmediate(poll)
            }
            setImmediate(poll)
        })
        this.ready = true
        this.emitEvent('fighterRun', { name: this.name }, Date.now() + CFG.SERVER_DELAY)
    }

    calculateTarget(targets) {
        TWEEN.update()
        if (!this.ready)
            return
        if (this.player === 1 && this.position.x + this.position.z < this.objectiveTriggers[this.currentObjectiveIndex])
            this.currentObjectiveIndex++
        else if (this.player === 2 && this.position.x + this.position.z > this.objectiveTriggers[this.currentObjectiveIndex])
            this.currentObjectiveIndex++
        let target = null
        let minDistance = null
        //Sprawdzenie czy jakiś przeciwnik jest w zasięgu ataku
        for (const t of targets) {
            //wzór na sprawdzenie zasięgu (x2-x1)^2 + (y2-y1)^2 < r^2 (zasięg jest okręgiem)
            const distance = Math.sqrt((t.position.x - this.position.x) * (t.position.x - this.position.x) + (t.position.z - this.position.z) * (t.position.z - this.position.z))
            //jeśli przeciwnik jest w zasięgu ataku to dodaje go do arrayu 
            //jeśli znaleziono już jakiegoś przeciwnika ale dystans do nowego przeciwnika jest krótszy to nadpisuje przeciwnika
            if (distance < this.attackRange * this.attackRange && (minDistance > distance || minDistance === null)) {
                target = t
                minDistance = distance
            }
        }
        if (target !== null) { //jeśli jakiś przeciwnik jest w zasięgu ataku 
            this.attackEnemy(target) //atakuje go
            return
        }
        //Sprawdzenie czy jakiś przeciwnik jest w zasięgu widzenia (jeśli żaden nie był w zasięgu ataku)
        for (const t of targets) {
            if (this.currentObjectiveIndex + t.currentObjectiveIndex !== 2)
                continue
            const distance = Math.sqrt((t.position.x - this.position.x) * (t.position.x - this.position.x) + (t.position.z - this.position.z) * (t.position.z - this.position.z))
            if (distance < this.sightRange && (minDistance > distance || minDistance === null)) {
                target = t
                minDistance = distance
            }
        }
        if (target !== null) { //jeśli jakiś przeciwnik jest w zasięgu widzenia 
            this.rotate({ x: target.position.x, z: target.position.z })
            this.move({ x: target.position.x, z: target.position.z }) //idzie w jego kierunku
            return
        }
        //Jeśli nie ma przeciwników w zasięgu widzenia to idzie na główny target (most lub baza)
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


    /**
     * Ustawia rotation w kierunku danej lokacji
     */
    rotate(location) {
        //kąt obrotu
        let targetAngle = Math.atan2(location.z - this.position.z, -(location.x - this.position.x)) + (2 * Math.PI)
        if (targetAngle >= 2 * Math.PI) //układ współrzędnych jest tu jakoś dziwnie ustawiony, więc trzeba tak zrobić
            targetAngle -= 2 * Math.PI
        this.rotation = targetAngle
    }

    /**
     * Obraca i przesuwa model do danej lokacji
     */
    move(location) {
        //długość drogi (potrzebna do szybkości animacji)
        const distance = Math.sqrt(((location.x - this.position.x) * (location.x - this.position.x) + (location.z - this.position.z) * (location.z - this.position.z)))
        this.targetPosition = location
        this.movementTween?.stop() //zatrzymanie poprzednich animacji
        this.movementTween = new TWEEN.Tween(this.position) //animacja
            .to(location, distance * 75)
            .start()
    }

    attackEnemy(target) {
        if (this.lastAttackTimestamp + 1000 > Date.now())
            return
        this.movementTween?.stop()
        this.lastAttackTimestamp = Date.now()
        target.handleGetAttacked(this.attack)
        this.currentAnimation = 'none'
        this.emitEvent('fighterAttack', { name: this.name, target: target.name }, Date.now() + CFG.SERVER_DELAY)
    }

    handleGetAttacked(attackValue) {
        this.hp -= attackValue
        if (this.hp <= 0) {
            this.dead = true
            this.emitEvent('fighterDeath', { name: this.name }, Date.now() + CFG.SERVER_DELAY)
        }
    }
}

module.exports = Fighter