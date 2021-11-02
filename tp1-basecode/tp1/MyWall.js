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

        /* the following example illustrates composition
           with geometric transformations: 3 instances of a 
           face geometry - a Cube - are created and placed
           in the appropriate places to form one of the top corners
           of the cube */

        /*
        // -Z Door Window Wall
        this.scene.pushMatrix();
        this.scene.translate(0, 5, -10)
        this.scene.scale(20, 10, 1);
        this.wall.display();
        this.scene.popMatrix();
        
*/      

        this.appearance.apply();
        // Top square
        this.scene.pushMatrix();
        this.wall.display();
        this.scene.popMatrix();


        /* NOTE: WHEN PERFORMING THE ENTIRE CUBE IT IS EXPECTED 
        THAT ALL CUBE FACES ARE FACED OUTWARDS! */ 
    }

    // These are only needed if you are enabling normal visualization in compound objects
    enableNormalViz(){     this.table.enableNormalViz();    } ;
    disableNormalViz(){     this.table.disableNormalViz();    } ;
}


