import { CGFappearance, CGFtexture } from "../lib/CGF.js";
import { MyPlane } from "../primitives/nurbs/MyPlane.js";
import { SimpleImage } from "./SimpleImage.js";

export class MyMap {

    /**
     * Constructor for map
     * @param {scene} scene 
     * @param {path to trackMap image} trackMapPath 
     * @param {path to terrain texture image} terrainTexturePath 
     */
    constructor(scene, trackMapPath, terrainTexturePath) {
        this.scene = scene;
        this.trackMap = new SimpleImage(this.onTrackMapLoaded, trackMapPath);
        this.terrainTexture = new CGFtexture(scene, terrainTexturePath);
        this.mapPlane = new MyPlane(scene, 100, 100);
        this.material = new CGFappearance(this.scene);
        this.material.setAmbient(1, 1, 1, 1);
        this.material.setDiffuse(1, 1, 1, 1);
        this.material.setSpecular(0.1, 0.1, 0.1, 0.1);
        this.material.setEmission(0, 0, 0, 1);
        this.material.setShininess(100);
    }

    onTrackMapLoaded() {
        console.log("   Track Map loaded!")
    }

    /**
     * Check if vehicle is in track
     * @param {vehicle position} position 
     * @returns true if vehicle is in track and false otherwise (edge case: image not loaded yet -> returns true)
     */
    in_track(position) {
        var pixel_data = this.trackMap.getPixelData(position[0], position[1]);
        // return rgb != 255, 255, 255
        return this.trackMap.loaded ? (pixel_data[0] + pixel_data[1] + pixel_data[2] !== 765) : true;
    }

    darkMode(){
        this.material.setAmbient(0, 0, 0, 1);
    }

    display() {
        this.scene.pushMatrix();
            this.scene.scale(512, 1, 512);
            this.scene.translate(0.5, 0.0, 0.5);
            this.scene.rotate(Math.PI / 2, 0, 1, 0);
            this.material.apply();
            this.terrainTexture.bind();
            this.mapPlane.display();
        this.scene.popMatrix();
    }
}