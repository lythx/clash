/**
 * Logowanie na serwerze
 */
const login = async (name) => {
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
const reset = async () => {
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
const status = async (player) => {
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

export {
    login,
    reset,
    status
}