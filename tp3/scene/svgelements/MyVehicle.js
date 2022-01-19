import { CGFobject } from "../../lib/CGF.js";
import { MyWheels } from "./MyWheels.js";

export class MyVehicle extends CGFobject {
  constructor(scene, start_direction, start_position) {
    super(scene);

    // For reset
    this.start_position_x = start_position[0];
    this.start_position_y = start_position[1];
    this.start_position_z = start_position[2];
    this.start_direction = start_direction;

    this.x = start_position[0];
    this.y = start_position[1];
    this.z = start_position[2];
    this.direction = start_direction;
    this.speed = 0;

    this.wheels = new MyWheels(scene, this);
    this.initLights();
    this.initBuffers();
  }


  initLights() {
    // Front Light
    this.scene.lights[7].setPosition(-6, 10, 0, 1);

    this.scene.lights[7].setAmbient(0, 0, 0, 0);
    this.scene.lights[7].setDiffuse(0.1, 0.1, 0.1, 0.5);
    this.scene.lights[7].setSpecular(0.0000001, 0.0000001, 0.0000001, 0.1);
    this.scene.lights[7].setConstantAttenuation(0.001);
    this.scene.lights[7].setLinearAttenuation(0.0000001);
    this.scene.lights[7].setQuadraticAttenuation(0);

    // spot
    this.scene.lights[7].setSpotCutOff(25);
    this.scene.lights[7].setSpotExponent(1000);
    this.scene.lights[7].setSpotDirection(-10, -5.9, 0);

    this.scene.lights[7].setVisible(true);
    this.scene.lights[7].enable();


    this.scene.lights[7].update();

    // Back Lights
    this.scene.lights[6].setPosition(6, 10, 0, 1);

    this.scene.lights[6].setAmbient(0, 0, 0, 0);
    this.scene.lights[6].setDiffuse(0.1, 0, 0, 0.5);
    this.scene.lights[6].setSpecular(0.0000001, 0, 0, 0.1);
    this.scene.lights[6].setConstantAttenuation(0.001);
    this.scene.lights[6].setLinearAttenuation(0.0000001);
    this.scene.lights[6].setQuadraticAttenuation(0);

    // spot
    this.scene.lights[6].setSpotCutOff(25);
    this.scene.lights[6].setSpotExponent(1000);
    this.scene.lights[6].setSpotDirection(10, -9.2, 0);

    this.scene.lights[6].setVisible(true);
    this.scene.lights[6].enable();


    this.scene.lights[6].update();

  }

  updateBuffers(complexity) {
    this.slices = 3 + Math.round(9 * complexity);

    this.initBuffers();
    this.initNormalVizBuffers();
  }

  update(t) {
    if (this.scene.map.in_track([this.x, this.z])) { }
    else { }

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
    this.speed = this.speed * 0.98;
    this.wheels.speed = this.speed * 0.98;

    // Turn car
    this.turn((this.wheels.wheel_angle) * 0.2);
  }

  turn(val) { // TODO Make this work while going backwards
    if (this.speed < -2) { // Going fast backwards
      this.direction -= val * ((-1 / 10) * (this.speed + 2) ** 2 + 2);
      this.wheels.direction -= val * ((-1 / 10) * (this.speed + 2) ** 2 + 2);
    }
    else if (this.speed < 0) { // Going slowly backwards
      this.direction += val * (-1 / 2 * (this.speed - 2) ** 2 + 2);
      this.wheels.direction += val * (-1 / 2 * (this.speed) - 2 ** 2 + 2);
    }
    else if (this.speed < 2) { // turns based on a parabolic curve
      this.direction += val * (-1 / 2 * (this.speed - 2) ** 2 + 2);
      this.wheels.direction += val * (-1 / 2 * (this.speed) - 2 ** 2 + 2);
    } else if (this.speed >= 2) { // turns based on a parabolic curve
      this.direction += val * ((-1 / 10) * (this.speed - 2) ** 2 + 2);
      this.wheels.direction += val * ((-1 / 10) * (this.speed - 2) ** 2 + 2);
    }
  }

  turnWheels(val) {
    this.wheels.wheel_angle += val

    if (this.wheels.wheel_angle >= Math.PI / 4.5)
      this.wheels.wheel_angle = Math.PI / 4.5
    else if (this.wheels.wheel_angle <= -Math.PI / 4.5)
      this.wheels.wheel_angle = -Math.PI / 4.5

  }

  accelerate(val) {
    this.speed += (val - (0.02 * this.speed));
    this.wheels.speed += val - (0.02 * this.speed);
  }

  reset() {
    this.setPosition(this.start_position_x, this.start_position_y, this.start_position_z);
    this.setDirection(this.start_direction);
    this.speed = 0;
    this.wheels.reset();
    this.time = 0;
  }

  setStartPosition(x, y, z) {
    this.start_position_x = x;
    this.start_position_y = y;
    this.start_position_z = z;
  }

  setDirection(angle) {
    this.direction = angle;
  }

  setStartDirection(angle) {
    this.start_direction = angle;
  }

  inRange(object) {
    return Math.abs(this.x - object.center_x) < 8 && Math.abs(this.z - object.center_z) < 8;
  }

  display() {

    this.scene.pushMatrix();
    this.scene.translate(this.x, this.y, this.z);
    this.scene.rotate(this.direction, 0, 1, 0);
    this.scene.lights[7].update();
    this.scene.lights[6].update();
    this.scene.graph.components['car_body'].display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(this.x, this.y, this.z);
    this.scene.rotate(this.direction, 0, 1, 0);
    this.scene.translate(-this.x, -this.y, -this.z);
    this.wheels.display();
    this.scene.popMatrix();

  }

  setFillMode() {
    this.primitiveType = this.scene.gl.TRIANGLES;
  }

  setLineMode() {
    this.primitiveType = this.scene.gl.LINE_STRIP;
  }
}
