import { CGFscene } from '../../lib/CGF.js';
import { CGFaxis, CGFcamera, CGFcameraOrtho, CGFappearance, CGFshader, CGFtexture } from '../../lib/CGF.js';
import { MyQuad } from '../primitives/MyQuad.js';
import { MyMap } from '../tracks/MyMap.js';
import { changeSceneByName } from '../main.js';
import { hasWon } from '../main.js';


var DEGREE_TO_RAD = Math.PI / 180;

/**
 * MySceneGame class, representing the scene that is to be rendered.
 */
export class MySceneGame extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface, demo) {
        super();

        this.interface = myinterface;
        this.changeSceneName = null;
        this.difficulty = null;
        this.track = null;
        this.defaultView = null;
        this.demo = demo;
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
        this.maxTimer = 60
        this.timer = this.maxTimer
        this.timeIsUp = false
        // ticks
        this.ticks = 0

        // Power up logic
        this.powerUpActive = false // Only one variable because only one power up has a duration to it (acceleration)
        this.powerUpMaxTimer = 10
        this.powerUpTimer = this.powerUpMaxTimer
        this.timeBonus = false
        this.timeBonusTicks = 0

        // Obstacle logic 
        this.obstacleActive = false;
        this.obstacleMaxTimer = 10
        this.obstacleTimer = this.obstacleMaxTimer
        this.timePenalty = false
        this.timePenaltyTicks = 0

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

        // POWER UPS
        this.powerUps = [];
        // Power up types 
        this.pUpType = {
            ACC_MULT: 1,
            BONUS_TIME: 2
        }

        // OBSTACLE
        this.obstacles = []
        // Obstacle types
        this.obstacleType = {
            TIME_PENALTY: 1,
            CONTR_INV: 2
        }

        // START LINE
        this.startLine = null;
        this.maxLap = 3
        this.lap = 0
        this.onLine = true // on contact with the start line

        // WIN
        this.hasWon = false
        this.firstWin = false

        // VEHICLE 
        this.vehicle = null;

        // ROUTES 
        this.routes = [];

        // TEXT
        this.textAppearance = new CGFappearance(this);

        // font texture: 16 x 16 characters
        // http://jens.ayton.se/oolite/files/font-tests/rgba/oolite-font.png
        this.fontTexture = new CGFtexture(this, "../font_textures/oolite-font.trans.png");
        this.textAppearance.setTexture(this.fontTexture);

        // plane where texture character will be rendered
        this.quad = new MyQuad(this);

        // instatiate text shader (used to simplify access via row/column coordinates)
        // check the two files to see how it is done
        this.textShader = new CGFshader(this.gl, "../shaders/font.vert", "../shaders/font.frag");

        // set number of rows and columns in font texture
        this.textShader.setUniformsValues({ 'dims': [16, 16] });

        // create dict for text
        this.textDict = {
            a: [1, 4], b: [2, 4], c: [3, 4], d: [4, 4], e: [5, 4], f: [6, 4], g: [7, 4], h: [8, 4], i: [9, 4], j: [10, 4], k: [11, 4], l: [12, 4], m: [13, 4], n: [14, 4], o: [15, 4], p: [0, 5], q: [1, 5], r: [2, 5], s: [3, 5], t: [4, 5], u: [5, 5], v: [6, 5], w: [7, 5], x: [8, 5], y: [9, 5], z: [10, 5], '*': [10, 2], "0": [0, 3], "1": [1, 3], "2": [2, 3], "3": [3, 3], "4": [4, 3], "5": [5, 3], "6": [6, 3], "7": [7, 3], "8": [8, 3], "9": [9, 3], ":": [10, 3], ".": [14, 2], "-": [13, 2], "/": [15, 2]
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
        if (this.interface.gui.__folders["Lights"] == null)
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

        this.defaultView = this.demo ? 'Fixed Car View' : this.graph.defaultView;
        this.camera = this.graph.cameras[this.defaultView];
        this.interface.setActiveCamera(this.camera);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

        this.interface.addViews();

        this.sxgLoaded = true;
    }

