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