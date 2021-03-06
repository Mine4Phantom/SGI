import { CGFobject } from "../../lib/CGF.js";

export class MyWheels extends CGFobject {
    constructor(scene, vehicle) {
        super(scene);
        this.vehicle = vehicle;
        this.wheel_angle = 0;
        this.speed = 0;

        this.time = 0;


        this.initBuffers();
    }
  
    updateBuffers(complexity){
      this.slices = 3 + Math.round(9 * complexity); 

      this.initBuffers();
      this.initNormalVizBuffers();
    }

    update(t){
      
      this.time += 0.6*this.speed;

    }

    accelerate(val){
      this.speed += val;
    }

    reset(){
      this.wheel_angle = 0;
      this.speed = 0;

      this.time = 0;
      }

    display() {
      
      this.scene.pushMatrix();
      this.scene.translate(this.vehicle.x-5, this.vehicle.y+1.2, this.vehicle.z+2);
      this.scene.rotate(this.wheel_angle, 0, 1, 0); // Turn the wheels
      this.scene.rotate(this.time, 0, 0, 1); // Spins wheels
      this.scene.translate(5, -1, -2);
      this.scene.graph.components['wheel3'].display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.scene.translate(this.vehicle.x-5, this.vehicle.y+1.2, this.vehicle.z-2);
      this.scene.rotate(this.wheel_angle, 0, 1, 0); // Turn the wheels
      this.scene.rotate(this.time, 0, 0, 1); // spins wheels
      this.scene.translate(5, -1, 2);
      this.scene.graph.components['wheel4'].display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.scene.translate(this.vehicle.x+5, this.vehicle.y+1.2, this.vehicle.z);
      this.scene.rotate(this.time, 0, 0, 1); // spins back wheels
      this.scene.translate(-5, -1, 0);
      this.scene.graph.components['back_wheels'].display();
      this.scene.popMatrix();
      
    }
    
    setFillMode() {
      this.primitiveType=this.scene.gl.TRIANGLES;
    }

    setLineMode() {
      this.primitiveType=this.scene.gl.LINE_STRIP;
    }
}
  