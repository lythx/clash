'use strict'

class Model {

    name
    position
    player
    rotation
    events = []
    eventIndex = 0

    /**
     * @param {string} name 
     * @param {number} player 
     * @param {object} position 
     * @param {number} rotation 
     */
    constructor(name, player, position, rotation) {
        this.name = name
        this.position = position
        this.player = player
        this.rotation = rotation
    }

    /**
     * Dodaje event do arrayu żeby później go wysłać
     * @param {string} event 
     * @param {*} data 
     * @param {number} timestamp 
     */
    emitEvent(event, data, timestamp) {
        this.events.push({ event, data, timestamp })
    }

    /**
     * Zwraca eventy i usuwa je z arrayu
     */
    getEvents() {
        const ret = [...this.events] // Zapisanie do zmiennej przed usunięciem z arrayu
        // Nie zeruje arrayu tylko usuwa taką liczbę elementów jaką pobrał, na wypadek gdyby podczas usuwania dodał sie jakiś event
        this.events.length = this.events.length - ret.length
        return ret
    }

    /**
     * Zwraca nazwę i pozycję obiektu
     */
    updateAndGetData() {
        return { name: this.name, position: this.position }
    }

}

module.exports = Model