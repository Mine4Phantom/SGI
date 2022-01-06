import { CGFobject } from "../../lib/CGF.js";

export class MyVehicle extends CGFobject {
    constructor(scene, components) {
        super(scene);
        this.components = components
        this.body = 0
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.angleYY = 0;
        this.speed = 0;
        this.propellerAng = 0;

        this.time = 0;

        this.initBuffers();
    }
  
    updateBuffers(complexity){
      this.slices = 3 + Math.round(9 * complexity); 

      this.initBuffers();
      this.initNormalVizBuffers();
    }

    update(t){

      this.x += this.speed * Math.cos(this.angleYY*Math.PI/180);
      this.z += this.speed * Math.sin(this.angleYY*Math.PI/180);

    }

    accelerate(val){
      this.speed += val;
    }

    reset(){
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.speed = 0;
      this.angleYY = 0;
      this.time = 0;
    }

    display() {

      this.scene.pushMatrix();
      this.scene.translate(this.x, this.y, this.z);
      this.components["car"].display();
      this.scene.popMatrix();
    }
    
    setFillMode() {
      this.primitiveType=this.scene.gl.TRIANGLES;
    }

    setLineMode() {
      this.primitiveType=this.scene.gl.LINE_STRIP;
    }
}
  