import { CGFobject } from '../lib/CGF.js';

/**
 * MyTube
 * @constructor
 * @param  {CGFscene} scene - MyScene object
 * @param {float} height - height
 * @param {float} topRadius - radius of the top circle
 * @param {float} bottomRadius - radius of the bottom circle
 * @param  {integer} stacks - number of divisions along the Z
 * @param  {integer} slices - number of divisions around the circumference
 */

export class MyTube extends CGFobject {
	constructor(scene, height, topRadius, bottomRadius, stacks, slices) {
		super(scene);

		this.stacks = stacks;
		this.slices = slices;
		this.height = height;
		this.topRadius = topRadius;
		this.bottomRadius = bottomRadius;


		this.initBuffers();
		
	}
	
	initBuffers() {
        this.vertices = [];
        this.indices = [];
		this.normals = [];
		this.texCoords = [];
    
		var angle = 2.0 *Math.PI / this.slices;

		for(var stack = 0; stack <= this.stacks; stack++){
			var radius = (this.topRadius - this.bottomRadius) * (stack / this.stacks) + this.bottomRadius; //current radius
			var h = this.height * stack / this.stacks; //z

			for(var slice = 0; slice <= this.slices; slice++){
				var x_ang = Math.cos(angle*slice) * radius;
				var y_ang = Math.sin(angle*slice) * radius;

				//Vertices
				this.vertices.push(x_ang, y_ang, h);

				//Normals
				this.normals.push(x_ang, y_ang, 0);

				//Text Coords
				this.texCoords.push(slice / this.slices, 1 - (stack / this.stacks));

			}
		}
		//Indices
		for(var stack = 0; stack < this.stacks; stack++){
			for(var slice = 0; slice < this.slices; slice++){
				var ind1 = slice + stack * (this.slices+1);
				var ind2 = slice + stack *(this.slices+1)+1;
				var ind3 = slice + (stack+1)*(this.slices+1);
				var ind4 = slice + (stack+1)*(this.slices+1)+1;
				this.indices.push(ind4, ind3, ind1);
				this.indices.push(ind1,ind2,ind4);
			}
		}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	updateBuffers(complexity){
        this.slices = 3 + Math.round(9 * complexity); //complexity varies 0-1, so slices varies 3-12

        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}