import { CGFXMLreader } from '../lib/CGF.js';
import { MyObstacle } from './svgelements/MyObstacle.js';
import { MyPowerUp } from './svgelements/MyPowerUp.js';
import { MyRoute } from './svgelements/MyRoute.js';
import { MyStartLine } from './svgelements/MyStartLine.js';
import { MyVehicle } from './svgelements/MyVehicle.js';


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

        this.track = null;
        this.routes = [];

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

        this.scene.onSVGLoaded();
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
            case "PowerUpsSpeed":
                this.scene.powerUps.push(new MyPowerUp(this.scene, cx, cy, this.scene.pUpType.ACC_MULT));
                break;
            case "PowerUpsTime":
                this.scene.powerUps.push(new MyPowerUp(this.scene, cx, cy, this.scene.pUpType.BONUS_TIME));
                break;
            case "ObstaclesInvCont":
                this.scene.obstacles.push(new MyObstacle(this.scene, cx, cy, this.scene.obstacleType.CONTR_INV));
                break;
            case "ObstaclesTime":
                this.scene.obstacles.push(new MyObstacle(this.scene, cx, cy, this.scene.obstacleType.TIME_PENALTY));
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

        let path_vertexes = []
        let close_path = false

        let path_info = d.split(' ');
        for (let i = 0; i < path_info.length; i++) {
            switch (path_info[i]) {
                case 'M':
                    i = this.getCoordsFromPath(path_vertexes, path_info, i, 'M');
                    break;
                case 'm':
                    i = this.getCoordsFromPath(path_vertexes, path_info, i, 'm');
                    break;
                case 'Z':
                case 'z':
                    close_path = true
                    break;
                default:
                    return "failed to parse attribute d in path with id = " + id + " with value " + path_info[i] + " inside layer " + layerName;
            }
        }

        switch (layerName) {
            case "Track":
                if (!close_path)
                    return "Track path must be closed!";
                this.track = (new MyRoute(this.scene, path_vertexes));
                break;
            case "Start":
                let orientation_vector = [path_vertexes[1][0] - path_vertexes[0][0], path_vertexes[1][1] - path_vertexes[0][1]];
                let angle = Math.atan(orientation_vector[1] / orientation_vector[0]);

                this.scene.vehicle = new MyVehicle(this.scene, angle + Math.PI, [path_vertexes[0][0], 0, path_vertexes[0][1]]) //angle + PI because the vehicle starts oriented to the negative side of the x axis

                this.scene.startLine = (new MyStartLine(this.scene, path_vertexes[0]));
                break;
            case "Routes":
                if (!close_path)
                    return "Route path must be closed!";
                this.scene.routes.push(new MyRoute(this.scene, path_vertexes));
                break;
        }
    }

    getCoordsFromPath(arrayToSave, path_info, i, path_command) {

        for (i = i + 1; i < path_info.length; i++) {

            let coords = path_info[i].split(",")

            if (this.isNumeric(coords[0]) && this.isNumeric(coords[1])) {
                coords = coords.map(Number)

                if (path_command == 'm' && arrayToSave.length != 0) {
                    let lastCoord = arrayToSave[arrayToSave.length - 1];
                    coords[0] = lastCoord[0] + coords[0];
                    coords[1] = lastCoord[1] + coords[1];
                }

                arrayToSave.push(coords)
            }
            else break;
        }
        return i - 1;
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