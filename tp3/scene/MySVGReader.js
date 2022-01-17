import { CGFXMLreader } from '../lib/CGF.js';
import { MyObstacle } from './svgelements/MyObstacle.js';
import { MyPowerUp } from './svgelements/MyPowerUp.js';
import { MyRoute } from './svgelements/MyRoute.js';


/**
 * MySVGReader class, representing the svg parser.
 */
export class MySVGReader {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.scene = scene;

        // File reading 
        this.reader = new CGFXMLreader();

        this.powerUps = [];
        this.obstacles = [];
        this.track = null
        this.start = null
        this.routes = []

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open(filename, this);
    }

    /*
    * Callback to be executed after successful reading
    */
    onXMLReady() {
        this.log("SVG Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseSVG(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }
    }

    /**
    * Parses the SVG file relevant blocks.
    * @param {SVG root element} root
    */
    parseSVG(root) {
        if (root.nodeName != "svg")
            return "root tag <svg> missing";

        let children = root.children;

        let error;
        for (let i = 0; i < children.length; i++)
            if (children[i].nodeName === 'g')
                if ((error = this.parseLayer(children[i])) != null)
                    return error;

        this.log('SVG all parsed');
        return null;
    }

    /**
     * Parses layer block
     * @param {Layer node (<g>)} layerNode 
     */
    parseLayer(layerNode) {
        let layerName = this.reader.getString(layerNode, 'inkscape:label')
        if (layerName == null)
            return "failed to parse layer name (inkscape:label attribute)";

        let children = layerNode.children;

        let error;
        for (let i = 0; i < children.length; i++) {
            switch (children[i].nodeName) {
                case 'ellipse': // Circle and ellipses parsed equally in this case
                case 'circle':
                    if ((error = this.parseCircle(children[i], layerName)) != null)
                        return error;
                    break;
                case 'path':
                    if ((error = this.parsePath(children[i], layerName)) != null)
                        return error;
                    break;
                default:
            }
        }
        this.log('Parsed layer ' + layerName);
        return null;
    }

    /**
     * Parses circle tag
     * @param {Circle node} circleNode 
     */
    parseCircle(circleNode, layerName) {
        // id 
        let id = this.reader.getString(circleNode, 'id')
        if (id == null)
            return "failed to parse attribute id in circle inside layer " + layerName;

        // Circle center coordinates
        let cx = this.reader.getFloat(circleNode, 'cx');
        if (cx == null)
            return "failed to parse attribute cx in circle with id = " + id + " inside layer " + layerName;
        let cy = this.reader.getFloat(circleNode, 'cy');
        if (cy == null)
            return "failed to parse attribute cy in circle with id = " + id + " inside layer " + layerName;

        // Create objects according to the layer name
        switch (layerName) {
            case "PowerUps":
                this.powerUps.push(new MyPowerUp(this.scene, cx, cy));
                break;
            case "Obstacles":
                this.obstacles.push(new MyObstacle(this.scene, cx, cy));
                break;
        }
    }

    parsePath(pathNode, layerName) {
        // id 
        let id = this.reader.getString(pathNode, 'id');
        if (id == null)
            return "failed to parse attribute id in path inside layer " + layerName;

        // d 
        let d = this.reader.getString(pathNode, 'd');
        if (d == null)
            return "failed to parse attribute d in path with id = " + id + " inside layer " + layerName;

        let move_tos = []
        let curves = []
        let lines = []
        let close_path = false

        let path_info = d.split(' ');
        for (let i = 0; i < path_info.length; i++) {
            // TODO
            switch (path_info[i]) {
                case 'm':
                case 'M':
                    i=this.getCoordsFromPath(move_tos,path_info,i)
                    break;
                case 'c':
                case 'C':
                    i=this.getCoordsFromPath(curves,path_info,i)
                    break;
                case 'Z':
                case 'z':
                    close_path = true
                    break;
                case 'L':
                    i=this.getCoordsFromPath(lines,path_info,i)
                    break;
                default:
                    return "failed to parse attribute d in path with id = " + id + " with value " + path_info[i] +  " inside layer " + layerName;
            }
        }

        switch (layerName) {
            case "Track":
                this.track = (new MyRoute(this.scene, move_tos, curves, lines, close_path));
                break;
            case "Start":
                this.start = (new MyRoute(this.scene, move_tos, curves, lines, close_path));
                break;
            case "Routes":
                this.routes.push(new MyRoute(this.scene, move_tos, curves, lines, close_path));
                break;
        }
    }

    getCoordsFromPath(arrayToSave,path_info,i){
        for (i = i + 1; i < path_info.length; i++) {
            let coords = path_info[i].split(",")
            if(!(this.isNumeric(coords[0]) && this.isNumeric(coords[1])))
            break;
            else{
                arrayToSave.push(coords)
            }
        }
        i = i - 1
        return i
    }



    isNumeric(str) {
        if (typeof str != "string") return false // we only process strings!  
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
               !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
      }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.graph.loadedOk = false;
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

}