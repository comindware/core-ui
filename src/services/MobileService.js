export default class MobileService {
    get isIE() {
        if (
            navigator.appName === 'Microsoft Internet Explorer' ||
            !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) ||
            (typeof $.browser !== 'undefined' && $.browser.msie === 1)
        ) {
            return true;
        }
        return false;
    }

    get isMobile() {
        if (
            navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i)
        ) {
            return true;
        }
        return false;
    }
}
