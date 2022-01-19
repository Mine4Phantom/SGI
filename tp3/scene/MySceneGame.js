import { CGFscene } from '../lib/CGF.js';
import { CGFaxis, CGFcamera, CGFcameraOrtho, CGFappearance, CGFshader, CGFtexture } from '../lib/CGF.js';
import { MyQuad } from '../primitives/MyQuad.js';
import { MyMap } from './MyMap.js';
import { changeSceneByName } from './main.js';


var DEGREE_TO_RAD = Math.PI / 180;

/**
 * MySceneGame class, representing the scene that is to be rendered.
 */
export class MySceneGame extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
        this.changeSceneName = null
        this.difficulty = null
        this.track = null
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sxgLoaded = false;
        this.svgLoaded = false

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100); // Do not change this value otherwise seconds will be miscounted
        // Time in seconds for the race
        this.timer = 60
        this.timeIsUp = false
        // ticks
        this.ticks = 0

        // Power up logic
        this.powerUpActive = false
        this.powerUpMaxTimer = 10
        this.powerUpTimer = this.powerUpMaxTimer

        // Dictionary containing bool values to check if light is on or not
        this.lightsOn = {};

        // Auxiliary variables to delay successive key presses (for M key in particular)
        this.lastUpdate = 0;
        this.lastMPress = 0;
        this.speedFactor = 1;

        // Aux vars for key control
        this.escape = false
        this.pause = false
        this.menuOption = 0



        // MAP
        var trackMapPath = "./SimpleMapTexture.png";
        var terrainTexturePath = "./MapTexture.png";
        this.map = new MyMap(this, trackMapPath, terrainTexturePath);

        // POWER UPS
        this.powerUps = [];

        // OBSTACLE
        this.obstacles = []

        // START LINE
        this.startLine = null;

        // VEHICLE 
        this.vehicle = null;

        // ROUTES 
        this.routes = [];

		// TEXT
		this.textAppearance = new CGFappearance(this);

		// font texture: 16 x 16 characters
		// http://jens.ayton.se/oolite/files/font-tests/rgba/oolite-font.png
		this.fontTexture = new CGFtexture(this, "../textures/oolite-font.trans.png");
		this.textAppearance.setTexture(this.fontTexture);

		// plane where texture character will be rendered
		this.quad=new MyQuad(this);
		
		// instatiate text shader (used to simplify access via row/column coordinates)
		// check the two files to see how it is done
		this.textShader=new CGFshader(this.gl, "../shaders/font.vert", "../shaders/font.frag");

		// set number of rows and columns in font texture
		this.textShader.setUniformsValues({'dims': [16, 16]});

		// create dict for text
		this.textDict = {
			a:[1,4],b:[2,4],c:[3,4],d:[4,4],e:[5,4],f:[6,4],g:[7,4],h:[8,4],i:[9,4],j:[10,4],k:[11,4],l:[12,4],m:[13,4],n:[14,4],o:[15,4],p:[0,5],q:[1,5],r:[2,5],s:[3,5],t:[4,5],u:[5,5],v:[6,5],w:[7,5],x:[8,5],y:[9,5],z:[10,5],'*':[10,2],"0":[0,3],"1":[1,3],"2":[2,3],"3":[3,3],"4":[4,3],"5":[5,3],"6":[6,3],"7":[7,3],"8":[8,3],"9":[9,3],":":[10,3],".":[14,2],"-":[13,2],"/":[15,2]
		} 

        // Picking
        this.setPickEnabled(true);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcameraOrtho(0, 0, 0, 0, 0.1, 500, vec3.fromValues(35, 35, 35), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.
        var lightsFolder;
        // Lights folder in GUI
        if(this.interface.gui.__folders["Lights"] == null)
            lightsFolder = this.interface.gui.addFolder('Lights');
        else
            lightsFolder = this.interface.gui.__folders["Lights"]

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lightsOn[key] = light[0];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);
                this.lights[i].setConstantAttenuation(light[6][0]);
                this.lights[i].setLinearAttenuation(light[6][1]);
                this.lights[i].setQuadraticAttenuation(light[6][2]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[7]);
                    this.lights[i].setSpotExponent(light[8]);
                    this.lights[i].setSpotDirection(light[9][0], light[9][1], light[9][2]);
                }

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;

                // add light to gui lights folder
                lightsFolder.add(this.lightsOn, key).name(key);
            }
        }
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }


    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.camera = this.graph.cameras[this.graph.defaultView];
        this.interface.setActiveCamera(this.camera);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

        this.interface.addViews();

        this.sxgLoaded = true;
    }

    onSVGLoaded() {
        this.svgLoaded = true;
    }
 
    update(t) {
        if(this.escape == false && this.pause == false){
            this.ticks+=1
            // A second has passed
            if(this.ticks % 10 == 0){
                if(this.timer > 0)
                    this.timer-=1
                else
                    this.timeIsUp = true
                
                if(this.powerUpActive){
                    if(this.powerUpTimer > 0)
                        this.powerUpTimer-=1
                    else{
                        this.powerUpActive = false
                        this.powerUpTimer = this.powerUpMaxTimer
                    }
                }

            }
        }

        this.lastUpdate = t;
        this.checkKeys(t);
        if (this.vehicle != null && this.escape == false && this.pause == false && this.timeIsUp == false){
            this.vehicle.update(t);
        }
            
        if(this.changeSceneName != null)
			changeSceneByName(this.changeSceneName);
		this.changeSceneName = null
    }

    selectView(viewId) {
        this.camera = this.graph.cameras[viewId];
        this.interface.setActiveCamera(this.ca5mera);
    }

    checkKeys(t) {
        if (this.gui.isKeyPressed("Escape")) {
            if(this.escape == false){
                this.escape = true
                this.menuOption = 0
            }
            else
                this.escape = false
        } 
        else if (this.gui.isKeyPressed("Space")){
            if(this.pause == false)
                this.pause = true
            else
                this.pause = false
        }
        if(this.escape){
            if(this.gui.isKeyPressed("Digit1")){
                this.menuOption = 1
            }
            else if(this.gui.isKeyPressed("Digit2")){
                this.menuOption = 2
            }
            if(this.gui.isKeyPressed("Enter")){
                this.chooseOption(this.menuOption)
            }
        }

        if(this.pause == true || this.escape == true || this.timeIsUp == true)
            return

        if (this.gui.isKeyPressed("KeyM")) {
            if (this.lastUpdate - this.lastMPress > 200) {
                this.lastMPress = t;
                this.graph.currentMaterialIndex++;
            }
        }
        if (this.gui.isKeyPressed("KeyW")) {
            if(this.powerUpActive)
                this.vehicle.accelerate(0.3 * this.speedFactor);        
            else
                this.vehicle.accelerate(0.25 * this.speedFactor);        
            
        }
        if (this.gui.isKeyPressed("KeyS")) {
            this.vehicle.accelerate(-0.25 * this.speedFactor);
        }
        if (this.gui.isKeyPressed("KeyA")) {
            this.vehicle.turnWheels(0.3);
        }

        if (this.gui.isKeyPressed("KeyD")) {
            this.vehicle.turnWheels(-0.3);
        }

        if (this.gui.isKeyPressed("KeyR")) {
            this.vehicle.reset();
        }

        if (this.gui.isKeyPressed("KeyP")) { // TO Do remove once power up collection is working
            this.powerUpActive = true 
            this.powerUpTimer = this.powerUpMaxTimer
        }
    }

    //Based on oolite-font image given. it is present in textures folder
    writeOnScreen(text, textId, pickable){
        text=text.toLowerCase()
        var spacing = 1
        if(pickable)
            this.registerForPick(textId, this.quad);
        for (var index in text){
            var char = text[index]
            if(char == ' '){
                this.translate(spacing,0,0);
                continue
            }

            var charPos = this.textDict[text[index]]
            if(charPos == undefined)
                continue
            this.activeShader.setUniformsValues({'charCoords': charPos});
            this.quad.display();

            this.translate(spacing,0,0);
        }
    }

	chooseOption(optionNumber){
		switch(optionNumber){
			case 1: this.changeSceneName = "Menu"; break;
			case 2: this.escape = false; break;
			default: break;

		}
	}

	checkPicking()
	{
		if (this.pickMode == false) {
			if (this.pickResults != null && this.pickResults.length > 0) {
				for (var i=0; i< this.pickResults.length; i++) {
					var obj = this.pickResults[i][0];
					if (obj)
					{
						var customId = this.pickResults[i][1];				
						//console.log("Picked object: " + obj + ", with pick id " + customId);
						this.chooseOption(customId)
					}
				}
				this.pickResults.splice(0,this.pickResults.length);
			}		
		}
	}

    roundTo(n, digits) {
        var negative = false;
        if (digits === undefined) {
            digits = 0;
        }
        if (n < 0) {
            negative = true;
            n = n * -1;
        }
        var multiplicator = Math.pow(10, digits);
        n = parseFloat((n * multiplicator).toFixed(11));
        n = (Math.round(n) / multiplicator).toFixed(digits);
        if (negative) {
            n = (n * -1).toFixed(digits);
        }
        return n;
    }

    //To Do change stuff it various difficultiues
    setSettings(difficulty, track){
        this.difficulty = difficulty
        this.track = track

        if(this.difficulty == 1){
            this.timer = 75
            this.powerUpMaxTimer = 15
        }
        else if(this.difficulty == 2){
            this.timer = 60
            this.powerUpMaxTimer = 10
        }
        else if(this.difficulty == 3){
            this.timer = 45
            this.powerUpMaxTimer = 5
        }
        this.powerUpTimer = this.powerUpMaxTimer
    }

    displayHUD() {
		    this.setActiveShaderSimple(this.textShader);
            this.textAppearance.apply()

            var customId = 1
            
            this.pushMatrix();
                // 	Reset transf. matrix to draw independent of camera
                this.loadIdentity();
                // transform as needed to place on screen
                this.translate(-5.4,15.5,-40);
                this.writeOnScreen("Rocket Kart", customId, false)
            this.popMatrix();

            this.pushMatrix();
                // 	Reset transf. matrix to draw independent of camera
                this.loadIdentity();
                // transform as needed to place on screen
                this.translate(-28,-15,-40);
                this.writeOnScreen(this.roundTo(this.vehicle.speed*16,0) + "KM/H", customId, false)
            this.popMatrix();

            this.pushMatrix();
                // 	Reset transf. matrix to draw independent of camera
                this.loadIdentity();
                // transform as needed to place on screen
                this.translate(-28,15,-40);
                this.writeOnScreen("Time Left:" + this.timer + "s", customId, false)
            this.popMatrix();

            if(this.powerUpActive){
                this.pushMatrix();
                    // 	Reset transf. matrix to draw independent of camera
                    this.loadIdentity();
                    // transform as needed to place on screen
                    this.translate(15,15,-40);
                    this.writeOnScreen("SPEED UP:" + this.powerUpTimer + "s", customId, false)
                this.popMatrix();
            }

            if(this.timeIsUp){
                this.pushMatrix();
                    // 	Reset transf. matrix to draw independent of camera
                    this.loadIdentity();
                    // transform as needed to place on screen
                    this.translate(-4,-5,-20);
                    this.writeOnScreen("Time is UP", customId, false)
                this.popMatrix();
            }

            if(this.escape == true){
                this.pushMatrix();
                    // 	Reset transf. matrix to draw independent of camera
                    this.loadIdentity();
                    // transform as needed to place on screen
                    this.translate(-10.4,4,-20);
                    this.writeOnScreen("Do you want to Exit Game?", customId, false)
                    this.translate(-20,-4,0);
                    this.writeOnScreen("1 YES", customId, true)
                    if(this.menuOption == 1){
                        this.translate(-4,0,0);
                        this.writeOnScreen("*", customId)
                    }
                    customId+=1
                this.popMatrix();
                this.pushMatrix();
                    this.loadIdentity();
                    this.translate(2,0,-20);
                    this.writeOnScreen("2 NO", customId, true)
                    if(this.menuOption == 2){
                        this.translate(-3,0,0);
                        this.writeOnScreen("*", customId)
                    }
                    customId+=1
                    this.clearPickRegistration();

                this.popMatrix();
            } 
            else if(this.pause == true){
                this.pushMatrix();
                    // 	Reset transf. matrix to draw independent of camera
                    this.loadIdentity();
                    // transform as needed to place on screen
                    this.translate(-5.4,0,-20);
                    this.writeOnScreen("Game Paused", customId, false)
                this.popMatrix();
            }

            // reactivate default shader
		    this.setActiveShaderSimple(this.defaultShader);
    }

    /**
     * Displays the scene.
     */
    display() {
        this.checkPicking();
        // this resets the picking buffer
		this.clearPickRegistration();

        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        this.axis.display();

        var i = 0;
        for (var key in this.lightsOn) {
            if (this.lightsOn.hasOwnProperty(key)) {
                if (this.lightsOn[key]) {
                    this.lights[i].setVisible(true);
                    this.lights[i].enable();
                }
                else {
                    this.lights[i].setVisible(false);
                    this.lights[i].disable();
                }
                this.lights[i].update();
                i++;
            }
        }



        if (this.sxgLoaded && this.svgLoaded) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            //this.graph.displayScene();
            this.map.display();
            this.vehicle.display();

            // Display HUD
            this.displayHUD()

            for (var i = 0; i < this.powerUps.length; i++) 
                this.powerUps[i].display();

            for (var i = 0; i < this.obstacles.length; i++) 
                this.obstacles[i].display();
        }

        this.popMatrix();

        // re-enable depth test 
		this.gl.enable(this.gl.DEPTH_TEST);


        // ---- END Background, camera and axis setup
    }
}