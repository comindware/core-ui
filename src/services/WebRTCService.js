let peerConn = {};
const peerConnCfg = {};

export default class {
    inialize(websocket) {
        this.wsc = websocket;
    }

    static initiateCall(localTarget, remoteTarget) {
        this.localTarget = localTarget;
        this.remoteTarget = remoteTarget;

        this.__prepareCall(remoteTarget);
        navigator.getUserMedia(
            { audio: true, video: true },
            stream => {
                this.localVideoStream = stream;
                localTarget.src = URL.createObjectURL(stream);
                peerConn.addStream(stream);
                this.__createAndSendOffer();
            },
            error => {
                console.log(error);
            }
        );
    }

    static endCall() {
        peerConn.close();
        this.localVideoStream.getTracks().forEach(track => {
            track.stop();
        });
        this.localVideo.src = '';
        this.remoteVideo.src = '';
    }

    __prepareCall(remoteTarget) {
        peerConn = new RTCPeerConnection(peerConnCfg);
        peerConn.onicecandidate = this.__onIceCandidateHandler;
        peerConn.onaddstream = this.__onAddStreamHandler(remoteTarget);
    }

    __onIceCandidateHandler(evt) {
        if (!evt || !evt.candidate) {
            return;
        }
        this.wsc.send(JSON.stringify({ candidate: evt.candidate }));
    }

    __onAddStreamHandler(evt) {
        this.remoteVideo.src = URL.createObjectURL(evt.stream);
    }

    __createAndSendOffer() {
        peerConn.createOffer(
            offer => {
                const off = new RTCSessionDescription(offer);
                peerConn.setLocalDescription(
                    new RTCSessionDescription(off),
                    () => {
                        this.wsc.send(JSON.stringify({ sdp: off }));
                    },
                    error => {
                        console.log(error);
                    }
                );
            },
            error => {
                console.log(error);
            }
        );
    }
}
