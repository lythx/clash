'use strict'

class Fighter extends Model {

    static positionOffset = 10

    cost
    maxHp
    hp
    attack
    attackSpeed
    startTime
    clips
    movementTween
    modelMixer
    movementSpeed = 100
    attackAnimationDelay = 200
    weaponMixer
    dead = false

    /**
     * @param {string} name 
     * @param {number} player 
     * @param {object} position 
     * @param {number} rotation 
     * @param {number} cost 
     * @param {number} maxHp 
     * @param {number} attack 
     * @param {number} attackSpeed 
     * @param {number} startTime 
     * @param {number} scale 
     * @param {string} modelGeometry 
     * @param {string} modelMap 
     * @param {string} weaponGeometry 
     * @param {string} weaponMap 
     */
    constructor(name, player, position, rotation, cost, maxHp, attack, attackSpeed, startTime, scale, modelGeometry, modelMap, weaponGeometry, weaponMap) {
        super(name, player, position, rotation, modelGeometry, modelMap, weaponGeometry, weaponMap)
        this.cost = cost
        this.maxHp = maxHp
        this.hp = maxHp
        this.attack = attack
        this.attackSpeed = attackSpeed
        this.startTime = startTime
        this.scale.set(scale, scale, scale)
        //model
        const modelMaterial = new THREE.MeshBasicMaterial(
            {
                map: this.textureLoader.load(modelMap),
                morphTargets: true //to jest potrzebne do animacji
            });
        //broń
        const weaponMaterial = new THREE.MeshBasicMaterial(
            {
                map: this.textureLoader.load(weaponMap),
                morphTargets: true //to jest potrzebne do animacji
            });
        const model = new THREE.Mesh(modelGeometry, modelMaterial)
        const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial)
        this.add(model, weapon)
        this.modelMixer = new THREE.AnimationMixer(model)
        this.weaponMixer = new THREE.AnimationMixer(weapon)
    }

    /**
     * Ładuje animacje modelu
     * @param {string} attackAnimation 
     * @param {string} runAnimation 
     * @param {string} tauntAnimation 
     * @param {string} deathAnimation 
     */
    createClips(attackAnimation, runAnimation, tauntAnimation, deathAnimation) {
        this.clips = {
            attack: [this.modelMixer.clipAction(attackAnimation).setLoop(THREE.LoopOnce), this.weaponMixer.clipAction(attackAnimation).setLoop(THREE.LoopOnce)],
            run: [this.modelMixer.clipAction(runAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(runAnimation).setLoop(THREE.LoopRepeat)],
            taunt: [this.modelMixer.clipAction(tauntAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(tauntAnimation).setLoop(THREE.LoopRepeat)],
            death: [this.modelMixer.clipAction(deathAnimation).setLoop(THREE.LoopOnce), this.weaponMixer.clipAction(deathAnimation).setLoop(THREE.LoopOnce)]
        }
    }

    /**
     * Przesuwa model do danej pozycji i obraca go w danym kierunku
     * @param {object} position 
     * @param {number} rotation 
     */
    update(position, rotation) {
        this.rotation.y = rotation
        this.position.set(position.x, position.y, position.z)
    }

    /**
     * Używane podczas stawiania fighterów, przy false zmienia kolor modelu na czerwony, a true na zielony
     * @param {boolean} canPlace 
     */
    setCanPlace(canPlace) {
        this.canPlace = canPlace
        if (canPlace)
            for (const c of this.children) {
                c.material.color.setHex(0x00ff00)
            }
        else
            for (const c of this.children) {
                c.material.color.setHex(0xff0000)
            }
    }

    /**
     * Updateuje animacje modelu
     * @param {number} delta 
     */
    animate(delta) {
        this.modelMixer.update(delta)
        this.weaponMixer.update(delta)
    }

    /**
     * Atakuje przeciwnika
     * @param {Model} target 
     * @param {number} dmg 
     */
    async handleAttack(target, dmg) {
        this.attackAnimation()
        // Opóźnienie dmga żeby zgrał sie z animacją ataku
        await new Promise((resolve) => setTimeout(resolve, this.attackAnimationDelay))
        target.handleGetAttacked(dmg)
    }

    /**
     * Bycie atakowanym 
     * @param {number} dmg 
     */
    async handleGetAttacked(dmg) {
        this.hp -= dmg
        this.setColor(0xff0000) // Ustawienie koloru na czerwony
        if (this.hp <= 0) { return } // Jeśli umarł to pozostaje czerwony
        await new Promise((resolve) => setTimeout(resolve, 500)) // Jeśli nie to po pol sekundy znowu normalny
        this.setColor(0xffffff)
    }

    /**
     * Ustawia kolor na czerwony i odpala animacje śmierci
     */
    die() {
        this.setColor(0xff0000)
        this.deathAnimation()
    }

    // Animacje
    tauntAnimation() {
        this.stopAnimations()
        for (const e of this.clips.taunt) { e.play() }
    }

    attackAnimation() {
        this.stopAnimations()
        for (const e of this.clips.attack) { e.play() }
    }

    runAnimation() {
        this.stopAnimations()
        for (const e of this.clips.run) { e.play() }
    }

    deathAnimation() {
        this.stopAnimations()
        for (const e of this.clips.death) { e.play() }
    }

    /**
     * Zatrzymanie wszystkich animacji
     */
    stopAnimations() {
        for (const key in this.clips) {
            for (const e of this.clips[key]) {
                e.stop()
            }
        }
    }

}