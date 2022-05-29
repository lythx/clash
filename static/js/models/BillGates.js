'use strict'

class BillGates extends Model {

    name
    player
    modelMixer
    weaponMixer
    ready = false
    attackRange = 4
    tauntClip
    tauntWeaponClip
    runClip
    runWeaponClip
    attackClip
    attackWeaponClip


    constructor(player, name) {
        super()
        this.name = name
        this.player = player
    }

    /**
     * Ładuje modele i tekstury, ustawia bazowe atrybuty modelu, dodaje go do arrayu modeli
     */
    async load() {
        const obj = await this._load('BillGates')
        const model = obj.model
        const weapon = obj.weapon
        this.add(model, weapon)
        this.modelMixer = new THREE.AnimationMixer(model)
        this.weaponMixer = new THREE.AnimationMixer(weapon)
        this.rotation.y = this.player === 1 ? 270 * (Math.PI / 180) : 90 * (Math.PI / 180)
        this.position.y = 13
        this.scale.set(0.4, 0.4, 0.4)
        this.runClip = this.modelMixer.clipAction("run").setLoop(THREE.LoopRepeat)
        this.runWeaponClip = this.weaponMixer.clipAction("run").setLoop(THREE.LoopRepeat)
        this.attackClip = this.modelMixer.clipAction("attack").setLoop(THREE.LoopRepeat)
        this.attackWeaponClip = this.weaponMixer.clipAction("attack").setLoop(THREE.LoopRepeat)
        this.tauntClip = this.modelMixer.clipAction("taunt").setLoop(THREE.LoopRepeat)
        this.tauntWeaponClip = this.weaponMixer.clipAction("taunt").setLoop(THREE.LoopRepeat)
    }

    /**
     * Używane w renderze, update animacji modelu
     */
    animate(delta) {
        this.modelMixer.update(delta)
        this.weaponMixer.update(delta)
    }

    /**
     * Zaznacza model przed postawieniem go
     */
    select() {
        for (const c of this.children) {
            c.material.color.setHex(0x00ff00)
        }
    }

    /**
     * Czeka do timestampa w którym model ma być postawiony (wtedy inne modele zaczynają go widzieć)
     * Odpala animacje taunta i czeka kolejną sekundę po czym model zaczyna się ruszać
     * Timestamp jest ważny, bo gdyby stawiać modele od razu to postawił by się później u przeciwnika 
     * niż u gracza stawiającego i gra by sie zdesynchronizowala i ogólnie wszystko by chuj strzelił
     * Dzięki timestampowi modele stawiają się w takim samym (prawie) momencie dla obu graczy
     */
    async place(timestamp) {
        for (const c of this.children) {
            c.material.color.setHex(0xffa500)
        }
        await new Promise((resolve) => {
            const poll = () => {
                if (Date.now() > timestamp) {
                    resolve()
                    return
                }
                requestAnimationFrame(poll)
            }
            requestAnimationFrame(poll)
        })
        Model.models.push(this)
        this.tauntAnimation()
        for (const c of this.children) {
            c.material.color.setHex(0xffffff)
        }
        await new Promise((resolve) => {
            const poll = () => {
                if (Date.now() > timestamp + 1000) {
                    resolve()
                    return
                }
                requestAnimationFrame(poll)
            }
            requestAnimationFrame(poll)
        })
        this.ready = true
    }

    /**
     * Startuje animację ataku i zatrzymuje TWEENA do ruszania modelu //TODO: Usuwa hp przeciwnika przy ataku i podświetla go na czerwono na chwile
     */
    attack(model) {
        this.tween?.stop()
        this._rotate(model.position)
        this.attackAnimation()
    }

    /**
     * Startuje animację chodzenia i TWEENA do ruszania modelu
     */
    go(location) {
        this.runAnimation()
        this._go(location)
    }

    /**
     * Ustala następny cel modelu zależnie od położenia przeciwników
     */
    async target() {
        if (!this.ready)
            return
        const models = Model.models.filter(a => a.player !== this.player) //Celem może być tylko przeciwnik
        let enemy = null
        let minDistance = null
        //Sprawdzenie czy jakiś przeciwnik jest w zasięgu ataku
        for (const m of models) {
            //wzór na sprawdzenie zasięgu (x2-x1)^2 + (y2-y1)^2 < r^2 (zasięg jest okręgiem)
            const distance = Math.sqrt((m.position.x - this.position.x) * (m.position.x - this.position.x)
                + (m.position.z - this.position.z) * (m.position.z - this.position.z))
            //jeśli przeciwnik jest w zasięgu ataku to dodaje go do arrayu 
            //jeśli znaleziono już jakiegoś przeciwnika ale dystans do nowego przeciwnika jest krótszy to nadpisuje przeciwnika
            if (distance < this.attackRange * this.attackRange && (minDistance > distance || minDistance === null)) {
                enemy = m
                minDistance = distance
            }
        }
        if (enemy !== null) { //jeśli jakiś przeciwnik jest w zasięgu ataku 
            this.attack(enemy) //atakuje go
            return
        }
        //Sprawdzenie czy jakiś przeciwnik jest w zasięgu widzenia (jeśli żaden nie był w zasięgu ataku)
        for (const m of models) {
            const distance = Math.sqrt((m.position.x - this.position.x) * (m.position.x - this.position.x)
                + (m.position.z - this.position.z) * (m.position.z - this.position.z))
            if (distance < 10000 && (minDistance > distance || minDistance === null)) {
                enemy = m
                minDistance = distance
            }
        }
        if (enemy !== null) { //jeśli jakiś przeciwnik jest w zasięgu widzenia 
            this.go({ x: enemy.position.x, z: enemy.position.z }) //idzie w jego kierunku
            return
        }
        //TODO: Jeśli nie ma przeciwników w zasięgu widzenia to powinien iść na bazę
    }

    /**
     * Animacja taunta (odpalana zaraz po postawieniu)
     */
    tauntAnimation() {
        this.attackClip.stop()
        this.attackWeaponClip.stop()
        this.runClip.stop()
        this.runWeaponClip.stop()
        this.tauntClip.play()
        this.tauntWeaponClip.play()
    }

    /**
     * Animacja biegu
     */
    runAnimation() {
        this.tauntClip.stop()
        this.tauntWeaponClip.stop()
        this.attackClip.stop()
        this.attackWeaponClip.stop()
        this.runClip.play()
        this.runWeaponClip.play()
    }

    /**
     * Animacja ataku
     */
    attackAnimation() {
        this.tauntClip.stop()
        this.tauntWeaponClip.stop()
        this.runClip.stop()
        this.runWeaponClip.stop()
        this.attackClip.play()
        this.attackWeaponClip.play()
    }
}
