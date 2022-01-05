export class MyVehicle extends CGFobject {
    constructor(scene) {
        super(scene);


        this.body = new MyBody(this.scene);
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.angleYY = 0;
        this.speed = 0;
        this.propellerAng = 0;

        this.autopilot = false;
        this.time = 0;

        this.initBuffers();
    }
  
    updateBuffers(complexity){
      this.slices = 3 + Math.round(9 * complexity); 

      this.initBuffers();
      this.initNormalVizBuffers();
    }

    update(t){
      if(this.autopilot)
        this.updateAutoPilot(t);
      else{
          this.x += this.speed * Math.sin(this.angleYY*Math.PI/180);
          this.z += this.speed * Math.cos(this.angleYY*Math.PI/180);
      }
      this.propellerAng += 25 * this.speed;
    }

    updateAutoPilot(t){
      if(this.time == 0){
        this.time = t;
      }
      else{
        this.x = this.center[0] - this.replace[0]*5;
        this.z = this.center[2] - this.replace[2]*5;
        this.angleYY += ((t - this.time)/1000)*72;

        this.updatePerpendiculars();
        this.time = t;
      }
    }

    startAutoPilot(){
      this.autopilot = true;
      this.updatePerpendiculars();
      this.center = [this.x + this.replace[0]*5, this.y, this.z + this.replace[2]*5];
  }

    stopAutoPilot(){
      this.autopilot = false;
    }

    updatePerpendiculars(){
      this.perpendicular = this.angleYY + 90;
      this.replace = [Math.sin(this.perpendicular/180*Math.PI), 0, Math.cos(this.perpendicular/180*Math.PI)];
  }

    turn(val){
      this.angleYY += val;
    }

    accelerate(val){
      this.speed += val;
      if(this.speed<0) this.speed=0;
    }

    reset(){
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.speed = 0;
      this.angleYY = 0;
      this.autopilot = false;
      this.time = 0;
    }

    display() {

      this.scene.pushMatrix();
      this.scene.translate(this.x, this.y, this.z);
      this.scene.rotate(this.angleYY*Math.PI/180.0, 0, 1, 0);
      this.body.display();
      this.scene.popMatrix();
    }
    
    setFillMode() {
      this.primitiveType=this.scene.gl.TRIANGLES;
    }

    setLineMode() {
      this.primitiveType=this.scene.gl.LINE_STRIP;
    }
}
  