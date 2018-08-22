//@flow
import { objectPropertyTypes } from '../Meta';
import { dateHelpers } from 'utils';
import EditableGridFieldView from './views/EditableGridFieldView';
import SimplifiedFieldView from '../form/fields/SimplifiedFieldView';
import DateTimeService from '../form/editors/services/DateTimeService';

let factory;

type CellExtention = {
    templateContext(): Object
};

type Column = { key: string, columnClass: string, editable: boolean, type: string, dataType: string, format: string }; //todo wtf datatype

export default (factory = {
    getCellViewForColumn(column: Column, model: Backbone.Model) {
        if (column.editable) {
            return column.simplified ? SimplifiedFieldView : EditableGridFieldView;
        }

        return factory.getCellHtml(column, model);
    },

    getCellViewByDataType(type: string) {
        //Used by Product server Grid
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
                result = factory.getHtmlCellView();
                break;
        }

        return result;
    },

    getTextCellView() {
        const extention = {
            templateContext() {
                return {
                    value: this.model.get(this.options.key)
                };
            }
        };
        return factory.__getSimpleView('{{highlightFragment value highlightedFragment}}', extention);
    },

    getReferenceCellView() {
        const extention = {
            templateContext() {
                return {
                    value: this.model.get(this.options.key)
                };
            }
        };
        return factory.__getSimpleView('{{#if value}}{{#if value.name}}{{highlightFragment value.name highlightedFragment}}{{/if}}{{/if}}', extention);
    },

    getUserCellView() {
        return factory.__getAccountView();
    },

    getEnumCellView() {
        return factory.__getEnumView();
    },

    getNumberCellView() {
        const extention = {
            templateContext() {
                return {
                    value: this.model.get(this.options.key)
                };
            }
        };
        return factory.__getSimpleView('{{value}}', extention);
    },

    getDurationCellView() {
        const extention = {
            templateContext() {
                return {
                    value: this.model.get(this.options.key)
                };
            }
        };
        return factory.__getSimpleView('{{renderShortDuration value}}', extention);
    },

    getBooleanCellView() {
        const extention = {
            templateContext() {
                const value = this.model.get(this.options.key);
                return {
                    value,
                    showIcon: _.isBoolean(value)
                };
            }
        };

        return factory.__getSimpleView(
            '{{#if showIcon}}' +
            '{{#if value}}<svg class="svg-grid-icons svg-icons_flag-yes"><use xlink:href="#icon-checked"></use></svg>{{/if}}' +
            '{{#unless value}}<svg class="svg-grid-icons svg-icons_flag-none"><use xlink:href="#icon-remove"></use></svg>{{/unless}}' +
            '{{/if}}',
            extention
        );
    },

    getDateTimeCellView() {
        const extention = {
            templateContext() {
                return {
                    value: this.model.get(this.options.key)
                };
            }
        };
        return factory.__getSimpleView('{{#if value}}{{renderFullDateTime value}}{{/if}}', extention);
    },

    getDocumentCellView() {
        return factory.__getDocumentView();
    },

    __getSimpleView(simpleTemplate: string, extention: CellExtention) {
        return Marionette.View.extend({
            template: Handlebars.compile(simpleTemplate),
            modelEvents: {
                'change:highlightedFragment': '__handleHighlightedFragmentChange',
                highlighted: '__handleHighlightedFragmentChange',
                unhighlighted: '__handleHighlightedFragmentChange'
            },
            __handleHighlightedFragmentChange() {
                this.render();
            },
            className: 'grid-cell',
            templateContext: extention.templateContext
        });
    },

    __getAccountView() {
        return Marionette.View.extend({
            template: Handlebars.compile('{{text}}'),
            templateContext() {
                const value = this.model.get(this.options.key);
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
        return Marionette.View.extend({
            template: Handlebars.compile('{{#each documents}}<a href="{{url}}" target="_blank">{{text}}</a>{{#unless @last}}, {{/unless}}{{/each}}'),

            templateContext() {
                const value = this.model.get(this.options.key);
                let documents = [];
                if (value && value.length > 0) {
                    documents = value
                        .map(item => ({
                            id: item.id,
                            text: item.text || item.name || (item.columns && item.columns[0]),
                            url: item.url || (item.columns && item.columns[1])
                        }))
                        .sort((a, b) => a.text > b.text);
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
        return Marionette.View.extend({
            template: Handlebars.compile('{{#if value}}{{valueExplained}}{{/if}}'),
            modelEvents: {
                'change:highlightedFragment': '__handleHighlightedFragmentChange'
            },
            __handleHighlightedFragmentChange() {
                this.render();
            },
            templateContext() {
                const value = this.model.get(this.options.key);
                return {
                    value,
                    valueExplained: value.valueExplained
                };
            },
            className: 'grid-cell'
        });
    },

    getHtmlCellView() {
        const extention = {
            templateContext() {
                return {
                    value: this.model.get(this.options.key)
                };
            }
        };
        return this.__getSimpleView('{{{value}}}', extention);
    },

    getCellHtml(column: Column, model: Backbone.Model) {
        const value = model.get(column.key);

        if (value === null || value === undefined) {
            return `<div class="cell ${column.columnClass}"></div>`;
        }
        let adjustedValue = value;

        switch (column.dataType || column.type) {
            case objectPropertyTypes.STRING:
                adjustedValue = this.__adjustValue(value);
                return `<div class="cell ${column.columnClass}" title="${column.format === 'HTML' ? '' : adjustedValue}">${adjustedValue}</div>`;
            case objectPropertyTypes.EXTENDED_STRING:
                adjustedValue = this.__adjustValue(value);
                return `
                        <div class="js-extend_cell_content extend_cell_content ${column.columnClass}" title="${adjustedValue}">
                        <div class="context-icon context-icon-type_${model.get('type').toLocaleLowerCase()}"></div>
                        <div class="extend_cell_text">
                            <span class="extend_cell_header">${adjustedValue}</span>
                            <span class="extend_info">${model.get('alias') || ''}</span>
                        </div>
                        </div>`;
            case objectPropertyTypes.INSTANCE:
                if (Array.isArray(value)) {
                    adjustedValue = value.map(v => v && v.name).join(', ');
                } else if (value && value.name) {
                    adjustedValue = value.name;
                }
                return `<div class="cell ${column.columnClass}" title="${adjustedValue || ''}">${adjustedValue || ''}</div>`;
            case objectPropertyTypes.ACCOUNT:
                if (value.length > 0) {
                    adjustedValue = value
                        .map(item => ({
                            id: item.id,
                            text: item.text || item.name || (item.columns && item.columns[0])
                        }))
                        .sort((a, b) => a.text > b.text)
                        .reduce((memo, member) => {
                            if (memo) {
                                return `${memo}, ${member.text}`;
                            }
                            return member.text;
                        }, null);
                    return `<div class="cell ${column.columnClass}" title="${adjustedValue} || ''">${adjustedValue}</div>`;
                } else if (value.name) {
                    return `<div class="cell ${column.columnClass}" title="${value.name}">${value.name}</div>`;
                }
            case objectPropertyTypes.ENUM:
                adjustedValue = value ? value.valueExplained : '';
                return `<div class="cell ${column.columnClass}" title="${adjustedValue}">${adjustedValue}</div>`;
            case objectPropertyTypes.INTEGER:
            case objectPropertyTypes.DOUBLE:
            case objectPropertyTypes.DECIMAL:
                adjustedValue = Array.isArray(value) ? value : [value];
                adjustedValue = adjustedValue
                    .map(v => {
                        if (!v) {
                            return '';
                        }
                        if (column.formatOptions) {
                            if (column.formatOptions.intlOptions) {
                                return new Intl.NumberFormat(Localizer.langCode, column.formatOptions.intlOptions).format(value);
                            } else if (column.formatOptions.allowFloat === false) {
                                return Math.floor(v);
                            }
                        }
                        return value;
                    }).join(', ');
                return `<div class="cell cell-right ${column.columnClass}" title="${adjustedValue}">${adjustedValue}</div>`;
            case objectPropertyTypes.DURATION: {
                adjustedValue = Array.isArray(value) ? value : [value];
                adjustedValue = adjustedValue
                    .map(v => {
                        const defaultOptions = {
                            allowDays: true,
                            allowHours: true,
                            allowMinutes: true,
                            allowSeconds: true
                        };
                        const options = Object.assign(defaultOptions, _.pick(column.formatOptions || {}, Object.keys(defaultOptions)));
                        let result = '';
                        if (value === 0) {
                            return '0';
                        }
                        if (!value) {
                            return '';
                        }

                        const duration = dateHelpers.durationISOToObject(value);
                        if (options.allowDays) {
                            result += `${duration.days + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.DAYS')} `;
                        }
                        if (options.allowHours) {
                            result += `${duration.hours + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.HOURS')} `;
                        }
                        if (options.allowMinutes) {
                            result += `${duration.minutes + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.MINUTES')} `;
                        }
                        if (options.allowSeconds) {
                            result += `${duration.seconds + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.SECONDS')} `;
                        }
                        return result;
                    })
                    .join(', ')
                    .trim();

                return `<div class="cell ${column.columnClass}" title="${adjustedValue}">${adjustedValue}</div>`;
            }
            case objectPropertyTypes.BOOLEAN:
                adjustedValue = Array.isArray(value) ? value : [value || ''];
                adjustedValue = adjustedValue
                    .map(v => {
                        let result = '';
                        if (v === true) {
                            result = '<svg class="svg-grid-icons svg-icons_flag-yes"><use xlink:href="#icon-checked"></use></svg>';
                        } else if (v === false) {
                            result = '<svg class="svg-grid-icons svg-icons_flag-none"><use xlink:href="#icon-remove"></use></svg>';
                        }
                        return result;
                    })
                    .join(', ');
                return `<div class="cell ${column.columnClass}">${adjustedValue}</div>`;
            case objectPropertyTypes.DATETIME:
                adjustedValue = Array.isArray(value) ? value : [value];
                adjustedValue = adjustedValue
                    .map(v => {
                        if (column.formatOptions) {
                            const dateDisplayValue = column.formatOptions.dateDisplayFormat ? DateTimeService.getDateDisplayValue(v, column.formatOptions.dateDisplayFormat) : '';
                            const timeDisplayValue = column.formatOptions.timeDisplayFormat ? DateTimeService.getTimeDisplayValue(v, column.formatOptions.timeDisplayFormat) : '';
                            return `${dateDisplayValue} ${timeDisplayValue}`;
                        }
                        return dateHelpers.dateToDateTimeString(v, 'generalDateShortTime');
                    }).join(', ');
                return `<div class="cell ${column.columnClass}" title="${adjustedValue}">${adjustedValue}</div>`;
            case objectPropertyTypes.DOCUMENT:
                if (value.length > 0) {
                    return `<div class="cell ${column.columnClass}">${value
                        .map(item => {
                            const text = item.text || item.name || (item.columns && item.columns[0]);
                            const url = item.url || (item.columns && item.columns[1]);
                            return `<a href="${url}" target="_blank" title="${text}">${text}</a>`;
                        })
                        .sort((a, b) => a.text > b.text)
                        .join(', ')}</div>`;
                }
            default:
                adjustedValue = this.__adjustValue(value);
                return `<div class="cell ${column.columnClass}">${adjustedValue || ''}</div>`;
        }
    },

    __adjustValue(value: Array<string | number> | string) {
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        return value;
    }
});
