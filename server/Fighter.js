const TWEEN = require('@tweenjs/tween.js')
const Model = require('./Model.js')
const CFG = require('./serverConfig.js')

class Fighter extends Model {

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
    toDelete = false

    /**
     * @param {string} name 
     * @param {number} player 
     * @param {object} position 
     * @param {number} attack 
     * @param {number} hp 
     * @param {number} movementSpeed 
     * @param {number} attackSpeed 
     * @param {number} rotation 
     * @param {number} attackRange 
     * @param {number} sightRange 
     * @param {number} startTime 
     */
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
            this.objectives = Fighter.p1Objectives // Ustawienie objectiveów
            this.objectiveTriggers = Fighter.p1ObjectiveTriggers // Ustawienie punktów na których objectivy są uznane za osiągnięte
        }
        else {
            this.objectives = Fighter.p2Objectives
            // Fighterzy gracza 2 mają dokładnie odwrotne triggery do objectiveów niż 1
            this.objectiveTriggers = Fighter.p1ObjectiveTriggers.map(a => -a)
        }
        this.emitEvent( // Wysłanie ewentu newFighter
            'newFighter',
            {
                className: this.constructor.name,
                name: this.name, player: this.player,
                position: this.position,
                hp: this.hp,
                rotation: this.rotation
            },
            createDate + CFG.SERVER_DELAY // Data wykonania to data stworzenia + opóźnienie klienta względem serwera
        )
        this.awaitReady(createDate) // Po postawieniu
    }

    get data() {
        return {
            name: this.name,
            position: this.position,
            rotation: this.rotation,
            targetPosition: this.targetPosition
        }
    }

    /**
     * Na początku fighter nie może się ruszać i nie jest widziany przez innych, potem  jest widziany, a na koniec może sie ruszać
     * @param {number} createDate 
     */
    async awaitReady(createDate) {
        await new Promise((resolve) => { // Nie jest widziany przez 300 milisekund
            const poll = () => {
                if (Date.now() > createDate + 300) {
                    resolve()
                    return
                }
                setImmediate(poll)
            }
            setImmediate(poll)
        })
        this.placed = true // Tu zaczyna być widziany
        this.emitEvent('fighterPlaced', { name: this.name }, Date.now() + CFG.SERVER_DELAY) // Wysłanie eventu że jest widziany
        await new Promise((resolve) => { // Tu jeszcze nie może sie ruszyć (długość zależnie od this.startTime)
            const poll = () => {
                if (Date.now() > createDate + 300 + this.startTime) {
                    resolve()
                    return
                }
                setImmediate(poll)
            }
            setImmediate(poll)
        })
        this.ready = true // Teraz może sie ruszyć
        this.emitEvent('fighterRun', { name: this.name }, Date.now() + CFG.SERVER_DELAY) // Wysłanie ewentu że biegnie
    }

    /**
     * Tu dokonywane są wszystkie obliczenia i wybierany jest cel fightera.
     * Stąd też wołane są funkcje do atakowania poruszania sie i obracania
     * @param {object[]} targets 
     * @returns 
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
            this.attackEnemy(target, targets) // Atakuje go
            return
        }
        //Sprawdzenie czy jakiś przeciwnik jest w zasięgu widzenia (jeśli żaden nie był w zasięgu ataku)
        for (const t of targets) {
            // Przeciwnicy mają na siebie nie iść jeśli są na różnych etapach mapy (etapy: twoja połowa, most, połowa przeciwnika)
            // (jeśli są na tym samym to suma indexów objectivów jest równa 2) jest to tak zrobione bo inaczej by szli na siebie przez rzekę
            if (this.currentObjectiveIndex + t.currentObjectiveIndex !== 2)
                continue // Skipuje iteracje loopa jeśli są na różnym etapie
            const distance = Math.sqrt((t.position.x - this.position.x) * (t.position.x - this.position.x) + (t.position.z - this.position.z) * (t.position.z - this.position.z))
            if (distance < this.sightRange && (minDistance > distance || minDistance === null)) {
                target = t
                minDistance = distance
            }
        }
        if (target !== null) { // Jeśli jakiś przeciwnik jest w zasięgu widzenia 
            this.rotate({ x: target.position.x, z: target.position.z }) // Obraca sie w jego kierunku
            this.move({ x: target.position.x, z: target.position.z }) // Idzie w jego kierunku
            return
        }
        // Jeśli nie ma przeciwników w zasięgu widzenia to idzie na główny target (most lub baza)
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
     * Ruch modelu w kierunku danej lokacji w czasie (tween)
     * @param {object} location 
     */
    move(location) {
        // Długość drogi (potrzebna do szybkości animacji)
        const distance = Math.sqrt(((location.x - this.position.x) * (location.x - this.position.x) + (location.z - this.position.z) * (location.z - this.position.z)))
        this.targetPosition = location
        this.movementTween?.stop() // Zatrzymanie poprzednich animacji
        this.movementTween = new TWEEN.Tween(this.position) // Animacja zapisana do zmiennej, żeby potem można było ją przerwać
            .to(location, distance * 75)
            .start()
    }

    /**
     * Atakuje przeciwnika
     * @param {object} target 
     */
    attackEnemy(target) {
        if (this.lastAttackTimestamp + 1000 > Date.now()) // Może atakować tylko co jakiś czas (attack speed)
            return
        this.lastAttackTimestamp = Date.now() // Ustawienie czasu ostatniego ataku
        this.movementTween?.stop() // Nie może sie ruszać podczas atakowania
        target.handleGetAttacked(this.attack) // Odpalenie funkcji na "bycie atakowanym" u przeciwnika
        // Wysłanie ewentu z celami ataku (tutaj zawsze jeden cel i taka sama siła ataku, ale w przypadku obszarowego jest inaczej)
        this.emitEvent('fighterAttack', { name: this.name, targets: [{ target: target.name, attackValue: this.attack }] }, Date.now() + CFG.SERVER_DELAY)
    }

    /**
     * Funkcja na "bycie atakwanym", odejmuje hp i zabija jeśli hp jest ujemne lub 0
     * @param {number} attackValue 
     */
    handleGetAttacked(attackValue) {
        this.hp -= attackValue
        if (this.hp <= 0) {
            this.dead = true
            this.emitEvent('fighterDeath', { name: this.name }, Date.now() + CFG.SERVER_DELAY) // Wysłanie ewentu w przypadku śmierci
        }
    }
}

module.exports = Fighter