    /*
    Saves powerUps and obstacles when svg loads
    Initializes vehicle lights
    */
    onSVGLoaded() {
        this.vehicle.initLights();
        this.vehicle.initRoutes();
        this.powerUpsStart = [...this.powerUps];  // Keep power ups list for reset
        this.obstaclesStart = [...this.obstacles];  // Keep obstacles list for reset
        this.svgLoaded = true;
    }

    update(t) {
        if (this.vehicle == null) // If vehicle is not yet initialized return
            return

        if (this.isLapDone()) {
            this.lap += 1
            this.timer += 10
            this.onLine = true
            if (this.lap >= this.maxLap){
                this.hasWon = true
                this.firstWin = hasWon()
                this.graph.currentMaterialIndex=1
            }
        }


        if (this.escape == false && this.pause == false && this.hasWon == false) { // If game is in a playable state (not paused), update stuff
            this.ticks += 1
            // A second has passed
            if (this.ticks % 10 == 0) {
                if (this.timer > 0)
                    this.timer -= 1
                else
                    this.timeIsUp = true

                if (this.powerUpActive) {
                    if (this.powerUpTimer > 0)
                        this.powerUpTimer -= 1
                    else { // if power up timer hits 0 it is deactivated and the timer is also restarted for the next time it is active
                        this.powerUpActive = false
                        this.powerUpTimer = this.powerUpMaxTimer
                    }
                }

                if (this.obstacleActive) {
                    if (this.obstacleTimer > 0)
                        this.obstacleTimer -= 1;
                    else {
                        this.obstacleActive = false;
                        this.obstacleTimer = this.obstacleMaxTimer;
                    }
                }
                if (this.timePenalty) {
                    this.timePenaltyTicks += 1
                    if (this.timePenaltyTicks >= 3) {
                        this.timePenaltyTicks = 0
                        this.timePenalty = false
                    }
                }

                if (this.timeBonus) {
                    this.timeBonusTicks += 1
                    if (this.timeBonusTicks >= 3) {
                        this.timeBonusTicks = 0
                        this.timeBonus = false
                    }
                }
            }
        }

        this.lastUpdate = t;
        this.checkKeys(t); // Process keys
        if (this.demo) {
            if (this.vehicle != null && this.escape == false && this.pause == false && this.timeIsUp == false && this.hasWon == false) {
                this.vehicle.updateDemo(t); // Update vehicle position based on demo
            }
        }
        else {
            if (this.vehicle != null && this.escape == false && this.pause == false && this.timeIsUp == false && this.hasWon == false) {
                this.vehicle.update(t); // Update vehicle position
            }
        }
        if (this.changeSceneName != null)
            changeSceneByName(this.changeSceneName);
        this.changeSceneName = null
    }

    selectView(viewId) {
        this.camera = this.graph.cameras[viewId];
        this.interface.setActiveCamera(this.camera);
    }

    // If lap is done returns true
    isLapDone() {
        if (this.onLine) {
            if (this.vehicle.inBigRange(this.startLine)) {
                return false //vehicle has not moved from start line
            } else {
                this.onLine = false
                return false
            }
        } else {
            if (this.vehicle.inBigRange(this.startLine)) {
                this.onLine = false
                return true
            } else {
                return false
            }
        }

    }

