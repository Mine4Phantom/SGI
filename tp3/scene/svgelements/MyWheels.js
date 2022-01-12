import { CGFobject } from "../../lib/CGF.js";

export class MyWheels extends CGFobject {
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

      this.x -= this.speed * Math.cos(this.direction*Math.PI/180);
      this.z += this.speed * Math.sin(this.direction*Math.PI/180);
      this.time += 0.5*this.speed;

    }

    turnWheel(val){
      this.wheel_angle += val
      if(this.wheel_angle >= Math.PI/6)
        this.wheel_angle = Math.PI/6
      else if(this.wheel_angle <= -Math.PI/6)
        this.wheel_angle = -Math.PI/6
    }

    turn(val){
      this.direction += val;
    }

    accelerate(val){
      this.speed += val;
    }

    reset(){
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.speed = 0;
        this.direction = 0;
        this.time = 0;
      }

    display() {
      
      this.scene.pushMatrix();
      this.scene.translate(this.x-5, this.y+1, this.z+2);
      this.scene.rotate(this.wheel_angle, 0, 1, 0); // Turn the wheels
      this.scene.rotate(this.time, 0, 0, 1); // Spins wheels
      this.scene.translate(5, -1, -2);
      this.component['wheel3'].display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.scene.translate(this.x-5, this.y+1, this.z-2);
      this.scene.rotate(this.wheel_angle, 0, 1, 0); // Turn the wheels
      this.scene.rotate(this.time, 0, 0, 1); // spins wheels
      this.scene.translate(5, -1, 2);
      this.component['wheel4'].display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.scene.translate(this.x+5, this.y+1, this.z); // Turn the wheels
      this.scene.rotate(this.time, 0, 0, 1); // spins back wheels
      this.scene.translate(-5, -1, 0);
      this.component['back_wheels'].display();
      this.scene.popMatrix();
      
    }
    
    setFillMode() {
      this.primitiveType=this.scene.gl.TRIANGLES;
    }

    setLineMode() {
      this.primitiveType=this.scene.gl.LINE_STRIP;
    }
}
  