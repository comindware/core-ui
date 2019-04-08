import { graphicFileExtensions, videoFileExtensions } from '../meta';
import SelectableBehavior from 'models/behaviors/SelectableBehavior';

export default Backbone.Model.extend({
    initialize({ uniqueId, id, streamId } = {}, options) {
        const previewTag = this.__getPreviewTag();
        if (previewTag) {
            this.set('previewTag', previewTag);
        }
        if (!uniqueId) {
            this.set({ uniqueId: id || streamId });
        }

        _.extend(this, new SelectableBehavior.Selectable(this));
    },

    __getPreviewTag() {
        const extension = this.get('extension');
        if (typeof extension === 'string') {
            if (graphicFileExtensions.includes(extension.toLowerCase())) {
                return 'img';
            } else if (videoFileExtensions.includes(extension.toLowerCase())) {
                return 'video';
            }
        }
    }
});
