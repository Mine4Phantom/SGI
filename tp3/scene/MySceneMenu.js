import { CGFscene, CGFcamera, CGFappearance, CGFaxis, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MyQuad } from '../primitives/MyQuad.js';
import { changeSceneByName } from './main.js';
import { setGameSettings } from './main.js';

export class MySceneMenu extends CGFscene
{
	constructor(myinterface)
    {
		super();
        this.interface = myinterface;
		this.texture = null;
		this.appearance = null;
		this.quad = null;
		this.textShader = null;
		this.menuKey = 0
		this.selected = false
		this.changeSceneName = null
		this.difficulty = false
		this.track = false
		this.difficultyOption = 2
		this.trackOption = 1
	}

	init(application) {
		super.init(application);

		this.initCameras();

		this.initLights();
		this.setUpdatePeriod(60);

		this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
		this.gl.clearDepth(1000.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.depthFunc(this.gl.LEQUAL);

		this.setPickEnabled(true);
		
		this.axis=new CGFaxis(this);
		this.enableTextures(true);
	
		this.appearance = new CGFappearance(this);

		// font texture: 16 x 16 characters
		// http://jens.ayton.se/oolite/files/font-tests/rgba/oolite-font.png
		this.fontTexture = new CGFtexture(this, "../textures/oolite-font.trans.png");
		this.appearance.setTexture(this.fontTexture);

		// plane where texture character will be rendered
		this.quad=new MyQuad(this);
		
		// instatiate text shader (used to simplify access via row/column coordinates)
		// check the two files to see how it is done
		this.textShader=new CGFshader(this.gl, "../shaders/font.vert", "../shaders/font.frag");

		// set number of rows and columns in font texture
		this.textShader.setUniformsValues({'dims': [16, 16]});

		// create dict for text
		this.textDict = {
			a:[1,4],b:[2,4],c:[3,4],d:[4,4],e:[5,4],f:[6,4],g:[7,4],h:[8,4],i:[9,4],j:[10,4],k:[11,4],l:[12,4],m:[13,4],n:[14,4],o:[15,4],p:[0,5],q:[1,5],r:[2,5],s:[3,5],t:[4,5],u:[5,5],v:[6,5],w:[7,5],x:[8,5],y:[9,5],z:[10,5],'*':[10,2],"1":[1,3],"2":[2,3],"3":[3,3],"4":[4,3]
		} 
		

	};

	initLights() {

		if (this.lights.length > 0) {
			this.lights[0].setPosition(3,3,3,1);
			this.lights[0].enable();		
			this.lights[0].update();
		}
	};


	initCameras = function () {
		this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(20, 20, 100), vec3.fromValues(0, 0, 0));
	};

	update(t) {
        this.checkKeys(t);
		if(this.changeSceneName != null){
			changeSceneByName(this.changeSceneName);
			setGameSettings(this.difficultyOption,this.trackOption)
		}
		this.changeSceneName = null
    }

	checkKeys(t) {
        if (this.gui.isKeyPressed("Digit1")) {
            this.menuKey = 1  
        }
        else if (this.gui.isKeyPressed("Digit2")) {
            this.menuKey = 2  
        }
        else if (this.gui.isKeyPressed("Digit3")) {
            this.menuKey = 3  
        }
        else if (this.gui.isKeyPressed("Digit4")) {
            this.menuKey = 4  
        }

		if (this.gui.isKeyPressed("Enter")) {
			this.selected = true
			this.chooseOption(this.menuKey)

		}
/* 		else if(this.gui.isKeyPressed("Escape")){
			this.difficulty = false
			this.track = false
			this.menuKey = 0  
		} */
    }

