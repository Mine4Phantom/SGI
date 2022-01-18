export class MyStartLine {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position;
    }

    display() {
        this.scene.pushMatrix();
            this.scene.translate(this.position[0], 0, this.position[1]);
            this.scene.graph.components['start_line'].display();
        this.scene.popMatrix();
    } 
}