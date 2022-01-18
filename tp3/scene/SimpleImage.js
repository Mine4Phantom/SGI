export class SimpleImage {

    constructor(url) {
        this.loaded = false;
        this.img = new Image(512, 512);
        this.img.onload = this.onload.bind(this);
        this.img.src = url;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
    }

    onload() {
        this.loaded = true;
        this.context.drawImage(this.img, 0, 0)
        this.width = this.img.width;
        this.height = this.img.height;
    }

    getPixel(x, y) {
        return this.loaded ? this.context.getImageData(x, y, 1, 1).data : null;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }
}