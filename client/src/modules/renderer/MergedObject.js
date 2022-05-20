import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
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
        node.id = this.nextId++;
        if(!this.head){
            this.head = node;
            this.tail = node;
            return;
        };

        node.index.offset = this.geometry.attributes.position.count;
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
            let next = node.next

            let maxPrev;
            // STAMP_1 const arr = [...this.mergedObject.geometry.index.array];
            while(next){
                let currentMax = 0;
                next.attributes.position.index -= node.attributes.position.count;
                next.attributes.normal.index -= node.attributes.normal.count;
                next.attributes.uv.index -= node.attributes.uv.count;
                next.attributes.index.index -= node.attributes.index.count;
                
                // 54.35400390625 ms
                // const arrMax = arr.slice(next.prev ? next.prev.attributes.index.index : 0,next.attributes.index.index);


                // 65.72119140625 ms
                //48.01611328125 ms
                const currIndex = next.attributes.index.index;
                
                if(!maxPrev){
                    const arrMax = this.mergedObject.geometry.index.array.slice(next.prev ? next.prev.attributes.index.index : 0,next.attributes.index.index);
                    arrMax.forEach(el => {if(el > maxPrev) maxPrev = el });
                };

                
                for(let i = currIndex,j=0;j<next.attributes.index.count;j++,i++){
                    // console.log(this.mergedObject.geometry.index.array[i],'->',next.attributes.indexInitial.array[j]+max+1);
                    this.mergedObject.geometry.index.array[i] = next.attributes.indexInitial.array[j]+maxPrev+1;
                    if(currentMax < next.attributes.indexInitial.array[j]+maxPrev+1){
                        currentMax = next.attributes.indexInitial.array[j]+maxPrev+1;
                    };
                };
                maxPrev = currentMax;
                console.log(currentMax);

                
                next = next.next;
            };
            console.log('remove: ',this.geometry.index);
        };
    }
}
class Node{
    constructor(object,attributes){
        this.object = object;
        this.next = null;
        this.prev = null;
        this.attributes = attributes;
    }
}


export default class MergedGeometry{
    constructor(properties){
        this.geometry = properties.geometry || MAIN.ASSETS.geometries.polygon.clone();
        this.list = new List(this);
        this.attributes = this.geometry.attributes;

        this.attributesArray = {};

        for ( const atr in this.geometry.attributes ) {
            this.attributesArray[atr] = [...this.geometry.attributes[atr].array];
        };

        this.material = properties.material;
        this.mesh = new THREE.Mesh(this.geometry,this.material);

        console.log(this);
    }
    add(object,properties){

    };
    remove(object){

    };

}