'use strict'

class Model extends THREE.Group {

    static models = []
    loader = new THREE.JSONLoader();
    tween

    /**
     * Ładuje i dodaje do grupy teksturę i model, zwraca mesh
     */
    async _load(model, texture) {
        const material = new THREE.MeshBasicMaterial(
            {
                map: new THREE.TextureLoader().load(texture),
                morphTargets: true
            });
        //loader.load() jest asynchroniczny więc trzeba użyć promisy
        const mesh = await new Promise((resolve) => {
            this.loader.load(model, (geometry) => {
                resolve(new THREE.Mesh(geometry, material))
            });
        })
        this.add(mesh)
        return mesh
    }

    /**
     * Obraca model w kierunku podanej lokacji
     */
    async _rotate(location) {
        //kąt obrotu
        let targetAngle = Math.atan2(location.z - this.position.z, -(location.x - this.position.x)) + (2 * Math.PI)
        if (targetAngle > 2 * Math.PI) //układ współrzędnych jest tu jakoś dziwnie ustawiony, więc trzeba tak zrobić
            targetAngle -= 2 * Math.PI
        this.rotation.y = targetAngle
    }

    /**
     * Obraca i przesuwa model do danej lokacji
     */
    async _go(location) {
        this._rotate(location)
        //długość drogi (potrzebna do szybkości animacji)
        const distance = Math.sqrt(((location.x - this.position.x) * (location.x - this.position.x) +
            (location.z - this.position.z) * (location.z - this.position.z)))
        this.tween?.stop() //zatrzymanie poprzednich animacji
        this.tween = new TWEEN.Tween(this.position) //animacja
            .to(location, distance * 75)
            .start()
    }
}