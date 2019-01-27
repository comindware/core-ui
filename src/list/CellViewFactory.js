//@flow
import { objectPropertyTypes, contextIconType } from '../Meta';
import { dateHelpers } from 'utils';
import EditableGridFieldView from './views/EditableGridFieldView';
import SimplifiedFieldView from '../form/fields/SimplifiedFieldView';
import DateTimeService from '../form/editors/services/DateTimeService';
import getIconPrefixer from '../utils/handlebars/getIconPrefixer';

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

    getCellHtml(column: Column, model: Backbone.Model) {
        const value = model.get(column.key);

        if (value === null || value === undefined) {
            return `<div class="cell ${column.columnClass}"></div>`;
        }
        let adjustedValue = value;

        switch (column.dataType || column.type) {
            case objectPropertyTypes.STRING:
                adjustedValue = this.__adjustValue(value);
                return `<div class="cell ${column.columnClass}" title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue}</div>`;
            case objectPropertyTypes.EXTENDED_STRING:
                return this.__createContextString(model, value, column);
            case objectPropertyTypes.INSTANCE:
                if (Array.isArray(value)) {
                    adjustedValue = value.map(v => v && v.name).join(', ');
                } else if (value && value.name) {
                    adjustedValue = value.name;
                }
                return `<div class="cell ${column.columnClass}" title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue || ''}</div>`;
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
                    return `<div class="cell ${column.columnClass}" title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue}</div>`;
                } else if (value.name) {
                    return `<div class="cell ${column.columnClass}" title="${this.__getTitle(column, model, value.name)}">${value.name}</div>`;
                }
            case objectPropertyTypes.ENUM:
                adjustedValue = value ? value.valueExplained : '';
                return `<div class="cell ${column.columnClass}" title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue}</div>`;
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
                    })
                    .join(', ');
                return `<div class="cell cell-right ${column.columnClass}" title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue}</div>`;
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
                        let totalMilliseconds = moment.duration(value).asMilliseconds();

                        if (options.allowDays) {
                            result += `${Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24)) + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.DAYS')} `;
                            totalMilliseconds %= 1000 * 60 * 60 * 24;
                        }
                        if (options.allowHours) {
                            result += `${Math.floor(totalMilliseconds / (1000 * 60 * 60)) + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.HOURS')} `;
                            totalMilliseconds %= 1000 * 60 * 60;
                        }
                        if (options.allowMinutes) {
                            result += `${Math.floor(totalMilliseconds / (1000 * 60)) + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.MINUTES')} `;
                            totalMilliseconds %= 1000 * 60;
                        }
                        if (options.allowSeconds) {
                            result += `${Math.floor(totalMilliseconds / 1000) + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.SECONDS')} `;
                            totalMilliseconds %= 1000;
                        }
                        return result;
                    })
                    .join(', ')
                    .trim();

                return `<div class="cell ${column.columnClass}" title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue}</div>`;
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
                    })
                    .join(', ');
                return `<div class="cell ${column.columnClass}" title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue}</div>`;
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
                return `<div class="cell ${column.columnClass}" title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue || ''}</div>`;
        }
    },

    __createContextString(model, value, column) {
        const adjustedValue = this.__adjustValue(value);
        const type = contextIconType[model.get('type').toLocaleLowerCase()];
        const getIcon = getIconPrefixer(type);
        return `
            <div class="js-extend_cell_content extend_cell_content ${column.columnClass}" title="${this.__getTitle(column, model, adjustedValue)}">
            <i class="${getIcon(type)} context-icon" aria-hidden="true"></i>
            <div class="extend_cell_text">
                <span class="extend_cell_header">${adjustedValue}</span>
                <span class="extend_info">${model.get('alias') || ''}</span>
            </div>
            </div>`;
    },

    __adjustValue(value: Array<string | number> | string) {
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        return value;
    },

    __getTitle(column, model, adjustedValue) {
        let title;
        if (column.format === 'HTML') {
            title = '';
        } else if (column.titleAttribute) {
            title = model.get(column.titleAttribute);
        } else {
            title = adjustedValue;
        }
        title = title !== null && title !== undefined ? title.toString().replace(/"/g, '&quot;') : '';
        return title;
    }
});
