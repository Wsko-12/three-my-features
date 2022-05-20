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
        if(!node.prev){
            this.head = node.next;
        }else{
            node.prev.next = node.next;
        }
        if(node.next){
            node.next.prev = node.prev;
        }else{
            this.tail = node.prev;
        };
        if(this.tail !== node.prev){
            // let next = node.next

            // let maxPrev;
            // // STAMP_1 const arr = [...this.mergedObject.geometry.index.array];
            // while(next){
            //     let currentMax = 0;
            //     next.attributes.position.index -= node.attributes.position.count;
            //     next.attributes.normal.index -= node.attributes.normal.count;
            //     next.attributes.uv.index -= node.attributes.uv.count;
            //     next.attributes.index.index -= node.attributes.index.count;
                
            //     // 54.35400390625 ms
            //     // const arrMax = arr.slice(next.prev ? next.prev.attributes.index.index : 0,next.attributes.index.index);


            //     // 65.72119140625 ms
            //     //48.01611328125 ms
            //     const currIndex = next.attributes.index.index;
                
            //     if(!maxPrev){
            //         const arrMax = this.mergedObject.geometry.index.array.slice(next.prev ? next.prev.attributes.index.index : 0,next.attributes.index.index);
            //         arrMax.forEach(el => {if(el > maxPrev) maxPrev = el });
            //     };

                
            //     for(let i = currIndex,j=0;j<next.attributes.index.count;j++,i++){
            //         // console.log(this.mergedObject.geometry.index.array[i],'->',next.attributes.indexInitial.array[j]+max+1);
            //         this.mergedObject.geometry.index.array[i] = next.attributes.indexInitial.array[j]+maxPrev+1;
            //         if(currentMax < next.attributes.indexInitial.array[j]+maxPrev+1){
            //             currentMax = next.attributes.indexInitial.array[j]+maxPrev+1;
            //         };
            //     };
            //     maxPrev = currentMax;
            //     console.log(currentMax);

                
            //     next = next.next;
            // };
            // console.log('remove: ',this.geometry.index);
        };
    }
}
class Node{
    constructor(object,offset){
        this.object = object;
        this.next = null;
        this.prev = null;
        object.inMergedGeometryNode = this;
        this.offset = offset;

        this.baseAttributes = {
            attributesCount : object.geometry.attributes.position.count,
            index: [...object.geometry.index.array],
        };
    }
}


export default class MergedObject{
    constructor(properties){
        this.geometry = properties.geometry || MAIN.ASSETS.geometries.polygon.clone();
        this.list = new List(this);
        this.attributes = this.geometry.attributes;

        this.attributesArray = {};

        for ( const atr in this.geometry.attributes ) {
            this.attributesArray[atr] = [...this.geometry.attributes[atr].array];
        };
        this.attributesArray.index = [...this.geometry.index.array];

        this.material = properties.material;
        this.mesh = new THREE.Mesh(this.geometry,this.material);
        this.mesh.geometry = this.geometry;
        console.log(this);
    }
    add(object,properties){
        const childGeometry = object.geometry.clone();
        properties.position && childGeometry.translate(...properties.position);

        const node = new Node(object,this.geometry.attributes.position.count);
        this.list.add(node);
        for(let atr in childGeometry.attributes){
            this.attributesArray[atr] = this.attributesArray[atr].concat([...childGeometry.attributes[atr].array]);
        }
        const offset = this.geometry.attributes.position.count;
        childGeometry.index.array.forEach(inx => {
            this.attributesArray.index.push(inx+offset);
        });
        
        this.update();
    };
    remove(object){

    };

    update(){
        this.geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(this.attributesArray.position),3));
        this.geometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(this.attributesArray.normal),3));
        this.geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(this.attributesArray.uv),2));
        this.geometry.index = new THREE.Uint16BufferAttribute(new Uint16Array(this.attributesArray.index),1);

        this.mesh.geometry = this.geometry;
    };

}