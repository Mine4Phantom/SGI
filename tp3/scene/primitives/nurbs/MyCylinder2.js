import { CGFobject } from "../../../lib/CGF.js";
import { MyPatch } from "./MyPatch.js";

/**
 * Class reperesenting a cylinder constructed using NURBS sufaces
 */
export class MyCylinder2 extends CGFobject {
    /**
     * @constructor                 Cylinder constructor
     * @param {MySceneGame} scene      Reference to the scene in which the cylinder will be dispayed
     * @param {Number} baseRadius   Radius of the bottom base (z = 0)
     * @param {Number} topRadius    Radius of the top base (z = height)
     * @param {Number} height       Height of the cylinder
     * @param {Number} slices       Number of slices, rotation divisions
     * @param {Number} stacks       Nuber of stacks, height divisions
     */
    constructor(scene, height, topRadius, baseRadius, stacks, slices) {
        super(scene);

        this.scene = scene;
        this.baseRadius = baseRadius;
        this.topRadius = topRadius;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;

        this.initBuffers();
    }

    initBuffers() {

        let baseH = 4 / 3 * this.baseRadius;
        let topH = 4 / 3 * this.topRadius;

        let controlPoints1 = [
            // U = 0
            [ // V = 0..1;
                [-this.baseRadius, 0, 0, 1],
                [-this.baseRadius, baseH, 0, 1],
                [this.baseRadius, baseH, 0, 1],
                [this.baseRadius, 0.0, 0, 1]

            ],
            // U = 1
            [ // V = 0..1
                [-this.topRadius, 0.0, this.height, 1],
                [-this.topRadius, topH, this.height, 1],
                [this.topRadius, topH, this.height, 1],
                [this.topRadius, 0.0, this.height, 1]
            ]
        ];

        let controlPoints2 = [

            // U = 0
            [ // V = 0..1
                [-this.topRadius, 0.0, this.height, 1],
                [-this.topRadius, -topH, this.height, 1],
                [this.topRadius, -topH, this.height, 1],
                [this.topRadius, 0.0, this.height, 1]
            ],
            // U = 1
            [ // V = 0..1;
                [-this.baseRadius, 0, 0, 1],
                [-this.baseRadius, -baseH, 0, 1],
                [this.baseRadius, -baseH, 0, 1],
                [this.baseRadius, 0.0, 0, 1]

            ]
        ];

        this.patch1 = new MyPatch(this.scene, this.stacks, Math.floor(this.slices / 2), 1, 3, controlPoints1);
        this.patch2 = new MyPatch(this.scene, this.stacks, Math.floor(this.slices / 2), 1, 3, controlPoints2);
    }

    display() {

        this.patch1.display();
        this.patch2.display();

    }
}