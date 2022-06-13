'use strict'

class Timer {

    maxTime
    time
    endCallbacks = []

    /**
     * @param {number} time - liczba sekund
     */
    constructor(time) {
        this.maxTime = time
        this.time = time
    }

    start = () => {
        let lastRender = Date.now()
        const render = () => {
            if (this.time === 0) {
                this.end()
                return
            }
            setImmediate(render)
            if (Date.now() - lastRender < 1000)
                return
            lastRender = Date.now()
            this.time--
        }
        setImmediate(render)
    }

    /**
     * Odpalanie funkcji przypisanych do końca timera
     */
    end() {
        for (const e of this.endCallbacks) {
            e()
        }
    }

    /**
     * Funkcja która wykona sie gdy time bedzie 0
     * @param {Function} callback 
     */
    onEnd(callback) {
        this.endCallbacks.push(callback)
    }

}

module.exports = Timer