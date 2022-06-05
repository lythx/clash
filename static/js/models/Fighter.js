'use strict'

class Fighter extends Model {

    cost
    maxHp
    hp
    attack
    attackSpeed
    startTime
    clips
    movementTween
    modelMixer
    weaponMixer

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
            attack: [this.modelMixer.clipAction(attackAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(attackAnimation).setLoop(THREE.LoopRepeat)],
            run: [this.modelMixer.clipAction(runAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(runAnimation).setLoop(THREE.LoopRepeat)],
            taunt: [this.modelMixer.clipAction(tauntAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(tauntAnimation).setLoop(THREE.LoopRepeat)],
            death: [this.modelMixer.clipAction(deathAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(deathAnimation).setLoop(THREE.LoopRepeat)]
        }
    }

    update(data) {
        this.rotation.y = data.rotation
        if (data.targetPosition !== undefined && data.targetPositionTravelTime !== undefined)
            this.move(data.targetPosition, data.targetPositionTravelTime)
    }

    move(targetPosition, targetPositionTravelTime) {
        this.movementTween?.stop()
        this.movementTween = new TWEEN.Tween(this.position)
            .to(targetPosition, targetPositionTravelTime)
            .start()
    }

    animate(delta) {
        this.modelMixer.update(delta)
        this.weaponMixer.update(delta)
    }

    // handleEvents(event, data) {
    //     switch (event) {
    //         case 'attack':
    //             //animacja ataku
    //             break
    //         case 'getAttacked':
    //             this.handleGetAttacked(data.attackValue)
    //             break
    //         case 'death':
    //             this.die()
    //             break
    //     }
    // }

    // attackAnimation() {
    //     this.playAnimation(this.attackAnimation)
    // }

    // handleGetAttacked(attackValue) {
    //     this.hp -= attackValue
    // }

    // die() {
    //     this.playAnimation(this.deathAnimation)
    // }
}