import IEService from './IEService';
import EdgeService from './EdgeService';

const classes = {
    mobile: 'mobile'
};

export default class MobileService {
    static isEdge: boolean;
    static isIE: boolean;
    static isIOS: boolean;
    static isMobile: boolean;
    static isPhone: boolean;
    static isTablet: boolean;
    static initialize() {
        const userAgent = navigator.userAgent;
        this.isPhone = /Android|webOS|iPhone|iPod|Blackberry|Windows Phone/i.test(userAgent) && window.innerWidth <= 1024;
        this.isTablet = /iPad|Android/i.test(userAgent) && window.innerWidth <= 1280 && window.innerHeight <= 1366;
        this.isMobile = this.isPhone || this.isTablet;

        if (this.isMobile) {
            document.body.classList.add(classes.mobile);
        }

        this.isIE = navigator.appName === 'Microsoft Internet Explorer' || /MSIE|Trident/i.test(userAgent);
        this.isIE && IEService.initialize();

        this.isEdge = /Edge\//.test(userAgent);
        this.isEdge && EdgeService.initialize();

        this.isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    }
}
