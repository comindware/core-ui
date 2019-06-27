import IEService from './IEService';

export default class MobileService {
    static isMobile: boolean;
    static isIE: boolean;
    static initialize() {
        if (
            navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i)
        ) {
            this.isMobile = true;
        } else {
            this.isMobile = false;
        }
        if (
            navigator.appName === 'Microsoft Internet Explorer' ||
            !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) ||
            (typeof $.browser !== 'undefined' && $.browser.msie === 1)
        ) {
            this.isIE = true;
            IEService.initialize();
        } else {
            this.isIE = false;
        }
    }
}
