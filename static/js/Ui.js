class Ui{

    loading

    constructor(){
        this.loading = document.createElement('div')
        this.loading.classList.add('lds-ring')
        this.loading.innerHTML = `<div></div><div></div><div></div><div></div>`
    }

    login(player) {
        document.getElementById('loginwrap').remove()
        let cover = document.getElementById('cover')
        cover.appendChild(this.loading)
    }
}