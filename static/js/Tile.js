'use strict'

class Tile extends THREE.Mesh {

    height = 5
    player
    style
    name

    /**
     * @param {string} name 
     * @param {number} size 
     * @param {number} player 
     * @param {string} style 
     */
    constructor(name, size, player, style) {
        super()
        this.player = player
        this.style = style
        this.name = name
        this.loadStyle()
        this.material = new THREE.MeshBasicMaterial({
            color: this.color
        })
        this.geometry = new THREE.BoxGeometry(size, this.height, size);
        this.position.y += this.height / 2
        this.mesh = new THREE.Mesh(this.geometry, this.material)
    }

    /**
     * Ustawia wygląd i pozycje obiektu zależnie od stylu
     */
    loadStyle() {
        switch (this.style) {
            case 'corner':
                this.height = 9
                this.color = 0x555555
                break
            case 'baseborder1':
                this.height += 9
                this.color = 0x455073
                break
            case 'baseborder2':
                this.height += 9
                this.color = 0x00154f
                break
            case 'base1':
                this.color = 0x999999
                break
            case 'base2':
                this.color = 0x999999
                break
            case 'border1':
                this.height += 8
                this.color = 0x555555
                break
            case 'border2':
                this.height += 8
                this.color = 0x555555
                break
            case 'bottomborder1':
                this.height += 8
                this.color = 0x455073
                break
            case 'bottomborder2':
                this.height += 8
                this.color = 0x00154f
                break
            case 'road1':
                this.color = 0x444444
                break
            case 'road2':
                this.color = 0x444444
                break
            case 'ground1':
                this.color = 0x210070
                break
            case 'ground2':
                this.color = 0x0e387a
                break
            case 'brigdeborder':
                this.height += 6
                this.color = 0x4b3d8f
                break
            case 'bridge':
                this.color = 0x37a677
                break
            case 'riverborder':
                this.height += 3
                this.color = 0x00034f
                break
            case 'river':
                this.height -= 2
                this.color = 0x00cccc
        }
    }

}