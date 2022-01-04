import { CGFobject } from "../../lib/CGF";

export class MyObstacle extends CGFobject {
    constructor(scene, center_x, center_z) {
        super(scene);
        this.center_x = center_x;
        this.center_z = center_z; 
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.center_x, 0, this.center_z);
        this.scene.graph.components['Obstacle'].display;
        this.scene.popMatrix();
    }
}