'use strict'

class Net {

    /**
     * Logowanie na serwerze
     */
    static login = async (name) => {
        const body = JSON.stringify({ name })
        const response = await fetch('/addlogin', {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return await response.json()
    }

    /**
     * Resetuje gre na serwerze
     */
    static reset = async () => {
        await fetch('/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    /**
     * Fetchuje status z serwera
     */
    static status = async (player) => {
        const body = JSON.stringify({ player })
        const response = await fetch('/status', {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return await response.json()
    }

    static newFighter(className, x, z, timestamp) {
        console.log(className, x, z, timestamp)
    }
}
