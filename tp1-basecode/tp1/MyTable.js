import {CGFobject, CGFappearance} from '../lib/CGF.js';
import { MyCube } from './MyCube.js';


/**
* MyCube
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyTable extends CGFobject {
    constructor(scene, appearance) {
        super(scene);
        
        this.cube=new MyCube(scene);
        this.appearance = appearance;



    }
    display() {

        /* the following example illustrates composition
           with geometric transformations: 3 instances of a 
           cube geometry - a Cube - are created and placed
           in the appropriate places to form one of the top corners
           of the cube */

        this.appearance.apply();
        
        // Top of table
        this.scene.pushMatrix();
        this.scene.translate(0, 3.5, 0);
        this.scene.scale(5, 0.3, 3)
        this.cube.display();
        this.scene.popMatrix();

        // Leg  +X+Z   
        this.scene.pushMatrix();
        this.scene.translate(2.35, 1.75, 1.35);
        this.scene.scale(0.3, 3.5, 0.3)
        this.cube.display();
        this.scene.popMatrix();

        // Leg +X-Z
        this.scene.pushMatrix();
        this.scene.translate(2.35, 1.75, -1.35);
        this.scene.scale(0.3, 3.5, 0.3)
        this.cube.display();
        this.scene.popMatrix();

        // Leg -X-Z
        this.scene.pushMatrix();
        this.scene.translate(-2.35, 1.75, -1.35);
        this.scene.scale(0.3, 3.5, 0.3)
        this.cube.display();
        this.scene.popMatrix();

        // Leg -X+Z
        this.scene.pushMatrix();
        this.scene.translate(-2.35, 1.75, 1.35);
        this.scene.scale(0.3, 3.5, 0.3)
        this.cube.display();
        this.scene.popMatrix();

        
        /* NOTE: WHEN PERFORMING THE ENTIRE CUBE IT IS EXPECTED 
        THAT ALL CUBE cubeS ARE cubeD OUTWARDS! */ 
    }

    // These are only needed if you are enabling normal visualization in compound objects
    enableNormalViz(){     this.cube.enableNormalViz();    } ;
    disableNormalViz(){     this.cube.disableNormalViz();    } ;
}