    /* 
    Processes Keys
    WASD for car control, Esc to exit, space to pause, R to restart
    */
    checkKeys(t) {
        if (this.gui.isKeyPressed("Escape")) {
            if (this.escape == false) {
                this.escape = true
                this.menuOption = 0
            }
            else
                this.escape = false
        }
        else if (this.gui.isKeyPressed("Space")) {
            if (this.pause == false)
                this.pause = true
            else
                this.pause = false
        }
        if (this.escape) {
            if (this.gui.isKeyPressed("Digit1")) {
                this.menuOption = 1
            }
            else if (this.gui.isKeyPressed("Digit2")) {
                this.menuOption = 2
            }
            if (this.gui.isKeyPressed("Enter")) {
                this.chooseOption(this.menuOption)
            }
        }
        // If game is in a paused state that does not allow restart by R key
        if (this.pause == true || this.escape == true)
            return

        if (this.gui.isKeyPressed("KeyR")) {
            this.vehicle.reset();
            this.powerUps = [...this.powerUpsStart];
            this.obstacles = [...this.obstaclesStart];
            this.timer = this.maxTimer
            if (this.timeIsUp)
                this.timeIsUp = false;
            this.powerUpActive = false;
            this.obstacleActive = false;
            this.hasWon = false
            this.onLine = true
            this.lap = 0
            this.timeBonus = false;
            this.timePenalty = false;
        }
        // If game is in a paused state which allows restart by R key
        if (this.timeIsUp || this.hasWon)
            return;


        if (this.gui.isKeyPressed("KeyW") && !this.demo) {
            if (this.powerUpActive)
                this.vehicle.accelerate(0.32 * this.speedFactor);
            else
                this.vehicle.accelerate(0.25 * this.speedFactor);

        }
        if (this.gui.isKeyPressed("KeyS") && !this.demo) {
            this.vehicle.accelerate(-0.25 * this.speedFactor);
        }
        if (this.gui.isKeyPressed("KeyA") && !this.demo) {
            if (this.obstacleActive)
                this.vehicle.turnWheels(-0.3);
            else
                this.vehicle.turnWheels(0.3);
        }

        if (this.gui.isKeyPressed("KeyD") && !this.demo) {
            if (this.obstacleActive)
                this.vehicle.turnWheels(0.3)
            else
                this.vehicle.turnWheels(-0.3);
        }
    }

    /*
	Based on oolite-font image given. it is present in textures folder
	Uses the dictionary created in init to process the text parameter and for each of its characters uses the shader in the respective position to draw the character
	Also registers for picking using textId, which should be passed as zero if no picking is desired
	*/
    writeOnScreen(text, textId, pickable) {
        text = text.toLowerCase()
        var spacing = 1
        if (pickable)
            this.registerForPick(textId, this.quad);
        for (var index in text) {
            var char = text[index]
            if (char == ' ') {
                this.translate(spacing, 0, 0);
                continue
            }

            var charPos = this.textDict[text[index]]
            if (charPos == undefined)
                continue
            this.activeShader.setUniformsValues({ 'charCoords': charPos });
            this.quad.display();

            this.translate(spacing, 0, 0);
        }
    }

    /*
	Chooses option based on option number
	*/
    chooseOption(optionNumber) {
        switch (optionNumber) {
            case 1: this.changeSceneName = "Menu"; break;
            case 2: this.escape = false; break;
            default: break;

        }
    }

	/* Checks if any of the pick objects were picked and if so calls chooseOption function */
    checkPicking() {
        if (this.pickMode == false) {
            if (this.pickResults != null && this.pickResults.length > 0) {
                for (var i = 0; i < this.pickResults.length; i++) {
                    var obj = this.pickResults[i][0];
                    if (obj) {
                        var customId = this.pickResults[i][1];
                        this.chooseOption(customId)
                    }
                }
                this.pickResults.splice(0, this.pickResults.length);
            }
        }
    }

    /*
    Rounds number to a certain number of digits
    */
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

    /*
    Set settings passed by parameter
    Based on these settings loads the respective map and adjusts difficulty based variables: maxTimer, powerUpMaxTimer or even activates Dark Mode
    */
    setSettings(difficulty, track) {
        this.difficulty = difficulty
        this.track = track

        if (this.track == 1) {
            var trackMapPath = "./tracks/textures/SimpleMapTexture.png";
            var terrainTexturePath = "./tracks/textures/MapTexture.png";
            this.map = new MyMap(this, trackMapPath, terrainTexturePath);
        } else if (this.track == 2) {
            var trackMapPath = "./tracks/textures/ComplexSimpleMapTex.png";
            var terrainTexturePath = "./tracks/textures/ComplexMapTex.png";
            this.map = new MyMap(this, trackMapPath, terrainTexturePath);
        }

        if (this.difficulty == 1) {
            if (this.track == 2)
                this.maxTimer = 400
            else
                this.maxTimer = 90
            this.powerUpMaxTimer = 15
        }
        else if (this.difficulty == 2) {
            if (this.track == 2)
                this.maxTimer = 250
            else
                this.maxTimer = 70
            this.powerUpMaxTimer = 10
        }
        else if (this.difficulty == 3) {
            if (this.track == 2)
                this.maxTimer = 160
            else
                this.maxTimer = 45
            this.powerUpMaxTimer = 5
            this.map.darkMode() // Makes the scene total darkness
        }
        this.timer = this.maxTimer
        this.powerUpTimer = this.powerUpMaxTimer
    }

