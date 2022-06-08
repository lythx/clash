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

    createClips(attackAnimation, runAnimation, tauntAnimation, deathAnimation) {
        this.clips = {
            attack: [this.modelMixer.clipAction(attackAnimation).setLoop(THREE.LoopOnce), this.weaponMixer.clipAction(attackAnimation).setLoop(THREE.LoopOnce)],
            run: [this.modelMixer.clipAction(runAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(runAnimation).setLoop(THREE.LoopRepeat)],
            taunt: [this.modelMixer.clipAction(tauntAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(tauntAnimation).setLoop(THREE.LoopRepeat)],
            death: [this.modelMixer.clipAction(deathAnimation).setLoop(THREE.LoopOnce), this.weaponMixer.clipAction(deathAnimation).setLoop(THREE.LoopOnce)]
        }
    }

    update(position, targetPosition, rotation) {
        this.rotation.y = rotation
        // if (position.x - this.position.x > Fighter.positionOffset || position.y - this.position.y > Fighter.positionOffset || position.z - this.position.z > Fighter.positionOffset)
        this.position.set(position.x, position.y, position.z)
        // if (data.targetPosition !== undefined)
        //     this.move(targetPosition)
    }

    move(targetPosition) {
        const distance = Math.sqrt(((targetPosition.x - this.position.x) * (targetPosition.x - this.position.x) + (targetPosition.z - this.position.z) * (targetPosition.z - this.position.z)))
        this.movementTween?.stop()
        this.movementTween = new TWEEN.Tween(this.position)
            .to(targetPosition, distance * 75)
            .start()
    }

    animate(delta) {
        this.modelMixer.update(delta)
        this.weaponMixer.update(delta)
    }

    async handleAttack(target) {
        this.attackAnimation()
        await new Promise((resolve) => setTimeout(resolve, this.attackAnimationDelay))
        target.handleGetAttacked(this.attack)
    }

    async handleGetAttacked(attackStrength) {
        this.hp -= attackStrength
        this.setColor(0xff0000)
        if (this.hp <= 0) { return }
        await new Promise((resolve) => setTimeout(resolve, 200))
        this.setColor(0xffffff)
    }

    die() {
        this.setColor(0xff0000)
        this.deathAnimation()
    }

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

    stopAnimations() {
        for (const key in this.clips) {
            for (const e of this.clips[key]) {
                e.stop()
            }
        }
    }

}