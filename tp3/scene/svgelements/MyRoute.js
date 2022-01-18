
export class MyRoute  {
    constructor(scene, route_vertexes) {
        this.scene = scene;
        this.route_vertexes = route_vertexes;
    }

    display() {
        this.scene.pushMatrix();
        //this.scene.translate(this.center_x, 0, this.center_z);
        this.scene.graph.components['MyRoute'].display();
        this.scene.popMatrix();
    }
}