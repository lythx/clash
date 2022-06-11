'use strict'

class Base extends Model {

    player
    attackRange = 4
    hp
    attack
    rotationOffset

    /**
     * @param {number} player 
     */
    constructor(player) {
        const obj = Model.materials.find(a => a.name === 'Base' + player)
        super('Base' + player, player, player === 1 ? { x: 125, y: 5, z: 125 } : { x: -125, y: 5, z: -125 }, 0)
        this.hp = obj.hp
        this.attack = obj.attack
        this.scale.set(obj.scale, obj.scale, obj.scale)
        this.maxHp = obj.hp
        this.attackSpeed = obj.attackSpeed
        this.attackRange = obj.attackRange
        const geometry = new THREE.CylinderGeometry(obj.cylinderRadius, obj.cylinderRadius, obj.cylinderHeight, 30)
        const material = new THREE.MeshBasicMaterial({ color: Number(obj.cylinderColor) })
        //model
        const modelMaterial = new THREE.MeshBasicMaterial(
            {
                map: this.textureLoader.load(obj.modelMap),
                morphTargets: true //to jest potrzebne do animacji
            });
        //broń
        const weaponMaterial = new THREE.MeshBasicMaterial(
            {
                map: this.textureLoader.load(obj.weaponMap),
                morphTargets: true //to jest potrzebne do animacji
            });
        const model = new THREE.Mesh(obj.modelGeometry, modelMaterial)
        const weapon = new THREE.Mesh(obj.weaponGeometry, weaponMaterial)
        model.position.y = obj.defaultY
        weapon.position.y = obj.defaultY
        this.rotationOffset = obj.rotationOffset
        model.rotation.y += obj.rotationOffset
        weapon.rotation.y += obj.rotationOffset
        model.position.x += obj.xOffset
        weapon.position.z += obj.zOffset
        model.position.x += obj.xOffset
        weapon.position.z += obj.zOffset
        this.add(model, weapon, new THREE.Mesh(geometry, material))
        this.modelMixer = new THREE.AnimationMixer(model)
        this.weaponMixer = new THREE.AnimationMixer(weapon)
        this.createClips(obj.attackAnimation, obj.tauntAnimation, obj.deathAnimation)
    }

    /**
     * Ładuje animacje modelu
     */
    createClips() {
        this.clips = {
            attack: [this.modelMixer.clipAction("attak").setLoop(THREE.LoopOnce), this.weaponMixer.clipAction("attack").setLoop(THREE.LoopOnce)],
            taunt: [this.modelMixer.clipAction("taunt").setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction("taunt").setLoop(THREE.LoopRepeat)],
            death: [this.modelMixer.clipAction("crdeath").setLoop(THREE.LoopOnce)]
        }
    }

    update(position, rotation) {
        this.children[0].rotation.y = rotation + this.rotationOffset
        this.children[1].rotation.y = rotation + this.rotationOffset
    }

    /**
     * Updateuje animacje modelu
     * @param {number} delta 
     */
    animate(delta) {
        this.modelMixer.update(delta)
        this.weaponMixer.update(delta)
    }

    async target() {
        const models = Model.models.filter(a => a.player !== this.player) //Celem może być tylko przeciwnik
        let target = null
        let minDistance = null
        //Sprawdzenie czy jakiś przeciwnik jest w zasięgu ataku
        for (const m of models) {
            //wzór na sprawdzenie zasięgu (x2-x1)^2 + (y2-y1)^2 < r^2 (zasięg jest okręgiem)
            const distance = Math.sqrt((m.position.x - this.position.x) * (m.position.x - this.position.x)
                + (m.position.z - this.position.z) * (m.position.z - this.position.z))
            //jeśli przeciwnik jest w zasięgu ataku to dodaje go do arrayu 
            //jeśli znaleziono już jakiegoś przeciwnika ale dystans do nowego przeciwnika jest krótszy to nadpisuje przeciwnika
            if (distance < this.attackRange * this.attackRange && (minDistance > distance || minDistance === null)) {
                target = m
                minDistance = distance
            }
        }
        if (target !== null) { //jeśli jakiś przeciwnik jest w zasięgu ataku 
            this.attackEnemy(target) //atakuje go
            return
        }
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

    // Animacje
    tauntAnimation() {
        this.stopAnimations()
        for (const e of this.clips.taunt) { e.play() }
    }

    attackAnimation() {
        this.stopAnimations()
        for (const e of this.clips.attack) { e.play() }
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

    /**
     * Ustawia kolor wszystkim elementom obiektu
     * @param {number} hex 
     */
    setColor(hex) {
        this.children[0].material.color.setHex(hex)
        this.children[1].material.color.setHex(hex)
    }

}