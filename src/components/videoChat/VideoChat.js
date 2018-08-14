import template from './templates/videoChat.html';
import WebRTCService from '../../services/WebRTCService';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    ui: {
        localVideo: '.js-local-video',
        remoteVideo: '.js-remote-video',
        videoCallButton: '.js-video-call-button',
        endCallButton: '.js-end-call-button'
    },

    events: {
        'click @ui.videoCallButton': '__handleLocalVideoButtonClick',
        'click @ui.endCallButton': '__handleEndCallButtonClick'
    },

    __handleLocalVideoButtonClick() {
        WebRTCService.initiateCall(this.ui.localVideo, this.ui.remoteVideo);
    },

    __handleEndCallButtonClick() {
        WebRTCService.endCall(this.ui.localVideo, this.ui.remoteVideo);
    }
});
