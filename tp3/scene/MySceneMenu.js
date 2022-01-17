import { CGFscene, CGFcamera, CGFappearance, CGFaxis, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MyQuad } from '../primitives/MyQuad.js';


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
	}

	init(application) {
		super.init(application);

		this.initCameras();

		this.initLights();
		this.setUpdatePeriod(100);

		this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
		this.gl.clearDepth(1000.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.depthFunc(this.gl.LEQUAL);
		
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

		//create dict for text
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
			if(this.menuKey >= 1 && this.menuKey <= 4)
				console.log("selected " + this.menuKey)
		}
    }

    //Based on oolite-font image given. it is present in textures folder
    writeOnScreen(text){
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
			this.quad.display();

			this.translate(spacing,0,0);
		}
    }

	display() 
	{
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
		this.axis.display();	

		// activate shader for rendering text characters
		this.setActiveShaderSimple(this.textShader);

		// Optional: disable depth test so that it is always in front (need to reenable in the end)
		this.gl.disable(this.gl.DEPTH_TEST);

		// activate texture containing the font
		this.appearance.apply();

        // Rocket Kart -tots not a reference to Rocket League and Mario Kart
		this.pushMatrix();
			// 	Reset transf. matrix to draw independent of camera
			this.loadIdentity();
			// transform as needed to place on screen
			this.translate(-5.4,4,-40);
			this.writeOnScreen("Rocket Kart")
		this.popMatrix();

		this.pushMatrix();
			this.loadIdentity();
			this.translate(-9,-4,-60);
			this.writeOnScreen("1 Start")
			if(this.menuKey == 1){
				this.translate(-6,0,0);
				this.writeOnScreen("*")
			}
		this.popMatrix();

		this.pushMatrix();
			this.loadIdentity();
			this.translate(5,-4,-60);
			this.writeOnScreen("2 Demo")
			if(this.menuKey == 2){
				this.translate(-5,0,0);
				this.writeOnScreen("*")
			}
		this.popMatrix();

		this.pushMatrix();
			this.loadIdentity();
			this.translate(-9,-7,-60);
			this.writeOnScreen("3 Difficulty")
			if(this.menuKey == 3){
				this.translate(-11,0,0);
				this.writeOnScreen("*")
			}
		this.popMatrix();

		this.pushMatrix();
			this.loadIdentity();
			this.translate(5,-7,-60);
			this.writeOnScreen("4 Track")
			if(this.menuKey == 4){
				this.translate(-6,0,0);
				this.writeOnScreen("*")
			}
		this.popMatrix();

		// re-enable depth test 
		this.gl.enable(this.gl.DEPTH_TEST);

		// reactivate default shader
		this.setActiveShaderSimple(this.defaultShader);

	}
}