'use strict'

class Tile extends THREE.Mesh {

    color

    constructor(name, size, player, style) {
        super()
        this.player = player
        this.style = style
        this.name = name
        this.geometry = new THREE.BoxGeometry(size, 5, size);
        this.material = this.getMaterial()
        this.mesh = new THREE.Mesh(this.geometry, this.material)
    }

    getMaterial() {
        switch (this.style) {
            case 'baseborder1':
                return new THREE.MeshBasicMaterial({
                    color: 0xf00000
                });
            case 'baseborder2':
                return new THREE.MeshBasicMaterial({
                    color: 0xff0f50
                });
            case 'base1':
                return new THREE.MeshBasicMaterial({
                    color: 0xfff000
                });
            case 'base2':
                return new THREE.MeshBasicMaterial({
                    color: 0xffff00
                });
            case 'border1':
                return new THREE.MeshBasicMaterial({
                    color: 0xabcdef
                });
            case 'border2':
                return new THREE.MeshBasicMaterial({
                    color: 0x000000
                });
            case 'bottomborder1':
                return new THREE.MeshBasicMaterial({
                    color: 0x00cccc
                });
            case 'bottomborder2':
                return new THREE.MeshBasicMaterial({
                    color: 0xffffff
                });
            case 'road1':
                return new THREE.MeshBasicMaterial({
                    color: 0x00000f
                });
            case 'road2':
                return new THREE.MeshBasicMaterial({
                    color: 0x0000ff
                });
            case 'ground1':
                return new THREE.MeshBasicMaterial({
                    color: 0x000fff
                });
            case 'ground2':
                return new THREE.MeshBasicMaterial({
                    color: 0x00ffff
                });
            case 'brigdeborder':
                return new THREE.MeshBasicMaterial({
                    color: 0xff00ff
                });
            case 'bridge':
                return new THREE.MeshBasicMaterial({
                    color: 0xfd8300
                });
            case 'riverborder':
                return new THREE.MeshBasicMaterial({
                    color: 0x00034f
                });
            case 'river':
                return new THREE.MeshBasicMaterial({
                    color: 0xf0f023
                });
        }

    }

}