'use strict'
let i = 0

class BillGates extends Fighter {

    constructor(data) {
        if (i++ === 1)
            throw err
        const obj = Model.materials.find(a => a.name === 'BillGates')
        super(data.name, data.player, { x: data.position.x, y: obj.defaultY, z: data.position.z }, data.rotation, obj.cost, obj.hp, obj.attack, obj.attackSpeed, obj.startTime, obj.scale, obj.modelGeometry, obj.modelMap, obj.weaponGeometry, obj.weaponMap)
        this.createClips(obj.attackAnimation, obj.runAnimation, obj.tauntAnimation, obj.deathAnimation)
    }

    createClips(attackAnimation, runAnimation, tauntAnimation, deathAnimation) {
        this.clips = {
            attack: [this.modelMixer.clipAction(attackAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(attackAnimation).setLoop(THREE.LoopRepeat)],
            run: [this.modelMixer.clipAction(runAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(runAnimation).setLoop(THREE.LoopRepeat)],
            taunt: [this.modelMixer.clipAction(tauntAnimation).setLoop(THREE.LoopRepeat), this.weaponMixer.clipAction(tauntAnimation).setLoop(THREE.LoopRepeat)],
            death: [this.modelMixer.clipAction(deathAnimation).setLoop(THREE.LoopRepeat)]
        }
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
        // this.tauntAnimation()
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

    // /**
    //  * Startuje animację ataku i zatrzymuje TWEENA do ruszania modelu odpala funkcje na zabieranie hp przeciwnikowi
    //  */
    // async attackEnemy(model) {
    //     if (!this.canAttack) //jeśli pomiędzy atakami nie minął ustalony czas to return
    //         return
    //     this.canAttack = false
    //     this.tween?.stop() //zatrzymanie poruszania sie
    //     this._rotate(model.position) //skierowanie modelu na przeciwnika
    //     this.attackAnimation() //zaczęcie animacji ataku
    //     await new Promise((resolve) => setTimeout(resolve, 150)) //czas pomiędzy startem animacji ataku a uderzeniem
    //     model.handleAttack(this.attack) //zabieranie hp i podświetlenie przeciwnika na czerwono
    //     await new Promise((resolve) => setTimeout(resolve, 650)) //czas pomiędzy atakami
    //     this.canAttack = true
    // }

    // /**
    //  * Odejmuje hp modelu, podświetla go na czerwono i zabija jeśli ma 0 hp
    //  */
    // async handleAttack(attackNumber) {
    //     this.hp -= attackNumber //odjęcie hp 
    //     for (const e of this.children) //czerwony kolor
    //         e.material.color.setHex(0xff0000)
    //     if (this.hp <= 0) { //jeśli umarł
    //         this.deathAnimation()
    //         //render wykonuje cały czas operacje na arrayu modeli, ta zmienna sprawia że usuwa go z arrayu po renderze (inaczej jest błąd bo obiekt jest usuwany za wcześnie)
    //         this.dead === true
    //     }
    //     await new Promise((resolve) => setTimeout(resolve, 300)) //tyle ma zostać czerwony kolor
    //     if (this.hp <= 0) {
    //         Game.scene.remove(this) //usunięcie ze sceny jest tylko wizualne i obiekt wciąż może atakować
    //         this.position.x = Math.random() * 10000 + 10000 //dlatego wywalamy go w kosmos 
    //         this.position.z = Math.random() * 10000 + 10000
    //         return
    //     }
    //     for (const e of this.children) //kolor spowrotem biały
    //         e.material.color.setHex(0xffffff)
    // }
}
