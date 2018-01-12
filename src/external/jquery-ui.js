/*! jQuery UI - v1.9.2 - 2012-11-23
* http://jqueryui.com
* Includes: jquery.ui.core.js, jquery.ui.widget.js, jquery.ui.mouse.js, jquery.ui.draggable.js, jquery.ui.droppable.js, jquery.ui.resizable.js, jquery.ui.selectable.js, jquery.ui.sortable.js, jquery.ui.effect.js, jquery.ui.autocomplete.js, jquery.ui.button.js, jquery.ui.effect-blind.js, jquery.ui.effect-bounce.js, jquery.ui.effect-clip.js, jquery.ui.effect-drop.js, jquery.ui.effect-explode.js, jquery.ui.effect-fade.js, jquery.ui.effect-fold.js, jquery.ui.effect-highlight.js, jquery.ui.effect-pulsate.js, jquery.ui.effect-scale.js, jquery.ui.effect-shake.js, jquery.ui.effect-slide.js, jquery.ui.effect-transfer.js, jquery.ui.menu.js, jquery.ui.position.js
* Copyright 2012 jQuery Foundation and other contributors; Licensed MIT */

(function($, undefined) {
    let uuid = 0,
        runiqueId = /^ui-id-\d+$/;

    // prevent duplicate loading
    // this is only a problem because we proxy existing functions
    // and we don't want to double proxy them
    $.ui = $.ui || {};
    if ($.ui.version) {
        return;
    }

    $.extend($.ui, {
        version: '1.9.2',

        keyCode: {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        }
    });

    // plugins
    $.fn.extend({
        _focus: $.fn.focus,
        focus(delay, fn) {
            return typeof delay === 'number' ?
                this.each(function() {
                    const elem = this;
                    setTimeout(() => {
                        $(elem).focus();
                        if (fn) {
                            fn.call(elem);
                        }
                    }, delay);
                }) :
                this._focus.apply(this, arguments);
        },

        scrollParent() {
            let scrollParent;
            if (($.ui.ie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
                scrollParent = this.parents().filter(function() {
                    return (/(relative|absolute|fixed)/).test($.css(this, 'position')) && (/(auto|scroll)/).test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'));
                }).eq(0);
            } else {
                scrollParent = this.parents().filter(function() {
                    return (/(auto|scroll)/).test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'));
                }).eq(0);
            }

            return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
        },

        zIndex(zIndex) {
            if (zIndex !== undefined) {
                return this.css('zIndex', zIndex);
            }

            if (this.length) {
                let elem = $(this[0]),
                    position,
                    value;
                while (elem.length && elem[0] !== document) {
                    // Ignore z-index if position is set to a value where z-index is ignored by the browser
                    // This makes behavior of this function consistent across browsers
                    // WebKit always returns auto if the element is positioned
                    position = elem.css('position');
                    if (position === 'absolute' || position === 'relative' || position === 'fixed') {
                        // IE returns 0 when zIndex is not specified
                        // other browsers return a string
                        // we ignore the case of nested elements with an explicit value of 0
                        // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                        value = parseInt(elem.css('zIndex'), 10);
                        if (!isNaN(value) && value !== 0) {
                            return value;
                        }
                    }
                    elem = elem.parent();
                }
            }

            return 0;
        },

        uniqueId() {
            return this.each(function() {
                if (!this.id) {
                    this.id = `ui-id-${++uuid}`;
                }
            });
        },

        removeUniqueId() {
            return this.each(function() {
                if (runiqueId.test(this.id)) {
                    $(this).removeAttr('id');
                }
            });
        }
    });

    // selectors
    function focusable(element, isTabIndexNotNaN) {
        let map,
            mapName,
            img,
            nodeName = element.nodeName.toLowerCase();
        if (nodeName === 'area') {
            map = element.parentNode;
            mapName = map.name;
            if (!element.href || !mapName || map.nodeName.toLowerCase() !== 'map') {
                return false;
            }
            img = $(`img[usemap=#${mapName}]`)[0];
            return !!img && visible(img);
        }
        return (/input|select|textarea|button|object/.test(nodeName) ?
            !element.disabled :
            nodeName === 'a' ?
                element.href || isTabIndexNotNaN :
                isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible(element);
    }

    function visible(element) {
        return $.expr.filters.visible(element) &&
		!$(element).parents().andSelf().filter(function() {
		    return $.css(this, 'visibility') === 'hidden';
		}).length;
    }

    $.extend($.expr[':'], {
        data: $.expr.createPseudo ?
            $.expr.createPseudo(dataName => function(elem) {
                return !!$.data(elem, dataName);
            }) :
            // support: jQuery <1.8
            function(elem, i, match) {
                return !!$.data(elem, match[3]);
            },

        focusable(element) {
            return focusable(element, !isNaN($.attr(element, 'tabindex')));
        },

        tabbable(element) {
            let tabIndex = $.attr(element, 'tabindex'),
                isTabIndexNaN = isNaN(tabIndex);
            return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
        }
    });

    // support
    $(() => {
        var body = document.body,
            div = body.appendChild(div = document.createElement('div'));

        // access offsetHeight before setting the style to prevent a layout bug
        // in IE 9 which causes the element to continue to take up space even
        // after it is removed from the DOM (#8026)
        div.offsetHeight;

        $.extend(div.style, {
            minHeight: '100px',
            height: 'auto',
            padding: 0,
            borderWidth: 0
        });

        $.support.minHeight = div.offsetHeight === 100;
        $.support.selectstart = 'onselectstart' in div;

        // set display to none to avoid a layout bug in IE
        // http://dev.jquery.com/ticket/4014
        body.removeChild(div).style.display = 'none';
    });

    // support: jQuery <1.8
    if (!$('<a>').outerWidth(1).jquery) {
        $.each([ 'Width', 'Height' ], (i, name) => {
            let side = name === 'Width' ? [ 'Left', 'Right' ] : [ 'Top', 'Bottom' ],
                type = name.toLowerCase(),
                orig = {
                    innerWidth: $.fn.innerWidth,
                    innerHeight: $.fn.innerHeight,
                    outerWidth: $.fn.outerWidth,
                    outerHeight: $.fn.outerHeight
                };

            function reduce(elem, size, border, margin) {
                $.each(side, function() {
                    size -= parseFloat($.css(elem, `padding${this}`)) || 0;
                    if (border) {
                        size -= parseFloat($.css(elem, `border${this}Width`)) || 0;
                    }
                    if (margin) {
                        size -= parseFloat($.css(elem, `margin${this}`)) || 0;
                    }
                });
                return size;
            }

            $.fn[`inner${name}`] = function(size) {
                if (size === undefined) {
                    return orig[`inner${name}`].call(this);
                }

                return this.each(function() {
                    $(this).css(type, `${reduce(this, size)}px`);
                });
            };

            $.fn[`outer${name}`] = function(size, margin) {
                if (typeof size !== 'number') {
                    return orig[`outer${name}`].call(this, size);
                }

                return this.each(function() {
                    $(this).css(type, `${reduce(this, size, true, margin)}px`);
                });
            };
        });
    }

    // support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
    if ($('<a>').data('a-b', 'a').removeData('a-b').data('a-b')) {
        $.fn.removeData = (function(removeData) {
            return function(key) {
                if (arguments.length) {
                    return removeData.call(this, $.camelCase(key));
                }
                return removeData.call(this);
            };
        }($.fn.removeData));
    }


    // deprecated

    (function() {
        const uaMatch = /msie ([\w.]+)/.exec(navigator.userAgent.toLowerCase()) || [];
        $.ui.ie = !!uaMatch.length;
        $.ui.ie6 = parseFloat(uaMatch[1], 10) === 6;
    }());

    $.fn.extend({
        disableSelection() {
            return this.bind(`${$.support.selectstart ? 'selectstart' : 'mousedown'
            }.ui-disableSelection`, event => {
                event.preventDefault();
            });
        },

        enableSelection() {
            return this.unbind('.ui-disableSelection');
        }
    });

    $.extend($.ui, {
        // $.ui.plugin is deprecated.  Use the proxy pattern instead.
        plugin: {
            add(module, option, set) {
                let i,
                    proto = $.ui[module].prototype;
                for (i in set) {
                    proto.plugins[i] = proto.plugins[i] || [];
                    proto.plugins[i].push([ option, set[i] ]);
                }
            },
            call(instance, name, args) {
                let i,
                    set = instance.plugins[name];
                if (!set || !instance.element[0].parentNode || instance.element[0].parentNode.nodeType === 11) {
                    return;
                }

                for (i = 0; i < set.length; i++) {
                    if (instance.options[set[i][0]]) {
                        set[i][1].apply(instance.element, args);
                    }
                }
            }
        },

        contains: $.contains,

        // only used by resizable
        hasScroll(el, a) {
            //If overflow is hidden, the element might have extra content, but the user wants to hide it
            if ($(el).css('overflow') === 'hidden') {
                return false;
            }

            let scroll = (a && a === 'left') ? 'scrollLeft' : 'scrollTop',
                has = false;

            if (el[scroll] > 0) {
                return true;
            }

            // TODO: determine which cases actually cause this to happen
            // if the element doesn't have the scroll set, see if it's possible to
            // set the scroll
            el[scroll] = 1;
            has = (el[scroll] > 0);
            el[scroll] = 0;
            return has;
        },

        // these are odd functions, fix the API or move into individual plugins
        isOverAxis(x, reference, size) {
            //Determines when x coordinate is over "b" element axis
            return (x > reference) && (x < (reference + size));
        },
        isOver(y, x, top, left, height, width) {
            //Determines when x, y coordinates is over "b" element
            return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width);
        }
    });
}(jQuery));

(function($, undefined) {
    let uuid = 0,
        slice = Array.prototype.slice,
        _cleanData = $.cleanData;
    $.cleanData = function(elems) {
        for (var i = 0, elem; (elem = elems[i]) != null; i++) {
            try {
                $(elem).triggerHandler('remove');
                // http://bugs.jquery.com/ticket/8235
            } catch (e) {}
        }
        _cleanData(elems);
    };

    $.widget = function(name, base, prototype) {
        let fullName,
            existingConstructor,
            constructor,
            basePrototype,
            namespace = name.split('.')[0];

        name = name.split('.')[1];
        fullName = `${namespace}-${name}`;

        if (!prototype) {
            prototype = base;
            base = $.Widget;
        }

        // create selector for plugin
        $.expr[':'][fullName.toLowerCase()] = function(elem) {
            return !!$.data(elem, fullName);
        };

        $[namespace] = $[namespace] || {};
        existingConstructor = $[namespace][name];
        constructor = $[namespace][name] = function(options, element) {
            // allow instantiation without "new" keyword
            if (!this._createWidget) {
                return new constructor(options, element);
            }

            // allow instantiation without initializing for simple inheritance
            // must use "new" keyword (the code above always passes args)
            if (arguments.length) {
                this._createWidget(options, element);
            }
        };
        // extend with the existing constructor to carry over any static properties
        $.extend(constructor, existingConstructor, {
            version: prototype.version,
            // copy the object used to create the prototype in case we need to
            // redefine the widget later
            _proto: $.extend({}, prototype),
            // track widgets that inherit from this widget in case this widget is
            // redefined after a widget inherits from it
            _childConstructors: []
        });

        basePrototype = new base();
        // we need to make the options hash a property directly on the new instance
        // otherwise we'll modify the options hash on the prototype that we're
        // inheriting from
        basePrototype.options = $.widget.extend({}, basePrototype.options);
        $.each(prototype, (prop, value) => {
            if ($.isFunction(value)) {
                prototype[prop] = (function() {
                    let _super = function() {
                            return base.prototype[prop].apply(this, arguments);
                        },
                        _superApply = function(args) {
                            return base.prototype[prop].apply(this, args);
                        };
                    return function() {
                        let __super = this._super,
                            __superApply = this._superApply,
                            returnValue;

                        this._super = _super;
                        this._superApply = _superApply;

                        returnValue = value.apply(this, arguments);

                        this._super = __super;
                        this._superApply = __superApply;

                        return returnValue;
                    };
                }());
            }
        });
        constructor.prototype = $.widget.extend(basePrototype, {
            // TODO: remove support for widgetEventPrefix
            // always use the name + a colon as the prefix, e.g., draggable:start
            // don't prefix for widgets that aren't DOM-based
            widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix : name
        }, prototype, {
            constructor,
            namespace,
            widgetName: name,
            // TODO remove widgetBaseClass, see #8155
            widgetBaseClass: fullName,
            widgetFullName: fullName
        });

        // If this widget is being redefined then we need to find all widgets that
        // are inheriting from it and redefine all of them so that they inherit from
        // the new version of this widget. We're essentially trying to replace one
        // level in the prototype chain.
        if (existingConstructor) {
            $.each(existingConstructor._childConstructors, (i, child) => {
                const childPrototype = child.prototype;

                // redefine the child widget using the same prototype that was
                // originally used, but inherit from the new version of the base
                $.widget(`${childPrototype.namespace}.${childPrototype.widgetName}`, constructor, child._proto);
            });
            // remove the list of existing child constructors from the old constructor
            // so the old child constructors can be garbage collected
            delete existingConstructor._childConstructors;
        } else {
            base._childConstructors.push(constructor);
        }

        $.widget.bridge(name, constructor);
    };

    $.widget.extend = function(target) {
        let input = slice.call(arguments, 1),
            inputIndex = 0,
            inputLength = input.length,
            key,
            value;
        for (; inputIndex < inputLength; inputIndex++) {
            for (key in input[inputIndex]) {
                value = input[inputIndex][key];
                if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
                    // Clone objects
                    if ($.isPlainObject(value)) {
                        target[key] = $.isPlainObject(target[key]) ?
                            $.widget.extend({}, target[key], value) :
                            // Don't extend strings, arrays, etc. with objects
                            $.widget.extend({}, value);
                        // Copy everything else by reference
                    } else {
                        target[key] = value;
                    }
                }
            }
        }
        return target;
    };

    $.widget.bridge = function(name, object) {
        const fullName = object.prototype.widgetFullName || name;
        $.fn[name] = function(options) {
            let isMethodCall = typeof options === 'string',
                args = slice.call(arguments, 1),
                returnValue = this;

            // allow multiple hashes to be passed on init
            options = !isMethodCall && args.length ?
                $.widget.extend.apply(null, [ options ].concat(args)) :
                options;

            if (isMethodCall) {
                this.each(function() {
                    let methodValue,
                        instance = $.data(this, fullName);
                    if (!instance) {
                        return $.error(`cannot call methods on ${name} prior to initialization; ` +
						`attempted to call method '${options}'`);
                    }
                    if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
                        return $.error(`no such method '${options}' for ${name} widget instance`);
                    }
                    methodValue = instance[options].apply(instance, args);
                    if (methodValue !== instance && methodValue !== undefined) {
                        returnValue = methodValue && methodValue.jquery ?
                            returnValue.pushStack(methodValue.get()) :
                            methodValue;
                        return false;
                    }
                });
            } else {
                this.each(function() {
                    const instance = $.data(this, fullName);
                    if (instance) {
                        instance.option(options || {})._init();
                    } else {
                        $.data(this, fullName, new object(options, this));
                    }
                });
            }

            return returnValue;
        };
    };

    $.Widget = function(/* options, element */) {};
    $.Widget._childConstructors = [];

    $.Widget.prototype = {
        widgetName: 'widget',
        widgetEventPrefix: '',
        defaultElement: '<div>',
        options: {
            disabled: false,

            // callbacks
            create: null
        },
        _createWidget(options, element) {
            element = $(element || this.defaultElement || this)[0];
            this.element = $(element);
            this.uuid = uuid++;
            this.eventNamespace = `.${this.widgetName}${this.uuid}`;
            this.options = $.widget.extend({},
                this.options,
                this._getCreateOptions(),
                options);

            this.bindings = $();
            this.hoverable = $();
            this.focusable = $();

            if (element !== this) {
                // 1.9 BC for #7810
                // TODO remove dual storage
                $.data(element, this.widgetName, this);
                $.data(element, this.widgetFullName, this);
                this._on(true, this.element, {
                    remove(event) {
                        if (event.target === element) {
                            this.destroy();
                        }
                    }
                });
                this.document = $(element.style ?
                    // element within the document
    element.ownerDocument :
                    // element is window or document
                    element.document || element);
                this.window = $(this.document[0].defaultView || this.document[0].parentWindow);
            }

            this._create();
            this._trigger('create', null, this._getCreateEventData());
            this._init();
        },
        _getCreateOptions: $.noop,
        _getCreateEventData: $.noop,
        _create: $.noop,
        _init: $.noop,

        destroy() {
            this._destroy();
            // we can probably remove the unbind calls in 2.0
            // all event bindings should go through this._on()
            this.element
                .unbind(this.eventNamespace)
            // 1.9 BC for #7810
            // TODO remove dual storage
                .removeData(this.widgetName)
                .removeData(this.widgetFullName)
            // support: jquery <1.6.3
            // http://bugs.jquery.com/ticket/9413
                .removeData($.camelCase(this.widgetFullName));
            this.widget()
                .unbind(this.eventNamespace)
                .removeAttr('aria-disabled')
                .removeClass(
                    `${this.widgetFullName}-disabled ` +
				'ui-state-disabled');

            // clean up events and states
            this.bindings.unbind(this.eventNamespace);
            this.hoverable.removeClass('ui-state-hover');
            this.focusable.removeClass('ui-state-focus');
        },
        _destroy: $.noop,

        widget() {
            return this.element;
        },

        option(key, value) {
            let options = key,
                parts,
                curOption,
                i;

            if (arguments.length === 0) {
                // don't return a reference to the internal hash
                return $.widget.extend({}, this.options);
            }

            if (typeof key === 'string') {
                // handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
                options = {};
                parts = key.split('.');
                key = parts.shift();
                if (parts.length) {
                    curOption = options[key] = $.widget.extend({}, this.options[key]);
                    for (i = 0; i < parts.length - 1; i++) {
                        curOption[parts[i]] = curOption[parts[i]] || {};
                        curOption = curOption[parts[i]];
                    }
                    key = parts.pop();
                    if (value === undefined) {
                        return curOption[key] === undefined ? null : curOption[key];
                    }
                    curOption[key] = value;
                } else {
                    if (value === undefined) {
                        return this.options[key] === undefined ? null : this.options[key];
                    }
                    options[key] = value;
                }
            }

            this._setOptions(options);

            return this;
        },
        _setOptions(options) {
            let key;

            for (key in options) {
                this._setOption(key, options[key]);
            }

            return this;
        },
        _setOption(key, value) {
            this.options[key] = value;

            if (key === 'disabled') {
                this.widget()
                    .toggleClass(`${this.widgetFullName}-disabled ui-state-disabled`, !!value)
                    .attr('aria-disabled', value);
                this.hoverable.removeClass('ui-state-hover');
                this.focusable.removeClass('ui-state-focus');
            }

            return this;
        },

        enable() {
            return this._setOption('disabled', false);
        },
        disable() {
            return this._setOption('disabled', true);
        },

        _on(suppressDisabledCheck, element, handlers) {
            let delegateElement,
                instance = this;

            // no suppressDisabledCheck flag, shuffle arguments
            if (typeof suppressDisabledCheck !== 'boolean') {
                handlers = element;
                element = suppressDisabledCheck;
                suppressDisabledCheck = false;
            }

            // no element argument, shuffle and use this.element
            if (!handlers) {
                handlers = element;
                element = this.element;
                delegateElement = this.widget();
            } else {
                // accept selectors, DOM elements
                element = delegateElement = $(element);
                this.bindings = this.bindings.add(element);
            }

            $.each(handlers, (event, handler) => {
                function handlerProxy() {
                    // allow widgets to customize the disabled handling
                    // - disabled as an array instead of boolean
                    // - disabled class as method for disabling individual parts
                    if (!suppressDisabledCheck &&
						(instance.options.disabled === true ||
							$(this).hasClass('ui-state-disabled'))) {
                        return;
                    }
                    return (typeof handler === 'string' ? instance[handler] : handler)
                        .apply(instance, arguments);
                }

                // copy the guid so direct unbinding works
                if (typeof handler !== 'string') {
                    handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
                }

                let match = event.match(/^(\w+)\s*(.*)$/),
                    eventName = match[1] + instance.eventNamespace,
                    selector = match[2];
                if (selector) {
                    delegateElement.delegate(selector, eventName, handlerProxy);
                } else {
                    element.bind(eventName, handlerProxy);
                }
            });
        },

        _off(element, eventName) {
            eventName = (eventName || '').split(' ').join(`${this.eventNamespace} `) + this.eventNamespace;
            element.unbind(eventName).undelegate(eventName);
        },

        _delay(handler, delay) {
            function handlerProxy() {
                return (typeof handler === 'string' ? instance[handler] : handler)
                    .apply(instance, arguments);
            }
            var instance = this;
            return setTimeout(handlerProxy, delay || 0);
        },

        _hoverable(element) {
            this.hoverable = this.hoverable.add(element);
            this._on(element, {
                mouseenter(event) {
                    $(event.currentTarget).addClass('ui-state-hover');
                },
                mouseleave(event) {
                    $(event.currentTarget).removeClass('ui-state-hover');
                }
            });
        },

        _focusable(element) {
            this.focusable = this.focusable.add(element);
            this._on(element, {
                focusin(event) {
                    $(event.currentTarget).addClass('ui-state-focus');
                },
                focusout(event) {
                    $(event.currentTarget).removeClass('ui-state-focus');
                }
            });
        },

        _trigger(type, event, data) {
            let prop,
                orig,
                callback = this.options[type];

            data = data || {};
            event = $.Event(event);
            event.type = (type === this.widgetEventPrefix ?
                type :
                this.widgetEventPrefix + type).toLowerCase();
            // the original event may come from any element
            // so we need to reset the target on the new event
            event.target = this.element[0];

            // copy original event properties over to the new event
            orig = event.originalEvent;
            if (orig) {
                for (prop in orig) {
                    if (!(prop in event)) {
                        event[prop] = orig[prop];
                    }
                }
            }

            this.element.trigger(event, data);
            return !($.isFunction(callback) &&
			callback.apply(this.element[0], [ event ].concat(data)) === false ||
			event.isDefaultPrevented());
        }
    };

    $.each({ show: 'fadeIn', hide: 'fadeOut' }, (method, defaultEffect) => {
        $.Widget.prototype[`_${method}`] = function(element, options, callback) {
            if (typeof options === 'string') {
                options = { effect: options };
            }
            let hasOptions,
                effectName = !options ?
                    method :
                    options === true || typeof options === 'number' ?
                        defaultEffect :
                        options.effect || defaultEffect;
            options = options || {};
            if (typeof options === 'number') {
                options = { duration: options };
            }
            hasOptions = !$.isEmptyObject(options);
            options.complete = callback;
            if (options.delay) {
                element.delay(options.delay);
            }
            if (hasOptions && $.effects && ($.effects.effect[effectName] || $.uiBackCompat !== false && $.effects[effectName])) {
                element[method](options);
            } else if (effectName !== method && element[effectName]) {
                element[effectName](options.duration, options.easing, callback);
            } else {
                element.queue(function(next) {
                    $(this)[method]();
                    if (callback) {
                        callback.call(element[0]);
                    }
                    next();
                });
            }
        };
    });

    // DEPRECATED
    if ($.uiBackCompat !== false) {
        $.Widget.prototype._getCreateOptions = function() {
            return $.metadata && $.metadata.get(this.element[0])[this.widgetName];
        };
    }
}(jQuery));

