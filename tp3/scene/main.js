import { CGFapplication, dat } from '../lib/CGF.js';
import { MySceneGame } from './scenes/MySceneGame.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './sxg_parser/MySceneGraph.js';
import { MySceneMenu } from './scenes/MySceneMenu.js';
import { MySVGReader } from './svg_elements/MySVGReader.js';

var menu;
var game;
var demo;
var filename;
var won = false;

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
            vars[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    return vars;
}

// Receives a String with the name of the scene to change into
export function changeSceneByName(sceneName) {
    switch (sceneName.toLowerCase()) {
        case "menu":
            var myInterfaceMenu = new MyInterface();
            var mySceneMenu = new MySceneMenu(myInterfaceMenu);
            changeScene(mySceneMenu, myInterfaceMenu, menu["app"])
            break;
        case "game": //Game settings reset when scene is changed
            var myInterfaceGame = new MyInterface();
            var mySceneGame = new MySceneGame(myInterfaceGame, false); // false for normal play
            game["scene"] = mySceneGame
            changeScene(mySceneGame, myInterfaceGame, game["app"])
            new MySceneGraph(filename, mySceneGame);
            if(won) // Change skin of car to gold
                mySceneGame.graph.currentMaterialIndex=1
            break;
        case "demo":
            var myInterfaceDemo = new MyInterface();
            var mySceneDemo = new MySceneGame(myInterfaceDemo, true); // true for demo
            demo["scene"] = mySceneDemo
            changeScene(mySceneDemo, myInterfaceDemo, demo["app"])
            new MySceneGraph(filename, mySceneDemo);
            demo["scene"].setSettings(2, 2)
            new MySVGReader('ComplexTrack.svg', mySceneDemo);
            break;
        default: break;
    }
}

// Sets difficulty and track for game since for the demo these are constant and calls the respective SVG Reader
export function setGameSettings(difficulty, track) {
    game["scene"].setSettings(difficulty, track);
    if (track == 1) { 
        new MySVGReader('SimpleTrack.svg', game["scene"]); 
    }
    else if (track == 2) { 
        new MySVGReader('ComplexTrack.svg', game["scene"]); 
    }
}

// Returns true if first time winning, changes won to true
export function hasWon(){
    var first = false
    if(won == false)
        first = true
    won = true
    return first
}

// Changes scene by setting it, and the interface and the camera.
// Eliminates old UI controls box since it creates a new one due to the way the library is constructed
function changeScene(myScene, myInterface, app) {

    var UIs = document.getElementsByClassName('dg main a');
    for (var i = 0; i < UIs.length; i++)
        UIs[i].remove();

    app.setScene(myScene);
    app.setInterface(myInterface);
    myInterface.setActiveCamera(myScene.camera);
    myInterface.gui.close();
}

// Initializes all required scenes and interfaces and stores them in a struct
// Presents the menu scene first
function main() {

    // Standard application, scene and interface setup
    var app = new CGFapplication(document.body);
    var myInterfaceGame = new MyInterface();
    var myInterfaceMenu = new MyInterface();
    var myInterfaceDemo = new MyInterface();
    var mySceneMenu = new MySceneMenu(myInterfaceMenu);
    var mySceneGame = new MySceneGame(myInterfaceGame, false);
    var mySceneDemo = new MySceneGame(myInterfaceDemo, true);

    menu = {
        'scene': mySceneMenu, 'interface': myInterfaceMenu, 'app': app
    }
    game = {
        'scene': mySceneGame, 'interface': myInterfaceGame, 'app': app
    }
    demo = {
        'scene': mySceneDemo, 'interface': myInterfaceDemo, 'app': app
    }

    // get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
    // or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 
    filename = getUrlVars()['file'] || "car.xml";

    app.init();
    //initScenes(menu["scene"], myInterfaceMenu, app);
    //initScenes(game["scene"], myInterface, app);
    //new MySceneGraph(filename, game["scene"]);

    changeSceneByName("Menu")

    // start
    app.run();
}

main();
