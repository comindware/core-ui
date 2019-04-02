// @flow
import formRepository from '../formRepository';
import BaseEditorView from './base/BaseEditorView';

/**
 * @name AudioEditor
 * @memberof module:core.form.editors
 * @class Slider editor. Supported data type: <code>Number</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

export default (formRepository.editors.AudioEditor = BaseEditorView.extend({
    tagName: 'audio',

    template: _.noop,

    templateContext() {
        return Object.assign(this.options, {
            title: this.value || ''
        });
    },

    attributes() {
        return {
            class: '.audio-editor-container',
            controls: true
        };
    },

    onRender() {
        const audio: AudioNode = this.el;
        let recorder = {};
        const regionEl = document.createElement('div');
        regionEl.className = 'js-button-region';
        this.$el.parent().append(regionEl);
        const region = this.addRegion('js-button-region', {
            el: regionEl
        });
        region.show(
            new Core.layout.HorizontalLayout({
                columns: [
                    new Core.layout.Button({
                        text: 'Start recording',
                        handler() {
                            if (navigator.mediaDevices) {
                                navigator.mediaDevices
                                    .getUserMedia({
                                        audio: true
                                    })
                                    .then(stream => {
                                        recorder = new window.MediaRecorder(stream);

                                        recorder.addEventListener('dataavailable', e => this.__onRecordingReady(e, audio));
                                        recorder.start();
                                    });
                            }
                        }
                    }),
                    new Core.layout.Button({
                        text: 'Stop recording',
                        handler() {
                            // Stopping the recorder will eventually trigger the `dataavailable` event and we can complete the recording process
                            recorder.stop();
                        }
                    })
                ]
            })
        );
    },

    __onRecordingReady(e, audio) {
        // e.data contains a blob representing the recording
        audio.src = URL.createObjectURL(e.data);
        audio.play();
    }
}));
