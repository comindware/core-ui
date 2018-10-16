//@flow
import { objectPropertyTypes, contextIconType } from '../Meta';
import { dateHelpers } from 'utils';
import EditableGridFieldView from './views/EditableGridFieldView';
import SimplifiedFieldView from '../form/fields/SimplifiedFieldView';
import DateTimeService from '../form/editors/services/DateTimeService';
import SelectionCellView from './views/selections/SelectionCellView';
import getIconPrefixer from '../utils/handlebars/getIconPrefixer';

let factory;

type Column = { key: string, columnClass: string, editable: boolean, type: string, dataType: string, format: string }; //todo wtf datatype

export default (factory = {
    getCellViewForColumn(column: Column, model: Backbone.Model) {
        if (column.editable) {
            return new (column.simplified ? SimplifiedFieldView : EditableGridFieldView)({
                className: `cell_editable ${column.customClass || ''}`,
                schema: column,
                model,
                key: column.key
            });
        }

        return factory.getCellHtml(column, model);
    },

    getSelectionCell(model) {
        return new SelectionCellView(model);
    },

    getCellHtml(column: Column, model: Backbone.Model) {
        const value = model.get(column.key);

        if (value === null || value === undefined) {
            return '<td></td>';
        }

        let adjustedValue = value;

        switch (column.type) {
            case objectPropertyTypes.STRING:
                adjustedValue = this.__adjustValue(value);

                return `<td title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue}</td>`;
            case objectPropertyTypes.EXTENDED_STRING:
                return this.__createContextString(model, value, column);
            case objectPropertyTypes.INSTANCE:
                if (Array.isArray(value)) {
                    adjustedValue = value.map(v => v && v.name).join(', ');
                } else if (value && value.name) {
                    adjustedValue = value.name;
                }
                return `<td title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue || ''}</td>`;
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
                    return `<td title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue}</td>`;
                } else if (value.name) {
                    return `<td title="${this.__getTitle(column, model, value.name)}">${value.name}</td>`;
                }
            case objectPropertyTypes.ENUM:
                adjustedValue = value ? value.valueExplained : '';
                return `<td title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue}</td>`;
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
                return `<td class="cell-right" title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue}</td>`;
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

                return `<td title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue}</td>`;
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
                return `<td>${adjustedValue}</td>`;
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
                return `<td title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue}</td>`;
            case objectPropertyTypes.DOCUMENT:
                if (value.length > 0) {
                    return `<td>${value
                        .map(item => {
                            const text = item.text || item.name || (item.columns && item.columns[0]);
                            const url = item.url || (item.columns && item.columns[1]);
                            return `<a href="${url}" target="_blank" title="${text}">${text}</a>`;
                        })
                        .sort((a, b) => a.text > b.text)
                        .join(', ')}</td>`;
                }
            default:
                adjustedValue = this.__adjustValue(value);
                return `<td title="${this.__getTitle(column, model, adjustedValue)}">${adjustedValue || ''}</td>`;
        }
    },

    __createContextString(model, value, column) {
        const adjustedValue = this.__adjustValue(value);
        const type = contextIconType[model.get('type').toLocaleLowerCase()];
        const getIcon = getIconPrefixer(type);
        return `
            <td class="js-extend_cell_content extend_cell_content}" title="${this.__getTitle(column, model, adjustedValue)}">
            <i class="${getIcon(type)} context-icon" aria-hidden="true"></i>
            <td class="extend_cell_text">
                <span class="extend_cell_header">${adjustedValue}</span>
                <span class="extend_info">${model.get('alias') || ''}</span>
            </td>
            </td>`;
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
