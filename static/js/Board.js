'use strict'

const size = 9
const count = 42

class Board {

    tiles = new THREE.Group()

    constructor() {
        for (let i = 0; i < count; i++) {
            for (let j = 0; j < count; j++) {
                let tile
                const a = Math.abs(i - j)
                //border przy bazie gracza 1
                if ((i === 4 || j === 4) && i + j < 15 && i + j > 7) {
                    tile = new Tile(`${i}${j}`, size, 'none', 'baseborder1')
                }
                //border przy bazie gracza 2
                else if ((i === 37 || j === 37) && i + j > 67 && i + j < 75) {
                    tile = new Tile(`${i}${j}`, size, 'none', 'baseborder2')
                }
                //baza gracza 1
                else if (a + i + j < 21 && i > 4 && j > 4) {
                    tile = new Tile(`${i}${j}`, size, 'none', 'base1')
                }
                //baza gracza 2
                else if (i > 30 && j > 30 && a + i + j < 73) {
                    tile = new Tile(`${i}${j}`, size, 'none', 'base2')
                }
                //nic
                else if (i + j < count / 3 || i + j > count + count * (2 / 3) - 2) {
                    continue
                }
                //border gracza 1
                else if (i === 0 || j === 0) {
                    tile = new Tile(`${i}${j}`, size, 'none', 'border1')
                }
                //border gracza 2
                else if (i === count - 1 || j === count - 1) {
                    tile = new Tile(`${i}${j}`, size, 'none', 'border2')
                }
                //border dolny gracza 1
                else if (i + j === count / 3) {
                    tile = new Tile(`${i}${j}`, size, 'none', 'bottomborder1')
                }
                //border dolny gracza 2
                else if (i + j === count + count * (2 / 3) - 2) {
                    tile = new Tile(`${i}${j}`, size, 'none', 'bottomborder2')
                }
                //plansza gracza 1
                else if (i + j < count - 4) {
                    //droga
                    if (i > 3 && i < 8 || a < 4 || j > 3 && j < 8) {
                        tile = new Tile(`${i}${j}`, size, 'p1', 'road1')
                    }
                    //nie droga
                    else {
                        tile = new Tile(`${i}${j}`, size, 'p1', 'ground1')
                    }
                }
                //border rzeki gracza 1
                else if (i + j < count - 2) {
                    //border mostu
                    if ([21, 22, 29, 30, 3, 4].includes(a)) {
                        tile = new Tile(`${i}${j}`, size, 'none', 'brigdeborder')
                    }
                    //most 
                    else if (a > 21 && a < 31 || a < 5) {
                        tile = new Tile(`${i}${j}`, size, 'neutral', 'bridge')
                    }
                    //border rzeki
                    else {
                        tile = new Tile(`${i}${j}`, size, 'none', 'riverborder')
                    }
                }
                //rzeka
                else if (i + j < count + 2) {
                    //border mostu
                    if ([21, 22, 29, 30, 3, 4].includes(a)) {
                        tile = new Tile(`${i}${j}`, size, 'none', 'brigdeborder')
                    }
                    //most 
                    else if (a > 21 && a < 31 || a < 5) {
                        tile = new Tile(`${i}${j}`, size, 'neutral', 'bridge')
                    }
                    //woda
                    else {
                        tile = new Tile(`${i}${j}`, size, 'none', 'river')
                    }
                }
                //border rzeki gracza 2
                else if (i + j < count + 4) {
                    //border mostu
                    if ([21, 22, 29, 30, 3, 4].includes(a)) {
                        tile = new Tile(`${i}${j}`, size, 'none', 'brigdeborder')
                    }
                    //most
                    else if (a > 21 && a < 31 || a < 5) {
                        tile = new Tile(`${i}${j}`, size, 'neutral', 'bridge')
                    }
                    //border rzeki
                    else {
                        tile = new Tile(`${i}${j}`, size, 'none', 'riverborder')
                    }
                }
                //plansza gracza 2
                else {
                    //droga
                    if (i > 33 && i < 38 || a < 4 || j > 33 && j < 38) {
                        tile = new Tile(`${i}${j}`, size, 'p2', 'road2')
                    }
                    //nie droga
                    else {
                        tile = new Tile(`${i}${j}`, size, 'p2', 'ground2')
                    }
                }
                tile.position.x = (j * size) - (count * (size / 2) - count / 2) - size * 6;
                tile.position.z = (i * size) - (count * (size / 2) - count / 2) - size * 6;
                this.tiles.add(tile)
            }
        }
    }

}