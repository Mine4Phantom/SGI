

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

		this.transformMatrix = mat4.create();
		mat4.identity(this.transformMatrix);
	}

	addMaterial(nodeID) {
		this.materials.push(nodeID);
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
		var newMaterialID = this.materials[0]; // To Do Change with input of key 'M'

		if(newMaterialID == "null")
			newMaterialID = currMaterialID;

		if(newTextureID == "null"){
			if(currTextureID != "null"){
				newTextureID = currTextureID;
			}
		}

		this.displayPrimitives(newTextureID,newMaterialID);

		
		for(var j=0; j < this.children.length; j++){
			this.graph.components[this.children[j]].display(newTextureID,newMaterialID);
		}

		this.scene.popMatrix();
	}

	displayPrimitives(newTextureID, newMaterialID) {

		if(newMaterialID != null && newMaterialID != "null")
			this.graph.materials[newMaterialID].apply();

		if(newTextureID != "clear" && newTextureID != null)
			this.graph.textures[newTextureID].bind();

		for(var i=0;i < this.primitives.length;i++){
			this.primitives[i].display();
		}
	}

}