import { CGFnurbsObject, CGFnurbsSurface, CGFobject } from "../../lib/CGF.js";

/**
 * MyPlane is a class that represents a plane through NURBS. It is equivalent to a Patch with U and V degree of 1
 */
export class MyPlane extends CGFobject {

    /**
     * @constructor
     * @param {MySceneGame} scene 
     * @param {Number} nDivisionsU  Number of divisions on the U Axis
     * @param {Number} nDivisionsV  Number of divisions on the V Axis
     */
    constructor(scene, nDivisionsU, nDivisionsV) {
        super(scene);

        this.nDivisionsU = nDivisionsU;
        this.nDivisionsV = nDivisionsV;
        this.initBuffers();
    }


    initBuffers() {


        let controlPoints = [
            // U = 0
            [ // V = 0..1;
                [-0.5,0,-0.5, 1],
                [0.5,0.0, -0.5, 1]

            ],
            // U = 1
            [ // V = 0..1
                [-0.5, 0.0, 0.5, 1],
                [0.5, 0.0, 0.5, 1]
            ]
        ];

        let nurbsSurface = new CGFnurbsSurface(1, 1, controlPoints);
        this.nurbsObject = new CGFnurbsObject(this.scene, this.nDivisionsU, this.nDivisionsV, nurbsSurface); 

    }

    display(){

        this.nurbsObject.display();
    }

}