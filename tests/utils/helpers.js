const at = function(collection, index) {
    return collection.at ? collection.at(index) : collection[index];
};

export const wait = ({ action, condition, callback, checkInterval = 0, repeatAction = false } = {}) =>
    new Promise(resolve => {
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

export function expectCollectionsToBeEqual(actualCollection, expectedCollection) {
    expect(actualCollection.length).toBe(expectedCollection.length);
    for (let i = 0, len = actualCollection.length; i < len; i++) {
        const actualValue = at(actualCollection, i);
        const expectedValue = at(expectedCollection, i);
        if (actualValue !== expectedValue) {
            // Logging additional debug information
            console.log('i =', i);
            if (actualValue && actualValue.toJSON) {
                console.log('actual:', actualValue.toJSON());
            }
            if (expectedValue && expectedValue.toJSON) {
                console.log('expected:', expectedValue.toJSON());
            }
        }
        expect(actualValue === expectedValue).toBe(true, `The elements of collections at index ${i} are equal.`);
    }
}

export function expectToHaveSameMembers(actual, expected) {
    const actualValues = _.sortBy(_.uniq(actual), v => v);
    const expectedValues = _.sortBy(_.uniq(expected), v => v);
    expectCollectionsToBeEqual(actualValues, expectedValues);
}
