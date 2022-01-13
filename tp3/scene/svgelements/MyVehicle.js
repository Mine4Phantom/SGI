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
        this.direction = 0;
        this.wheel_angle = 0;
        this.speed = 0;


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

      this.x -= this.speed * Math.cos(this.direction);
      this.z += this.speed * Math.sin(this.direction);
      this.wheels.update(t);
      
    }

    turn(val){
      this.direction += val*this.speed*0.01;
      this.wheels.direction += val*this.speed*0.01;
    }

    turnWheels(val){
      this.wheel_angle += val

      if(this.wheel_angle >= Math.PI/5)
        this.wheel_angle = Math.PI/5
      else if(this.wheel_angle <= -Math.PI/5)
        this.wheel_angle = -Math.PI/5

      this.wheels.wheel_angle = this.wheel_angle;
      this.turn(val*30);
    }

    accelerate(val){
      this.speed += (val - (0.025 * this.speed));
      this.wheels.accelerate(val - (0.025 * this.speed));
    }

    reset(){
      this.wheels.reset();
      this.body = 0
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.direction = 0;
      this.wheel_angle = 0;
      this.speed = 0;

      this.time = 0;
    }

    display() {
      
      this.scene.pushMatrix();
      this.scene.translate(this.x, this.y, this.z);
      this.scene.rotate(this.direction, 0, 1, 0);
      this.component['body'].display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.scene.translate(this.x, this.y, this.z);
      this.scene.rotate(this.direction, 0, 1, 0);
      this.scene.translate(-this.x, this.y, -this.z);
      this.wheels.display();
      this.scene.popMatrix();

      
    }
    
    setFillMode() {
      this.primitiveType=this.scene.gl.TRIANGLES;
    }

    setLineMode() {
      this.primitiveType=this.scene.gl.LINE_STRIP;
    }
}
  