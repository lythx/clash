const TWEEN = require('@tweenjs/tween.js')
const Model = require('./Model.js')

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
    lastAttackTimestamp
    targetPosition
    targetPositionTravelTime

    constructor(player, position, attack, hp, movementSpeed, attackSpeed, rotation, attackRange, sightRange, startTime) {
        const createDate = Date.now()
        super(player, position)
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
        this.awaitReady(createDate)
    }

    get data() {
        return {
            id: this.id, player: this.player, position: this.position, maxHp: this.maxHp, hp: this.hp,
            rotation: this.rotation, targetPosition: this.targetPosition, targetPositionTravelTime: this.targetPositionTravelTime,
            currentAnimation: this.currentAnimation, placed: this.placed, ready: this.ready
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
        this.currentAnimation = 'taunt'
        await new Promise((resolve) => {
            const poll = () => {
                if (Date.now() > createDate + this.startTime) {
                    resolve()
                    return
                }
                setImmediate(poll)
            }
            setImmediate(poll)
        })
        this.ready = true
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
            const distance = Math.sqrt((t.x - this.position.x) * (t.x - this.position.x) + (t.z - this.position.z) * (t.z - this.position.z))
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
            const distance = Math.sqrt((t.x - this.position.x) * (t.x - this.position.x) + (t.z - this.position.z) * (t.z - this.position.z))
            if (distance < this.sightRange && (minDistance > distance || minDistance === null)) {
                target = m
                minDistance = distance
            }
        }
        if (target !== null) { //jeśli jakiś przeciwnik jest w zasięgu widzenia 
            this.rotate({ x: target.x, z: target.z })
            this.move({ x: target.x, z: target.z }) //idzie w jego kierunku
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

    penis
    /**
     * Obraca i przesuwa model do danej lokacji
     */
    move(location) {
        if (this.penis) {
            return
        }
        this.penis = true
        //długość drogi (potrzebna do szybkości animacji)
        const distance = Math.sqrt(((location.x - this.position.x) * (location.x - this.position.x) + (location.z - this.position.z) * (location.z - this.position.z)))
        this.movementTween?.stop() //zatrzymanie poprzednich animacji
        this.movementTween = new TWEEN.Tween(this.position) //animacja
            .to(location, distance * this.movementSpeed)
            .start()
    }

}

module.exports = Fighter