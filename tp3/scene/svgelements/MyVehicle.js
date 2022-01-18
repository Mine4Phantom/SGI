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
      // console.log(this.scene.map.in_track([this.x,this.z]))

      // Car position
      this.x -= this.speed * Math.cos(this.direction);
      this.z += this.speed * Math.sin(this.direction);

      // Wheels position
      this.wheels.x -= this.speed * Math.cos(this.direction);
      this.wheels.z += this.speed * Math.sin(this.direction);

      // Wheel Angle
      this.wheels.wheel_angle = this.wheels.wheel_angle * 0.8
      this.wheels.update(t);
      
      // Drag
      this.speed = this.speed*0.98;
      this.wheels.speed = this.speed*0.98;

      // Turn car
      this.turn((this.wheels.wheel_angle)*0.2);
    }

    turn(val){ // TODO Make this work while going backwards
      if(this.speed < -2){ // Going fast backwards
        this.direction -= val*((-1/10)*(this.speed+2)**2 + 2);
        this.wheels.direction -= val*((-1/10)*(this.speed+2)**2 + 2);
      }
      else if(this.speed < 0){ // Going slowly backwards
        this.direction += val*(-1/2*(this.speed-2)**2+2);
        this.wheels.direction += val*(-1/2*(this.speed)-2**2+2);
      }
      else if(this.speed < 2){ // turns based on a parabolic curve
        this.direction += val*(-1/2*(this.speed-2)**2+2);
        this.wheels.direction += val*(-1/2*(this.speed)-2**2+2);
      }else if (this.speed >= 2){ // turns based on a parabolic curve
        this.direction += val*((-1/10)*(this.speed-2)**2 + 2);
        this.wheels.direction += val*((-1/10)*(this.speed-2)**2 + 2);
      }
    }

    turnWheels(val){
      this.wheels.wheel_angle += val

      if(this.wheels.wheel_angle >= Math.PI/4.5)
        this.wheels.wheel_angle = Math.PI/4.5
      else if(this.wheels.wheel_angle <= -Math.PI/4.5)
        this.wheels.wheel_angle = -Math.PI/4.5
      
    }

    accelerate(val){
      this.speed += (val - (0.02 * this.speed));
      this.wheels.speed += val - (0.02 * this.speed);
    }

    reset(){
      this.wheels.reset();
      this.body = 0
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.direction = 0;
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
      this.scene.translate(-this.x, -this.y, -this.z);
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
  