    /*
    Displays Game related HUD with speed, time left and power up related stuff
    */
    displayGameHUD(customId){
        this.pushMatrix();
        // 	Reset transf. matrix to draw independent of camera
        this.loadIdentity();
        // transform as needed to place on screen
        this.translate(-5.4, 15.5, -40);
        this.writeOnScreen("Rocket Kart", customId, false)
        this.popMatrix();

        this.pushMatrix();
        // 	Reset transf. matrix to draw independent of camera
        this.loadIdentity();
        // transform as needed to place on screen
        if (this.camera == this.graph.cameras['First Person'])
            this.translate(-28, 3.5, -40);
        else
            this.translate(-28, -15, -40);
        this.writeOnScreen(this.roundTo(this.vehicle.speed * 16, 0) + "KM/H", customId, false)
        this.popMatrix();

        this.pushMatrix();
        // 	Reset transf. matrix to draw independent of camera
        this.loadIdentity();
        // transform as needed to place on screen
        this.translate(-28, 15, -40);
        this.writeOnScreen("Time Left:" + this.timer + "s", customId, false)
        this.popMatrix();

        if (this.powerUpActive) {
            this.pushMatrix();
            // 	Reset transf. matrix to draw independent of camera
            this.loadIdentity();
            // transform as needed to place on screen
            this.translate(15, 15, -40);
            this.writeOnScreen("SPEED UP:" + this.powerUpTimer + "s", customId, false)
            this.popMatrix();
        }

        if (this.obstacleActive) {
            this.pushMatrix();
            this.loadIdentity();
            if (this.powerUpActive) this.translate(11, 13, -40);
            else this.translate(11, 15, -40);
            this.writeOnScreen("A/D INVERTED:" + this.obstacleTimer + "s", customId, false);
            this.popMatrix();
        }

        if (this.timePenalty) {
            this.pushMatrix();
            this.loadIdentity();
            this.translate(-28, 11, -40);
            this.writeOnScreen("Time Penalty", customId, false);
            this.popMatrix();
        }

        if (this.timeBonus) {
            this.pushMatrix();
            this.loadIdentity();
            this.translate(-28, 11, -40);
            this.writeOnScreen("Time Bonus", customId, false);
            this.popMatrix();
        }


        if (this.timeIsUp) {
            this.pushMatrix();
            // 	Reset transf. matrix to draw independent of camera
            this.loadIdentity();
            // transform as needed to place on screen
            this.translate(-4, -3, -20);
            this.writeOnScreen("Time is UP", customId, false)
            this.popMatrix();
            if (this.escape == false && this.pause == false) {
                this.pushMatrix();
                // 	Reset transf. matrix to draw independent of camera
                this.loadIdentity();
                // transform as needed to place on screen
                this.translate(-9, -5, -20);
                this.writeOnScreen("Press R to restart", customId, false)
                this.popMatrix();
            }

        }
    }

