import { CGFapplication } from '../lib/CGF.js';
import { MySceneGame } from './MySceneGame.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './MySceneGraph.js';
import { MySceneMenu } from './MySceneMenu.js';
import { MySVGReader } from './MySVGReader.js';

var menu;
var game;
var filename;

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
            vars[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    return vars;
}

export function changeSceneByName(sceneName) {
    switch (sceneName.toLowerCase()) {
        case "menu":
            changeScene(menu["scene"], menu["interface"], menu["app"])
            break;
        case "game":
            changeScene(game["scene"], game["interface"], game["app"])
            new MySceneGraph(filename, game["scene"]);
            new MySVGReader('TestTrackMap.svg', game["scene"]);
            break;
        default:
            console.log("CRASHHHHHHHHHHHHHHHH in changing scene")
    }
}

function changeScene(myScene, myInterface, app) {
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

    menu = {
        'scene': mySceneMenu, 'interface': myInterface, 'app': app
    }
    game = {
        'scene': mySceneGame, 'interface': myInterface, 'app': app
    }

    // get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
    // or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 
    filename = getUrlVars()['file'] || "car.xml";

    app.init();

    changeSceneByName("Menu")

    // start
    app.run();
}

main();