(function($, undefined) {
    let mouseHandled = false;
    $(document).mouseup(e => {
        mouseHandled = false;
    });

    $.widget('ui.mouse', {
        version: '1.9.2',
        options: {
            cancel: 'input,textarea,button,select,option',
            distance: 1,
            delay: 0
        },
        _mouseInit() {
            const that = this;

            this.element
                .bind(`mousedown.${this.widgetName}`, event => that._mouseDown(event))
                .bind(`click.${this.widgetName}`, event => {
                    if ($.data(event.target, `${that.widgetName}.preventClickEvent`) === true) {
                        $.removeData(event.target, `${that.widgetName}.preventClickEvent`);
                        event.stopImmediatePropagation();
                        return false;
                    }
                });

            this.started = false;
        },

        // TODO: make sure destroying one instance of mouse doesn't mess with
        // other instances of mouse
        _mouseDestroy() {
            this.element.unbind(`.${this.widgetName}`);
            if (this._mouseMoveDelegate) {
                $(document)
                    .unbind(`mousemove.${this.widgetName}`, this._mouseMoveDelegate)
                    .unbind(`mouseup.${this.widgetName}`, this._mouseUpDelegate);
            }
        },

        _mouseDown(event) {
            // don't let more than one widget handle mouseStart
            if (mouseHandled) { return; }

            // we may have missed mouseup (out of window)
            (this._mouseStarted && this._mouseUp(event));

            this._mouseDownEvent = event;

            let that = this,
                btnIsLeft = (event.which === 1),
                // event.target.nodeName works around a bug in IE 8 with
                // disabled inputs (#7620)
                elIsCancel = (typeof this.options.cancel === 'string' && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
            if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
                return true;
            }

            this.mouseDelayMet = !this.options.delay;
            if (!this.mouseDelayMet) {
                this._mouseDelayTimer = setTimeout(() => {
                    that.mouseDelayMet = true;
                }, this.options.delay);
            }

            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted = (this._mouseStart(event) !== false);
                if (!this._mouseStarted) {
                    event.preventDefault();
                    return true;
                }
            }

            // Click event may never have fired (Gecko & Opera)
            if ($.data(event.target, `${this.widgetName}.preventClickEvent`) === true) {
                $.removeData(event.target, `${this.widgetName}.preventClickEvent`);
            }

            // these delegates are required to keep context
            this._mouseMoveDelegate = function(event) {
                return that._mouseMove(event);
            };
            this._mouseUpDelegate = function(event) {
                return that._mouseUp(event);
            };
            $(document)
                .bind(`mousemove.${this.widgetName}`, this._mouseMoveDelegate)
                .bind(`mouseup.${this.widgetName}`, this._mouseUpDelegate);

            event.preventDefault();

            mouseHandled = true;
            return true;
        },

        _mouseMove(event) {
            // IE mouseup check - mouseup happened when mouse was out of window
            if ($.ui.ie && !(document.documentMode >= 9) && !event.button) {
                return this._mouseUp(event);
            }

            if (this._mouseStarted) {
                this._mouseDrag(event);
                return event.preventDefault();
            }

            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
                (this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
            }

            return !this._mouseStarted;
        },

        _mouseUp(event) {
            $(document)
                .unbind(`mousemove.${this.widgetName}`, this._mouseMoveDelegate)
                .unbind(`mouseup.${this.widgetName}`, this._mouseUpDelegate);

            if (this._mouseStarted) {
                this._mouseStarted = false;

                if (event.target === this._mouseDownEvent.target) {
                    $.data(event.target, `${this.widgetName}.preventClickEvent`, true);
                }

                this._mouseStop(event);
            }

            return false;
        },

        _mouseDistanceMet(event) {
            return (Math.max(
                Math.abs(this._mouseDownEvent.pageX - event.pageX),
                Math.abs(this._mouseDownEvent.pageY - event.pageY)
            ) >= this.options.distance
            );
        },

        _mouseDelayMet(event) {
            return this.mouseDelayMet;
        },

        // These are placeholder methods, to be overriden by extending plugin
        _mouseStart(event) {},
        _mouseDrag(event) {},
        _mouseStop(event) {},
        _mouseCapture(event) { return true; }
    });
}(jQuery));

