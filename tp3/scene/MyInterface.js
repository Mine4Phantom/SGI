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
        if(this.gui != null)
            return
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        //this.gui.add(this.scene, 'axis').name("Display axis");
        this.initKeys();

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

    addViews() {
        var group = this.gui.addFolder("Views");
        const cameraArray = Object.keys(this.scene.graph.cameras);
        this.currentCamera = this.scene.graph.defaultView;
        group.add(this, 'currentCamera', cameraArray).name('Camera').onChange(val => this.scene.selectView(val));
    }
}