
// Inspired by:
// https://coderwall.com/p/iyhizq/get-the-pixel-data-of-an-image-in-html

export class SimpleImage {

    constructor(callbackFunc, url) {
        this.loaded = false;
        this.img = new Image();
        this.img.onload = this.onload.bind(this);
        this.callbackFunc = callbackFunc;
        this.img.src = url;
        this.canvas = document.createElement('canvas');
    }

    onload() {
        this.loaded = true;

        this.canvas.width = this.width = this.img.naturalWidth;
        this.canvas.height = this.height = this.img.naturalHeight;
        this.context = this.canvas.getContext('2d');
        this.context.drawImage(this.img, 0, 0);
        // this typically gives empty data the first time as the image may still be loading
        this.callbackFunc()
    }

    getPixelData(x, y) {
        if (this.loaded)
            return this.context.getImageData(x, y, 1, 1).data;
        else
            return null;
    }


    logPixelAt(x, y) {
        var coord = "x=" + x + ", y=" + y;
        var p = this.getPixelData(x, y);
        var hex = "#" + ("000000" + this.rgbToHex(p[0], p[1], p[2])).slice(-6);
        return "" + coord + ": " + p[0] + ", " + p[1] + ", " + p[2] + "( " + hex + ")";
    }

    rgbToHex(r, g, b) {
        if (r > 255 || g > 255 || b > 255)
            throw "Invalid color component";
        return ((r << 16) | (g << 8) | b).toString(16);
    }


    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }
}