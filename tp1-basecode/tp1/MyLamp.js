import {CGFobject, CGFappearance} from '../lib/CGF.js';
import { MyCube } from './MyCube.js';
import { MyPyramid } from './MyPyramid.js';

/**
* MyCube
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyLamp extends CGFobject {
    constructor(scene, appearance) {
        super(scene);
        
        this.base = new MyCube(scene);
        this.leg = new MyCube(scene);
        this.pyramid = new MyPyramid(scene, 4, 4)


        this.legAppearance = new CGFappearance(this.scene);
        this.legAppearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.legAppearance.setDiffuse(0.753, 0.753, 0.753, 1);
        this.legAppearance.setSpecular(0.753, 0.753, 0.753, 1);
        this.legAppearance.setShininess(300);

        this.appearance = appearance;



    }
    display() {

        /* the following example illustrates composition
           with geometric transformations: 3 instances of a 
           cube geometry - a Cube - are created and placed
           in the appropriate places to form one of the top corners
           of the cube */

        this.appearance.apply();
        
        // Base
        this.scene.pushMatrix();
        this.scene.translate(0, 0.05, 0);
        this.scene.scale(1, 0.1, 1);
        this.base.display();
        this.scene.popMatrix();

        // Pyramid
        this.scene.pushMatrix();
        this.scene.translate(0, 1.7, 0);
        this.scene.scale(1, 0.5, 1);
        this.pyramid.display();
        this.scene.popMatrix();

        this.legAppearance.apply();
        // Leg
        this.scene.pushMatrix();
        this.scene.translate(0, 0.95, 0);
        this.scene.scale(0.2, 1.7, 0.2);
        this.leg.display();
        this.scene.popMatrix();


        /* NOTE: WHEN PERFORMING THE ENTIRE CUBE IT IS EXPECTED 
        THAT ALL CUBE cubeS ARE cubeD OUTWARDS! */ 
    }

    // These are only needed if you are enabling normal visualization in compound objects
    enableNormalViz(){     this.cube.enableNormalViz();    } ;
    disableNormalViz(){     this.cube.disableNormalViz();    } ;
}


