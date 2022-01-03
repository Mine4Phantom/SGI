import { CGFXMLreader } from '../lib/CGF.js';


/**
 * MySVGReader class, representing the svg parser.
 */
export class MySVGReader {
    /**
     * @constructor
     */
    constructor(filename, graph) {
        this.graph = graph;

        // File reading 
        this.reader = new CGFXMLreader();

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

        this.graph.loadedOk = true;
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

        // TODO:
        // Do we need r attribute aswell?
        // How to distinguish obstacles from power ups? (layer name?)
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

        let path_info = d.split(' ');

        for (let i = 0; i < path_info.length; i++) {
            // TODO
            this.log(path_info[i]);
        }
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