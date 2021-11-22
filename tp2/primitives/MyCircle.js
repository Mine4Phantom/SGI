import { CGFobject } from '../lib/CGF.js';

/**
 * MyCircle
 * @constructor
 * @param {CFGscene} scene - MyScene object
 * @param {float} radius - radius of the circle
 * @param {integer} slices - number of slices around Y
 */
export class MyCircle extends CGFobject {
	constructor(scene, radius, slices) {
		super(scene);
		this.radius = radius;
		this.slices = slices;
		this.initBuffers();
		
	}
	
	initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [0, 0, 1];
        this.texCoords = [];
        
        var angle = 0;
		var beta = 2 * Math.PI / this.slices;

		for(var i = 0; i <= this.slices; i++){
				var x_ang = Math.cos(angle) * this.radius;
                var y_ang = Math.sin(angle) * this.radius;
                angle += beta;

                //Vertices
                this.vertices.push(x_ang, y_ang, 0);
                //Normals
                this.normals.push(0, 0, 1);
                //Indices
                this.indices.push(0, i, i + 1);
                //Text Coords
                this.texCoords.push((Math.cos(beta * i) + 1) / 2, 1 - (Math.sin(beta * i) + 1) / 2);
			
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