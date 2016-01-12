/**
 * - Underscore extensions (general functionality for objects, arrays, collections and functions)
 */
define(["core/coreApi"], function () {
    'use strict';

    _.mixin({
        //Arrays
        
        //Array rotate: converts array to object 
        //Example: _.arrayToObj(['one', 'two', 'three']) => { 'one': true, 'two': true, 'three': true }
        arrayToObj: function(arr, val) {
            if (arr === null || arr === undefined) return {};

            var i = 0, _i = arr.length,
                newVal = val || true,
                out = {};
            for (; i < _i; i++) {
                out[arr[i]] = newVal;
            }
            return out;
        },

        //Lets imagine an array as a looped object, where after last element goes the first one
        //Example: JS.arrayRotate([1,2,3,4,5],2) => (3,4,5,1,2)
        arrayRotate: function(arr, i) {
            return arr.slice(i).concat(arr.slice(0, i));
        },
        
        //arr: [{id: 2,name:'a'},{id:5, name:'b'}]
        //makeHash(arr, 'id') => {2:{id: 2,name:'a'}, 5:{id:5, name:'b'}}
        //makeHash(arr, function(el){ return el.name+el.id;}) => {a2:{id: 2,name:'a'}, b5:{id:5, name:'b'}}
        //makeHash(arr, 'id', JS.getProperty('name')) => {2:'a', 5:'b'}
        //makeHash(arr, function(el){ return el.name+el.id;}, JS.getProperty('name')) => {a2:'a', b5:'b'}
        makeHash: function(arr, hash, hashVal) {
            var out = {}, i, item;
            if (typeof hashVal === 'function')
                if (typeof hash === 'function') {
                    for (i = arr.length; i;) {
                        item = arr[--i];
                        out[hash(item)] = hashVal(item);
                    }
                } else {
                    for (i = arr.length; i;) {
                        item = arr[--i];
                        out[item[hash]] = hashVal(item);
                    }
                }
            else if (typeof hash === 'function') {
                for (i = arr.length; i;) {
                    item = arr[--i];
                    out[hash(item)] = item;
                }
            } else {
                for (i = arr.length; i;) {
                    item = arr[--i];
                    out[item[hash]] = item;
                }
            }
            return out;
        },

        //Objects

        //Wraps single element with Array
        // TODO move to $.makeArray
        makeArray: function(obj) {
            return obj !== void 0 ? (_.isArray(obj) ? obj : [obj]) : [];
        },
        
        //Repeates function call n times
        repeat: function(n, fn, scope) {
            var out = [];
            for (var i = 0; i < n; i++)
                out.push(fn.call(scope, i, n));
            return out;
        },

        //Checks if specified property exists in window object and returns its value
        getWindowPropIfHas: function(key) {
            return _.getPropIfHas(window, key);
        },

        //Checks if specified property exists in object and returns its value
        getPropIfHas: function(object, key) {
            var arr = key.split('.');
            for (var i = 0, l = arr.length; i < l; i++) {
                if (!object[arr[i]])
                    return false;
                object = object[arr[i]];
            }
            return object;
        },

        //Deeply extends thirst obejct with second
        extendDeep: function(a, b) {
            var me = _.extendDeep,
                i, el;

            for (i in b) {
                el = a[i];
                if (el && typeof el === 'object') {
                    me(el, b[i]);
                } else
                    a[i] = b[i];
            }
            return a;
        },

        //Makes deep clone of object
        cloneDeep: function(obj) {
            var out, i;
            if (_.isArray(obj)) {
                out = [];
                for (i = obj.length; i;) {
                    --i;
                    out[i] = _.cloneDeep(obj[i]);
                }
                return out;
            }

            if (_.isObject(obj) && typeof obj !== "function") {
                out = {};
                for (i in obj)
                    out[i] = _.cloneDeep(obj[i]);
                return out;
            }
            return obj;
        },

        isObjLiteral: function(obj) {
		    var testObj = obj;
		    return (typeof obj !== 'object' || obj === null ?
				    false :
				    (
					    (function() {
						    while (!false) {
						    	if (Object.getPrototypeOf(testObj = Object.getPrototypeOf(testObj)) === null) {
								    break;
							    }
						    }
						    return Object.getPrototypeOf(obj) === testObj;
					    })()
				    )
		    );
	    }
    });
});