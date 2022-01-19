export class MyPowerUp {
    /**
     * MyPowerUp constructor
     * @param {scene} scene 
     * @param {power up x coordinate} center_x 
     * @param {power up z coordinate} center_z 
     */ 
    constructor(scene, center_x, center_z) {
        this.scene = scene;
        this.center_x = center_x;
        this.center_z = center_z;
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.center_x, 0, this.center_z);
        this.scene.graph.components['power_up'].display();
        this.scene.popMatrix();
    }
}