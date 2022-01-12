import { CGFapplication } from '../lib/CGF.js';
import { MySceneGame } from './MySceneGame.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './MySceneGraph.js';
import { MySceneMenu } from './MySceneMenu.js';
import { MySVGReader } from './MySVGReader.js';

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return vars;
}	 

function changeScene(myScene, myInterface, app){
    app.setScene(myScene);
    app.setInterface(myInterface);
    myInterface.setActiveCamera(myScene.camera);
}

function main() {

	// Standard application, scene and interface setup
    var app = new CGFapplication(document.body);
    var myInterface = new MyInterface();
    var mySceneMenu = new MySceneMenu(myInterface);
    var mySceneGame = new MySceneGame(myInterface);

    app.init();

    changeScene(mySceneMenu,myInterface,app)

	// get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
	// or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 
	
    var filename=getUrlVars()['file'] || "car.xml";

    changeScene(mySceneGame,myInterface,app)
	// create and load graph, and associate it to scene. 
	// Check console for loading errors
	var myGraph = new MySceneGraph(filename, mySceneGame);
	
    // SVG parser for map info
    let svgParser = new MySVGReader('TestTrackMap.svg', mySceneGame);

    changeScene(mySceneMenu,myInterface,app)

    //app.setScene(mySceneMenu);
	// start
    app.run();
}

main();
