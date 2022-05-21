import * as THREE from 'three';
import RENDERER from './modules/renderer/renderer.js';
import ASSETS from './modules/atlas/assets.js';
import './style.scss';


export default {
  THREE:THREE,
  ASSETS:ASSETS,
};
ASSETS.load().then(assets => {
  RENDERER.init(true);
});

