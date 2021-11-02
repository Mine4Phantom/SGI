import {CGFappearance, CGFobject} from '../lib/CGF.js';
import { MyQuad } from './MyQuad.js';
import { MyTable } from './MyTable.js';
import { MyComplexWall } from './MyComplexWall.js';
import { MyChair } from './MyChair.js';
import { MyWall } from './MyWall.js';

/**
* MyCube
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyRoom extends CGFobject {
    constructor(scene) {
        super(scene);

        this.tableappearance = new CGFappearance(this.scene);
        this.tableappearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.tableappearance.setDiffuse(1, 0, 0, 1);
        this.tableappearance.setSpecular(0, 0, 0, 1);
        this.tableappearance.setShininess(120);

        this.chairappearance = new CGFappearance(this.scene);
        this.chairappearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.chairappearance.setDiffuse(0, 0, 1, 1);
        this.chairappearance.setSpecular(0, 0, 0, 1);
        this.chairappearance.setShininess(120);

        this.wallappearance = new CGFappearance(this.scene);
        this.wallappearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.wallappearance.setDiffuse(0, 1, 0, 1);
        this.wallappearance.setSpecular(0, 0, 1, 1);
        this.wallappearance.setShininess(120);

        this.complexwallappearance = new CGFappearance(this.scene);
        this.complexwallappearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.complexwallappearance.setDiffuse(0, 1, 1, 1);
        this.complexwallappearance.setSpecular(0, 0, 0, 1);
        this.complexwallappearance.setShininess(120);

        this.plane= new MyWall(scene, this.wallappearance);
        this.table= new MyTable(scene, this.tableappearance);
        this.complexWall = new MyComplexWall(scene, this.complexwallappearance);
        this.chair = new MyChair(scene, this.chairappearance);


    }
    display() {

        /* the following example illustrates composition
           with geometric transformations: 3 instances of a 
           face geometry - a Cube - are created and placed
           in the appropriate places to form one of the top corners
           of the cube */

        // Table 1
        this.scene.pushMatrix();
        this.table.display();
        this.scene.popMatrix();
        // Table 2
        this.scene.pushMatrix();
        this.scene.translate(-5, 0, 5)
        this.table.display();
        this.scene.popMatrix();

        // Table 3
        this.scene.pushMatrix();
        this.scene.translate(5, 0, -5)
        this.table.display();
        this.scene.popMatrix();

        // Floor
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.scale(20, 20, 1);
        this.plane.display();
        this.scene.popMatrix();
        
        // +X Clean wall
        this.scene.pushMatrix();
        this.scene.translate(10, 5, 0)
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.scene.scale(20, 10, 1);
        this.plane.display();
        this.scene.popMatrix();
        
        // -X CLean Wall
        this.scene.pushMatrix();
        this.scene.translate(-10, 5, 0)
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(20, 10, 1);
        this.plane.display();
        this.scene.popMatrix();

        // +Z Clean wall
        this.scene.pushMatrix();
        this.scene.translate(0, 5, 10);
        this.scene.rotate(Math.PI, 1, 0, 0);
        this.scene.scale(20, 10, 1);
        this.plane.display();
        this.scene.popMatrix();


        // Complex wall
        this.scene.pushMatrix();
        this.scene.translate(0, 8.5, -10)
        this.complexWall.display();
        this.scene.popMatrix();

        // Chair 1
        this.scene.pushMatrix();
        this.scene.translate(10, 0, 5);
        this.chair.display();
        this.scene.popMatrix();

        // Chair 2
        this.scene.pushMatrix();
        this.scene.translate(5, 0, 10);
        this.chair.display();
        this.scene.popMatrix();

        /*
        // -Z Door Window Wall
        this.scene.pushMatrix();
        this.scene.translate(0, 5, -10)
        //this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.scene.scale(20, 10, 1);
        this.plane.display();
        this.scene.popMatrix();
        */
        /* NOTE: WHEN PERFORMING THE ENTIRE CUBE IT IS EXPECTED 
        THAT ALL CUBE FACES ARE FACED OUTWARDS! */ 
    }

    // These are only needed if you are enabling normal visualization in compound objects
    enableNormalViz(){     this.table.enableNormalViz();    } ;
    disableNormalViz(){     this.table.disableNormalViz();    } ;
}


