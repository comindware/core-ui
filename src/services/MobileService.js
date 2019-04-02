export default class MobileService {
    static get isIE() {
        const userAgent = navigator.userAgent;
        if (navigator.appName === 'Microsoft Internet Explorer' || !!(userAgent.match(/Trident/) || userAgent.match(/rv:11/)) || userAgent.indexOf('MSIE') > 0) {
            return true;
        }
        return false;
    }

    static get isMobile() {
        const userAgent = navigator.userAgent;
        if (
            userAgent.match(/Android/i) ||
            userAgent.match(/webOS/i) ||
            userAgent.match(/iPhone/i) ||
            userAgent.match(/iPad/i) ||
            userAgent.match(/iPod/i) ||
            userAgent.match(/BlackBerry/i) ||
            userAgent.match(/Windows Phone/i)
        ) {
            return true;
        }
        return false;
    }
}
