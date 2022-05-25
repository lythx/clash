/**
 * Logowanie na serwerze
 */
const login = async () => {
    const login = document.getElementById('txt').value
    const body = JSON.stringify({ login })
    const response = await fetch('/addlogin', {
        method: 'POST',
        body,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const data = await response.json()
    return data
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

export {
    login,
    reset
}