(function($, undefined) {
    $.widget('ui.draggable', $.ui.mouse, {
        version: '1.9.2',
        widgetEventPrefix: 'drag',
        options: {
            addClasses: true,
            appendTo: 'parent',
            axis: false,
            connectToSortable: false,
            containment: false,
            cursor: 'auto',
            cursorAt: false,
            grid: false,
            handle: false,
            helper: 'original',
            iframeFix: false,
            opacity: false,
            refreshPositions: false,
            revert: false,
            revertDuration: 500,
            scope: 'default',
            scroll: true,
            scrollSensitivity: 20,
            scrollSpeed: 20,
            snap: false,
            snapMode: 'both',
            snapTolerance: 20,
            stack: false,
            zIndex: false
        },
        _create() {
            if (this.options.helper == 'original' && !(/^(?:r|a|f)/).test(this.element.css('position'))) { this.element[0].style.position = 'relative'; }

            (this.options.addClasses && this.element.addClass('ui-draggable'));
            (this.options.disabled && this.element.addClass('ui-draggable-disabled'));

            this._mouseInit();
        },

        _destroy() {
            this.element.removeClass('ui-draggable ui-draggable-dragging ui-draggable-disabled');
            this._mouseDestroy();
        },

        _mouseCapture(event) {
            const o = this.options;

            // among others, prevent a drag on a resizable-handle
            if (this.helper || o.disabled || $(event.target).is('.ui-resizable-handle')) { return false; }

            //Quit if we're not on a valid handle
            this.handle = this._getHandle(event);
            if (!this.handle) { return false; }

            $(o.iframeFix === true ? 'iframe' : o.iframeFix).each(function() {
                $('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>')
                    .css({
                        width: `${this.offsetWidth}px`,
                        height: `${this.offsetHeight}px`,
                        position: 'absolute',
                        opacity: '0.001',
                        zIndex: 1000
                    })
                    .css($(this).offset())
                    .appendTo('body');
            });

            return true;
        },

        _mouseStart(event) {
            const o = this.options;

            //Create and append the visible helper
            this.helper = this._createHelper(event);

            this.helper.addClass('ui-draggable-dragging');

            //Cache the helper size
            this._cacheHelperProportions();

            //If ddmanager is used for droppables, set the global draggable
            if ($.ui.ddmanager) { $.ui.ddmanager.current = this; }

            /*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

            //Cache the margins of the original element
            this._cacheMargins();

            //Store the helper's css position
            this.cssPosition = this.helper.css('position');
            this.scrollParent = this.helper.scrollParent();

            //The element's absolute position on the page minus margins
            this.offset = this.positionAbs = this.element.offset();
            this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            };

            $.extend(this.offset, {
                click: { //Where the click happened, relative to the element
                    left: event.pageX - this.offset.left,
                    top: event.pageY - this.offset.top
                },
                parent: this._getParentOffset(),
                relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
            });

            //Generate the original position
            this.originalPosition = this.position = this._generatePosition(event);
            this.originalPageX = event.pageX;
            this.originalPageY = event.pageY;

            //Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
            (o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

            //Set a containment if given in the options
            if (o.containment) { this._setContainment(); }

            //Trigger event + callbacks
            if (this._trigger('start', event) === false) {
                this._clear();
                return false;
            }

            //Recache the helper size
            this._cacheHelperProportions();

            //Prepare the droppable offsets
            if ($.ui.ddmanager && !o.dropBehaviour) { $.ui.ddmanager.prepareOffsets(this, event); }


            this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position

            //If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
            if ($.ui.ddmanager) $.ui.ddmanager.dragStart(this, event);

            return true;
        },

        _mouseDrag(event, noPropagation) {
            //Compute the helpers position
            this.position = this._generatePosition(event);
            this.positionAbs = this._convertPositionTo('absolute');

            //Call plugins and callbacks and use the resulting position if something is returned
            if (!noPropagation) {
                const ui = this._uiHash();
                if (this._trigger('drag', event, ui) === false) {
                    this._mouseUp({});
                    return false;
                }
                this.position = ui.position;
            }

            if (!this.options.axis || this.options.axis != 'y') this.helper[0].style.left = `${this.position.left}px`;
            if (!this.options.axis || this.options.axis != 'x') this.helper[0].style.top = `${this.position.top}px`;
            if ($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

            return false;
        },

        _mouseStop(event) {
            //If we are using droppables, inform the manager about the drop
            let dropped = false;
            if ($.ui.ddmanager && !this.options.dropBehaviour) { dropped = $.ui.ddmanager.drop(this, event); }

            //if a drop comes from outside (a sortable)
            if (this.dropped) {
                dropped = this.dropped;
                this.dropped = false;
            }

            //if the original element is no longer in the DOM don't bother to continue (see #8269)
            let element = this.element[0],
                elementInDom = false;
            while (element && (element = element.parentNode)) {
                if (element == document) {
                    elementInDom = true;
                }
            }
            if (!elementInDom && this.options.helper === 'original') { return false; }

            if ((this.options.revert == 'invalid' && !dropped) || (this.options.revert == 'valid' && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
                const that = this;
                $(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), () => {
                    if (that._trigger('stop', event) !== false) {
                        that._clear();
                    }
                });
            } else if (this._trigger('stop', event) !== false) {
                this._clear();
            }

            return false;
        },

        _mouseUp(event) {
            //Remove frame helpers
            $('div.ui-draggable-iframeFix').each(function() {
                this.parentNode.removeChild(this);
            });

            //If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
            if ($.ui.ddmanager) $.ui.ddmanager.dragStop(this, event);

            return $.ui.mouse.prototype._mouseUp.call(this, event);
        },

        cancel() {
            if (this.helper.is('.ui-draggable-dragging')) {
                this._mouseUp({});
            } else {
                this._clear();
            }

            return this;
        },

        _getHandle(event) {
            let handle = !!(!this.options.handle || !$(this.options.handle, this.element).length);
            $(this.options.handle, this.element)
                .find('*')
                .andSelf()
                .each(function() {
                    if (this == event.target) handle = true;
                });

            return handle;
        },

        _createHelper(event) {
            const o = this.options;
            const helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper == 'clone' ? this.element.clone().removeAttr('id') : this.element);

            if (!helper.parents('body').length) { helper.appendTo((o.appendTo == 'parent' ? this.element[0].parentNode : o.appendTo)); }

            if (helper[0] != this.element[0] && !(/(fixed|absolute)/).test(helper.css('position'))) { helper.css('position', 'absolute'); }

            return helper;
        },

        _adjustOffsetFromHelper(obj) {
            if (typeof obj === 'string') {
                obj = obj.split(' ');
            }
            if ($.isArray(obj)) {
                obj = { left: +obj[0], top: +obj[1] || 0 };
            }
            if ('left' in obj) {
                this.offset.click.left = obj.left + this.margins.left;
            }
            if ('right' in obj) {
                this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
            }
            if ('top' in obj) {
                this.offset.click.top = obj.top + this.margins.top;
            }
            if ('bottom' in obj) {
                this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
            }
        },

        _getParentOffset() {
            //Get the offsetParent and cache its position
            this.offsetParent = this.helper.offsetParent();
            let po = this.offsetParent.offset();

            // This is a special case where we need to modify a offset calculated on start, since the following happened:
            // 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
            // 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
            //    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
            if (this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
                po.left += this.scrollParent.scrollLeft();
                po.top += this.scrollParent.scrollTop();
            }

            if ((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.ui.ie)) //Ugly IE fix
            { po = { top: 0, left: 0 }; }

            return {
                top: po.top + (parseInt(this.offsetParent.css('borderTopWidth'), 10) || 0),
                left: po.left + (parseInt(this.offsetParent.css('borderLeftWidth'), 10) || 0)
            };
        },

        _getRelativeOffset() {
            if (this.cssPosition == 'relative') {
                const p = this.element.position();
                return {
                    top: p.top - (parseInt(this.helper.css('top'), 10) || 0) + this.scrollParent.scrollTop(),
                    left: p.left - (parseInt(this.helper.css('left'), 10) || 0) + this.scrollParent.scrollLeft()
                };
            }
            return { top: 0, left: 0 };
        },

        _cacheMargins() {
            this.margins = {
                left: (parseInt(this.element.css('marginLeft'), 10) || 0),
                top: (parseInt(this.element.css('marginTop'), 10) || 0),
                right: (parseInt(this.element.css('marginRight'), 10) || 0),
                bottom: (parseInt(this.element.css('marginBottom'), 10) || 0)
            };
        },

        _cacheHelperProportions() {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            };
        },

        _setContainment() {
            const o = this.options;
            if (o.containment == 'parent') o.containment = this.helper[0].parentNode;
            if (o.containment == 'document' || o.containment == 'window') {
                this.containment = [
                    o.containment == 'document' ? 0 : $(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
                    o.containment == 'document' ? 0 : $(window).scrollTop() - this.offset.relative.top - this.offset.parent.top,
                    (o.containment == 'document' ? 0 : $(window).scrollLeft()) + $(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
                    (o.containment == 'document' ? 0 : $(window).scrollTop()) + ($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
                ];
            }

            if (!(/^(document|window|parent)$/).test(o.containment) && o.containment.constructor != Array) {
                const c = $(o.containment);
                const ce = c[0]; if (!ce) return;
                const co = c.offset();
                const over = ($(ce).css('overflow') != 'hidden');

                this.containment = [
                    (parseInt($(ce).css('borderLeftWidth'), 10) || 0) + (parseInt($(ce).css('paddingLeft'), 10) || 0),
                    (parseInt($(ce).css('borderTopWidth'), 10) || 0) + (parseInt($(ce).css('paddingTop'), 10) || 0),
                    (over ? Math.max(ce.scrollWidth, ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css('borderLeftWidth'), 10) || 0) - (parseInt($(ce).css('paddingRight'), 10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right,
                    (over ? Math.max(ce.scrollHeight, ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css('borderTopWidth'), 10) || 0) - (parseInt($(ce).css('paddingBottom'), 10) || 0) - this.helperProportions.height - this.margins.top - this.margins.bottom
                ];
                this.relative_container = c;
            } else if (o.containment.constructor == Array) {
                this.containment = o.containment;
            }
        },

        _convertPositionTo(d, pos) {
            if (!pos) pos = this.position;
            const mod = d == 'absolute' ? 1 : -1;
            let o = this.options,
                scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
                scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

            return {
                top: (
                    pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ((this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : (scrollIsRootNode ? 0 : scroll.scrollTop())) * mod)
                ),
                left: (
                    pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ((this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft()) * mod)
                )
            };
        },

        _generatePosition(event) {
            let o = this.options,
                scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
                scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
            let pageX = event.pageX;
            let pageY = event.pageY;

            /*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

            if (this.originalPosition) { //If we are not dragging yet, we won't check for options
                let containment;
                if (this.containment) {
                    if (this.relative_container) {
                        const co = this.relative_container.offset();
                        containment = [ this.containment[0] + co.left,
                            this.containment[1] + co.top,
                            this.containment[2] + co.left,
                            this.containment[3] + co.top ];
                    } else {
                        containment = this.containment;
                    }

                    if (event.pageX - this.offset.click.left < containment[0]) pageX = containment[0] + this.offset.click.left;
                    if (event.pageY - this.offset.click.top < containment[1]) pageY = containment[1] + this.offset.click.top;
                    if (event.pageX - this.offset.click.left > containment[2]) pageX = containment[2] + this.offset.click.left;
                    if (event.pageY - this.offset.click.top > containment[3]) pageY = containment[3] + this.offset.click.top;
                }

                if (o.grid) {
                    //Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
                    const top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
                    pageY = containment ? (!(top - this.offset.click.top < containment[1] || top - this.offset.click.top > containment[3]) ? top : (!(top - this.offset.click.top < containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

                    const left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
                    pageX = containment ? (!(left - this.offset.click.left < containment[0] || left - this.offset.click.left > containment[2]) ? left : (!(left - this.offset.click.left < containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
                }
            }

            return {
                top: (
                    pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ((this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : (scrollIsRootNode ? 0 : scroll.scrollTop())))
                ),
                left: (
                    pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ((this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft()))
                )
            };
        },

        _clear() {
            this.helper.removeClass('ui-draggable-dragging');
            if (this.helper[0] != this.element[0] && !this.cancelHelperRemoval) this.helper.remove();
            //if($.ui.ddmanager) $.ui.ddmanager.current = null;
            this.helper = null;
            this.cancelHelperRemoval = false;
        },

        // From now on bulk stuff - mainly helpers

        _trigger(type, event, ui) {
            ui = ui || this._uiHash();
            $.ui.plugin.call(this, type, [event, ui]);
            if (type == 'drag') this.positionAbs = this._convertPositionTo('absolute'); //The absolute position has to be recalculated after plugins
            return $.Widget.prototype._trigger.call(this, type, event, ui);
        },

        plugins: {},

        _uiHash(event) {
            return {
                helper: this.helper,
                position: this.position,
                originalPosition: this.originalPosition,
                offset: this.positionAbs
            };
        }

    });

    $.ui.plugin.add('draggable', 'connectToSortable', {
        start(event, ui) {
            let inst = $(this).data('draggable'),
                o = inst.options,
                uiSortable = $.extend({}, ui, { item: inst.element });
            inst.sortables = [];
            $(o.connectToSortable).each(function() {
                const sortable = $.data(this, 'sortable');
                if (sortable && !sortable.options.disabled) {
                    inst.sortables.push({
                        instance: sortable,
                        shouldRevert: sortable.options.revert
                    });
                    sortable.refreshPositions();	// Call the sortable's refreshPositions at drag start to refresh the containerCache since the sortable container cache is used in drag and needs to be up to date (this will ensure it's initialised as well as being kept in step with any changes that might have happened on the page).
                    sortable._trigger('activate', event, uiSortable);
                }
            });
        },
        stop(event, ui) {
            //If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
            let inst = $(this).data('draggable'),
                uiSortable = $.extend({}, ui, { item: inst.element });

            $.each(inst.sortables, function() {
                if (this.instance.isOver) {
                    this.instance.isOver = 0;

                    inst.cancelHelperRemoval = true; //Don't remove the helper in the draggable instance
                    this.instance.cancelHelperRemoval = false; //Remove it in the sortable instance (so sortable plugins like revert still work)

                    //The sortable revert is supported, and we have to set a temporary dropped variable on the draggable to support revert: 'valid/invalid'
                    if (this.shouldRevert) this.instance.options.revert = true;

                    //Trigger the stop of the sortable
                    this.instance._mouseStop(event);

                    this.instance.options.helper = this.instance.options._helper;

                    //If the helper has been the original item, restore properties in the sortable
                    if (inst.options.helper == 'original') { this.instance.currentItem.css({ top: 'auto', left: 'auto' }); }
                } else {
                    this.instance.cancelHelperRemoval = false; //Remove the helper in the sortable instance
                    this.instance._trigger('deactivate', event, uiSortable);
                }
            });
        },
        drag(event, ui) {
            let inst = $(this).data('draggable'),
                that = this;

            const checkPos = function(o) {
                let dyClick = this.offset.click.top,
                    dxClick = this.offset.click.left;
                let helperTop = this.positionAbs.top,
                    helperLeft = this.positionAbs.left;
                let itemHeight = o.height,
                    itemWidth = o.width;
                let itemTop = o.top,
                    itemLeft = o.left;

                return $.ui.isOver(helperTop + dyClick, helperLeft + dxClick, itemTop, itemLeft, itemHeight, itemWidth);
            };

            $.each(inst.sortables, function(i) {
                let innermostIntersecting = false;
                const thisSortable = this;
                //Copy over some variables to allow calling the sortable's native _intersectsWith
                this.instance.positionAbs = inst.positionAbs;
                this.instance.helperProportions = inst.helperProportions;
                this.instance.offset.click = inst.offset.click;

                if (this.instance._intersectsWith(this.instance.containerCache)) {
                    innermostIntersecting = true;
                    $.each(inst.sortables, function() {
                        this.instance.positionAbs = inst.positionAbs;
                        this.instance.helperProportions = inst.helperProportions;
                        this.instance.offset.click = inst.offset.click;
                        if (this != thisSortable
						&& this.instance._intersectsWith(this.instance.containerCache)
						&& $.ui.contains(thisSortable.instance.element[0], this.instance.element[0])) { innermostIntersecting = false; }
                        return innermostIntersecting;
                    });
                }


                if (innermostIntersecting) {
                    //If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
                    if (!this.instance.isOver) {
                        this.instance.isOver = 1;
                        //Now we fake the start of dragging for the sortable instance,
                        //by cloning the list group item, appending it to the sortable and using it as inst.currentItem
                        //We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
                        this.instance.currentItem = $(that).clone().removeAttr('id').appendTo(this.instance.element)
                            .data('sortable-item', true);
                        this.instance.options._helper = this.instance.options.helper; //Store helper option to later restore it
                        this.instance.options.helper = function() { return ui.helper[0]; };

                        event.target = this.instance.currentItem[0];
                        this.instance._mouseCapture(event, true);
                        this.instance._mouseStart(event, true, true);

                        //Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
                        this.instance.offset.click.top = inst.offset.click.top;
                        this.instance.offset.click.left = inst.offset.click.left;
                        this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
                        this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

                        inst._trigger('toSortable', event);
                        inst.dropped = this.instance.element; //draggable revert needs that
                        //hack so receive/update callbacks work (mostly)
                        inst.currentItem = inst.element;
                        this.instance.fromOutside = inst;
                    }

                    //Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
                    if (this.instance.currentItem) this.instance._mouseDrag(event);
                } else {
                    //If it doesn't intersect with the sortable, and it intersected before,
                    //we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
                    if (this.instance.isOver) {
                        this.instance.isOver = 0;
                        this.instance.cancelHelperRemoval = true;

                        //Prevent reverting on this forced stop
                        this.instance.options.revert = false;

                        // The out event needs to be triggered independently
                        this.instance._trigger('out', event, this.instance._uiHash(this.instance));

                        this.instance._mouseStop(event, true);
                        this.instance.options.helper = this.instance.options._helper;

                        //Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
                        this.instance.currentItem.remove();
                        if (this.instance.placeholder) this.instance.placeholder.remove();

                        inst._trigger('fromSortable', event);
                        inst.dropped = false; //draggable revert needs that
                    }
                }
            });
        }
    });

    $.ui.plugin.add('draggable', 'cursor', {
        start(event, ui) {
            let t = $('body'),
                o = $(this).data('draggable').options;
            if (t.css('cursor')) o._cursor = t.css('cursor');
            t.css('cursor', o.cursor);
        },
        stop(event, ui) {
            const o = $(this).data('draggable').options;
            if (o._cursor) $('body').css('cursor', o._cursor);
        }
    });

    $.ui.plugin.add('draggable', 'opacity', {
        start(event, ui) {
            let t = $(ui.helper),
                o = $(this).data('draggable').options;
            if (t.css('opacity')) o._opacity = t.css('opacity');
            t.css('opacity', o.opacity);
        },
        stop(event, ui) {
            const o = $(this).data('draggable').options;
            if (o._opacity) $(ui.helper).css('opacity', o._opacity);
        }
    });

    $.ui.plugin.add('draggable', 'scroll', {
        start(event, ui) {
            const i = $(this).data('draggable');
            if (i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') i.overflowOffset = i.scrollParent.offset();
        },
        drag(event, ui) {
            let i = $(this).data('draggable'),
                o = i.options,
                scrolled = false;

            if (i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') {
                if (!o.axis || o.axis != 'x') {
                    if ((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) { i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed; } else if (event.pageY - i.overflowOffset.top < o.scrollSensitivity) { i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed; }
                }

                if (!o.axis || o.axis != 'y') {
                    if ((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) { i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed; } else if (event.pageX - i.overflowOffset.left < o.scrollSensitivity) { i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed; }
                }
            } else {
                if (!o.axis || o.axis != 'x') {
                    if (event.pageY - $(document).scrollTop() < o.scrollSensitivity) { scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed); } else if ($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) { scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed); }
                }

                if (!o.axis || o.axis != 'y') {
                    if (event.pageX - $(document).scrollLeft() < o.scrollSensitivity) { scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed); } else if ($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) { scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed); }
                }
            }

            if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) { $.ui.ddmanager.prepareOffsets(i, event); }
        }
    });

    $.ui.plugin.add('draggable', 'snap', {
        start(event, ui) {
            let i = $(this).data('draggable'),
                o = i.options;
            i.snapElements = [];

            $(o.snap.constructor != String ? (o.snap.items || ':data(draggable)') : o.snap).each(function() {
                const $t = $(this); const $o = $t.offset();
                if (this != i.element[0]) {
                    i.snapElements.push({
                        item: this,
                        width: $t.outerWidth(),
                        height: $t.outerHeight(),
                        top: $o.top,
                        left: $o.left
                    });
                }
            });
        },
        drag(event, ui) {
            let inst = $(this).data('draggable'),
                o = inst.options;
            const d = o.snapTolerance;

            let x1 = ui.offset.left,
                x2 = x1 + inst.helperProportions.width,
                y1 = ui.offset.top,
                y2 = y1 + inst.helperProportions.height;

            for (let i = inst.snapElements.length - 1; i >= 0; i--) {
                let l = inst.snapElements[i].left,
                    r = l + inst.snapElements[i].width,
                    t = inst.snapElements[i].top,
                    b = t + inst.snapElements[i].height;

                //Yes, I know, this is insane ;)
                if (!((l - d < x1 && x1 < r + d && t - d < y1 && y1 < b + d) || (l - d < x1 && x1 < r + d && t - d < y2 && y2 < b + d) || (l - d < x2 && x2 < r + d && t - d < y1 && y1 < b + d) || (l - d < x2 && x2 < r + d && t - d < y2 && y2 < b + d))) {
                    if (inst.snapElements[i].snapping) (inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
                    inst.snapElements[i].snapping = false;
                    continue;
                }

                if (o.snapMode != 'inner') {
                    var ts = Math.abs(t - y2) <= d;
                    var bs = Math.abs(b - y1) <= d;
                    var ls = Math.abs(l - x2) <= d;
                    var rs = Math.abs(r - x1) <= d;
                    if (ts) ui.position.top = inst._convertPositionTo('relative', { top: t - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
                    if (bs) ui.position.top = inst._convertPositionTo('relative', { top: b, left: 0 }).top - inst.margins.top;
                    if (ls) ui.position.left = inst._convertPositionTo('relative', { top: 0, left: l - inst.helperProportions.width }).left - inst.margins.left;
                    if (rs) ui.position.left = inst._convertPositionTo('relative', { top: 0, left: r }).left - inst.margins.left;
                }

                const first = (ts || bs || ls || rs);

                if (o.snapMode != 'outer') {
                    var ts = Math.abs(t - y1) <= d;
                    var bs = Math.abs(b - y2) <= d;
                    var ls = Math.abs(l - x1) <= d;
                    var rs = Math.abs(r - x2) <= d;
                    if (ts) ui.position.top = inst._convertPositionTo('relative', { top: t, left: 0 }).top - inst.margins.top;
                    if (bs) ui.position.top = inst._convertPositionTo('relative', { top: b - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
                    if (ls) ui.position.left = inst._convertPositionTo('relative', { top: 0, left: l }).left - inst.margins.left;
                    if (rs) ui.position.left = inst._convertPositionTo('relative', { top: 0, left: r - inst.helperProportions.width }).left - inst.margins.left;
                }

                if (!inst.snapElements[i].snapping && (ts || bs || ls || rs || first)) { (inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item }))); }
                inst.snapElements[i].snapping = (ts || bs || ls || rs || first);
            }
        }
    });

    $.ui.plugin.add('draggable', 'stack', {
        start(event, ui) {
            const o = $(this).data('draggable').options;

            const group = $.makeArray($(o.stack)).sort((a, b) => (parseInt($(a).css('zIndex'), 10) || 0) - (parseInt($(b).css('zIndex'), 10) || 0));
            if (!group.length) { return; }

            const min = parseInt(group[0].style.zIndex) || 0;
            $(group).each(function(i) {
                this.style.zIndex = min + i;
            });

            this[0].style.zIndex = min + group.length;
        }
    });

    $.ui.plugin.add('draggable', 'zIndex', {
        start(event, ui) {
            let t = $(ui.helper),
                o = $(this).data('draggable').options;
            if (t.css('zIndex')) o._zIndex = t.css('zIndex');
            t.css('zIndex', o.zIndex);
        },
        stop(event, ui) {
            const o = $(this).data('draggable').options;
            if (o._zIndex) $(ui.helper).css('zIndex', o._zIndex);
        }
    });
}(jQuery));

(function($, undefined) {
    $.widget('ui.droppable', {
        version: '1.9.2',
        widgetEventPrefix: 'drop',
        options: {
            accept: '*',
            activeClass: false,
            addClasses: true,
            greedy: false,
            hoverClass: false,
            scope: 'default',
            tolerance: 'intersect'
        },
        _create() {
            let o = this.options,
                accept = o.accept;
            this.isover = 0; this.isout = 1;

            this.accept = $.isFunction(accept) ? accept : function(d) {
                return d.is(accept);
            };

            //Store the droppable's proportions
            this.proportions = { width: this.element[0].offsetWidth, height: this.element[0].offsetHeight };

            // Add the reference and positions to the manager
            $.ui.ddmanager.droppables[o.scope] = $.ui.ddmanager.droppables[o.scope] || [];
            $.ui.ddmanager.droppables[o.scope].push(this);

            (o.addClasses && this.element.addClass('ui-droppable'));
        },

        _destroy() {
            const drop = $.ui.ddmanager.droppables[this.options.scope];
            for (let i = 0; i < drop.length; i++) {
                if (drop[i] == this) { drop.splice(i, 1); }
            }

            this.element.removeClass('ui-droppable ui-droppable-disabled');
        },

        _setOption(key, value) {
            if (key == 'accept') {
                this.accept = $.isFunction(value) ? value : function(d) {
                    return d.is(value);
                };
            }
            $.Widget.prototype._setOption.apply(this, arguments);
        },

        _activate(event) {
            const draggable = $.ui.ddmanager.current;
            if (this.options.activeClass) this.element.addClass(this.options.activeClass);
            (draggable && this._trigger('activate', event, this.ui(draggable)));
        },

        _deactivate(event) {
            const draggable = $.ui.ddmanager.current;
            if (this.options.activeClass) this.element.removeClass(this.options.activeClass);
            (draggable && this._trigger('deactivate', event, this.ui(draggable)));
        },

        _over(event) {
            const draggable = $.ui.ddmanager.current;
            if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return; // Bail if draggable and droppable are same element

            if (this.accept.call(this.element[0], (draggable.currentItem || draggable.element))) {
                if (this.options.hoverClass) this.element.addClass(this.options.hoverClass);
                this._trigger('over', event, this.ui(draggable));
            }
        },

        _out(event) {
            const draggable = $.ui.ddmanager.current;
            if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return; // Bail if draggable and droppable are same element

            if (this.accept.call(this.element[0], (draggable.currentItem || draggable.element))) {
                if (this.options.hoverClass) this.element.removeClass(this.options.hoverClass);
                this._trigger('out', event, this.ui(draggable));
            }
        },

        _drop(event, custom) {
            const draggable = custom || $.ui.ddmanager.current;
            if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return false; // Bail if draggable and droppable are same element

            let childrenIntersection = false;
            this.element.find(':data(droppable)').not('.ui-draggable-dragging').each(function() {
                const inst = $.data(this, 'droppable');
                if (
                    inst.options.greedy
				&& !inst.options.disabled
				&& inst.options.scope == draggable.options.scope
				&& inst.accept.call(inst.element[0], (draggable.currentItem || draggable.element))
				&& $.ui.intersect(draggable, $.extend(inst, { offset: inst.element.offset() }), inst.options.tolerance)
                ) { childrenIntersection = true; return false; }
            });
            if (childrenIntersection) return false;

            if (this.accept.call(this.element[0], (draggable.currentItem || draggable.element))) {
                if (this.options.activeClass) this.element.removeClass(this.options.activeClass);
                if (this.options.hoverClass) this.element.removeClass(this.options.hoverClass);
                this._trigger('drop', event, this.ui(draggable));
                return this.element;
            }

            return false;
        },

        ui(c) {
            return {
                draggable: (c.currentItem || c.element),
                helper: c.helper,
                position: c.position,
                offset: c.positionAbs
            };
        }

    });

    $.ui.intersect = function(draggable, droppable, toleranceMode) {
        if (!droppable.offset) return false;

        let x1 = (draggable.positionAbs || draggable.position.absolute).left,
            x2 = x1 + draggable.helperProportions.width,
            y1 = (draggable.positionAbs || draggable.position.absolute).top,
            y2 = y1 + draggable.helperProportions.height;
        let l = droppable.offset.left,
            r = l + droppable.proportions.width,
            t = droppable.offset.top,
            b = t + droppable.proportions.height;

        switch (toleranceMode) {
            case 'fit':
                return (l <= x1 && x2 <= r
				&& t <= y1 && y2 <= b);
                break;
            case 'intersect':
                return (l < x1 + (draggable.helperProportions.width / 2) // Right Half
				&& x2 - (draggable.helperProportions.width / 2) < r // Left Half
				&& t < y1 + (draggable.helperProportions.height / 2) // Bottom Half
				&& y2 - (draggable.helperProportions.height / 2) < b); // Top Half
                break;
            case 'pointer':
                var draggableLeft = ((draggable.positionAbs || draggable.position.absolute).left + (draggable.clickOffset || draggable.offset.click).left),
                    draggableTop = ((draggable.positionAbs || draggable.position.absolute).top + (draggable.clickOffset || draggable.offset.click).top),
                    isOver = $.ui.isOver(draggableTop, draggableLeft, t, l, droppable.proportions.height, droppable.proportions.width);
                return isOver;
                break;
            case 'touch':
                return (
                    (y1 >= t && y1 <= b) ||	// Top edge touching
					(y2 >= t && y2 <= b) ||	// Bottom edge touching
					(y1 < t && y2 > b)		// Surrounded vertically
                ) && (
                    (x1 >= l && x1 <= r) ||	// Left edge touching
					(x2 >= l && x2 <= r) ||	// Right edge touching
					(x1 < l && x2 > r)		// Surrounded horizontally
                );
                break;
            default:
                return false;
                break;
        }
    };

    /*
	This manager tracks offsets of draggables and droppables
*/
    $.ui.ddmanager = {
        current: null,
        droppables: { default: [] },
        prepareOffsets(t, event) {
            const m = $.ui.ddmanager.droppables[t.options.scope] || [];
            const type = event ? event.type : null; // workaround for #2317
            const list = (t.currentItem || t.element).find(':data(droppable)').andSelf();

            droppablesLoop: for (let i = 0; i < m.length; i++) {
                if (m[i].options.disabled || (t && !m[i].accept.call(m[i].element[0], (t.currentItem || t.element)))) continue;	//No disabled and non-accepted
                for (let j = 0; j < list.length; j++) { if (list[j] == m[i].element[0]) { m[i].proportions.height = 0; continue droppablesLoop; } } //Filter out elements in the current dragged item
                m[i].visible = m[i].element.css('display') != 'none'; if (!m[i].visible) continue; 									//If the element is not visible, continue

                if (type == 'mousedown') m[i]._activate.call(m[i], event); //Activate the droppable if used directly from draggables

                m[i].offset = m[i].element.offset();
                m[i].proportions = { width: m[i].element[0].offsetWidth, height: m[i].element[0].offsetHeight };
            }
        },
        drop(draggable, event) {
            let dropped = false;
            $.each($.ui.ddmanager.droppables[draggable.options.scope] || [], function() {
                if (!this.options) return;
                if (!this.options.disabled && this.visible && $.ui.intersect(draggable, this, this.options.tolerance)) { dropped = this._drop.call(this, event) || dropped; }

                if (!this.options.disabled && this.visible && this.accept.call(this.element[0], (draggable.currentItem || draggable.element))) {
                    this.isout = 1; this.isover = 0;
                    this._deactivate.call(this, event);
                }
            });
            return dropped;
        },
        dragStart(draggable, event) {
            //Listen for scrolling so that if the dragging causes scrolling the position of the droppables can be recalculated (see #5003)
            draggable.element.parentsUntil('body').bind('scroll.droppable', () => {
                if (!draggable.options.refreshPositions) $.ui.ddmanager.prepareOffsets(draggable, event);
            });
        },
        drag(draggable, event) {
            //If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
            if (draggable.options.refreshPositions) $.ui.ddmanager.prepareOffsets(draggable, event);

            //Run through all droppables and check their positions based on specific tolerance options
            $.each($.ui.ddmanager.droppables[draggable.options.scope] || [], function() {
                if (this.options.disabled || this.greedyChild || !this.visible) return;
                const intersects = $.ui.intersect(draggable, this, this.options.tolerance);

                const c = !intersects && this.isover == 1 ? 'isout' : (intersects && this.isover == 0 ? 'isover' : null);
                if (!c) return;

                let parentInstance;
                if (this.options.greedy) {
                    // find droppable parents with same scope
                    const scope = this.options.scope;
                    const parent = this.element.parents(':data(droppable)').filter(function() {
                        return $.data(this, 'droppable').options.scope === scope;
                    });

                    if (parent.length) {
                        parentInstance = $.data(parent[0], 'droppable');
                        parentInstance.greedyChild = (c == 'isover' ? 1 : 0);
                    }
                }

                // we just moved into a greedy child
                if (parentInstance && c == 'isover') {
                    parentInstance.isover = 0;
                    parentInstance.isout = 1;
                    parentInstance._out.call(parentInstance, event);
                }

                this[c] = 1; this[c == 'isout' ? 'isover' : 'isout'] = 0;
                this[c == 'isover' ? '_over' : '_out'].call(this, event);

                // we just moved out of a greedy child
                if (parentInstance && c == 'isout') {
                    parentInstance.isout = 0;
                    parentInstance.isover = 1;
                    parentInstance._over.call(parentInstance, event);
                }
            });
        },
        dragStop(draggable, event) {
            draggable.element.parentsUntil('body').unbind('scroll.droppable');
            //Call prepareOffsets one final time since IE does not fire return scroll events when overflow was caused by drag (see #5003)
            if (!draggable.options.refreshPositions) $.ui.ddmanager.prepareOffsets(draggable, event);
        }
    };
}(jQuery));

(jQuery.effects || (function($, undefined) {
    let backCompat = $.uiBackCompat !== false,
        // prefix used for storing data on .data()
        dataSpace = 'ui-effects-';

    $.effects = {
        effect: {}
    };

    /*!
 * jQuery Color Animations v2.0.0
 * http://jquery.com/
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Date: Mon Aug 13 13:41:02 2012 -0500
 */
    (function(jQuery, undefined) {
        let stepHooks = 'backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor'.split(' '),

            // plusequals test for += 100 -= 100
            rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
            // a set of RE's that can match strings and generate color tuples.
            stringParsers = [{
                re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                parse(execResult) {
                    return [
                        execResult[1],
                        execResult[2],
                        execResult[3],
                        execResult[4]
                    ];
                }
            }, {
                re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                parse(execResult) {
                    return [
                        execResult[1] * 2.55,
                        execResult[2] * 2.55,
                        execResult[3] * 2.55,
                        execResult[4]
                    ];
                }
            }, {
                // this regex ignores A-F because it's compared against an already lowercased string
                re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
                parse(execResult) {
                    return [
                        parseInt(execResult[1], 16),
                        parseInt(execResult[2], 16),
                        parseInt(execResult[3], 16)
                    ];
                }
            }, {
                // this regex ignores A-F because it's compared against an already lowercased string
                re: /#([a-f0-9])([a-f0-9])([a-f0-9])/,
                parse(execResult) {
                    return [
                        parseInt(execResult[1] + execResult[1], 16),
                        parseInt(execResult[2] + execResult[2], 16),
                        parseInt(execResult[3] + execResult[3], 16)
                    ];
                }
            }, {
                re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                space: 'hsla',
                parse(execResult) {
                    return [
                        execResult[1],
                        execResult[2] / 100,
                        execResult[3] / 100,
                        execResult[4]
                    ];
                }
            }],

            // jQuery.Color( )
            color = jQuery.Color = function(color, green, blue, alpha) {
                return new jQuery.Color.fn.parse(color, green, blue, alpha);
            },
            spaces = {
                rgba: {
                    props: {
                        red: {
                            idx: 0,
                            type: 'byte'
                        },
                        green: {
                            idx: 1,
                            type: 'byte'
                        },
                        blue: {
                            idx: 2,
                            type: 'byte'
                        }
                    }
                },

                hsla: {
                    props: {
                        hue: {
                            idx: 0,
                            type: 'degrees'
                        },
                        saturation: {
                            idx: 1,
                            type: 'percent'
                        },
                        lightness: {
                            idx: 2,
                            type: 'percent'
                        }
                    }
                }
            },
            propTypes = {
                byte: {
                    floor: true,
                    max: 255
                },
                percent: {
                    max: 1
                },
                degrees: {
                    mod: 360,
                    floor: true
                }
            },
            support = color.support = {},

            // element for support tests
            supportElem = jQuery('<p>')[0],

            // colors = jQuery.Color.names
            colors,

            // local aliases of functions called often
            each = jQuery.each;

        // determine rgba support immediately
        supportElem.style.cssText = 'background-color:rgba(1,1,1,.5)';
        support.rgba = supportElem.style.backgroundColor.indexOf('rgba') > -1;

        // define cache name and alpha properties
        // for rgba and hsla spaces
        each(spaces, (spaceName, space) => {
            space.cache = `_${spaceName}`;
            space.props.alpha = {
                idx: 3,
                type: 'percent',
                def: 1
            };
        });

        function clamp(value, prop, allowEmpty) {
            const type = propTypes[prop.type] || {};

            if (value == null) {
                return (allowEmpty || !prop.def) ? null : prop.def;
            }

            // ~~ is an short way of doing floor for positive numbers
            value = type.floor ? ~~value : parseFloat(value);

            // IE will pass in empty strings as value for alpha,
            // which will hit this case
            if (isNaN(value)) {
                return prop.def;
            }

            if (type.mod) {
                // we add mod before modding to make sure that negatives values
                // get converted properly: -10 -> 350
                return (value + type.mod) % type.mod;
            }

            // for now all property types without mod have min and max
            return value < 0 ? 0 : type.max < value ? type.max : value;
        }

        function stringParse(string) {
            let inst = color(),
                rgba = inst._rgba = [];

            string = string.toLowerCase();

            each(stringParsers, (i, parser) => {
                let parsed,
                    match = parser.re.exec(string),
                    values = match && parser.parse(match),
                    spaceName = parser.space || 'rgba';

                if (values) {
                    parsed = inst[spaceName](values);

                    // if this was an rgba parse the assignment might happen twice
                    // oh well....
                    inst[spaces[spaceName].cache] = parsed[spaces[spaceName].cache];
                    rgba = inst._rgba = parsed._rgba;

                    // exit each( stringParsers ) here because we matched
                    return false;
                }
            });

            // Found a stringParser that handled it
            if (rgba.length) {
                // if this came from a parsed string, force "transparent" when alpha is 0
                // chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
                if (rgba.join() === '0,0,0,0') {
                    jQuery.extend(rgba, colors.transparent);
                }
                return inst;
            }

            // named colors
            return colors[string];
        }

        color.fn = jQuery.extend(color.prototype, {
            parse(red, green, blue, alpha) {
                if (red === undefined) {
                    this._rgba = [ null, null, null, null ];
                    return this;
                }
                if (red.jquery || red.nodeType) {
                    red = jQuery(red).css(green);
                    green = undefined;
                }

                let inst = this,
                    type = jQuery.type(red),
                    rgba = this._rgba = [];

                // more than 1 argument specified - assume ( red, green, blue, alpha )
                if (green !== undefined) {
                    red = [ red, green, blue, alpha ];
                    type = 'array';
                }

                if (type === 'string') {
                    return this.parse(stringParse(red) || colors._default);
                }

                if (type === 'array') {
                    each(spaces.rgba.props, (key, prop) => {
                        rgba[prop.idx] = clamp(red[prop.idx], prop);
                    });
                    return this;
                }

                if (type === 'object') {
                    if (red instanceof color) {
                        each(spaces, (spaceName, space) => {
                            if (red[space.cache]) {
                                inst[space.cache] = red[space.cache].slice();
                            }
                        });
                    } else {
                        each(spaces, (spaceName, space) => {
                            const cache = space.cache;
                            each(space.props, (key, prop) => {
                                // if the cache doesn't exist, and we know how to convert
                                if (!inst[cache] && space.to) {
                                    // if the value was null, we don't need to copy it
                                    // if the key was alpha, we don't need to copy it either
                                    if (key === 'alpha' || red[key] == null) {
                                        return;
                                    }
                                    inst[cache] = space.to(inst._rgba);
                                }

                                // this is the only case where we allow nulls for ALL properties.
                                // call clamp with alwaysAllowEmpty
                                inst[cache][prop.idx] = clamp(red[key], prop, true);
                            });

                            // everything defined but alpha?
                            if (inst[cache] && $.inArray(null, inst[cache].slice(0, 3)) < 0) {
                                // use the default of 1
                                inst[cache][3] = 1;
                                if (space.from) {
                                    inst._rgba = space.from(inst[cache]);
                                }
                            }
                        });
                    }
                    return this;
                }
            },
            is(compare) {
                let is = color(compare),
                    same = true,
                    inst = this;

                each(spaces, (_, space) => {
                    let localCache,
                        isCache = is[space.cache];
                    if (isCache) {
                        localCache = inst[space.cache] || space.to && space.to(inst._rgba) || [];
                        each(space.props, (_, prop) => {
                            if (isCache[prop.idx] != null) {
                                same = (isCache[prop.idx] === localCache[prop.idx]);
                                return same;
                            }
                        });
                    }
                    return same;
                });
                return same;
            },
            _space() {
                let used = [],
                    inst = this;
                each(spaces, (spaceName, space) => {
                    if (inst[space.cache]) {
                        used.push(spaceName);
                    }
                });
                return used.pop();
            },
            transition(other, distance) {
                let end = color(other),
                    spaceName = end._space(),
                    space = spaces[spaceName],
                    startColor = this.alpha() === 0 ? color('transparent') : this,
                    start = startColor[space.cache] || space.to(startColor._rgba),
                    result = start.slice();

                end = end[space.cache];
                each(space.props, (key, prop) => {
                    let index = prop.idx,
                        startValue = start[index],
                        endValue = end[index],
                        type = propTypes[prop.type] || {};

                    // if null, don't override start value
                    if (endValue === null) {
                        return;
                    }
                    // if null - use end
                    if (startValue === null) {
                        result[index] = endValue;
                    } else {
                        if (type.mod) {
                            if (endValue - startValue > type.mod / 2) {
                                startValue += type.mod;
                            } else if (startValue - endValue > type.mod / 2) {
                                startValue -= type.mod;
                            }
                        }
                        result[index] = clamp((endValue - startValue) * distance + startValue, prop);
                    }
                });
                return this[spaceName](result);
            },
            blend(opaque) {
                // if we are already opaque - return ourself
                if (this._rgba[3] === 1) {
                    return this;
                }

                let rgb = this._rgba.slice(),
                    a = rgb.pop(),
                    blend = color(opaque)._rgba;

                return color(jQuery.map(rgb, (v, i) => (1 - a) * blend[i] + a * v));
            },
            toRgbaString() {
                let prefix = 'rgba(',
                    rgba = jQuery.map(this._rgba, (v, i) => (v == null ? (i > 2 ? 1 : 0) : v));

                if (rgba[3] === 1) {
                    rgba.pop();
                    prefix = 'rgb(';
                }

                return `${prefix + rgba.join()})`;
            },
            toHslaString() {
                let prefix = 'hsla(',
                    hsla = jQuery.map(this.hsla(), (v, i) => {
                        if (v == null) {
                            v = i > 2 ? 1 : 0;
                        }

                        // catch 1 and 2
                        if (i && i < 3) {
                            v = `${Math.round(v * 100)}%`;
                        }
                        return v;
                    });

                if (hsla[3] === 1) {
                    hsla.pop();
                    prefix = 'hsl(';
                }
                return `${prefix + hsla.join()})`;
            },
            toHexString(includeAlpha) {
                let rgba = this._rgba.slice(),
                    alpha = rgba.pop();

                if (includeAlpha) {
                    rgba.push(~~(alpha * 255));
                }

                return `#${jQuery.map(rgba, v => {
                    // default to 0 when nulls exist
                    v = (v || 0).toString(16);
                    return v.length === 1 ? `0${ v}` : v;
                }).join('')}`;
            },
            toString() {
                return this._rgba[3] === 0 ? 'transparent' : this.toRgbaString();
            }
        });
        color.fn.parse.prototype = color.fn;

        // hsla conversions adapted from:
        // https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021

        function hue2rgb(p, q, h) {
            h = (h + 1) % 1;
            if (h * 6 < 1) {
                return p + (q - p) * h * 6;
            }
            if (h * 2 < 1) {
                return q;
            }
            if (h * 3 < 2) {
                return p + (q - p) * ((2 / 3) - h) * 6;
            }
            return p;
        }

        spaces.hsla.to = function(rgba) {
            if (rgba[0] == null || rgba[1] == null || rgba[2] == null) {
                return [ null, null, null, rgba[3] ];
            }
            let r = rgba[0] / 255,
                g = rgba[1] / 255,
                b = rgba[2] / 255,
                a = rgba[3],
                max = Math.max(r, g, b),
                min = Math.min(r, g, b),
                diff = max - min,
                add = max + min,
                l = add * 0.5,
                h,
                s;

            if (min === max) {
                h = 0;
            } else if (r === max) {
                h = (60 * (g - b) / diff) + 360;
            } else if (g === max) {
                h = (60 * (b - r) / diff) + 120;
            } else {
                h = (60 * (r - g) / diff) + 240;
            }

            if (l === 0 || l === 1) {
                s = l;
            } else if (l <= 0.5) {
                s = diff / add;
            } else {
                s = diff / (2 - add);
            }
            return [ Math.round(h) % 360, s, l, a == null ? 1 : a ];
        };

        spaces.hsla.from = function(hsla) {
            if (hsla[0] == null || hsla[1] == null || hsla[2] == null) {
                return [ null, null, null, hsla[3] ];
            }
            let h = hsla[0] / 360,
                s = hsla[1],
                l = hsla[2],
                a = hsla[3],
                q = l <= 0.5 ? l * (1 + s) : l + s - l * s,
                p = 2 * l - q;

            return [
                Math.round(hue2rgb(p, q, h + (1 / 3)) * 255),
                Math.round(hue2rgb(p, q, h) * 255),
                Math.round(hue2rgb(p, q, h - (1 / 3)) * 255),
                a
            ];
        };


        each(spaces, (spaceName, space) => {
            let props = space.props,
                cache = space.cache,
                to = space.to,
                from = space.from;

            // makes rgba() and hsla()
            color.fn[spaceName] = function(value) {
                // generate a cache for this space if it doesn't exist
                if (to && !this[cache]) {
                    this[cache] = to(this._rgba);
                }
                if (value === undefined) {
                    return this[cache].slice();
                }

                let ret,
                    type = jQuery.type(value),
                    arr = (type === 'array' || type === 'object') ? value : arguments,
                    local = this[cache].slice();

                each(props, (key, prop) => {
                    let val = arr[type === 'object' ? key : prop.idx];
                    if (val == null) {
                        val = local[prop.idx];
                    }
                    local[prop.idx] = clamp(val, prop);
                });

                if (from) {
                    ret = color(from(local));
                    ret[cache] = local;
                    return ret;
                }
                return color(local);
            };

            // makes red() green() blue() alpha() hue() saturation() lightness()
            each(props, (key, prop) => {
                // alpha is included in more than one space
                if (color.fn[key]) {
                    return;
                }
                color.fn[key] = function(value) {
                    let vtype = jQuery.type(value),
                        fn = (key === 'alpha' ? (this._hsla ? 'hsla' : 'rgba') : spaceName),
                        local = this[fn](),
                        cur = local[prop.idx],
                        match;

                    if (vtype === 'undefined') {
                        return cur;
                    }

                    if (vtype === 'function') {
                        value = value.call(this, cur);
                        vtype = jQuery.type(value);
                    }
                    if (value == null && prop.empty) {
                        return this;
                    }
                    if (vtype === 'string') {
                        match = rplusequals.exec(value);
                        if (match) {
                            value = cur + parseFloat(match[2]) * (match[1] === '+' ? 1 : -1);
                        }
                    }
                    local[prop.idx] = value;
                    return this[fn](local);
                };
            });
        });

        // add .fx.step functions
        each(stepHooks, (i, hook) => {
            jQuery.cssHooks[hook] = {
                set(elem, value) {
                    let parsed,
                        curElem,
                        backgroundColor = '';

                    if (jQuery.type(value) !== 'string' || (parsed = stringParse(value))) {
                        value = color(parsed || value);
                        if (!support.rgba && value._rgba[3] !== 1) {
                            curElem = hook === 'backgroundColor' ? elem.parentNode : elem;
                            while (
                                (backgroundColor === '' || backgroundColor === 'transparent') &&
						curElem && curElem.style
                            ) {
                                try {
                                    backgroundColor = jQuery.css(curElem, 'backgroundColor');
                                    curElem = curElem.parentNode;
                                } catch (e) {
                                }
                            }

                            value = value.blend(backgroundColor && backgroundColor !== 'transparent' ?
                                backgroundColor :
                                '_default');
                        }

                        value = value.toRgbaString();
                    }
                    try {
                        elem.style[hook] = value;
                    } catch (error) {
                        // wrapped to prevent IE from throwing errors on "invalid" values like 'auto' or 'inherit'
                    }
                }
            };
            jQuery.fx.step[hook] = function(fx) {
                if (!fx.colorInit) {
                    fx.start = color(fx.elem, hook);
                    fx.end = color(fx.end);
                    fx.colorInit = true;
                }
                jQuery.cssHooks[hook].set(fx.elem, fx.start.transition(fx.end, fx.pos));
            };
        });

        jQuery.cssHooks.borderColor = {
            expand(value) {
                const expanded = {};

                each([ 'Top', 'Right', 'Bottom', 'Left' ], (i, part) => {
                    expanded[`border${ part}Color`] = value;
                });
                return expanded;
            }
        };

        // Basic color names only.
        // Usage of any of the other color names requires adding yourself or including
        // jquery.color.svg-names.js.
        colors = jQuery.Color.names = {
            // 4.1. Basic color keywords
            aqua: '#00ffff',
            black: '#000000',
            blue: '#0000ff',
            fuchsia: '#ff00ff',
            gray: '#808080',
            green: '#008000',
            lime: '#00ff00',
            maroon: '#800000',
            navy: '#000080',
            olive: '#808000',
            purple: '#800080',
            red: '#ff0000',
            silver: '#c0c0c0',
            teal: '#008080',
            white: '#ffffff',
            yellow: '#ffff00',

            // 4.2.3. "transparent" color keyword
            transparent: [ null, null, null, 0 ],

            _default: '#ffffff'
        };
    }(jQuery));


    /******************************************************************************/
    /****************************** CLASS ANIMATIONS ******************************/
    /******************************************************************************/
    (function() {
        let classAnimationActions = [ 'add', 'remove', 'toggle' ],
            shorthandStyles = {
                border: 1,
                borderBottom: 1,
                borderColor: 1,
                borderLeft: 1,
                borderRight: 1,
                borderTop: 1,
                borderWidth: 1,
                margin: 1,
                padding: 1
            };

        $.each([ 'borderLeftStyle', 'borderRightStyle', 'borderBottomStyle', 'borderTopStyle' ], (_, prop) => {
            $.fx.step[prop] = function(fx) {
                if (fx.end !== 'none' && !fx.setAttr || fx.pos === 1 && !fx.setAttr) {
                    jQuery.style(fx.elem, prop, fx.end);
                    fx.setAttr = true;
                }
            };
        });

        function getElementStyles() {
            let style = this.ownerDocument.defaultView ?
                    this.ownerDocument.defaultView.getComputedStyle(this, null) :
                    this.currentStyle,
                newStyle = {},
                key,
                len;

            // webkit enumerates style porperties
            if (style && style.length && style[0] && style[style[0]]) {
                len = style.length;
                while (len--) {
                    key = style[len];
                    if (typeof style[key] === 'string') {
                        newStyle[$.camelCase(key)] = style[key];
                    }
                }
            } else {
                for (key in style) {
                    if (typeof style[key] === 'string') {
                        newStyle[key] = style[key];
                    }
                }
            }

            return newStyle;
        }


        function styleDifference(oldStyle, newStyle) {
            let diff = {},
                name,
                value;

            for (name in newStyle) {
                value = newStyle[name];
                if (oldStyle[name] !== value) {
                    if (!shorthandStyles[name]) {
                        if ($.fx.step[name] || !isNaN(parseFloat(value))) {
                            diff[name] = value;
                        }
                    }
                }
            }

            return diff;
        }

        $.effects.animateClass = function(value, duration, easing, callback) {
            const o = $.speed(duration, easing, callback);

            return this.queue(function() {
                let animated = $(this),
                    baseClass = animated.attr('class') || '',
                    applyClassChange,
                    allAnimations = o.children ? animated.find('*').andSelf() : animated;

                // map the animated objects to store the original styles.
                allAnimations = allAnimations.map(function() {
                    const el = $(this);
                    return {
                        el,
                        start: getElementStyles.call(this)
                    };
                });

                // apply class change
                applyClassChange = function() {
                    $.each(classAnimationActions, (i, action) => {
                        if (value[action]) {
                            animated[`${action}Class`](value[action]);
                        }
                    });
                };
                applyClassChange();

                // map all animated objects again - calculate new styles and diff
                allAnimations = allAnimations.map(function() {
                    this.end = getElementStyles.call(this.el[0]);
                    this.diff = styleDifference(this.start, this.end);
                    return this;
                });

                // apply original class
                animated.attr('class', baseClass);

                // map all animated objects again - this time collecting a promise
                allAnimations = allAnimations.map(function() {
                    let styleInfo = this,
                        dfd = $.Deferred(),
                        opts = jQuery.extend({}, o, {
                            queue: false,
                            complete() {
                                dfd.resolve(styleInfo);
                            }
                        });

                    this.el.animate(this.diff, opts);
                    return dfd.promise();
                });

                // once all animations have completed:
                $.when.apply($, allAnimations.get()).done(function() {
                    // set the final class
                    applyClassChange();

                    // for each animated element,
                    // clear all css properties that were animated
                    $.each(arguments, function() {
                        const el = this.el;
                        $.each(this.diff, key => {
                            el.css(key, '');
                        });
                    });

                    // this is guarnteed to be there if you use jQuery.speed()
                    // it also handles dequeuing the next anim...
                    o.complete.call(animated[0]);
                });
            });
        };

        $.fn.extend({
            _addClass: $.fn.addClass,
            addClass(classNames, speed, easing, callback) {
                return speed ?
                    $.effects.animateClass.call(this,
                        { add: classNames }, speed, easing, callback) :
                    this._addClass(classNames);
            },

            _removeClass: $.fn.removeClass,
            removeClass(classNames, speed, easing, callback) {
                return speed ?
                    $.effects.animateClass.call(this,
                        { remove: classNames }, speed, easing, callback) :
                    this._removeClass(classNames);
            },

            _toggleClass: $.fn.toggleClass,
            toggleClass(classNames, force, speed, easing, callback) {
                if (typeof force === 'boolean' || force === undefined) {
                    if (!speed) {
                        // without speed parameter
                        return this._toggleClass(classNames, force);
                    }
                    return $.effects.animateClass.call(this,
                        (force ? { add: classNames } : { remove: classNames }),
                        speed, easing, callback);
                }
                // without force parameter
                return $.effects.animateClass.call(this,
                    { toggle: classNames }, force, speed, easing);
            },

            switchClass(remove, add, speed, easing, callback) {
                return $.effects.animateClass.call(this, {
                    add,
                    remove
                }, speed, easing, callback);
            }
        });
    }());

    /******************************************************************************/
    /*********************************** EFFECTS **********************************/
    /******************************************************************************/

    (function() {
        $.extend($.effects, {
            version: '1.9.2',

            // Saves a set of properties in a data storage
            save(element, set) {
                for (let i = 0; i < set.length; i++) {
                    if (set[i] !== null) {
                        element.data(dataSpace + set[i], element[0].style[set[i]]);
                    }
                }
            },

            // Restores a set of previously saved properties from a data storage
            restore(element, set) {
                let val,
                    i;
                for (i = 0; i < set.length; i++) {
                    if (set[i] !== null) {
                        val = element.data(dataSpace + set[i]);
                        // support: jQuery 1.6.2
                        // http://bugs.jquery.com/ticket/9917
                        // jQuery 1.6.2 incorrectly returns undefined for any falsy value.
                        // We can't differentiate between "" and 0 here, so we just assume
                        // empty string since it's likely to be a more common value...
                        if (val === undefined) {
                            val = '';
                        }
                        element.css(set[i], val);
                    }
                }
            },

            setMode(el, mode) {
                if (mode === 'toggle') {
                    mode = el.is(':hidden') ? 'show' : 'hide';
                }
                return mode;
            },

            // Translates a [top,left] array into a baseline value
            // this should be a little more flexible in the future to handle a string & hash
            getBaseline(origin, original) {
                let y,
                    x;
                switch (origin[0]) {
                    case 'top': y = 0; break;
                    case 'middle': y = 0.5; break;
                    case 'bottom': y = 1; break;
                    default: y = origin[0] / original.height;
                }
                switch (origin[1]) {
                    case 'left': x = 0; break;
                    case 'center': x = 0.5; break;
                    case 'right': x = 1; break;
                    default: x = origin[1] / original.width;
                }
                return {
                    x,
                    y
                };
            },

            // Wraps the element around a wrapper that copies position properties
            createWrapper(element) {
                // if the element is already wrapped, return it
                if (element.parent().is('.ui-effects-wrapper')) {
                    return element.parent();
                }

                // wrap the element
                let props = {
                        width: element.outerWidth(true),
                        height: element.outerHeight(true),
                        float: element.css('float')
                    },
                    wrapper = $('<div></div>')
                        .addClass('ui-effects-wrapper')
                        .css({
                            fontSize: '100%',
                            background: 'transparent',
                            border: 'none',
                            margin: 0,
                            padding: 0
                        }),
                    // Store the size in case width/height are defined in % - Fixes #5245
                    size = {
                        width: element.width(),
                        height: element.height()
                    },
                    active = document.activeElement;

                // support: Firefox
                // Firefox incorrectly exposes anonymous content
                // https://bugzilla.mozilla.org/show_bug.cgi?id=561664
                try {
                    active.id;
                } catch (e) {
                    active = document.body;
                }

                element.wrap(wrapper);

                // Fixes #7595 - Elements lose focus when wrapped.
                if (element[0] === active || $.contains(element[0], active)) {
                    $(active).focus();
                }

                wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually lose the reference to the wrapped element

                // transfer positioning properties to the wrapper
                if (element.css('position') === 'static') {
                    wrapper.css({ position: 'relative' });
                    element.css({ position: 'relative' });
                } else {
                    $.extend(props, {
                        position: element.css('position'),
                        zIndex: element.css('z-index')
                    });
                    $.each([ 'top', 'left', 'bottom', 'right' ], (i, pos) => {
                        props[pos] = element.css(pos);
                        if (isNaN(parseInt(props[pos], 10))) {
                            props[pos] = 'auto';
                        }
                    });
                    element.css({
                        position: 'relative',
                        top: 0,
                        left: 0,
                        right: 'auto',
                        bottom: 'auto'
                    });
                }
                element.css(size);

                return wrapper.css(props).show();
            },

            removeWrapper(element) {
                const active = document.activeElement;

                if (element.parent().is('.ui-effects-wrapper')) {
                    element.parent().replaceWith(element);

                    // Fixes #7595 - Elements lose focus when wrapped.
                    if (element[0] === active || $.contains(element[0], active)) {
                        $(active).focus();
                    }
                }


                return element;
            },

            setTransition(element, list, factor, value) {
                value = value || {};
                $.each(list, (i, x) => {
                    const unit = element.cssUnit(x);
                    if (unit[0] > 0) {
                        value[x] = unit[0] * factor + unit[1];
                    }
                });
                return value;
            }
        });

        // return an effect options object for the given parameters:
        function _normalizeArguments(effect, options, speed, callback) {
            // allow passing all options as the first parameter
            if ($.isPlainObject(effect)) {
                options = effect;
                effect = effect.effect;
            }

            // convert to an object
            effect = { effect };

            // catch (effect, null, ...)
            if (options == null) {
                options = {};
            }

            // catch (effect, callback)
            if ($.isFunction(options)) {
                callback = options;
                speed = null;
                options = {};
            }

            // catch (effect, speed, ?)
            if (typeof options === 'number' || $.fx.speeds[options]) {
                callback = speed;
                speed = options;
                options = {};
            }

            // catch (effect, options, callback)
            if ($.isFunction(speed)) {
                callback = speed;
                speed = null;
            }

            // add options to effect
            if (options) {
                $.extend(effect, options);
            }

            speed = speed || options.duration;
            effect.duration = $.fx.off ? 0 :
                typeof speed === 'number' ? speed :
                    speed in $.fx.speeds ? $.fx.speeds[speed] :
                        $.fx.speeds._default;

            effect.complete = callback || options.complete;

            return effect;
        }

        function standardSpeed(speed) {
            // valid standard speeds
            if (!speed || typeof speed === 'number' || $.fx.speeds[speed]) {
                return true;
            }

            // invalid strings - treat as "normal" speed
            if (typeof speed === 'string' && !$.effects.effect[speed]) {
                // TODO: remove in 2.0 (#7115)
                if (backCompat && $.effects[speed]) {
                    return false;
                }
                return true;
            }

            return false;
        }

        $.fn.extend({
            effect(/* effect, options, speed, callback */) {
                let args = _normalizeArguments.apply(this, arguments),
                    mode = args.mode,
                    queue = args.queue,
                    effectMethod = $.effects.effect[args.effect],

                    // DEPRECATED: remove in 2.0 (#7115)
                    oldEffectMethod = !effectMethod && backCompat && $.effects[args.effect];

                if ($.fx.off || !(effectMethod || oldEffectMethod)) {
                    // delegate to the original method (e.g., .show()) if possible
                    if (mode) {
                        return this[mode](args.duration, args.complete);
                    }
                    return this.each(function() {
                        if (args.complete) {
                            args.complete.call(this);
                        }
                    });
                }

                function run(next) {
                    let elem = $(this),
                        complete = args.complete,
                        mode = args.mode;

                    function done() {
                        if ($.isFunction(complete)) {
                            complete.call(elem[0]);
                        }
                        if ($.isFunction(next)) {
                            next();
                        }
                    }

                    // if the element is hiddden and mode is hide,
                    // or element is visible and mode is show
                    if (elem.is(':hidden') ? mode === 'hide' : mode === 'show') {
                        done();
                    } else {
                        effectMethod.call(elem[0], args, done);
                    }
                }

                // TODO: remove this check in 2.0, effectMethod will always be true
                if (effectMethod) {
                    return queue === false ? this.each(run) : this.queue(queue || 'fx', run);
                }
                // DEPRECATED: remove in 2.0 (#7115)
                return oldEffectMethod.call(this, {
                    options: args,
                    duration: args.duration,
                    callback: args.complete,
                    mode: args.mode
                });
            },

            _show: $.fn.show,
            show(speed) {
                if (standardSpeed(speed)) {
                    return this._show.apply(this, arguments);
                }
                const args = _normalizeArguments.apply(this, arguments);
                args.mode = 'show';
                return this.effect.call(this, args);
            },

            _hide: $.fn.hide,
            hide(speed) {
                if (standardSpeed(speed)) {
                    return this._hide.apply(this, arguments);
                }
                const args = _normalizeArguments.apply(this, arguments);
                args.mode = 'hide';
                return this.effect.call(this, args);
            },

            // jQuery core overloads toggle and creates _toggle
            __toggle: $.fn.toggle,
            toggle(speed) {
                if (standardSpeed(speed) || typeof speed === 'boolean' || $.isFunction(speed)) {
                    return this.__toggle.apply(this, arguments);
                }
                const args = _normalizeArguments.apply(this, arguments);
                args.mode = 'toggle';
                return this.effect.call(this, args);
            },

            // helper functions
            cssUnit(key) {
                let style = this.css(key),
                    val = [];

                $.each([ 'em', 'px', '%', 'pt' ], (i, unit) => {
                    if (style.indexOf(unit) > 0) {
                        val = [ parseFloat(style), unit ];
                    }
                });
                return val;
            }
        });
    }());

    /******************************************************************************/
    /*********************************** EASING ***********************************/
    /******************************************************************************/

    (function() {
        // based on easing equations from Robert Penner (http://www.robertpenner.com/easing)

        const baseEasings = {};

        $.each([ 'Quad', 'Cubic', 'Quart', 'Quint', 'Expo' ], (i, name) => {
            baseEasings[name] = function(p) {
                return Math.pow(p, i + 2);
            };
        });

        $.extend(baseEasings, {
            Sine(p) {
                return 1 - Math.cos(p * Math.PI / 2);
            },
            Circ(p) {
                return 1 - Math.sqrt(1 - p * p);
            },
            Elastic(p) {
                return p === 0 || p === 1 ? p :
                    -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
            },
            Back(p) {
                return p * p * (3 * p - 2);
            },
            Bounce(p) {
                let pow2,
                    bounce = 4;

                while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
                return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);
            }
        });

        $.each(baseEasings, (name, easeIn) => {
            $.easing[`easeIn${name}`] = easeIn;
            $.easing[`easeOut${name}`] = function(p) {
                return 1 - easeIn(1 - p);
            };
            $.easing[`easeInOut${name}`] = function(p) {
                return p < 0.5 ?
                    easeIn(p * 2) / 2 :
                    1 - easeIn(p * -2 + 2) / 2;
            };
        });
    }());
}(jQuery)));

(function($, undefined) {
    $.effects.effect.fade = function(o, done) {
        let el = $(this),
            mode = $.effects.setMode(el, o.mode || 'toggle');

        el.animate({
            opacity: mode
        }, {
            queue: false,
            duration: o.duration,
            easing: o.easing,
            complete: done
        });
    };
}(jQuery));

(function($, undefined) {
    $.effects.effect.slide = function(o, done) {
        // Create element
        let el = $(this),
            props = [ 'position', 'top', 'bottom', 'left', 'right', 'width', 'height' ],
            mode = $.effects.setMode(el, o.mode || 'show'),
            show = mode === 'show',
            direction = o.direction || 'left',
            ref = (direction === 'up' || direction === 'down') ? 'top' : 'left',
            positiveMotion = (direction === 'up' || direction === 'left'),
            distance,
            animation = {};

        // Adjust
        $.effects.save(el, props);
        el.show();
        distance = o.distance || el[ref === 'top' ? 'outerHeight' : 'outerWidth'](true);

        $.effects.createWrapper(el).css({
            overflow: 'hidden'
        });

        if (show) {
            el.css(ref, positiveMotion ? (isNaN(distance) ? `-${distance}` : -distance) : distance);
        }

        // Animation
        animation[ref] = (show ?
            (positiveMotion ? '+=' : '-=') :
            (positiveMotion ? '-=' : '+=')) +
		distance;

        // Animate
        el.animate(animation, {
            queue: false,
            duration: o.duration,
            easing: o.easing,
            complete() {
                if (mode === 'hide') {
                    el.hide();
                }
                $.effects.restore(el, props);
                $.effects.removeWrapper(el);
                done();
            }
        });
    };
}(jQuery));

(function($, undefined) {
    $.ui = $.ui || {};

    let cachedScrollbarWidth,
        max = Math.max,
        abs = Math.abs,
        round = Math.round,
        rhorizontal = /left|center|right/,
        rvertical = /top|center|bottom/,
        roffset = /[\+\-]\d+%?/,
        rposition = /^\w+/,
        rpercent = /%$/,
        _position = $.fn.position;

    function getOffsets(offsets, width, height) {
        return [
            parseInt(offsets[0], 10) * (rpercent.test(offsets[0]) ? width / 100 : 1),
            parseInt(offsets[1], 10) * (rpercent.test(offsets[1]) ? height / 100 : 1)
        ];
    }
    function parseCss(element, property) {
        return parseInt($.css(element, property), 10) || 0;
    }

    $.position = {
        scrollbarWidth() {
            if (cachedScrollbarWidth !== undefined) {
                return cachedScrollbarWidth;
            }
            let w1,
                w2,
                div = $("<div style='display:block;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),
                innerDiv = div.children()[0];

            $('body').append(div);
            w1 = innerDiv.offsetWidth;
            div.css('overflow', 'scroll');

            w2 = innerDiv.offsetWidth;

            if (w1 === w2) {
                w2 = div[0].clientWidth;
            }

            div.remove();

            return (cachedScrollbarWidth = w1 - w2);
        },
        getScrollInfo(within) {
            let overflowX = within.isWindow ? '' : within.element.css('overflow-x'),
                overflowY = within.isWindow ? '' : within.element.css('overflow-y'),
                hasOverflowX = overflowX === 'scroll' ||
				(overflowX === 'auto' && within.width < within.element[0].scrollWidth),
                hasOverflowY = overflowY === 'scroll' ||
				(overflowY === 'auto' && within.height < within.element[0].scrollHeight);
            return {
                width: hasOverflowX ? $.position.scrollbarWidth() : 0,
                height: hasOverflowY ? $.position.scrollbarWidth() : 0
            };
        },
        getWithinInfo(element) {
            let withinElement = $(element || window),
                isWindow = $.isWindow(withinElement[0]);
            return {
                element: withinElement,
                isWindow,
                offset: withinElement.offset() || { left: 0, top: 0 },
                scrollLeft: withinElement.scrollLeft(),
                scrollTop: withinElement.scrollTop(),
                width: isWindow ? withinElement.width() : withinElement.outerWidth(),
                height: isWindow ? withinElement.height() : withinElement.outerHeight()
            };
        }
    };

    $.fn.position = function(options) {
        if (!options || !options.of) {
            return _position.apply(this, arguments);
        }

        // make a copy, we don't want to modify arguments
        options = $.extend({}, options);

        let atOffset,
            targetWidth,
            targetHeight,
            targetOffset,
            basePosition,
            target = $(options.of),
            within = $.position.getWithinInfo(options.within),
            scrollInfo = $.position.getScrollInfo(within),
            targetElem = target[0],
            collision = (options.collision || 'flip').split(' '),
            offsets = {};

        if (targetElem.nodeType === 9) {
            targetWidth = target.width();
            targetHeight = target.height();
            targetOffset = { top: 0, left: 0 };
        } else if ($.isWindow(targetElem)) {
            targetWidth = target.width();
            targetHeight = target.height();
            targetOffset = { top: target.scrollTop(), left: target.scrollLeft() };
        } else if (targetElem.preventDefault) {
            // force left top to allow flipping
            options.at = 'left top';
            targetWidth = targetHeight = 0;
            targetOffset = { top: targetElem.pageY, left: targetElem.pageX };
        } else {
            targetWidth = target.outerWidth();
            targetHeight = target.outerHeight();
            targetOffset = target.offset();
        }
        // clone to reuse original targetOffset later
        basePosition = $.extend({}, targetOffset);

        // force my and at to have valid horizontal and vertical positions
        // if a value is missing or invalid, it will be converted to center
        $.each([ 'my', 'at' ], function() {
            let pos = (options[this] || '').split(' '),
                horizontalOffset,
                verticalOffset;

            if (pos.length === 1) {
                pos = rhorizontal.test(pos[0]) ?
                    pos.concat([ 'center' ]) :
                    rvertical.test(pos[0]) ?
                        [ 'center' ].concat(pos) :
                        [ 'center', 'center' ];
            }
            pos[0] = rhorizontal.test(pos[0]) ? pos[0] : 'center';
            pos[1] = rvertical.test(pos[1]) ? pos[1] : 'center';

            // calculate offsets
            horizontalOffset = roffset.exec(pos[0]);
            verticalOffset = roffset.exec(pos[1]);
            offsets[this] = [
                horizontalOffset ? horizontalOffset[0] : 0,
                verticalOffset ? verticalOffset[0] : 0
            ];

            // reduce to just the positions without the offsets
            options[this] = [
                rposition.exec(pos[0])[0],
                rposition.exec(pos[1])[0]
            ];
        });

        // normalize collision option
        if (collision.length === 1) {
            collision[1] = collision[0];
        }

        if (options.at[0] === 'right') {
            basePosition.left += targetWidth;
        } else if (options.at[0] === 'center') {
            basePosition.left += targetWidth / 2;
        }

        if (options.at[1] === 'bottom') {
            basePosition.top += targetHeight;
        } else if (options.at[1] === 'center') {
            basePosition.top += targetHeight / 2;
        }

        atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
        basePosition.left += atOffset[0];
        basePosition.top += atOffset[1];

        return this.each(function() {
            let collisionPosition,
                using,
                elem = $(this),
                elemWidth = elem.outerWidth(),
                elemHeight = elem.outerHeight(),
                marginLeft = parseCss(this, 'marginLeft'),
                marginTop = parseCss(this, 'marginTop'),
                collisionWidth = elemWidth + marginLeft + parseCss(this, 'marginRight') + scrollInfo.width,
                collisionHeight = elemHeight + marginTop + parseCss(this, 'marginBottom') + scrollInfo.height,
                position = $.extend({}, basePosition),
                myOffset = getOffsets(offsets.my, elem.outerWidth(), elem.outerHeight());

            if (options.my[0] === 'right') {
                position.left -= elemWidth;
            } else if (options.my[0] === 'center') {
                position.left -= elemWidth / 2;
            }

            if (options.my[1] === 'bottom') {
                position.top -= elemHeight;
            } else if (options.my[1] === 'center') {
                position.top -= elemHeight / 2;
            }

            position.left += myOffset[0];
            position.top += myOffset[1];

            // if the browser doesn't support fractions, then round for consistent results
            if (!$.support.offsetFractions) {
                position.left = round(position.left);
                position.top = round(position.top);
            }

            collisionPosition = {
                marginLeft,
                marginTop
            };

            $.each([ 'left', 'top' ], (i, dir) => {
                if ($.ui.position[collision[i]]) {
                    $.ui.position[collision[i]][dir](position, {
                        targetWidth,
                        targetHeight,
                        elemWidth,
                        elemHeight,
                        collisionPosition,
                        collisionWidth,
                        collisionHeight,
                        offset: [ atOffset[0] + myOffset[0], atOffset[1] + myOffset[1] ],
                        my: options.my,
                        at: options.at,
                        within,
                        elem
                    });
                }
            });

            if ($.fn.bgiframe) {
                elem.bgiframe();
            }

            if (options.using) {
                // adds feedback as second argument to using callback, if present
                using = function(props) {
                    let left = targetOffset.left - position.left,
                        right = left + targetWidth - elemWidth,
                        top = targetOffset.top - position.top,
                        bottom = top + targetHeight - elemHeight,
                        feedback = {
                            target: {
                                element: target,
                                left: targetOffset.left,
                                top: targetOffset.top,
                                width: targetWidth,
                                height: targetHeight
                            },
                            element: {
                                element: elem,
                                left: position.left,
                                top: position.top,
                                width: elemWidth,
                                height: elemHeight
                            },
                            horizontal: right < 0 ? 'left' : left > 0 ? 'right' : 'center',
                            vertical: bottom < 0 ? 'top' : top > 0 ? 'bottom' : 'middle'
                        };
                    if (targetWidth < elemWidth && abs(left + right) < targetWidth) {
                        feedback.horizontal = 'center';
                    }
                    if (targetHeight < elemHeight && abs(top + bottom) < targetHeight) {
                        feedback.vertical = 'middle';
                    }
                    if (max(abs(left), abs(right)) > max(abs(top), abs(bottom))) {
                        feedback.important = 'horizontal';
                    } else {
                        feedback.important = 'vertical';
                    }
                    options.using.call(this, props, feedback);
                };
            }

            elem.offset($.extend(position, { using }));
        });
    };

    $.ui.position = {
        fit: {
            left(position, data) {
                let within = data.within,
                    withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
                    outerWidth = within.width,
                    collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                    overLeft = withinOffset - collisionPosLeft,
                    overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
                    newOverRight;

                // element is wider than within
                if (data.collisionWidth > outerWidth) {
                    // element is initially over the left side of within
                    if (overLeft > 0 && overRight <= 0) {
                        newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
                        position.left += overLeft - newOverRight;
                        // element is initially over right side of within
                    } else if (overRight > 0 && overLeft <= 0) {
                        position.left = withinOffset;
                        // element is initially over both left and right sides of within
                    } else if (overLeft > overRight) {
                        position.left = withinOffset + outerWidth - data.collisionWidth;
                    } else {
                        position.left = withinOffset;
                    }
                    // too far left -> align with left edge
                } else if (overLeft > 0) {
                    position.left += overLeft;
                    // too far right -> align with right edge
                } else if (overRight > 0) {
                    position.left -= overRight;
                    // adjust based on position and margin
                } else {
                    position.left = max(position.left - collisionPosLeft, position.left);
                }
            },
            top(position, data) {
                let within = data.within,
                    withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
                    outerHeight = data.within.height,
                    collisionPosTop = position.top - data.collisionPosition.marginTop,
                    overTop = withinOffset - collisionPosTop,
                    overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
                    newOverBottom;

                // element is taller than within
                if (data.collisionHeight > outerHeight) {
                    // element is initially over the top of within
                    if (overTop > 0 && overBottom <= 0) {
                        newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
                        position.top += overTop - newOverBottom;
                        // element is initially over bottom of within
                    } else if (overBottom > 0 && overTop <= 0) {
                        position.top = withinOffset;
                        // element is initially over both top and bottom of within
                    } else if (overTop > overBottom) {
                        position.top = withinOffset + outerHeight - data.collisionHeight;
                    } else {
                        position.top = withinOffset;
                    }
                    // too far up -> align with top
                } else if (overTop > 0) {
                    position.top += overTop;
                    // too far down -> align with bottom edge
                } else if (overBottom > 0) {
                    position.top -= overBottom;
                    // adjust based on position and margin
                } else {
                    position.top = max(position.top - collisionPosTop, position.top);
                }
            }
        },
        flip: {
            left(position, data) {
                let within = data.within,
                    withinOffset = within.offset.left + within.scrollLeft,
                    outerWidth = within.width,
                    offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
                    collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                    overLeft = collisionPosLeft - offsetLeft,
                    overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
                    myOffset = data.my[0] === 'left' ?
                        -data.elemWidth :
                        data.my[0] === 'right' ?
                            data.elemWidth :
                            0,
                    atOffset = data.at[0] === 'left' ?
                        data.targetWidth :
                        data.at[0] === 'right' ?
                            -data.targetWidth :
                            0,
                    offset = -2 * data.offset[0],
                    newOverRight,
                    newOverLeft;

                if (overLeft < 0) {
                    newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
                    if (newOverRight < 0 || newOverRight < abs(overLeft)) {
                        position.left += myOffset + atOffset + offset;
                    }
                } else if (overRight > 0) {
                    newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
                    if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
                        position.left += myOffset + atOffset + offset;
                    }
                }
            },
            top(position, data) {
                let within = data.within,
                    withinOffset = within.offset.top + within.scrollTop,
                    outerHeight = within.height,
                    offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
                    collisionPosTop = position.top - data.collisionPosition.marginTop,
                    overTop = collisionPosTop - offsetTop,
                    overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
                    top = data.my[1] === 'top',
                    myOffset = top ?
                        -data.elemHeight :
                        data.my[1] === 'bottom' ?
                            data.elemHeight :
                            0,
                    atOffset = data.at[1] === 'top' ?
                        data.targetHeight :
                        data.at[1] === 'bottom' ?
                            -data.targetHeight :
                            0,
                    offset = -2 * data.offset[1],
                    newOverTop,
                    newOverBottom;
                if (overTop < 0) {
                    newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
                    if ((position.top + myOffset + atOffset + offset) > overTop && (newOverBottom < 0 || newOverBottom < abs(overTop))) {
                        position.top += myOffset + atOffset + offset;
                    }
                } else if (overBottom > 0) {
                    newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
                    if ((position.top + myOffset + atOffset + offset) > overBottom && (newOverTop > 0 || abs(newOverTop) < overBottom)) {
                        position.top += myOffset + atOffset + offset;
                    }
                }
            }
        },
        flipfit: {
            left() {
                $.ui.position.flip.left.apply(this, arguments);
                $.ui.position.fit.left.apply(this, arguments);
            },
            top() {
                $.ui.position.flip.top.apply(this, arguments);
                $.ui.position.fit.top.apply(this, arguments);
            }
        }
    };

    // fraction support test
    (function() {
        let testElement,
            testElementParent,
            testElementStyle,
            offsetLeft,
            i,
            body = document.getElementsByTagName('body')[0],
            div = document.createElement('div');

        //Create a "fake body" for testing based on method used in jQuery.support
        testElement = document.createElement(body ? 'div' : 'body');
        testElementStyle = {
            visibility: 'hidden',
            width: 0,
            height: 0,
            border: 0,
            margin: 0,
            background: 'none'
        };
        if (body) {
            $.extend(testElementStyle, {
                position: 'absolute',
                left: '-1000px',
                top: '-1000px'
            });
        }
        for (i in testElementStyle) {
            testElement.style[i] = testElementStyle[i];
        }
        testElement.appendChild(div);
        testElementParent = body || document.documentElement;
        testElementParent.insertBefore(testElement, testElementParent.firstChild);

        div.style.cssText = 'position: absolute; left: 10.7432222px;';

        offsetLeft = $(div).offset().left;
        $.support.offsetFractions = offsetLeft > 10 && offsetLeft < 11;

        testElement.innerHTML = '';
        testElementParent.removeChild(testElement);
    }());

    // DEPRECATED
    if ($.uiBackCompat !== false) {
        // offset option
        (function($) {
            const _position = $.fn.position;
            $.fn.position = function(options) {
                if (!options || !options.offset) {
                    return _position.call(this, options);
                }
                let offset = options.offset.split(' '),
                    at = options.at.split(' ');
                if (offset.length === 1) {
                    offset[1] = offset[0];
                }
                if (/^\d/.test(offset[0])) {
                    offset[0] = `+${offset[0]}`;
                }
                if (/^\d/.test(offset[1])) {
                    offset[1] = `+${offset[1]}`;
                }
                if (at.length === 1) {
                    if (/left|center|right/.test(at[0])) {
                        at[1] = 'center';
                    } else {
                        at[1] = at[0];
                        at[0] = 'center';
                    }
                }
                return _position.call(this, $.extend(options, {
                    at: `${at[0] + offset[0]} ${at[1]}${offset[1]}`,
                    offset: undefined
                }));
            };
        }(jQuery));
    }
}(jQuery));
