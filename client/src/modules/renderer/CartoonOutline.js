import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing//Pass.js';
import * as THREE from 'three';


class CartoonOutline extends Pass{
    constructor(properties,resolution,scene,camera){
        super();
        this.scene = scene;
        this.camera = camera;
        this.resolution = new THREE.Vector2( resolution.x, resolution.y );

        const target = new THREE.WebGLRenderTarget( resolution.x, resolution.y );
        target.texture.minFilter = THREE.NearestFilter;
        target.texture.magFilter = THREE.NearestFilter;
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
                outlineColor:{value:properties.color},
                outlineSize:{value:properties.size},
                outlineDifference:{value:properties.difference},
                resolution:{value:resolution},
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
                precision lowp float;
                uniform sampler2D tDiffuse;
                uniform sampler2D tDepth;
                varying vec2 vUv;


                uniform vec2 resolution;
                uniform float cameraNear;
                uniform float cameraFar;
                uniform vec3 outlineColor;
                uniform float outlineSize;
                uniform float outlineDifference;


                float readDepth( sampler2D depthSampler, vec2 coord ) {
                    float fragCoordZ = texture2D( depthSampler, coord ).x;
                    float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
                    return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
                }


                void main() {
                    vec4 texture = texture2D( tDiffuse, vUv );
                    float depth = 1.0 - readDepth( tDepth, vUv );
                    // vec3 depthColor = vec3(depth);

                    float shift_x = (1.0/(resolution.x*0.5)*0.5) * outlineSize;
                    float shift_y = (1.0/(resolution.y*0.5)*0.5) * outlineSize;

                    float depth_top = 1.0 - readDepth(tDepth, vec2(vUv.x,vUv.y+shift_y));
                    float depth_bottom = 1.0 - readDepth(tDepth, vec2(vUv.x,vUv.y-shift_y));
                    float depth_left = 1.0 - readDepth(tDepth, vec2(vUv.x-shift_x,vUv.y));
                    float depth_right = 1.0 - readDepth(tDepth, vec2(vUv.x+shift_x,vUv.y));

                    float depth_round_average = (depth_top+depth_bottom+depth_left+depth_right)*0.25;
                    float outline = abs(depth-depth_round_average);
                    float outline_step = 1.0 - step(outline,0.004);
                    gl_FragColor = vec4(mix(texture.rgb, outlineColor, outline_step),1.0);
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
    setSize(...size){
        this.target.setSize(...size);
        this.material.uniforms.resolution.value.x = size[0];
        this.material.uniforms.resolution.value.y = size[1];
        // alert(size[0] + ':' + size[1]);

    }
    set size(value){
        this.material.uniforms.outlineSize.value = value;
    }
    get size(){
        return this.material.uniforms.outlineSize.value;
    }

    set difference(value){
        this.material.uniforms.outlineDifference.value = value;
    }
    get difference(){
        return this.material.uniforms.outlineDifference.value;
    }

    set color(color){
        if(!(color instanceof THREE.Color)) return;
        this.material.uniforms.outlineColor.value = color;
    }
    get color(){
        return this.material.uniforms.outlineColor.value;
    }
};

export { CartoonOutline };