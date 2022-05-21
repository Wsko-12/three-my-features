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

                    float shift = 0.005;
                    float depth_top = readDepth(tDepth, vec2(vUv.x,vUv.y+shift));
                    float depth_bottom = readDepth(tDepth, vec2(vUv.x,vUv.y-shift));
                    float depth_left = readDepth(tDepth, vec2(vUv.x-shift,vUv.y));
                    float depth_right = readDepth(tDepth, vec2(vUv.x+shift,vUv.y));

                    float depth_sum = depth_top + depth_bottom + depth_left + depth_right;
                    float depth_average = depth_sum/4.0;
                    
                    float depthAverageColor_float =step((depth_average - depth)*10.0, 0.005);
                    vec3 depthAverageColor = vec3(depthAverageColor_float);

                    gl_FragColor = vec4(texture.rgb*depthAverageColor_float,1.0);
                    
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