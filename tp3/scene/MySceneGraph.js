import { CGFXMLreader } from '../lib/CGF.js';
import { CGFtexture } from '../lib/CGF.js';
import { CGFappearance } from '../lib/CGF.js';
import { CGFcamera } from '../lib/CGF.js';
import { CGFcameraOrtho } from '../lib/CGF.js';
import { MyRectangle } from '../primitives/MyRectangle.js';
import { MyTriangle } from '../primitives/MyTriangle.js';
import { MyCylinder } from '../primitives/MyCylinder.js';
import { MySphere } from '../primitives/MySphere.js';
import { MyCircle } from '../primitives/MyCircle.js';
import { MyComponentNode } from './MyComponentNode.js';
import { MyPrimitiveNode } from './MyPrimitiveNode.js';
import { MyPatch } from '../primitives/nurbs/MyPatch.js';
import { MyPlane } from '../primitives/nurbs/MyPlane.js';
import { MyCylinder2 } from '../primitives/nurbs/MyCylinder2.js';
import { MySVGReader } from './MySVGReader.js';

var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(sceneFilename, mapFilename, scene) {
        this.loadedOk = null;

        this.mapFilename = mapFilename;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.
        this.currentMaterialIndex = 0;          // Changed with M/m Key
        this.cameras = [];
        this.defaultView = null;

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + sceneFilename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        let svgParser = new MySVGReader(this.mapFilename, this);

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    generateRandomString(length) {
        // Generates an array of random integer ASCII codes of the specified length
        // and returns a string of the specified length.
        var numbers = [];
        for (var i = 0; i < length; i++)
            numbers.push(Math.floor(Math.random() * 256));          // Random ASCII code.

        return String.fromCharCode.apply(null, numbers);
    }

    generateDefaultMaterial() {
        var materialDefault = new CGFappearance(this.scene);
        materialDefault.setShininess(1);
        materialDefault.setSpecular(0, 0, 0, 1);
        materialDefault.setDiffuse(0.5, 0.5, 0.5, 1);
        materialDefault.setAmbient(0, 0, 0, 1);
        materialDefault.setEmission(0, 0, 0, 1);

        // Generates random material ID not currently in use.
        this.defaultMaterialID = null;
        do this.defaultMaterialID = this.generateRandomString(5);
        while (this.materials[this.defaultMaterialID] != null);

        this.materials[this.defaultMaterialID] = materialDefault;

        return;
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxg")
            return "root tag <sxg> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {

        var viewDefault = this.reader.getString(viewsNode, 'default')
        if (viewDefault == null)
            return "no view default  defined for scene";
        this.defaultView = viewDefault;

        var children = viewsNode.children;
        this.perspective = [];
        this.ortho = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var viewCnt = 0;
        var isDefaultId = 0;

        for (var k = 0; k < children.length; k++) {

            // Perspective
            var perspectiveIndex = k;
            var orthoIndex = k;


            if (children[perspectiveIndex].nodeName == "perspective") {
                viewCnt += 1;
                var perspectiveID = this.reader.getString(children[perspectiveIndex], 'id');
                if (perspectiveID == viewDefault)
                    isDefaultId = 1;
                var perspectiveNear = this.reader.getFloat(children[perspectiveIndex], 'near');
                var perspectiveFar = this.reader.getFloat(children[perspectiveIndex], 'far');
                var perspectiveAngle = this.reader.getFloat(children[perspectiveIndex], 'angle');
                if (perspectiveID == null | perspectiveNear == null || perspectiveFar == null || perspectiveAngle == null)
                    return "Error parsing perspective values, id = [" + perspectiveID + "]";

                var grandChildren = children[perspectiveIndex].children;
                var nodeNamesGrandChildren = [];

                for (var i = 0; i < grandChildren.length; i++)
                    nodeNamesGrandChildren.push(grandChildren[i].nodeName);

                var fromIndex = nodeNamesGrandChildren.indexOf("from");
                if (fromIndex == -1)
                    return "Error parsing perspective child \'from\', id = [" + perspectiveID + "]";
                var fromX = this.reader.getFloat(grandChildren[fromIndex], 'x');
                var fromY = this.reader.getFloat(grandChildren[fromIndex], 'y');
                var fromZ = this.reader.getFloat(grandChildren[fromIndex], 'z');
                if (fromX == null || fromY == null || fromZ == null)
                    return "Error parsing perspective child \'from\' values, id = [" + perspectiveID + "]";

                var toIndex = nodeNamesGrandChildren.indexOf("to");
                if (toIndex == -1)
                    return "Error parsing perspective child \'to\', id = [" + perspectiveID + "]";
                var toX = this.reader.getFloat(grandChildren[toIndex], 'x');
                var toY = this.reader.getFloat(grandChildren[toIndex], 'y');
                var toZ = this.reader.getFloat(grandChildren[toIndex], 'z');
                if (toX == null || toY == null || toZ == null)
                    return "Error parsing perspective child \'to\' values, id = [" + perspectiveID + "]";

                this.cameras.push([perspectiveID, new CGFcamera(perspectiveAngle * DEGREE_TO_RAD, perspectiveNear, perspectiveFar, vec3.fromValues(fromX, fromY, fromZ), vec3.fromValues(toX, toY, toZ))]);
            }
            // Ortho
            else if (children[perspectiveIndex].nodeName == "ortho") {
                viewCnt += 1;
                var orthoID = this.reader.getString(children[orthoIndex], 'id');
                if (orthoID == viewDefault)
                    isDefaultId = 1;
                var orthoNear = this.reader.getFloat(children[orthoIndex], 'near');
                var orthoFar = this.reader.getFloat(children[orthoIndex], 'far');
                var orthoLeft = this.reader.getFloat(children[orthoIndex], 'left');
                var orthoRight = this.reader.getFloat(children[orthoIndex], 'right');
                var orthoTop = this.reader.getFloat(children[orthoIndex], 'top');
                var orthoBottom = this.reader.getFloat(children[orthoIndex], 'bottom');
                if (orthoID == null | orthoNear == null || orthoFar == null || orthoLeft == null || orthoRight == null || orthoTop == null || orthoBottom == null)
                    return "Error parsing ortho values, id = [" + orthoID + "]";

                var grandChildren = children[orthoIndex].children;
                var nodeNamesGrandChildren = [];

                for (var i = 0; i < grandChildren.length; i++)
                    nodeNamesGrandChildren.push(grandChildren[i].nodeName);

                var fromIndex = nodeNamesGrandChildren.indexOf("from");
                if (fromIndex == -1)
                    return "Error parsing ortho child \'from\', id = [" + orthoID + "]";
                var fromX = this.reader.getFloat(grandChildren[fromIndex], 'x');
                var fromY = this.reader.getFloat(grandChildren[fromIndex], 'y');
                var fromZ = this.reader.getFloat(grandChildren[fromIndex], 'z');
                if (fromX == null || fromY == null || fromZ == null)
                    return "Error parsing ortho child \'from\' values, id = [" + orthoID + "]";

                var toIndex = nodeNamesGrandChildren.indexOf("to");
                if (toIndex == -1)
                    return "Error parsing ortho child \'to\', id = [" + orthoID + "]";
                var toX = this.reader.getFloat(grandChildren[toIndex], 'x');
                var toY = this.reader.getFloat(grandChildren[toIndex], 'y');
                var toZ = this.reader.getFloat(grandChildren[toIndex], 'z');
                if (toX == null || toY == null || toZ == null)
                    return "Error parsing ortho child \'to\' values, id = [" + orthoID + "]";

                var upIndex = nodeNamesGrandChildren.indexOf("up");
                var upX;
                var upY;
                var upZ;
                if (upIndex != -1) {
                    var upX = this.reader.getFloat(grandChildren[upIndex], 'x');
                    var upY = this.reader.getFloat(grandChildren[upIndex], 'y');
                    var upZ = this.reader.getFloat(grandChildren[upIndex], 'z');
                    if (upX == null || upY == null || upZ == null)
                        return "Error parsing ortho child \'up\' values, id = [" + orthoID + "]";

                    this.cameras.push([orthoID, new CGFcameraOrtho(orthoLeft, orthoRight, orthoBottom, orthoTop, orthoNear, orthoFar, vec3.fromValues(fromX, fromY, fromZ), vec3.fromValues(toX, toY, toZ), vec3.fromValues(upX, upY, upZ))]);
                } else {
                    this.cameras.push([orthoID, new CGFcameraOrtho(orthoLeft, orthoRight, orthoBottom, orthoTop, orthoNear, orthoFar, vec3.fromValues(fromX, fromY, fromZ), vec3.fromValues(toX, toY, toZ), vec3.fromValues(0, 1, 0))]);
                }
            }
        }
        this.scene.views = this.cameras;
        if (viewCnt == 0)
            return "Error, at least one view must exist";
        if (isDefaultId == 0)
            return "Error, default view must exist";

        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }



    parseAttenuationValues(node, msg) {
        var values = [];
        var constant = this.reader.getFloat(node, 'constant');
        if (!(constant != null && !isNaN(constant))) return "unable to parse constant " + msg;
        if (constant > 1) constant = 1.0;

        var linear = this.reader.getFloat(node, 'linear');
        if (!(linear != null && !isNaN(linear))) return "unable to parse linear " + msg;
        if (linear > 1) linear = 1.0;

        var quadratic = this.reader.getFloat(node, 'quadratic');
        if (!(quadratic != null && !isNaN(quadratic))) return "unable to parse quadratic " + msg;
        if (quadratic > 1) quadratic = 1.0;

        values.push(...[constant, linear, quadratic]);
        return values;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular", "attenuation"]);
                attributeTypes.push(...["position", "color", "color", "color", "attenuation"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else if (attributeTypes[j] == "attenuation")
                        var aux = this.parseAttenuationValues(grandChildren[attributeIndex], "light attenuation for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        //For each texture in textures block, check ID and file URL

        this.textures = [];

        var eachTexture = texturesNode.children;
        // Each texture.

        var oneTextureDefined = false;

        for (var i = 0; i < eachTexture.length; i++) {
            var nodeName = eachTexture[i].nodeName;
            if (nodeName == "texture") {
                // Retrieves texture ID.
                var textureID = this.reader.getString(eachTexture[i], 'id');
                if (textureID == null)
                    return "failed to parse texture ID";
                // Checks if ID is valid.
                if (this.textures[textureID] != null)
                    return "texture ID must be unique (conflict with ID = " + textureID + ")";

                var filepath = this.reader.getString(eachTexture[i], 'file');;
                if (filepath == null)
                    return "unable to parse texture file path for ID = " + textureID;

                var texture = new CGFtexture(this.scene, "./scenes/images/" + filepath);

                this.textures[textureID] = texture;
                oneTextureDefined = true;
            }
            else
                this.onXMLMinorError("unknown tag name <" + nodeName + ">");
        }

        if (!oneTextureDefined)
            return "at least one texture must be defined in the textures block";

        this.log("Parsed textures");

        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];

        var grandChildren = [];
        var nodeNames = [];
        var oneMaterialDefined = false;

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each material (conflict: ID = " + materialID + ")";

            // Shininess
            var shininess = this.reader.getFloat(children[i], 'shininess');
            if (shininess == null)
                return "Shininess must be defined for each material (conflict: ID = " + materialID + ")";

            var materialDetails = children[i].children;

            for (var j = 0; j < materialDetails.length; j++)
                nodeNames.push(materialDetails[j].nodeName);


            // Specular component.
            var specularIndex = nodeNames.indexOf("specular");
            if (specularIndex == -1)
                return "no specular component defined for material with ID = " + materialID;
            var specularComponent = [];
            var r = this.reader.getFloat(materialDetails[specularIndex], 'r');
            var g = this.reader.getFloat(materialDetails[specularIndex], 'g');
            var b = this.reader.getFloat(materialDetails[specularIndex], 'b');
            var a = this.reader.getFloat(materialDetails[specularIndex], 'a');
            if (r == null || g == null || b == null || a == null)
                return "unable to parse rgba component of specular reflection for material with ID = " + materialID;
            else if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a))
                return "specular rgba is a non numeric value on the materials block";
            else if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0)
                return "specular rgba must be a value between 0 and 1 on the materials block"
            specularComponent.push(r);
            specularComponent.push(g);
            specularComponent.push(b);
            specularComponent.push(a);

            // Diffuse component.
            var diffuseIndex = nodeNames.indexOf("diffuse");
            if (diffuseIndex == -1)
                return "no diffuse component defined for material with ID = " + materialID;
            var diffuseComponent = [];
            r = this.reader.getFloat(materialDetails[diffuseIndex], 'r');
            g = this.reader.getFloat(materialDetails[diffuseIndex], 'g');
            b = this.reader.getFloat(materialDetails[diffuseIndex], 'b');
            a = this.reader.getFloat(materialDetails[diffuseIndex], 'a');
            if (r == null || g == null || b == null || a == null)
                return "unable to parse rgba component of diffuse reflection for material with ID = " + materialID;
            else if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a))
                return "diffuse rgba is a non numeric value on the materials block";
            else if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0)
                return "diffuse rgba must be a value between 0 and 1 on the materials block"
            diffuseComponent.push(r);
            diffuseComponent.push(g);
            diffuseComponent.push(b);
            diffuseComponent.push(a);

            // Ambient component.
            var ambientIndex = nodeNames.indexOf("ambient");
            if (ambientIndex == -1)
                return "no ambient component defined for material with ID = " + materialID;
            var ambientComponent = [];
            r = this.reader.getFloat(materialDetails[ambientIndex], 'r');
            g = this.reader.getFloat(materialDetails[ambientIndex], 'g');
            b = this.reader.getFloat(materialDetails[ambientIndex], 'b');
            a = this.reader.getFloat(materialDetails[ambientIndex], 'a');
            if (r == null || g == null || b == null || a == null)
                return "unable to parse rgba component of ambient reflection for material with ID = " + materialID;
            else if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a))
                return "ambient rgba is a non numeric value on the materials block";
            else if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0)
                return "ambient rgba must be a value between 0 and 1 on the materials block"
            ambientComponent.push(r);
            ambientComponent.push(g);
            ambientComponent.push(b);
            ambientComponent.push(a);

            // Emission component.
            var emissionIndex = nodeNames.indexOf("emission");
            if (emissionIndex == -1)
                return "no emission component defined for material with ID = " + materialID;
            var emissionComponent = [];
            r = this.reader.getFloat(materialDetails[emissionIndex], 'r');
            g = this.reader.getFloat(materialDetails[emissionIndex], 'g');
            b = this.reader.getFloat(materialDetails[emissionIndex], 'b');
            a = this.reader.getFloat(materialDetails[emissionIndex], 'a');
            if (r == null || g == null || b == null || a == null)
                return "unable to parse rgba component of emission for material with ID = " + materialID;
            else if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a))
                return "emission rgba is a non numeric value on the materials block";
            else if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0)
                return "emission rgba must be a value between 0 and 1 on the materials block"
            emissionComponent.push(r);
            emissionComponent.push(g);
            emissionComponent.push(b);
            emissionComponent.push(a);

            // Creates material with the specified characteristics.
            var newMaterial = new CGFappearance(this.scene);
            newMaterial.setShininess(shininess);
            newMaterial.setAmbient(ambientComponent[0], ambientComponent[1], ambientComponent[2], ambientComponent[3]);
            newMaterial.setDiffuse(diffuseComponent[0], diffuseComponent[1], diffuseComponent[2], diffuseComponent[3]);
            newMaterial.setSpecular(specularComponent[0], specularComponent[1], specularComponent[2], specularComponent[3]);
            newMaterial.setEmission(emissionComponent[0], emissionComponent[1], emissionComponent[2], emissionComponent[3]);
            this.materials[materialID] = newMaterial;
            oneMaterialDefined = true;

        }



        if (!oneMaterialDefined)
            return "at least one material must be defined on the MATERIALS block";

        // Generates a default material.
        this.generateDefaultMaterial();

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = mat4.create();

            for (var j = 0; j < grandChildren.length; j++) {
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "scale transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'rotate':
                        var axis = this.reader.getItem(grandChildren[j], 'axis', ['x', 'y', 'z']);
                        if (axis == null)
                            return "unable to parse axis of the " + "rotate transformation for ID " + transformationID;

                        var angle = this.reader.getFloat(grandChildren[j], 'angle');
                        if (!(angle != null && !isNaN(angle)))
                            return "unable to parse angle of the " + "rotate transformation for ID " + transformationID;

                        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, this.axisCoords[axis]);
                        break;
                }
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    parsePlane(primitiveId, planeNode) {

        // npartsU
        var npartsU = this.reader.getInteger(planeNode, 'npartsU');
        if (!(npartsU != null && !isNaN(npartsU)))
            return "unable to parse npartsU of the primitive parameters for ID = " + primitiveId;

        // npartsV
        var npartsV = this.reader.getInteger(planeNode, 'npartsV');
        if (!(npartsV != null && !isNaN(npartsV)))
            return "unable to parse npartsV of the primitive parameters for ID = " + primitiveId;


        return new MyPlane(this.scene, npartsU, npartsV);

    }

    /**
    * Method to parse a sxg-format patch node
    * @param {String} primitiveId 
    * @param {sxg patch node} patchNode 
    */
    parsePatch(primitiveId, patchNode) {

        // npartsU
        var npartsU = this.reader.getInteger(patchNode, 'npartsU');
        if (!(npartsU != null && !isNaN(npartsU)))
            return "unable to parse npartsU of the primitive parameters for ID = " + primitiveId;

        // npartsV
        var npartsV = this.reader.getInteger(patchNode, 'npartsV');
        if (!(npartsV != null && !isNaN(npartsV)))
            return "unable to parse npartsV of the primitive parameters for ID = " + primitiveId;

        // npointsU
        var npointsU = this.reader.getInteger(patchNode, 'npointsU');
        if (!(npointsU != null && !isNaN(npointsU)))
            return "unable to parse npointsU of the primitive parameters for ID = " + primitiveId;

        // npointsV
        var npointsV = this.reader.getInteger(patchNode, 'npointsV');
        if (!(npointsV != null && !isNaN(npointsV)))
            return "unable to parse npointsV of the primitive parameters for ID = " + primitiveId;

        let children = patchNode.children;
        let upoints = [];

        // get control points

        for (let u = 0; u < npointsU; u++) {

            let vpoints = [];

            for (let v = 0; v < npointsV; v++) {

                let index = u * npointsV + v;

                if (children[index].nodeName != 'controlpoint')
                    return "unknown tag <" + children[index].nodeName + "> for primtive with ID =  " + primitiveId;

                var xx = this.reader.getFloat(children[index], 'xx');
                var yy = this.reader.getFloat(children[index], 'yy');
                var zz = this.reader.getFloat(children[index], 'zz');

                vpoints.push([xx, yy, zz, 1]);
            }

            upoints.push(vpoints);
        }
        return new MyPatch(this.scene, npartsU, npartsV, npointsU - 1, npointsV - 1, upoints);

    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere'
                    && grandChildren[0].nodeName != 'plane' && grandChildren[0].nodeName != 'patch'
                    && grandChildren[0].nodeName != 'circle' && grandChildren[0].nodeName != 'cylinder2')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere, plane, patch, circle)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            }

            else if (primitiveType == 'triangle') {

                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2)))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // x3
                var x3 = this.reader.getFloat(grandChildren[0], 'x3');
                if (!(x3 != null && !isNaN(x3)))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2)))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // y3
                var y3 = this.reader.getFloat(grandChildren[0], 'y3');
                if (!(y3 != null && !isNaN(y3)))
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;


                var tri = new MyTriangle(this.scene, primitiveId, x1, y1, x2, y2, x3, y3);

                this.primitives[primitiveId] = tri;
            }
            else if (primitiveType == 'cylinder') {

                // height
                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height)))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                // topRadius
                var topRadius = this.reader.getFloat(grandChildren[0], 'topRadius');
                if (!(topRadius != null && !isNaN(topRadius)))
                    return "unable to parse topRadius of the primitive coordinates for ID = " + primitiveId;

                // bottomRadius
                var bottomRadius = this.reader.getFloat(grandChildren[0], 'bottomRadius');
                if (!(bottomRadius != null && !isNaN(bottomRadius)))
                    return "unable to parse bottomRadius of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;


                var cylinder = new MyCylinder(this.scene, height, topRadius, bottomRadius, stacks, slices);

                this.primitives[primitiveId] = cylinder;
            }
            else if (primitiveType == 'sphere') {

                // radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius)))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;


                var sphere = new MySphere(this.scene, radius, slices, stacks);

                this.primitives[primitiveId] = sphere;
            }
            else if (primitiveType == 'circle') {

                // radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius)))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                var circle = new MyCircle(this.scene, radius, slices);

                this.primitives[primitiveId] = circle;
            }
            else if (primitiveType == 'cylinder2') {

                // height
                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height)))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                // topRadius
                var topRadius = this.reader.getFloat(grandChildren[0], 'topRadius');
                if (!(topRadius != null && !isNaN(topRadius)))
                    return "unable to parse topRadius of the primitive coordinates for ID = " + primitiveId;

                // bottomRadius
                var bottomRadius = this.reader.getFloat(grandChildren[0], 'bottomRadius');
                if (!(bottomRadius != null && !isNaN(bottomRadius)))
                    return "unable to parse bottomRadius of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;


                var cylinder = new MyCylinder2(this.scene, height, topRadius, bottomRadius, stacks, slices);

                this.primitives[primitiveId] = cylinder;
            }
            else if (primitiveType == 'plane') {
                var plane = this.parsePlane(primitiveId, grandChildren[0]);

                if (typeof plane === 'string' || plane instanceof String)
                    return plane;

                this.primitives[primitiveId] = plane;

            }
            else if (primitiveType == 'patch') {
                var patch = this.parsePatch(primitiveId, grandChildren[0]);

                if (typeof patch === 'string' || patch instanceof String)
                    return patch;

                this.primitives[primitiveId] = patch;

            }
            else {
                console.warn("Unkown Primitive.");
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var materials = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children"); // transf, material, texture, children

            // Create current node and then add info to it
            this.components[componentID] = new MyComponentNode(this, componentID);


            // Material ID
            if (materialsIndex == -1)
                return "material must be defined (node ID = " + componentID + ")";
            materials = grandChildren[materialsIndex].children // each material
            var sizeMaterials = 0;
            for (var j = 0; j < materials.length; j++) {
                var materialID = this.reader.getString(materials[j], 'id');
                if (materialID != "inherit") {
                    if (materialID == null)
                        return "unable to parse material ID (node ID = " + componentID + ")";
                    if (materialID != "null" && this.materials[materialID] == null)
                        return "ID does not correspond to a valid material (node ID = " + componentID + ")";
                }
                this.components[componentID].addMaterial(materialID);
                sizeMaterials++;
            }
            if (sizeMaterials == 0)
                return "at least one material must be defined for each intermediate node";


            // Texture ID
            if (textureIndex == -1)
                return "texture must be defined (node ID = " + componentID + ")";
            var textureID = this.reader.getString(grandChildren[textureIndex], 'id');
            if (textureID != "inherit" && textureID != "none") {
                if (textureID == null) //To Do  none
                    return "unable to parse texture ID (node ID = " + componentID + ")";
                if (textureID != "null" && textureID != "clear" && this.textures[textureID] == null)
                    return "ID does not correspond to a valid texture (node ID = " + componentID + ")";
                var textureS = this.reader.getFloat(grandChildren[textureIndex], 'length_s');
                if (textureS == null) //To Do deal with id = null
                    return "unable to parse texture length_s (node ID = " + componentID + ")";
                var textureT = this.reader.getFloat(grandChildren[textureIndex], 'length_t');
                if (textureT == null) //To Do deal with id = null
                    return "unable to parse texture length_t (node ID = " + componentID + ")";
                this.components[componentID].addLenghtST(textureS, textureT);
            }

            this.components[componentID].textureID = textureID;



            // Transformation ID
            if (transformationIndex == -1)
                return "transformation must be defined (node ID = " + componentID + ")";
            var transformationsList = grandChildren[transformationIndex].children // each material
            for (var j = 0; j < transformationsList.length; j++) {
                switch (transformationsList[j].nodeName) {
                    case 'transformationref':
                        var transformationID = this.reader.getString(transformationsList[j], 'id');
                        if (transformationID == null)
                            return "unable to parse transformation ID (node ID = " + componentID + ")";
                        if (transformationID != "null" && transformationID != "clear" && this.transformations[transformationID] == null)
                            return "ID does not correspond to a valid transformation (node ID = " + componentID + ")";
                        mat4.multiply(this.components[componentID].transformMatrix, this.components[componentID].transformMatrix, this.transformations[transformationID]);
                        break;

                    case 'translate':
                        var coordinates = this.parseCoordinates3D(transformationsList[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        mat4.translate(this.components[componentID].transformMatrix, this.components[componentID].transformMatrix, coordinates);
                        break;
                    case 'scale':
                        var coordinates = this.parseCoordinates3D(transformationsList[j], "scale transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        mat4.scale(this.components[componentID].transformMatrix, this.components[componentID].transformMatrix, coordinates);
                        break;
                    case 'rotate':
                        var axis = this.reader.getItem(transformationsList[j], 'axis', ['x', 'y', 'z']);
                        if (axis == null)
                            return "unable to parse axis of the " + "rotate transformation for ID " + transformationID;

                        var angle = this.reader.getFloat(transformationsList[j], 'angle');
                        if (!(angle != null && !isNaN(angle)))
                            return "unable to parse angle of the " + "rotate transformation for ID " + transformationID;

                        mat4.rotate(this.components[componentID].transformMatrix, this.components[componentID].transformMatrix, angle * DEGREE_TO_RAD, this.axisCoords[axis]);
                        break;
                }

            }





            // Children ID
            if (childrenIndex == -1)
                return "children must be defined (node ID = " + componentID + ")";
            grandgrandChildren = grandChildren[childrenIndex].children // componentrefs and primitiverefs

            var sizeChildren = 0;
            for (var j = 0; j < grandgrandChildren.length; j++) {
                if (grandgrandChildren[j].nodeName == "componentref") {
                    var curId = this.reader.getString(grandgrandChildren[j], 'id');
                    //console.log("   componentref: "+curId);

                    if (curId == null)
                        this.onXMLMinorError("unable to parse child id");
                    else if (curId == componentID)
                        return "a node may not be a child of its own";
                    else {
                        this.components[componentID].addChild(curId);
                        sizeChildren++;
                    }
                }
                else if (grandgrandChildren[j].nodeName == "primitiveref") {
                    var curId = this.reader.getString(grandgrandChildren[j], 'id');
                    //console.log("   primitiveref: "+curId);

                    if (curId == null)
                        this.onXMLMinorError("unable to parse child id");
                    else if (curId == componentID)
                        return "a node especially a primitive may not be a child of its own";
                    else {
                        this.components[componentID].addPrimitive(new MyPrimitiveNode(this, curId));
                        sizeChildren++;
                    }
                }
                else
                    this.onXMLMinorError("unknown tag <" + grandgrandChildren[j].nodeName + ">");

            }
            if (sizeChildren == 0)
                return "at least one descendant must be defined for each intermediate node";
        }
        this.log("Parsed components");
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    checkKeys() {
        if (this.scene.gui.isKeyPressed("KeyM")) {
            this.currentMaterialIndex += 1;
        }
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        //To do: Create display loop for transversing the scene graph

        this.components['root'].display();
    }
}