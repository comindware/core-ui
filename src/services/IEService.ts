import EdgeService from './EdgeService';
import 'innersvg-polyfill';

export default class IEService extends EdgeService {
    static initialize() {
        super.initialize();
        DOMTokenList.prototype.toggle = function (name, flag = !this.contains(name)) {
            return flag ? (this.add(name), true) : (this.remove(name), false);
        };
    }
}
