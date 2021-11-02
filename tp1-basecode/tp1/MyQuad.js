import {CGFobject, CGFappearance} from '../lib/CGF.js';
/**
* MyQuad
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyQuad extends CGFobject {
    constructor(scene, appearance) {
        super(scene);
        this.initBuffers();
        this.appearance = appearance;
    }

    initBuffers() {
        // Generate vertices
        this.vertices = [
            -0.5, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, 0.5, 0.0,
            0.5, -0.5, 0.0
        ];
      
        this.indices = [
            0, 1, 2,
            3, 2, 1
        ];

        this.normals = [
            0,0,1,
            0,0,1,
            0,0,1,
            0,0,1
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
/*
    display() {
        this.appearance.apply();
        this.scene.pushMatrix();
        this.scene.popMatrix();
    }
    */
}