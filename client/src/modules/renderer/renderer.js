import MAIN from '../../index.js';
import MergedObject from './MergedObject.js';


let THREE;
let mergedObject;
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
        this.clock = new THREE.Clock();
        
        const scene = new THREE.Scene();
        this.scene = scene;

        window.addEventListener("resize", ()=>{this.setSize()});
        this.setSize();
        

        const nullMaterial = new THREE.MeshBasicMaterial();
         mergedObject = new MergedObject({material:new THREE.MeshBasicMaterial({map:MAIN.ASSETS.textures.test_texture, side:THREE.DoubleSide})});
        MAIN.ASSETS.textures.test_texture.magFilter = THREE.NearestFilter;
        MAIN.ASSETS.geometries.test_model.scale(0.2,0.2,0.2);
        MAIN.ASSETS.geometries.sphere.scale(0.2,0.2,0.2);
        MAIN.ASSETS.geometries.pir.scale(0.2,0.2,0.2);

       
        const testMesh = new THREE.Mesh(MAIN.ASSETS.geometries.test_model,nullMaterial);
        const testMesh_2 = new THREE.Mesh(MAIN.ASSETS.geometries.sphere,nullMaterial);
        const testMesh_3 = new THREE.Mesh(MAIN.ASSETS.geometries.polygon_size,nullMaterial);
        const testMesh_4 = new THREE.Mesh(MAIN.ASSETS.geometries.test_model,nullMaterial);
        const testMesh_5 = new THREE.Mesh(MAIN.ASSETS.geometries.pir,nullMaterial);


       

        console.time('add');
        mergedObject.add(testMesh,{position:[-2,0,0]});
        mergedObject.add(testMesh_2,{position:[-1,0,0]});
        mergedObject.add(testMesh_3,{position:[0,0,0]});
        mergedObject.add(testMesh_4,{position:[1,0,0]});
        mergedObject.add(testMesh_5,{position:[2,0,0]});

        console.timeEnd('add');
        setTimeout(()=>{
            console.time('test');
            mergedObject.remove(testMesh_2);
            console.timeEnd('test');
            setTimeout(()=>{
                mergedObject.add(testMesh_2,{position:[-1,0,0]});
                setTimeout(()=>{
                    mergedObject.remove(testMesh);
                    setTimeout(()=>{
                        mergedObject.add(testMesh,{position:[-2,0,0]});

                        setTimeout(()=>{
                            mergedObject.remove(testMesh_5);
                            setTimeout(()=>{
                                mergedObject.add(testMesh_5,{position:[2,0,0]});
                            },2000)
                            
                        },2000)
                        
                    },2000)
                    
                },2000)
            },2000)
        },2000);

        scene.add(mergedObject.mesh);

        if(startRender) {
            this.clock.start()
            this.render()
        };
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
        mergedObject.mesh.rotation.y = this.clock.getElapsedTime();
        requestAnimationFrame(()=>{this.render()});
    },
};