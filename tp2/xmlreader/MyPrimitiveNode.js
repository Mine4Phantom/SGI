

/**
 * MyPrimitiveNode class, representing a primitive node in the scene graph.
 * @constructor
 **/

 import { CGFobject } from "../lib/CGF.js";


 export class MyPrimitiveNode extends CGFobject {
     constructor(graph, nodeID) {
        super(graph.scene);
        this.graph = graph;
        this.scene = graph.scene;
        this.nodeID = nodeID;
 
        // The material ID.
        this.materialID = null ;
 
        // The texture ID.
        this.textureID = null ;
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
        this.scene.primitives[this.nodeID].display(currTextureID,currMaterialID)
     }
 
 }