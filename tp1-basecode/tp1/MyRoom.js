import {CGFappearance, CGFobject} from '../lib/CGF.js';
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

        //Isto deve dar para reduzir que está feio

        this.tableappearance = new CGFappearance(this.scene);
        this.tableappearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.tableappearance.setDiffuse(0.66, 0.33, 0, 1);
        this.tableappearance.setSpecular(0, 0, 0, 1);
        this.tableappearance.setShininess(120);

        this.chairappearance = new CGFappearance(this.scene);
        this.chairappearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.chairappearance.setDiffuse(0, 0, 1, 1);
        this.chairappearance.setSpecular(0, 0, 0, 1);
        this.chairappearance.setShininess(120);

        this.wallappearance = new CGFappearance(this.scene);
        this.wallappearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.wallappearance.setDiffuse(0.95, 0.95, 0.8, 1);
        this.wallappearance.setSpecular(0.95, 0.95, 0.8, 1);
        this.wallappearance.setShininess(60);

        this.complexwallappearance = new CGFappearance(this.scene);
        this.complexwallappearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.complexwallappearance.setDiffuse(0.95, 0.95, 0.8, 1);
        this.complexwallappearance.setSpecular(0.95, 0.95, 0.8, 1);
        this.complexwallappearance.setShininess(120);

        this.floorappearance = new CGFappearance(this.scene);
        this.floorappearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.floorappearance.setDiffuse(0.5, 0.5, 0.5, 1);
        this.floorappearance.setSpecular(0.5, 0.5, 0.5, 1);
        this.floorappearance.setShininess(50);

        this.plane= new MyWall(scene, this.wallappearance);
        this.table= new MyTable(scene, this.tableappearance);
        this.complexWall = new MyComplexWall(scene, this.complexwallappearance);
        this.chair = new MyChair(scene, this.chairappearance);
        this.floor = new MyWall(scene, this.floorappearance);


    }
    display() {


        // Table 1
        this.scene.pushMatrix();
        this.scene.translate(7, 0, -4)
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.table.display();
        this.scene.popMatrix();

        // Table 2
        this.scene.pushMatrix();
        this.scene.translate(-5, 0, 5)
        this.table.display();
        this.scene.popMatrix();

        // Table 3
        this.scene.pushMatrix();
        this.scene.translate(6, 0, 6);
        this.scene.rotate(Math.PI/4, 0, 1, 0);
        this.table.display();
        this.scene.popMatrix();

        // Floor
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.scale(20, 20, 1);
        this.floor.display();
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
        this.scene.translate(-5, 0, 7);
        this.chair.display();
        this.scene.popMatrix();

        // Chair 2
        this.scene.pushMatrix();
        this.scene.translate(8, 0, 8);
        this.scene.rotate(Math.PI/4, 0, 1, 0);
        this.chair.display();
        this.scene.popMatrix();

        /* NOTE: WHEN PERFORMING THE ENTIRE CUBE IT IS EXPECTED 
        THAT ALL CUBE FACES ARE FACED OUTWARDS! */ 
    }

    // These are only needed if you are enabling normal visualization in compound objects
    enableNormalViz(){     this.table.enableNormalViz();    } ;
    disableNormalViz(){     this.table.disableNormalViz();    } ;
}


