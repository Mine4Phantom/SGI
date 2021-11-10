import {CGFobject} from '../lib/CGF.js';
import { MyQuad } from './MyQuad.js';

/**
* MyCube
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyWall extends CGFobject {
    constructor(scene, appearance) {
        super(scene);

        this.wall=new MyQuad(scene, appearance);
        this.appearance = appearance;

    }
    display() {    

        this.appearance.apply();
        this.scene.pushMatrix();
        this.wall.display();
        this.scene.popMatrix();


    }

    // These are only needed if you are enabling normal visualization in compound objects
    enableNormalViz(){     this.table.enableNormalViz();    } ;
    disableNormalViz(){     this.table.disableNormalViz();    } ;
}


