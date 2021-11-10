import {CGFobject} from '../lib/CGF.js';
import { MyQuad } from './MyQuad.js';
import { MyTable } from './MyTable.js';

/**
* MyCube
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyComplexWall extends CGFobject {
    constructor(scene, appearance) {
        super(scene);

        this.plane=new MyQuad(scene, appearance);
        this.appearance = appearance;

    }
    display() {

        /* the following example illustrates composition
           with geometric transformations: 3 instances of a 
           face geometry - a Cube - are created and placed
           in the appropriate places to form one of the top corners
           of the cube */  

        this.appearance.apply();
        // Top square 1
        this.scene.pushMatrix();
        this.scene.translate(-8.5, 0, 0)
        this.scene.scale(3, 3, 1);
        this.plane.display();
        this.scene.popMatrix();
        
        // Top square 2
        this.scene.pushMatrix();
        this.scene.translate(-4.75, 0, 0)
        this.scene.scale(4.5, 3, 1);
        this.plane.display();
        this.scene.popMatrix();

        // Top square 3
        this.scene.pushMatrix();
        this.scene.scale(5, 3, 1);
        this.plane.display();
        this.scene.popMatrix();

        // Top square 4
        this.scene.pushMatrix();
        this.scene.translate(4.75, 0, 0)
        this.scene.scale(4.5, 3, 1);
        this.plane.display();
        this.scene.popMatrix();

        // Top square 5
        this.scene.pushMatrix();
        this.scene.translate(8.5, 0, 0)
        this.scene.scale(3, 3, 1);
        this.plane.display();
        this.scene.popMatrix();
        
        // Left rectangle
        this.scene.pushMatrix();
        this.scene.translate(-8.5, -5, 0)
        this.scene.scale(3, 7, 1);
        this.plane.display();
        this.scene.popMatrix();

        // Middle rectangle
        this.scene.pushMatrix();
        this.scene.translate(0, -5, 0)
        this.scene.scale(5, 7, 1);
        this.plane.display();
        this.scene.popMatrix();

        // Under window
        this.scene.pushMatrix();
        this.scene.translate(5, -7, 0)
        this.scene.scale(5, 3, 1);
        this.plane.display();
        this.scene.popMatrix();


        // Right 
        this.scene.pushMatrix();
        this.scene.translate(8.5, -5, 0)
        this.scene.scale(3, 7, 1);
        this.plane.display();
        this.scene.popMatrix();


        /* NOTE: WHEN PERFORMING THE ENTIRE CUBE IT IS EXPECTED 
        THAT ALL CUBE FACES ARE FACED OUTWARDS! */ 
    }

    // These are only needed if you are enabling normal visualization in compound objects
    enableNormalViz(){     this.table.enableNormalViz();    } ;
    disableNormalViz(){     this.table.disableNormalViz();    } ;
}