    /**
     * Displays the head up display, it is different depending on whether its game or demo
     * It also varies if certain game states are active like pause or escape
     */
    displayHUD() {
        this.setActiveShaderSimple(this.textShader);
        this.textAppearance.apply()

        var customId = 1

        this.pushMatrix();
        // 	Reset transf. matrix to draw independent of camera
        this.loadIdentity();
        // transform as needed to place on screen
        this.translate(-28, 13, -40);
        this.writeOnScreen("Lap:" + this.lap + "/" + this.maxLap, customId, false)
        this.popMatrix();

        if (!this.demo)
            this.displayGameHUD(customId)
        if (this.hasWon) {
            this.pushMatrix();
            // 	Reset transf. matrix to draw independent of camera
            this.loadIdentity();
            // transform as needed to place on screen
            this.translate(-6, -3, -20);
            this.writeOnScreen("You have Won", customId, false)
            if(this.firstWin){
                this.translate(-14, -1, 0);
                this.writeOnScreen("Unlocked Gold Skin", customId, false)
            }
            this.popMatrix();
            if (this.escape == false && this.pause == false) {
                this.pushMatrix();
                // 	Reset transf. matrix to draw independent of camera
                this.loadIdentity();
                // transform as needed to place on screen
                this.translate(-9, -6, -20);
                this.writeOnScreen("Press R to restart", customId, false)
                this.popMatrix();
            }
        }

        if (this.escape == true) {
            this.pushMatrix();
            // 	Reset transf. matrix to draw independent of camera
            this.loadIdentity();
            // transform as needed to place on screen
            this.translate(-10.4, 4, -20);
            this.writeOnScreen("Do you want to Exit Game?", customId, false)
            this.translate(-20, -4, 0);
            this.writeOnScreen("1 YES", customId, true)
            if (this.menuOption == 1) {
                this.translate(-4, 0, 0);
                this.writeOnScreen("*", customId)
            }
            customId += 1
            this.popMatrix();
            this.pushMatrix();
            this.loadIdentity();
            this.translate(2, 0, -20);
            this.writeOnScreen("2 NO", customId, true)
            if (this.menuOption == 2) {
                this.translate(-3, 0, 0);
                this.writeOnScreen("*", customId)
            }
            customId += 1
            this.clearPickRegistration();

            this.popMatrix();
        }
        else if (this.pause == true) {
            this.pushMatrix();
            // 	Reset transf. matrix to draw independent of camera
            this.loadIdentity();
            // transform as needed to place on screen
            this.translate(-5.4, 0, -20);
            this.writeOnScreen("Game Paused", customId, false)
            this.popMatrix();
        }

        // reactivate default shader
        this.setActiveShaderSimple(this.defaultShader);
    }

    /**
     * Displays the power ups read in the svg
     */
    displayPowerUps() {
        for (var i = 0; i < this.powerUps.length; i++) {
            var power_up = this.powerUps[i];
            if (this.vehicle.inRange(power_up)) { // Collision with power up
                // Remove power up from list
                this.powerUps.splice(i, 1);

                // Apply power up
                if (power_up.get_type() == this.pUpType.ACC_MULT) { // 200% accelaration 
                    this.powerUpActive = true
                    this.powerUpTimer = this.powerUpMaxTimer
                }
                else if (power_up.get_type() == this.pUpType.BONUS_TIME) {
                    this.timeBonus = true // Time Bonus
                    this.timePenalty = false
                    this.timePenaltyTicks = 0
                    if (this.difficulty == 1)
                        this.timer += 10;
                    else if (this.difficulty == 2)
                        this.timer += 7;
                    else if (this.difficulty == 3)
                        this.timer += 5;
                }
                i--;
                continue;
            }
            power_up.display();
        }
    }

    /**
     * Displays the obstacles read in the svg
     */
    displayObstacles() {
        for (var i = 0; i < this.obstacles.length; i++) {
            var obstacle = this.obstacles[i];
            if (this.vehicle.inRange(this.obstacles[i])) {  // Collision with obstacle
                // Remove obstacle from list
                this.obstacles.splice(i, 1);

                // Obstacle collision event
                if (obstacle.get_type() == this.obstacleType.TIME_PENALTY) { // Time deduction
                    this.timePenalty = true
                    this.timeBonus = false
                    this.timeBonusTicks = 0
                    var timer_after_penalty = this.timer;
                    if (this.difficulty == 1)
                        timer_after_penalty -= 5;
                    else if (this.difficulty == 2)
                        timer_after_penalty -= 7;
                    else if (this.difficulty == 3)
                        timer_after_penalty -= 10

                    this.timer = timer_after_penalty < 0 ? 0 : timer_after_penalty;
                }
                else if (obstacle.get_type() == this.obstacleType.CONTR_INV) {  // Controls A/D inversion
                    this.obstacleActive = true;
                    this.obstacleTimer = this.obstacleMaxTimer;
                }

                i--;
                continue;
            }
            obstacle.display();
        }
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
                if (this.lightsOn[key] && this.difficulty != 3) {
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
            this.startLine.display()

            // Display HUD (Some elements stay out for the demo)
            this.displayHUD();

            if (!this.demo) {
                // Display Power Ups
                this.displayPowerUps();

                // Display Obstacles
                this.displayObstacles();
            }
        }

        this.popMatrix();

        // re-enable depth test 
        this.gl.enable(this.gl.DEPTH_TEST);


        // ---- END Background, camera and axis setup
    }
}