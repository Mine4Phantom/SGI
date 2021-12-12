

/**
 * MyComponentNode class, representing an intermediate node in the scene graph.
 * @constructor
 **/

import { CGFobject } from "../lib/CGF.js";


export class MyComponentNode extends CGFobject {
	constructor(graph, nodeID) {
		super(graph.scene);
		this.graph = graph;
		this.scene = graph.scene;
		this.nodeID = nodeID;

		// IDs of child nodes.
		this.children = [];

		// IDs of child nodes.
		this.primitives = [];

		// IDs of materials.
		this.materials= [] ;

		// The texture ID.
		this.textureID = null ;
		this.textureS = 1;
		this.textureT = 1;

		this.actualS = 1;
		this.actualT = 1;

		this.transformMatrix = mat4.create();
		mat4.identity(this.transformMatrix);
	}

	addMaterial(nodeID) {
		this.materials.push(nodeID);
	}

	addLenghtST(lenght_S, lenght_T){
		this.textureS = lenght_S;
		this.textureT = lenght_T;
		this.actualS = lenght_S;
		this.actualT = lenght_T;
	}

	/**
	 * Adds the reference (ID) of another node to this node's children array.
	 */
	addChild(nodeID) {
		this.children.push(nodeID);
	}

	/**
	 * Adds a primitive to this node's primitives array.
	 */
	addPrimitive(primitive) {
		this.primitives.push(primitive);
	}

	/**
	 * This function applies the transformation the respective node and all of its children.
	 * Then inherit the father material and/or texture if that's the case.
	 * After this the appearance with the right texutre and material is applied.
	 * Then, each child primitive is displayed as well each child node.
	 * By iterating each children nodes and starting with the root node, this function goes through
	 * the scene graph and displays each object.
	 * @param  {[Texture]} currTextureID father texture
	 * @param  {[Material]} currMaterialID father material
	 */
	display(currTextureID, currMaterialID) {

		this.scene.pushMatrix();
		this.scene.multMatrix(this.transformMatrix);

		var newTextureID = this.textureID;
		var newMaterialID;

		newMaterialID = this.materials[this.graph.currentMaterialIndex % this.materials.length]; // loop the material

		if(newMaterialID == "inherit")
			newMaterialID = currMaterialID;

		if(newTextureID == "inherit")
			newTextureID = currTextureID;
		

		this.displayPrimitives(newTextureID,newMaterialID);
		
		for(var j=0; j < this.children.length; j++){
			
			this.graph.components[this.children[j]].display(newTextureID,newMaterialID);
		}

		this.scene.popMatrix();
	}

	displayPrimitives(newTextureID, newMaterialID) {

		this.graph.materials[newMaterialID].apply();

		if(newTextureID != "none")
			this.graph.textures[newTextureID].bind();
		else
			this.graph.textures["demoTexture"].unbind();

		for(var i=0;i < this.primitives.length;i++){
			if(newTextureID != "none" && newTextureID != null){
				this.textureS = this.actualS;
				this.textureT = this.actualT;
				this.primitives[i].updateTexCoords(this.textureS,this.textureT);
			}

			this.primitives[i].display();
		}
	}

}