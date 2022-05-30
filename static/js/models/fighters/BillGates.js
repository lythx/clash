'use strict'

class BillGates extends Fighter {

    name
    player
    modelMixer
    weaponMixer
    ready = false
    attackRange = 4
    sightRange = 80
    tauntClip
    tauntWeaponClip
    runClip
    runWeaponClip
    attackClip
    attackWeaponClip
    targets
    currentTarget = 0
    milestones
    hp
    attack
    cost
    canPlace
    canAttack = true
    dead = false

    constructor(player, name) {
        super()
        this.name = name
        this.player = player
        this.targets = player === 1 ? Fighter.p1Targets : Fighter.p2Targets
        this.milestones = player === 1 ? Fighter.milestones : Fighter.milestones.map(a => -a)
    }

    /**
     * Ładuje modele i tekstury, ustawia bazowe atrybuty modelu, dodaje go do arrayu modeli
     */
    async load() {
        const obj = await this._load('BillGates')
        const model = obj.model
        const weapon = obj.weapon
        this.hp = obj.hp
        this.attack = obj.attack
        this.cost = obj.cost
        this.add(model, weapon)
        this.modelMixer = new THREE.AnimationMixer(model)
        this.weaponMixer = new THREE.AnimationMixer(weapon)
        this.rotation.y = this.player === 1 ? 270 * (Math.PI / 180) : 90 * (Math.PI / 180)
        this.position.y = 15
        this.scale.set(0.4, 0.4, 0.4)
        this.runClip = this.modelMixer.clipAction("run").setLoop(THREE.LoopRepeat)
        this.runWeaponClip = this.weaponMixer.clipAction("run").setLoop(THREE.LoopRepeat)
        this.attackClip = this.modelMixer.clipAction("attack").setLoop(THREE.LoopRepeat)
        this.attackWeaponClip = this.weaponMixer.clipAction("attack").setLoop(THREE.LoopRepeat)
        this.tauntClip = this.modelMixer.clipAction("taunt").setLoop(THREE.LoopRepeat)
        this.tauntWeaponClip = this.weaponMixer.clipAction("taunt").setLoop(THREE.LoopRepeat)
        this.deathClip = this.modelMixer.clipAction("crdeath").setLoop(THREE.LoopOnce)
    }

    /**
     * Używane w renderze, update animacji modelu
     */
    animate(delta) {
        if (this.dead)
            Model.models.splice(Model.models.indexOf(this), 1)
        this.modelMixer.update(delta)
        this.weaponMixer.update(delta)
    }

    /**
     * Zaznacza model przed postawieniem go
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
     * Startuje animację ataku i zatrzymuje TWEENA do ruszania modelu odpala funkcje na zabieranie hp przeciwnikowi
     */
    async attackEnemy(model) {
        if (!this.canAttack) //jeśli pomiędzy atakami nie minął ustalony czas to return
            return
        this.canAttack = false
        this.tween?.stop() //zatrzymanie poruszania sie
        this._rotate(model.position) //skierowanie modelu na przeciwnika
        this.attackAnimation() //zaczęcie animacji ataku
        await new Promise((resolve) => setTimeout(resolve, 150)) //czas pomiędzy startem animacji ataku a uderzeniem
        model.handleAttack(this.attack) //zabieranie hp i podświetlenie przeciwnika na czerwono
        await new Promise((resolve) => setTimeout(resolve, 650)) //czas pomiędzy atakami
        this.canAttack = true
    }

    /**
     * Odejmuje hp modelu, podświetla go na czerwono i zabija jeśli ma 0 hp
     */
    async handleAttack(attackNumber) {
        this.hp -= attackNumber //odjęcie hp 
        for (const e of this.children) //czerwony kolor
            e.material.color.setHex(0xff0000)
        if (this.hp <= 0) { //jeśli umarł
            this.deathAnimation()
            //render wykonuje cały czas operacje na arrayu modeli, ta zmienna sprawia że usuwa go z arrayu po renderze (inaczej jest błąd bo obiekt jest usuwany za wcześnie)
            this.dead === true
        }
        await new Promise((resolve) => setTimeout(resolve, 300)) //tyle ma zostać czerwony kolor
        if (this.hp <= 0) {
            Game.scene.remove(this) //usunięcie ze sceny jest tylko wizualne i obiekt wciąż może atakować
            this.position.x = Math.random() * 10000 + 10000 //dlatego wywalamy go w kosmos 
            this.position.z = Math.random() * 10000 + 10000
            return
        }
        for (const e of this.children) //kolor spowrotem biały
            e.material.color.setHex(0xffffff)
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
        if (this.player === 1 && this.position.x + this.position.z < this.milestones[this.currentTarget])
            this.currentTarget++
        else if (this.player === 2 && this.position.x + this.position.z > this.milestones[this.currentTarget])
            this.currentTarget++
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
        //Sprawdzenie czy jakiś przeciwnik jest w zasięgu widzenia (jeśli żaden nie był w zasięgu ataku)
        for (const m of models) {
            if (Math.abs(this.currentTarget + m.currentTarget) !== 2)
                continue
            const distance = Math.sqrt((m.position.x - this.position.x) * (m.position.x - this.position.x)
                + (m.position.z - this.position.z) * (m.position.z - this.position.z))
            if (distance < this.sightRange && (minDistance > distance || minDistance === null)) {
                target = m
                minDistance = distance
            }
        }
        if (target !== null) { //jeśli jakiś przeciwnik jest w zasięgu widzenia 
            this.go({ x: target.position.x, z: target.position.z }) //idzie w jego kierunku
            return
        }
        //Jeśli nie ma przeciwników w zasięgu widzenia to idzie na główny target (most lub baza)
        for (const t of this.targets[this.currentTarget]) {
            const distance = Math.sqrt((t.x - this.position.x) * (t.x - this.position.x)
                + (t.z - this.position.z) * (t.z - this.position.z))
            if (minDistance > distance || minDistance === null) {
                target = t
                minDistance = distance
            }
        }
        this.go(target)
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

    /**
     * Animacja śmierci
     */
    deathAnimation() {
        this.tauntClip.stop()
        this.tauntWeaponClip.stop()
        this.runClip.stop()
        this.runWeaponClip.stop()
        this.attackClip.stop()
        this.attackWeaponClip.stop()
        this.deathClip.play()
    }
}
