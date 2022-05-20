import MAIN from '../../index.js';
import MergedObject from './MergedObject.js';


let THREE;
export default {
    init(startRender){
        THREE = MAIN.THREE;
        const canvasRenderer = document.createElement('canvas');
        canvasRenderer.showContextMenu = function(e) {
            e.preventDefault();
        };
        document.body.append(canvasRenderer);
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRenderer,
        });
        this.renderer = renderer;
        const camera = new THREE.PerspectiveCamera(10, 2, 0.2, 500);
        this.camera = camera;
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);
        
        const scene = new THREE.Scene();
        this.scene = scene;

        window.addEventListener("resize", ()=>{this.setSize()});
        this.setSize();
        

        const nullMaterial = new THREE.MeshBasicMaterial();
        const mergedObject = new MergedObject({material:new THREE.MeshBasicMaterial({map:MAIN.ASSETS.textures.test_texture, side:THREE.DoubleSide})});

        const testMesh = new THREE.Mesh(MAIN.ASSETS.geometries.test_model,nullMaterial);

        mergedObject.add(testMesh,{position:[0,0,0]});


        scene.add(mergedObject.mesh);














        if(startRender) this.render();
    },

    setSize(){
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const windowPixelRatio = Math.min(window.devicePixelRatio, 2);

        this.renderer.setSize(windowWidth, windowHeight);
        this.renderer.setPixelRatio(windowPixelRatio);

        this.camera.aspect = windowWidth / windowHeight;
        this.camera.updateProjectionMatrix();
    },

    render:function(){
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(()=>{this.render()});
    },
};