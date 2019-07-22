import 'innersvg-polyfill';

export default class IEService {
    static initialize() {
        DOMTokenList.prototype.toggle = function(name, flag = !this.contains(name)) {
            return flag ? (this.add(name), true) : (this.remove(name), false);
        };

        const originAdd = DOMTokenList.prototype.add;
        DOMTokenList.prototype.add = function() {
            [...arguments].map(name => originAdd.call(this, name));
        };

        const oldRemove = DOMTokenList.prototype.remove;
        DOMTokenList.prototype.remove = function() {
            [...arguments].map(name => oldRemove.call(this, name));
        };
    }
}
