let game
let net 

window.onload = () => {
    game = new Game()
    game.generateBoard()
    net = new Net()
}