import IEService from './IEService';
import EdgeService from './EdgeService';

export default class MobileService {
    static initialize() {
        const userAgent = navigator.userAgent;
        const isPhone = /Android|webOS|iPhone|iPod|Blackberry|Windows Phone/i.test(userAgent)
            && window.innerWidth <= 414 
            && window.innerHeight <= 896;
        const isTablet = /iPad|Android/i.test(userAgent) && window.innerWidth <= 1280 && window.innerHeight <= 1366;
        const isMobile = (isPhone || isTablet) != null;

        const isIE = navigator.appName === 'Microsoft Internet Explorer' || /MSIE|Trident/i.test(userAgent);
        isIE && IEService.initialize();

        const isEdge = /Edge\//.test(userAgent);
        isEdge && EdgeService.initialize();
    }
}
