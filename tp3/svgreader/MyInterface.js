import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        //this.gui.add(this.scene, 'axis').name("Display axis");
        this.initKeys();

        var lightsFolder = this.gui.addFolder('Lights');
        lightsFolder.add(this.scene.lights[0], 'enabled').name('Light 1');
        lightsFolder.add(this.scene.lights[1], 'enabled').name('Light 2');
        lightsFolder.add(this.scene.lights[2], 'enabled').name('Light 3');
        lightsFolder.add(this.scene.lights[3], 'enabled').name('Lamp Light');
        //lightsFolder.add(this.scene.views[0], 'enabled').name('Light 1');


        return true;
    }


    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}