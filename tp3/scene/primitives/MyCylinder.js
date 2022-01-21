import { CGFobject } from '../../lib/CGF.js';
import { MyTube} from './MyTube.js'
import { MyCircle} from './MyCircle.js'

/**
 * MyCylinder
 * @constructor
 * @param  {CGFscene} scene - MyScene object
 * @param {float} height - height
 * @param {float} topRadius - radius of the top circle
 * @param {float} bottomRadius - radius of the bottom circle
 * @param  {integer} stacks - number of stacks 
 * @param  {integer} slices - number of slices 
 */

export class MyCylinder extends CGFobject {
	constructor(scene, height, topRadius, bottomRadius, stacks, slices) {
        super(scene);

        this.cylinder_side = new MyTube(scene, height, topRadius, bottomRadius, stacks, slices);
        //Bases
        this.top_circle = new MyCircle(scene, topRadius, slices);
        this.bottom_circle = new MyCircle(scene, bottomRadius, slices);

        this.stacks = stacks;
        this.slices = slices;
        this.height = height;
        this.topRadius = topRadius;
        this.bottomRadius = bottomRadius;

		
	}
	
	
    display(){

        //Bottom
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1, 0, 0);
        this.bottom_circle.display();
        this.scene.popMatrix();

        //Top
        this.scene.pushMatrix();
        this.scene.translate(0, 0, this.height);
        this.top_circle.display();
        this.scene.popMatrix();

        this.cylinder_side.display();
    }
    
}