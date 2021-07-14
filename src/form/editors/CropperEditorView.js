import template from './templates/cropperEditor.hbs';
import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';

export default Marionette.View.extend({
    initialize(options) {
        this.options = options;
    },

    className: 'cropper-img__wrp',

    template: Handlebars.compile(template),

    regions: {
        cropButtonsRegion: '.cropper-buttons-region'
    },

    onRender() {
        const img = this.el.childNodes[0].firstElementChild;
        this.cropper = new Cropper(img, {
            aspectRatio: this.options.cropOptions.aspectRatio
        });
    },

    templateContext() {
        return {
            url: this.options.file.url
        };
    },

    getCrop() {
        const canvasData = this.cropper.getCanvasData();
        const imageData = this.cropper.getImageData();
        const cropBoxData = this.cropper.getCropBoxData();
        const naturalRatio = imageData.naturalHeight / imageData.height;
        const cropTop = Math.round((cropBoxData.top - canvasData.top) * naturalRatio);
        const cropLeft = Math.round((cropBoxData.left - canvasData.left) * naturalRatio);
        const cropWidth = Math.round(cropBoxData.width * naturalRatio);
        const cropHeight = Math.round(cropBoxData.height * naturalRatio);
        const file = this.options.file;
        const cropObj = {
            type: 'Crop',
            y1: cropTop,
            x1: cropLeft,
            x2: cropWidth + cropLeft,
            y2: cropHeight + cropTop
        };
        file.imageTransformations ? file.imageTransformations.push(cropObj) : (file.imageTransformations = [cropObj]);
        return file;
    }
});
