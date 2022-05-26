class Model extends THREE.Mesh {

    mixer
    loader = new THREE.JSONLoader();

    constructor(texture, model, name) {
        super()
        const material = new THREE.MeshBasicMaterial(
            {
                map: new THREE.TextureLoader().load(texture), // dowolny plik png, jpg
                morphTargets: true // ta własność odpowiada za możliwość animowania materiału modelu
            });
        this.loader.load(model, (geometry) => {
            this.mesh = new THREE.Mesh(geometry, material)
            this.mesh.name = name;
            this.mixer = new THREE.AnimationMixer(this.mesh)
            console.log(this.mixer)
        });
    }
}