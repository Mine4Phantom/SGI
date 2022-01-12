import { CGFobject } from "../../lib/CGF.js";

export class MyWheels extends CGFobject {
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

        this.wheels = 

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
      this.time += 0.5*this.speed;

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
      this.scene.translate(this.x-5, this.y+1, this.z);
      this.scene.rotate(this.time, 0, 0, 1);
      this.scene.translate(5, -1, 0);
      this.component['front_wheels'].display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.scene.translate(this.x+5, this.y+1, this.z);
      this.scene.rotate(this.time, 0, 0, 1);
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
  