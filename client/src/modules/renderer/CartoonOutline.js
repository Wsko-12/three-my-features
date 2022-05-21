import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing//Pass.js';
import * as THREE from 'three';


class CartoonOutline extends Pass{
    constructor(resolution,){
        super();
        this.resolution = new THREE.Vector2( resolution.x, resolution.y );
        this.renderTargetDepthBuffer = new THREE.WebGLRenderTarget( this.resolution.x, this.resolution.y );
        this.fsQuad = new FullScreenQuad( null );
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                'tDiffuse': { value: null }
            },
        
            vertexShader: /* glsl */`
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,
        
            fragmentShader: /* glsl */`
                #include <common>
                uniform sampler2D tDiffuse;
                varying vec2 vUv;
                void main() {
                    gl_FragColor = texture2D( tDiffuse, vUv );
                }`,
        })
    }
    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive){
        this.material.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
        this.fsQuad.material = this.material;
        renderer.setRenderTarget( null );
        this.fsQuad.render( renderer );
    }
};

export { CartoonOutline };