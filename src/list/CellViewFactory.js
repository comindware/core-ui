/**
 * Developer: Grigory Kuznetsov
 * Date: 23.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { objectPropertyTypes } from '../Meta';
import { helpers } from 'utils';
import { Handlebars } from 'lib';

let factory = {
    getCellViewByDataType: function(type) {
        var result;

        switch (type) {
        case objectPropertyTypes.STRING:
            result = factory.getTextCellView();
            break;
        case objectPropertyTypes.INSTANCE:
            result = factory.getReferenceCellView();
            break;
        case objectPropertyTypes.ACCOUNT:
            result = factory.getUserCellView();
            break;
        case objectPropertyTypes.ENUM:
            result = factory.getEnumCellView();
            break;
        case objectPropertyTypes.INTEGER:
        case objectPropertyTypes.DOUBLE:
        case objectPropertyTypes.DECIMAL:
            result = factory.getNumberCellView();
            break;
        case objectPropertyTypes.DURATION:
            result = factory.getDurationCellView();
            break;
        case objectPropertyTypes.BOOLEAN:
            result = factory.getBooleanCellView();
            break;
        case objectPropertyTypes.DATETIME:
            result = factory.getDateTimeCellView();
            break;
        case objectPropertyTypes.DOCUMENT:
            result = factory.getDocumentCellView();
            break;
        default:
            helpers.throwNotSupportedError('Data type' + type + 'is not supported');
            break;
        }

        return result;
    },

    getTextCellView: function () {
        return factory.__getSimpleView('{{highlightFragment value highlightedFragment}}');
    },

    getReferenceCellView: function () {
        return factory.__getSimpleView('{{#if value}}{{#if value.name}}{{highlightFragment value.name highlightedFragment}}{{/if}}{{/if}}');
    },

    getUserCellView: function () {
        return factory.__getAccountView();
    },

    getEnumCellView: function () {
        return factory.__getEnumView();
    },

    getNumberCellView: function () {
        return factory.__getSimpleView('{{value}}');
    },

    getDurationCellView: function () {
        return factory.__getSimpleView('{{renderShortDuration value}}');
    },

    getBooleanCellView: function () {
        return factory.__getSimpleView(
            '{{#if value}}<svg class="svg-icons svg-icons_flag-yes"><use xlink:href="#icon-checked"></use></svg>{{/if}}' +
            '{{#unless value}}<svg class="svg-icons svg-icons_flag-none"><use xlink:href="#icon-remove"></use></svg>{{/unless}}');
    },

    getDateTimeCellView: function () {
        return factory.__getSimpleView('{{#if value}}{{renderFullDate value}}{{/if}}');
    },

    getDocumentCellView: function () {
        return factory.__getDocumentView();
    },

    __getSimpleView: function (template, templateHelpers) {
        return Marionette.ItemView.extend({
            template: Handlebars.compile(template),
            modelEvents: {
                'change:highlightedFragment': '__handleHighlightedFragmentChange'
            },
            __handleHighlightedFragmentChange: function () {
                this.render();
            },
            className: 'grid-cell',
            templateHelpers: templateHelpers
        });
    },

    __getAccountView: function () {
        return Marionette.ItemView.extend({
            template: Handlebars.compile('{{text}}'),
            templateHelpers: function () {
                var value = this.model.get('value');
                var text = '';
                if (value && value.length > 0) {
                    text = _.chain(value).
                        map(function (item) {
                            return {
                                id: item.id,
                                text: item.columns[0]
                            };
                        }).
                        sortBy(function (member) {
                            return member.text;
                        }).
                        reduce(function (memo, member) {
                            if (memo) {
                                return memo + ', ' + member.text;
                            } else {
                                return member.text;
                            }
                        }, null).
                        value();
                }
                else if (value && value.name) {
                    text = value.name;
                }

                return {
                    text: text
                };
            },
            modelEvents: {
                'change:highlightedFragment': '__handleHighlightedFragmentChange'
            },
            __handleHighlightedFragmentChange: function () {
                this.render();
            },
            className: 'grid-cell'
        });
    },

    __getDocumentView: function () {
        return Marionette.ItemView.extend({
            template: Handlebars.compile('{{#each documents}}<a href="{{url}}">{{text}}</a>{{#unless @last}}, {{/unless}}{{/each}}'),

            templateHelpers: function () {
                var value = this.model.get('value');
                var documents = [];
                if (value && value.length > 0) {
                    documents = _.chain(value).
                        map(function (item) {
                            return {
                                id: item.id,
                                text: item.columns[0],
                                url: item.columns[1]
                            };
                        }).
                        sortBy(function (document) {
                            return document.text;
                        }).
                        value();
                }

                return {
                    documents: documents
                };
            },
            modelEvents: {
                'change:highlightedFragment': '__handleHighlightedFragmentChange'
            },
            __handleHighlightedFragmentChange: function () {
                this.render();
            },
            className: 'grid-cell'
        });
    },

    __getEnumView: function() {
        return Marionette.ItemView.extend({
            template: Handlebars.compile("{{#if value}}{{valueExplained}}{{/if}}"),
            modelEvents: {
                'change:highlightedFragment': '__handleHighlightedFragmentChange'
            },
            __handleHighlightedFragmentChange: function () {
                this.render();
            },
            templateHelpers: function () {
                var value = this.model.get("value");
                return {
                    value: value,
                    valueExplained: value.valueExplained
                };
            },
            className: 'grid-cell'
        });
    }
};
export default factory;
