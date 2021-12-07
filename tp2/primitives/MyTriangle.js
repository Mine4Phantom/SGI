import {CGFobject} from '../lib/CGF.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTriangle extends CGFobject {
	constructor(scene, id, x1, y1, x2, y2, x3, y3) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.x3 = x3;
		this.y1 = y1;
		this.y2 = y2;
		this.y3 = y3;
		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [
			this.x1, this.y1, 0,	//0
			this.x2, this.y2, 0,	//1
			this.x3, this.y3, 0,	//2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2
		];

		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];


		//The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}

	updateTexCoords(factor_s, factor_t) {

		this.distancep1p2 = Math.sqrt( Math.pow((this.x2 - this.x1), 2) +
		Math.pow((this.y2 - this.y1), 2));
		this.distancep1p3 = Math.sqrt( Math.pow((this.x3 - this.x1), 2) +
		Math.pow((this.y3 - this.y1), 2));
		this.distancep2p3 = Math.sqrt( Math.pow((this.x3 - this.x2), 2) +
		Math.pow((this.y3 - this.y2), 2));

		var angBeta = Math.acos((Math.pow(this.distancep2p3, 2) - Math.pow(this.distancep1p3, 2) + Math.pow(this.distancep1p2, 2)) / (2 * this.distancep2p3 * this.distancep1p2));
		var distD = this.distancep2p3 * Math.sin(angBeta);
		

		this.texCoords = [
		0, distD/factor_t,
		this.distancep1p2/factor_s, distD/factor_t,
		(this.distancep1p2-this.distancep2p3*Math.cos(angBeta))/factor_s,(distD-this.distancep2p3*Math.sin(angBeta))/factor_t
		];
	
		this.updateTexCoordsGLBuffers();
	}

}