export default class TestService {
    static wait({ action, condition, callback, checkInterval = 0, repeatAction = false } = {}) {
        return new Promise(resolve => {
            let isActionCalled = false;
            const shouldCallAction = () => repeatAction || !isActionCalled;
            const first = setInterval(() => {
                if (typeof action === 'function' && shouldCallAction()) {
                    isActionCalled = true;
                    action();
                }
                if (typeof condition === 'function' ? condition() : true) {
                    clearTimeout(first);
                    resolve(typeof callback === 'function' && callback());
                }
            }, checkInterval);
        });
    }
}