	chooseOption(optionNumber){
		if(this.difficulty == false && this.track == false){
			switch(optionNumber){
				case 1: this.changeSceneName = "Game"; break;
				case 2: console.log("Demo is not yet developed"); break;
				case 3: this.difficulty = true; break;
				case 4: this.track = true; break;
				default: break;
	
			}
		}
		else if(this.difficulty == true){
			this.track = false
			switch(optionNumber){
				case 1: this.difficulty = false; this.difficultyOption=1;this.menuKey = 0; break;
				case 2: this.difficulty = false; this.difficultyOption=2;this.menuKey = 0; break;
				case 3: this.difficulty = false; this.difficultyOption=3;this.menuKey = 0; break;
				default: break;
	
			}
		}
		else if(this.track == true){
			this.difficulty = false
			switch(optionNumber){
				case 1: this.track = false; this.trackOption=1;this.menuKey = 0; break;
				case 2: this.track = false; this.trackOption=2;this.menuKey = 0; break;
				default: break;
	
			}
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

    //Based on oolite-font image given. it is present in textures folder
    writeOnScreen(text, textId){
		text=text.toLowerCase()
		var spacing = 1
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
			this.registerForPick(textId, this.quad);
			this.quad.display();

			this.translate(spacing,0,0);
		}
    }

	display() 
	{
		this.checkPicking();

		// this resets the picking buffer
		this.clearPickRegistration();

		// Clear image and depth buffer every time we update the scene
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.gl.enable(this.gl.DEPTH_TEST);

		// Initialize Model-View matrix as identity (no transformation
		this.updateProjectionMatrix();
		this.loadIdentity();

		// Apply transformations corresponding to the camera position relative to the origin
		this.applyViewMatrix();
		
		// Update all lights used
		this.lights[0].update();

		// Draw axis
		//this.axis.display();	



		// Optional: disable depth test so that it is always in front (need to reenable in the end)
		this.gl.disable(this.gl.DEPTH_TEST);

		var customId = 0

		// activate shader for rendering text characters
		this.setActiveShaderSimple(this.textShader);

		// activate texture containing the font
		this.appearance.apply();

        // Rocket Kart -tots not a reference to Rocket League and Mario Kart
		this.pushMatrix();
			// 	Reset transf. matrix to draw independent of camera
			this.loadIdentity();
			// transform as needed to place on screen
			this.translate(-5.4,4,-40);
			this.writeOnScreen("Rocket Kart", customId)
			customId+=1
		this.popMatrix();

		if(this.difficulty == false && this.track == false){
			this.pushMatrix();
				this.loadIdentity();
				this.translate(-9,-4,-60);
				this.writeOnScreen("1 Start", customId)
				if(this.menuKey == 1){
					this.translate(-6,0,0);
					this.writeOnScreen("*", customId)
				}
				customId+=1
			this.popMatrix();

			this.pushMatrix();
				this.loadIdentity();
				this.translate(5,-4,-60);
				this.writeOnScreen("2 Demo", customId)
				if(this.menuKey == 2){
					this.translate(-5,0,0);
					this.writeOnScreen("*", customId)
				}
				customId+=1
			this.popMatrix();

			this.pushMatrix();
				this.loadIdentity();
				this.translate(-9,-7,-60);
				this.writeOnScreen("3 Difficulty", customId)
				if(this.menuKey == 3){
					this.translate(-11,0,0);
					this.writeOnScreen("*", customId)
				}
				customId+=1
			this.popMatrix();

			this.pushMatrix();
				this.loadIdentity();
				this.translate(5,-7,-60);
				this.writeOnScreen("4 Track", customId)
				if(this.menuKey == 4){
					this.translate(-6,0,0);
					this.writeOnScreen("*", customId)
				}
				customId+=1
			this.popMatrix();
		}
		else if(this.difficulty == true){
			customId=0
			this.pushMatrix();
				this.loadIdentity();
				this.translate(-6,-4,-60);
				this.writeOnScreen("Difficulty", customId)
				customId+=1
			this.popMatrix();

			this.pushMatrix();
				this.loadIdentity();
				this.translate(-18,-8,-60);
				this.writeOnScreen("1 Easy", customId)
				if(this.menuKey == 1){
					this.translate(-5,0,0);
					this.writeOnScreen("*", customId)
				}
				customId+=1
			this.popMatrix();

			this.pushMatrix();
				this.loadIdentity();
				this.translate(-6,-8,-60);
				this.writeOnScreen("2 Medium", customId)
				if(this.menuKey == 2){
					this.translate(-7,0,0);
					this.writeOnScreen("*", customId)
				}
				customId+=1
			this.popMatrix();

			this.pushMatrix();
				this.loadIdentity();
				this.translate(6,-8,-60);
				this.writeOnScreen("3 Hard", customId)
				if(this.menuKey == 3){
					this.translate(-5,0,0);
					this.writeOnScreen("*", customId)
				}
			this.popMatrix();
		}
		else if(this.track == true){
			customId=0
			this.pushMatrix();
				this.loadIdentity();
				this.translate(-2,-4,-60);
				this.writeOnScreen("Track", customId)
				customId+=1
			this.popMatrix();

			this.pushMatrix();
				this.loadIdentity();
				this.translate(-10,-8,-60);
				this.writeOnScreen("1 Simple", customId)
				if(this.menuKey == 1){
					this.translate(-5,0,0);
					this.writeOnScreen("*", customId)
				}
				customId+=1
			this.popMatrix();

			this.pushMatrix();
				this.loadIdentity();
				this.translate(3,-8,-60);
				this.writeOnScreen("2 Complex", customId)
				if(this.menuKey == 2){
					this.translate(-7,0,0);
					this.writeOnScreen("*", customId)
				}
			this.popMatrix();
		}



		// re-enable depth test 
		this.gl.enable(this.gl.DEPTH_TEST);

		// reactivate default shader
		this.setActiveShaderSimple(this.defaultShader);

	}
}