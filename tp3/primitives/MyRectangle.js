import { CGFobject } from '../lib/CGF.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyRectangle extends CGFobject {
	constructor(scene, id, x1, x2, y1, y2) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;

		this.maxS = x2-x1;
		this.maxT = y2-y1;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, 0,	//0
			this.x2, this.y1, 0,	//1
			this.x1, this.y2, 0,	//2
			this.x2, this.y2, 0		//3
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
			1, 3, 2
		];

		//Facing Z positive
		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];
		
		/*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */

		this.texCoords = [
			0, 1,
			1, 1,
			0, 0,
			1, 0
		]
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(factor_s, factor_t) {
		let UminS = 0;
		let UminT = 0;
		let UmaxS=this.maxS/factor_s; // delta x
		let UmaxT=this.maxT/factor_t; // delta y

		//console.log("factor_s ", factor_s)
		//console.log("factor_t ", factor_t)
		//console.log("this.maxS ",this.maxS)
		//console.log("this.maxT ",this.maxT)
		//console.log("UmaxS ",UmaxS)
		//console.log("UmaxT ",UmaxT)

		//UmaxS = 1.5;
		//UmaxT = 1.5;
	
		this.texCoords = [
			UminS, UmaxT,
			UmaxS, UmaxT,
			UminS, UminT,
			UmaxS, UminT
			];
	
		this.updateTexCoordsGLBuffers();
	}
}

