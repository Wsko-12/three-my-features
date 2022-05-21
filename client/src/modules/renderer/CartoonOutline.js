import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing//Pass.js';
import * as THREE from 'three';


class CartoonOutline extends Pass{
    constructor(resolution,scene,camera){
        super();
        this.scene = scene;
        this.camera = camera;
        this.resolution = new THREE.Vector2( resolution.x, resolution.y );

        const target = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
        target.texture.minFilter = THREE.NearestFilter;
        target.texture.magFilter = THREE.NearestFilter;;
        target.depthTexture = new THREE.DepthTexture();
        target.depthTexture.format = THREE.DepthFormat;
        target.depthTexture.type = THREE.UnsignedShortType;
        this.target = target;


        console.log(this.camera)

        this.fsQuad = new FullScreenQuad( null );
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                'tDiffuse': { value: null },
                'tDepth': { value: null },
                cameraNear:{value:this.camera.near},
                cameraFar:{value:5},
            },
        
            vertexShader: /* glsl */`
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,
        
            fragmentShader: /* glsl */`
                #include <common>
                #include <packing>
                uniform sampler2D tDiffuse;
                uniform sampler2D tDepth;
                varying vec2 vUv;
                uniform float cameraNear;
                uniform float cameraFar;

                float readDepth( sampler2D depthSampler, vec2 coord ) {
                    float fragCoordZ = texture2D( depthSampler, coord ).x;
                    float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
                    return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
                }


                void main() {
                    vec4 texture = texture2D( tDiffuse, vUv );
                    float depth = readDepth( tDepth, vUv );
                    vec3 depthColor = 1.0 - vec3( depth );
                    vec3 depthColorPow = depthColor * depthColor;
                    gl_FragColor = vec4(depthColorPow*2.0,1.0);
                }`,
        })
    }
    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive){
        renderer.setRenderTarget( this.target );
        renderer.render( this.scene, this.camera );

        this.material.uniforms.tDepth.value = this.target.depthTexture;
        this.material.uniforms.tDiffuse.value = this.target.texture;


        this.fsQuad.material = this.material;
        renderer.setRenderTarget( null );
        this.fsQuad.render( renderer );
    }
};

export { CartoonOutline };