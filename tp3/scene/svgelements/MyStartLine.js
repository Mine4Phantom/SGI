export class MyStartLine {
    /**
     * MyStartLine constructor
     * @param {scene} scene 
     * @param {start line position ([x,z])} position 
     * @param {angle in the xOz plane} orientation 
     */
    constructor(scene, position, orientation) {
        this.scene = scene;
        this.position = position;
        this.orientation = orientation
        this.center_x = position[0];
        this.center_z = position[1];
    }

    display() {
        this.scene.pushMatrix();
            //this.scene.translate(this.position[0], 0, this.position[1]);
            //this.scene.rotate(this.orientation, 0, 1, 0);
            this.scene.graph.components['start_line'].display();
        this.scene.popMatrix();
    } 
}