// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import MAIN from '../../index.js';


class List{
    constructor(mergedObject){
        this.head = null;
        this.tail = null;
        this.nextId = 0;
        this.length = 0;
        this.mergedObject = mergedObject;
    }
    add(node){
        this.length++;
        node.list = this;
        node.object.inMergedObject = this.mergedObject;
        node.id = this.nextId++;
        if(!this.head){
            this.head = node;
            this.tail = node;
            return;
        };
        this.tail.next = node;
        node.prev = this.tail;
        this.tail = node;
    }
    remove(node){
        this.length--;
        const prev = node.prev;
        const next = node.next;

        if(!node.prev){
            this.head = node.next;
        }else{
            node.prev.next = node.next;
        };

        if(node.next){
            node.next.prev = node.prev;
        }else{
            this.tail = node.prev;
        };

        if(this.tail !== node.prev){
            let current = node.next;
            let prev = node.prev;
            while(current){
                if(prev){
                    current.offsets.position = prev.offsets.position + prev.counts.position;
                    current.offsets.index = prev.offsets.index + prev.counts.index;
                }else{
                    current.offsets.position = 3;
                    current.offsets.index = 3;
                }

                current.object.geometry.index.array.forEach((item,i) => {
                    this.mergedObject.attributesArray.index[current.offsets.index + i] = item + current.offsets.position;
                });
                
                prev = current;
                current = current.next;
            };
        };
    }
}
class Node{
    constructor(object,offsets,counts){
        this.object = object;
        this.next = null;
        this.prev = null;
        object.inMergedObjectNode = this;
        this.offsets = offsets;
        this.counts = counts;

        this.attributesCount = object.geometry.attributes.position.count;
    }
}


export default class MergedObject{
    constructor(properties){
        this.geometry = properties.geometry || MAIN.ASSETS.geometries.polygon.clone();
        this.list = new List(this);

        this.attributesArray = {};

        for ( const atr in this.geometry.attributes ) {
            this.attributesArray[atr] = [...this.geometry.attributes[atr].array];
        };
        this.attributesArray.index = [...this.geometry.index.array];

        this.material = properties.material;
        this.mesh = new THREE.Mesh(this.geometry,this.material);
        this.mesh.geometry = this.geometry;
    }
    add(object,properties){
        if(!object) return;
        const childGeometry = object.geometry.clone();
        properties.position && childGeometry.translate(...properties.position);

       
        
        for(let atr in childGeometry.attributes){
            if(!this.attributesArray[atr]){
                console.error('Geometries must have the same attributes');
                return;
            };
            this.attributesArray[atr].push(...childGeometry.attributes[atr].array)
        };
        const offsets = {
            position:this.geometry.attributes.position.count,
            index:this.geometry.index.count,
        };
        const counts = {
            position:childGeometry.attributes.position.count,
            index:childGeometry.index.count,
        }
       
        childGeometry.index.array.forEach(inx => {
            this.attributesArray.index.push(inx + offsets.position);
        });

        const node = new Node(object,offsets,counts);
        this.list.add(node);
        
        this.update();
        return this;
    };
    remove(object){
        if(object.inMergedObject != this) return;

        const node = object.inMergedObjectNode;
        if(!node) return;
        for(const atr in object.geometry.attributes){
            this.attributesArray[atr].splice(node.offsets.position*object.geometry.attributes[atr].itemSize,
                                             object.geometry.attributes[atr].array.length);
        }
        this.attributesArray.index.splice(node.offsets.index, object.geometry.index.array.length)

        this.list.remove(node);
        this.update();
    };

    update(con){
        this.geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(this.attributesArray.position),3));
        this.geometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(this.attributesArray.normal),3));
        this.geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(this.attributesArray.uv),2));
        this.geometry.index = new THREE.Uint16BufferAttribute(new Uint16Array(this.attributesArray.index),1);

        this.mesh.geometry = this.geometry;
    };

}