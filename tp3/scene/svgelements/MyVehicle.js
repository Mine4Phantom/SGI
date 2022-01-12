import { CGFobject } from "../../lib/CGF.js";
import { MyWheels } from "./MyWheels.js";

export class MyVehicle extends CGFobject {
    constructor(scene, component) {
        super(scene);
        this.component = component;
        this.body = 0
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.angleYY = 0;
        this.speed = 0;
        this.propellerAng = 0;

        this.time = 0;

        this.wheels = new MyWheels(scene, component);

        this.initBuffers();
    }
  
    updateBuffers(complexity){
      this.slices = 3 + Math.round(9 * complexity); 

      this.initBuffers();
      this.initNormalVizBuffers();
    }

    update(t){

      
      this.x -= this.speed * Math.cos(this.angleYY*Math.PI/180);
      this.z -= this.speed * Math.sin(this.angleYY*Math.PI/180);
      this.wheels.update(t);
      
    }

    accelerate(val){
      this.speed += val;
      this.wheels.accelerate(val);
    }

    reset(){
      this.wheels.reset();
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
      this.component['body'].display();
      this.scene.popMatrix();

      

      this.wheels.display();

      
    }
    
    setFillMode() {
      this.primitiveType=this.scene.gl.TRIANGLES;
    }

    setLineMode() {
      this.primitiveType=this.scene.gl.LINE_STRIP;
    }
}
  