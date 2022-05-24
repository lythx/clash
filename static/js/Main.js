let game
let net 
let ui 

window.onload = () => {
    game = new Game()
    game.generateBoard()
    net = new Net()
    ui = new Ui()
}