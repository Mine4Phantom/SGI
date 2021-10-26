import {CGFinterface, dat} from '../lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        // call CGFinterface init
        super.init(application);
       
        // init GUI. For more information on the methods, check:
        // https://github.com/dataarts/dat.gui/blob/master/API.md
        this.gui = new dat.GUI();

        this.gui.add(this.scene, 'displayAxis').name("Display axis");
        this.gui.add(this.scene, 'displayNormals').name("Display normals").onChange(this.scene.updateNormalViz.bind(this.scene));;


        // Anothe forlder for grouping the custom material's parameters
        var f2 = this.gui.addFolder('Custom Material');
        
        f2.addColor(this.scene.customMaterialValues,'Ambient').onChange(this.scene.updateCustomMaterial.bind(this.scene));
        f2.addColor(this.scene.customMaterialValues,'Diffuse').onChange(this.scene.updateCustomMaterial.bind(this.scene));
        f2.addColor(this.scene.customMaterialValues,'Specular').onChange(this.scene.updateCustomMaterial.bind(this.scene));
        f2.add(this.scene.customMaterialValues,'Shininess', 0, 100).onChange(this.scene.updateCustomMaterial.bind(this.scene));

        return true;
    }


}