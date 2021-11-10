import {CGFappearance, CGFobject} from '../lib/CGF.js';
import { MyTable } from './MyTable.js';
import { MyComplexWall } from './MyComplexWall.js';
import { MyChair } from './MyChair.js';
import { MyWall } from './MyWall.js';
import { MyPyramid } from './MyPyramid.js';
import { MyCube } from './MyCube.js';
import { MyLamp } from './MyLamp.js';

/**
* MyCube
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyRoom extends CGFobject {
    constructor(scene) {
        super(scene);

        //Isto deve dar para reduzir que está feio

        this.tableAppearance = new CGFappearance(this.scene);
        this.tableAppearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.tableAppearance.setDiffuse(0.66, 0.33, 0, 1);
        this.tableAppearance.setSpecular(0, 0, 0, 1);
        this.tableAppearance.setShininess(120);

        this.chairAppearance = new CGFappearance(this.scene);
        this.chairAppearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.chairAppearance.setDiffuse(0.2, 0.2, 1, 1);
        this.chairAppearance.setSpecular(0, 0, 0, 1);
        this.chairAppearance.setShininess(120);

        this.chairAppearance2 = new CGFappearance(this.scene);
        this.chairAppearance2.setAmbient(0.3, 0.3, 0.3, 1);
        this.chairAppearance2.setDiffuse(1, 0, 0, 1);
        this.chairAppearance2.setSpecular(1, 0, 0, 1);
        this.chairAppearance2.setShininess(120);

        this.wallAppearance = new CGFappearance(this.scene);
        this.wallAppearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.wallAppearance.setDiffuse(0.95, 0.95, 0.8, 1);
        this.wallAppearance.setSpecular(0.95, 0.95, 0.8, 1);
        this.wallAppearance.setShininess(60);

        this.complexwallAppearance = new CGFappearance(this.scene);
        this.complexwallAppearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.complexwallAppearance.setDiffuse(0.95, 0.95, 0.8, 1);
        this.complexwallAppearance.setSpecular(0.95, 0.95, 0.8, 1);
        this.complexwallAppearance.setShininess(120);

        this.floorAppearance = new CGFappearance(this.scene);
        this.floorAppearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.floorAppearance.setDiffuse(0.5, 0.5, 0.5, 1);
        this.floorAppearance.setSpecular(0.5, 0.5, 0.5, 1);
        this.floorAppearance.setShininess(50);

        this.lampAppearance = new CGFappearance(this.scene);
        this.lampAppearance.setAmbient(0.3, 0.3, 0.3, 1);
        this.lampAppearance.setDiffuse(0.83, 0.69, 0.216, 1);
        this.lampAppearance.setSpecular(0.83, 0.69, 0.216, 1);
        this.lampAppearance.setShininess(300);

        this.plane= new MyWall(scene, this.wallAppearance);
        this.table= new MyTable(scene, this.tableAppearance);
        this.complexWall = new MyComplexWall(scene, this.complexwallAppearance);
        this.chair1 = new MyChair(scene, this.chairAppearance);
        this.chair2 = new MyChair(scene, this.chairAppearance2);
        this.floor = new MyWall(scene, this.floorAppearance);
        this.lamp = new MyLamp(scene, this.lampAppearance);


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
        this.chair1.display();
        this.scene.popMatrix();

        // Chair 2
        this.scene.pushMatrix();
        this.scene.translate(8, 0, 8);
        this.scene.rotate(Math.PI/4, 0, 1, 0);
        this.chair2.display();
        this.scene.popMatrix();

        // Lamp
        this.scene.pushMatrix();
        this.scene.translate(-6.5, 3.65, 4.5);
        this.scene.rotate(Math.PI/4, 0, 1, 0);
        this.lamp.display();
        this.scene.popMatrix();

        

        /* NOTE: WHEN PERFORMING THE ENTIRE CUBE IT IS EXPECTED 
        THAT ALL CUBE FACES ARE FACED OUTWARDS! */ 
    }

    // These are only needed if you are enabling normal visualization in compound objects
    enableNormalViz(){     this.table.enableNormalViz();    } ;
    disableNormalViz(){     this.table.disableNormalViz();    } ;
}


