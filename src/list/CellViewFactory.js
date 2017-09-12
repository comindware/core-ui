/**
 * Developer: Grigory Kuznetsov
 * Date: 23.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { objectPropertyTypes } from '../Meta';
import { helpers } from 'utils';
import { Handlebars } from 'lib';

const factory = {
    getCellViewByDataType(type) {
        let result;

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
                helpers.throwNotSupportedError(`Data type${type}is not supported`);
                break;
        }

        return result;
    },

    getTextCellView() {
        return factory.__getSimpleView('{{highlightFragment value highlightedFragment}}');
    },

    getReferenceCellView() {
        return factory.__getSimpleView('{{#if value}}{{#if value.name}}{{highlightFragment value.name highlightedFragment}}{{/if}}{{/if}}');
    },

    getUserCellView() {
        return factory.__getAccountView();
    },

    getEnumCellView() {
        return factory.__getEnumView();
    },

    getNumberCellView() {
        return factory.__getSimpleView('{{value}}');
    },

    getDurationCellView() {
        return factory.__getSimpleView('{{renderShortDuration value}}');
    },

    getBooleanCellView() {
        const templateHelpers = {
            showIcon() {
                return _.isBoolean(this.value);
            }
        };
        
        return factory.__getSimpleView(
            '{{#if showIcon}}' +
                '{{#if value}}<svg class="svg-grid-icons svg-icons_flag-yes"><use xlink:href="#icon-checked"></use></svg>{{/if}}' +
                '{{#unless value}}<svg class="svg-grid-icons svg-icons_flag-none"><use xlink:href="#icon-remove"></use></svg>{{/unless}}' +
            '{{/if}}', templateHelpers);
    },

    getDateTimeCellView() {
        return factory.__getSimpleView('{{#if value}}{{renderFullDate value}}{{/if}}');
    },

    getDocumentCellView() {
        return factory.__getDocumentView();
    },

    __getSimpleView(template, templateHelpers) {
        return Marionette.ItemView.extend({
            template: Handlebars.compile(template),
            modelEvents: {
                'change:highlightedFragment': '__handleHighlightedFragmentChange'
            },
            __handleHighlightedFragmentChange() {
                this.render();
            },
            className: 'grid-cell',
            templateHelpers
        });
    },

    __getAccountView() {
        return Marionette.ItemView.extend({
            template: Handlebars.compile('{{text}}'),
            templateHelpers() {
                const value = this.model.get('value');
                let text = '';
                if (value && value.length > 0) {
                    text = _.chain(value)
                        .map(item => ({
                            id: item.id,
                            text: item.text || item.name || (item.columns && item.columns[0])
                        }))
                        .sortBy(member => member.text)
                        .reduce((memo, member) => {
                            if (memo) {
                                return `${memo}, ${member.text}`;
                            }
                            return member.text;
                        }, null)
                        .value();
                } else if (value && value.name) {
                    text = value.name;
                }

                return {
                    text
                };
            },
            modelEvents: {
                'change:highlightedFragment': '__handleHighlightedFragmentChange'
            },
            __handleHighlightedFragmentChange() {
                this.render();
            },
            className: 'grid-cell'
        });
    },

    __getDocumentView() {
        return Marionette.ItemView.extend({
            template: Handlebars.compile('{{#each documents}}<a href="{{url}}">{{text}}</a>{{#unless @last}}, {{/unless}}{{/each}}'),

            templateHelpers() {
                const value = this.model.get('value');
                let documents = [];
                if (value && value.length > 0) {
                    documents = _.chain(value)
                        .map(item => ({
                            id: item.id,
                            text: item.text || item.name || (item.columns && item.columns[0]),
                            url: item.url || (item.columns && item.columns[1])
                        }))
                        .sortBy(document => document.text)
                        .value();
                }

                return {
                    documents
                };
            },
            modelEvents: {
                'change:highlightedFragment': '__handleHighlightedFragmentChange'
            },
            __handleHighlightedFragmentChange() {
                this.render();
            },
            className: 'grid-cell'
        });
    },

    __getEnumView() {
        return Marionette.ItemView.extend({
            template: Handlebars.compile('{{#if value}}{{valueExplained}}{{/if}}'),
            modelEvents: {
                'change:highlightedFragment': '__handleHighlightedFragmentChange'
            },
            __handleHighlightedFragmentChange() {
                this.render();
            },
            templateHelpers() {
                const value = this.model.get('value');
                return {
                    value,
                    valueExplained: value.valueExplained
                };
            },
            className: 'grid-cell'
        });
    }
};
export default factory;
