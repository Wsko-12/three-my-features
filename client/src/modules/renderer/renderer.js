import MAIN from '../../index.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import {CartoonOutline} from './CartoonOutline.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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
        this.setSize();
        
        
        const composer = new EffectComposer( renderer );
        this.composer = composer;
        const renderPass = new RenderPass( scene, camera );
        composer.addPass( renderPass );

        // const CartoonOutlinePass = new ShaderPass(  );
        composer.addPass( new CartoonOutline(new THREE.Vector2( window.innerWidth, window.innerHeight ),scene,camera) );


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
            mesh.position.set(-2,0,-2);
            scene.add(mesh)

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
        // this.renderer.render(this.scene, this.camera);
        this.composer.render();
        requestAnimationFrame(()=>{this.render()});
    },
};