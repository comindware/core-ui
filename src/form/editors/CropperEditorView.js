import template from './templates/cropperEditor.hbs';
import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';

export default Marionette.View.extend({
    className: 'cropper-img__wrp',

    template: Handlebars.compile(template),

    ui: {
        cropperImageItem: '.js-cropper-img-item'
    },

    regions: {
        cropButtonsRegion: '.cropper-buttons-region'
    },

    onRender() {
        const img = this.ui.cropperImageItem.get(0);
        this.cropper = new Cropper(img, this.options.cropOptions);
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
        if (isNaN(cropTop) || isNaN(cropLeft) || isNaN(cropWidth) || isNaN(cropHeight)) {
            file.imageTransformations = [];
        } else {
            file.imageTransformations = [cropObj];
        }
        return file;
    }
});
