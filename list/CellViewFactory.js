/**
 * Developer: Grigory Kuznetsov
 * Date: 23.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
        'core/Meta',
        'core/utils/utilsApi',
        'core/collections/VirtualCollection',
        './views/ListView', './views/ScrollbarView', './views/EmptyListView', './views/EmptyGridView', './EventAggregator', './views/GridView', './views/GridColumnHeaderView'
    ],
    function (
        meta,
        utils,
        VirtualCollection,
        ListView, ScrollbarView, EmptyListView, EmptyGridView, EventAggregator, GridView, GridColumnHeaderView
    ) {
        'use strict';

        var factory = {
            getCellViewByDataType: function(type) {
                var result;

                switch (type) {
                case meta.objectPropertyTypes.STRING:
                    result = factory.getTextCellView();
                    break;
                case meta.objectPropertyTypes.INSTANCE:
                    result = factory.getReferenceCellView();
                    break;
                case meta.objectPropertyTypes.ACCOUNT:
                    result = factory.getUserCellView();
                    break;
                case meta.objectPropertyTypes.ENUM:
                    result = factory.getEnumCellView();
                    break;
                case meta.objectPropertyTypes.INTEGER:
                case meta.objectPropertyTypes.DOUBLE:
                case meta.objectPropertyTypes.DECIMAL:
                    result = factory.getNumberCellView();
                    break;
                case meta.objectPropertyTypes.DURATION:
                    result = factory.getDurationCellView();
                    break;
                case meta.objectPropertyTypes.BOOLEAN:
                    result = factory.getBooleanCellView();
                    break;
                case meta.objectPropertyTypes.DATETIME:
                    result = factory.getDateTimeCellView();
                    break;
                case meta.objectPropertyTypes.DOCUMENT:
                    result = factory.getDocumentCellView();
                    break;
                default:
                    utils.helpers.throwNotSupportedError('Data type' + type + 'is not supported');
                    break;
                }

                return result;
            },

            getTextCellView: function () {
                return factory.__getSimpleView('{{{highlightFragment value highlightedFragment}}}');
            },

            getReferenceCellView: function () {
                return factory.__getSimpleView('{{#if value}}{{#if value.name}}{{{highlightFragment value.name highlightedFragment}}}{{/if}}{{/if}}');
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
                    "{{#if value}}{{localize 'PROCESS.FORMDESIGNER.COMPONENTS.BOOLEAN.YES'}}{{/if}}" +
                    "{{#unless value}}{{localize 'PROCESS.FORMDESIGNER.COMPONENTS.BOOLEAN.NO'}}{{/unless}}");
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
        return factory;
    });
