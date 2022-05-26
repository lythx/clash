class Model extends THREE.Mesh {

    mixer
    loader = new THREE.JSONLoader();

    constructor(name) {
        super()
        this.name = name
    }

    async _load(model, texture) {
        const material = new THREE.MeshBasicMaterial(
            {
                map: new THREE.TextureLoader().load(texture), // dowolny plik png, jpg
                morphTargets: true // ta własność odpowiada za możliwość animowania materiału modelu
            });
        const [mesh, mixer] = await new Promise((resolve) => {
            this.loader.load(model, (geometry) => {
                const mesh = new THREE.Mesh(geometry, material)
                const mixer = new THREE.AnimationMixer(mesh)
                resolve([mesh, mixer])
            });
        })
        this.mesh = mesh
        this.mixer = mixer
    }
}