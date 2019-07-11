import 'innersvg-polyfill';

export default class IEService {
    static initialize() {
        DOMTokenList.prototype.toggle = function(name, flag = !this.contains(name)) {
            return flag ? (this.add(name), true) : (this.remove(name), false);
        };

        const oldAdd = DOMTokenList.prototype.add;
        DOMTokenList.prototype.add = function(className) {
            return arguments.length > 1 
            ? ([...arguments].map(name => oldAdd.call(this, name)), true) 
            : (oldAdd.call(this, className), true);
        };

        const oldRemove = DOMTokenList.prototype.add;
        DOMTokenList.prototype.remove = function(className) {
            return arguments.length > 1 
            ? ([...arguments].map(name => oldRemove.call(this, name)), false) 
            : (oldRemove.call(this, className), false);
        };
    }
}
