import MAIN from '../../index.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import {CartoonOutline} from './CartoonOutline.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui';

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
        renderer.setClearColor(new THREE.Color(0.5,0.65,0.8));
        const camera = new THREE.PerspectiveCamera(10, 2, 0.2, 500);
        this.camera = camera;
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);

        const scene = new THREE.Scene();
        this.scene = scene;

        window.addEventListener("resize", ()=>{this.setSize()});
        
        
        
        const composer = new EffectComposer( renderer );
        this.composer = composer;
        const renderPass = new RenderPass( scene, camera );
        composer.addPass( renderPass );

        const CartoonOutlinePass = new CartoonOutline({
            color:new THREE.Color(0x303030),
            size:2,
            difference:200,
        },new THREE.Vector2( window.innerWidth, window.innerHeight ),scene,camera);
        composer.addPass( CartoonOutlinePass );
        
        this.setSize();
       

        let colorGui = {
            color:'#303030',
        }
        const gui = new GUI();
        gui.addColor( colorGui, 'color').onChange( function() { CartoonOutlinePass.color = new THREE.Color( colorGui.color ); } );
        gui.add( CartoonOutlinePass,'size',0,10,1 );
        gui.add( CartoonOutlinePass,'difference',0,2000,100 );

   

        this.controls = new OrbitControls(camera, renderer.domElement);
        MAIN.ASSETS.textures.test_texture.magFilter = THREE.NearestFilter;
        this.scene.add(
            new THREE.Mesh(
                MAIN.ASSETS.geometries.character,
                new THREE.MeshBasicMaterial({map:MAIN.ASSETS.textures.test_texture})
                )
            );
        const mesh = new THREE.Mesh(
            MAIN.ASSETS.geometries.sphere,
            new THREE.MeshBasicMaterial({map:MAIN.ASSETS.textures.test_texture})
            );
            mesh.position.set(-2,0,-2.5);
            scene.add(mesh)



        MAIN.ASSETS.textures.texture_plant.magFilter = THREE.NearestFilter;
        
        const count = 2;
        for(let x = -count; x<count;x++){
            for(let y = -count; y<count;y++){
                const plant = new THREE.Mesh(
                    MAIN.ASSETS.geometries.plant,
                    
                    new THREE.MeshBasicMaterial({map:MAIN.ASSETS.textures.texture_plant,side:THREE.DoubleSide,transparent:true,alphaTest: 0.5,}),
                );
                plant.position.x = x*0.1-2 + Math.random()-0.5;
                plant.position.z = y*0.1 + Math.random()-0.5;

                plant.rotation.y = Math.random();
                scene.add(plant);
            }
        }


        if(startRender) this.render();
    },

    setSize(){
        const canvas = this.renderer.domElement;
        const windowPixelRatio = Math.min(window.devicePixelRatio, 2);
        const windowWidth = +canvas.clientWidth * windowPixelRatio;
        const windowHeight = +canvas.clientHeight * windowPixelRatio;


        
        this.renderer.setSize(windowWidth, windowHeight,false);
        this.renderer.setPixelRatio(windowPixelRatio);

        this.camera.aspect = windowWidth / windowHeight;
        this.camera.updateProjectionMatrix();
        if(this.composer){
            this.composer.setSize(windowWidth, windowHeight);
        }
    },

    render:function(){
        // this.renderer.render(this.scene, this.camera);
        this.composer.render();
        requestAnimationFrame(()=>{this.render()});
    },
};