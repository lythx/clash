'use strict'

class Base extends Model {

    player
    attackRange = 4
    hp
    attack

    constructor(player) {
        super()
        this.player = player
    }

    async load() {
        const obj = await this._load('Base' + 1)
        const model = obj.model
        this.hp = obj.hp
        this.attack = obj.attack
        this.add(model)
        this.rotation.y = this.player === 1 ? 270 * (Math.PI / 180) : 90 * (Math.PI / 180)
        this.position.y = 15
        this.scale.set(0.4, 0.4, 0.4)
    }

    attackEnemy(model) {

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
}