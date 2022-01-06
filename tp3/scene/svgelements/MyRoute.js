
export class MyRoute  {
    constructor(scene, move_tos, curves, lines, close_path ) {
        this.scene = scene;
        this.move_tos = move_tos
        this.curves = curves
        this.lines = lines
        this.close_path = close_path
    }

    display() {
        this.scene.pushMatrix();
        //this.scene.translate(this.center_x, 0, this.center_z);
        this.scene.graph.components['MyRoute'].display;
        this.scene.popMatrix();
    }
}