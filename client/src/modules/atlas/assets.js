import models from "./models";
import textures from "./textures";

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

import MAIN from '../../index.js';

export default{
  textures:{},
  geometries:{},

  load:async function(){
    const that = this;


    async function loadModels(){
      const loader = new GLTFLoader();
      let modelIndex = -1;
      return new Promise(res => {
        function load(){ 
          modelIndex++;
          if(modelIndex < models.length){
            const modelData = models[modelIndex];
            const path = './assets/models/' + modelData.folder + modelData.file;
            loader.load(path,(model)=>{
              that.geometries[modelData.name] = model.scene.children[0].geometry;
              load();
            });
          }else{
            res(true);
          };
        }
        load();
      });
    };

    async function loadTextures(){
      const loader = new MAIN.THREE.TextureLoader();
      let textureIndex = -1;
      return new Promise(res => {
        function load(){ 
          textureIndex++;
          if(textureIndex < textures.length){
            const textureData = textures[textureIndex];
            const path = './assets/textures/' + textureData.folder + textureData.file;
            loader.load(path,(texture)=>{
              that.textures[textureData.name] = texture;
              that.textures[textureData.name].flipY = false;
              load();
            });
          }else{
            res(true);
          };
        }
        load();
      });
    };

    return new Promise(assetsLoaded => {
      loadModels().then((modelsLoaded)=>{
        loadTextures().then((textureLoader)=>{
          assetsLoaded(MAIN);
        });
      });

    });

  }

};
