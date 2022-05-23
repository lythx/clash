class Net {

    async login() {
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
        console.log(data)
    }
}