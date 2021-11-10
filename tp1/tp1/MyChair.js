import {CGFobject} from '../lib/CGF.js';
import { MyCube } from './MyCube.js';
import { MyTable } from './MyTable.js';

/**
* MyCube
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyChair extends CGFobject {
    constructor(scene, appearance) {
        super(scene);

        this.cube=new MyCube(scene);
        this.appearance = appearance;
    }
    display() {

        /* the following example illustrates composition
           with geometric transformations: 3 instances of a 
           face geometry - a quad - are created and placed
           in the appropriate places to form one of the top corners
           of the cube */
        this.appearance.apply();


        // Stair sit
        this.scene.pushMatrix();
        this.scene.translate(0, 2, 0);
        this.scene.scale(1.55, 0.15, 1.55)
        this.cube.display();
        this.scene.popMatrix();

        // Leg  +X+Z   
        this.scene.pushMatrix();
        this.scene.translate(0.7, 1, 0.7);
        this.scene.scale(0.15, 2, 0.15)
        this.cube.display();
        this.scene.popMatrix();

        // Leg +X-Z
        this.scene.pushMatrix();
        this.scene.translate(0.7, 1, -0.7);
        this.scene.scale(0.15, 2, 0.15)
        this.cube.display();
        this.scene.popMatrix();

        // Leg -X-Z
        this.scene.pushMatrix();
        this.scene.translate(-0.7, 1, -0.7);
        this.scene.scale(0.15, 2, 0.15)
        this.cube.display();
        this.scene.popMatrix();

        // Leg -X+Z
        this.scene.pushMatrix();
        this.scene.translate(-0.7, 1, 0.7);
        this.scene.scale(0.15, 2, 0.15)
        this.cube.display();
        this.scene.popMatrix();

        // Right back support
        this.scene.pushMatrix();
        this.scene.translate(-0.7, 3, 0.7);
        this.scene.scale(0.15, 2, 0.15)
        this.cube.display();
        this.scene.popMatrix();

        // Left back support
        this.scene.pushMatrix();
        this.scene.translate(0.7, 3, 0.7);
        this.scene.scale(0.15, 2, 0.15)
        this.cube.display();
        this.scene.popMatrix();

        // Back support
        this.scene.pushMatrix();
        this.scene.translate(0, 3.5, 0.7);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.scale(1.55, 0.15, 1)
        this.cube.display();
        this.scene.popMatrix();

        /* NOTE: WHEN PERFORMING THE ENTIRE CUBE IT IS EXPECTED 
        THAT ALL CUBE FACES ARE FACED OUTWARDS! */ 
    }

    // These are only needed if you are enabling normal visualization in compound objects
    enableNormalViz(){     this.face.enableNormalViz();    } ;
    disableNormalViz(){     this.face.disableNormalViz();    } ;
}


