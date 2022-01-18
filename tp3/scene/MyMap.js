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
        this.trackMap = new SimpleImage(trackMapPath);
        this.terrainTexture = new CGFtexture(scene, terrainTexturePath);
        this.mapPlane = new MyPlane(scene, 1, 1);
        this.material = new CGFappearance(this.scene);
        this.material.setAmbient(1, 1, 1, 1);
        this.material.setDiffuse(1, 1, 1, 1);
        this.material.setSpecular(0, 0, 0, 1);
        this.material.setEmission(0, 0, 0, 1);
        this.material.setShininess(10);
    }

    in_track(position) {
        var pixel_data;
        while((pixel_data = this.trackMap.getPixel(position[0] + 256, position[1] + 256)) == null){}
        
        return (pixel_data[0] + pixel_data[1] + pixel_data[2] === 0);
    }

    display() {
        this.scene.pushMatrix();
            this.scene.scale(512, 1, 512);
            this.material.apply();
            this.terrainTexture.bind();
            this.mapPlane.display();
        this.scene.popMatrix();
    }
}