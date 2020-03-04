import { objectPropertyTypes, contextIconType, complexValueTypes, getComplexValueTypesLocalization } from '../Meta';
import { Column } from './types/types';
import { dateHelpers } from 'utils';
import UserService from 'services/UserService';
import ExtensionIconService from '../form/editors/impl/document/services/ExtensionIconService';
import DateTimeService from '../form/editors/services/DateTimeService';
import CellFieldView from './views/CellFieldView';
import getIconPrefixer from '../utils/handlebars/getIconPrefixer';
import compositeDocumentCell from './templates/compositeDocumentCell.html';
import compositeUserCell from './templates/compositeUserCell.html';
import compositeReferenceCell from './templates/compositeReferenceCell.html';
import { cmpPos } from 'codemirror';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import moment from 'moment';
import DropdownView from '../dropdown/views/DropdownView';

const compiledCompositeDocumentCell = Handlebars.compile(compositeDocumentCell);
const compiledCompositeReferenceCell = Handlebars.compile(compositeReferenceCell);
const compiledCompositeUserCell = Handlebars.compile(compositeUserCell);
const compiledStringValueCell = Handlebars.compile('{{{value}}}');
const compiledValueCell = Handlebars.compile('{{value}}');

const getWrappedTemplate = (template: string) => `<div class="composite-cell__wrp">
        ${template}
        <span class="composite-cell__count">+{{count}}</div>
    </div>`;

const compiledWrappedCompositeDocumentCell = Handlebars.compile(getWrappedTemplate(compositeDocumentCell));
const compiledWrappedCompositeReferenceCell = Handlebars.compile(getWrappedTemplate(compositeReferenceCell));
const compiledWrappedCompositeUserCell = Handlebars.compile(getWrappedTemplate(compositeUserCell));
const compiledWrappedStringValueCell = Handlebars.compile(getWrappedTemplate('{{{value}}}'));
const compiledWrappedValueCell = Handlebars.compile(getWrappedTemplate('{{value}}'));

type ValueFormatOption = {
    value: any,
    column: Column
};

type GetCellOptions = {
    column: Column,
    model: Backbone.Model,
    values?: any,
    [others: string]: any
};

type GetCellInnerHTMLResult = {
    cellInnerHTML: string,
    title: string
};

export interface ICellViewFactory {
    getCellViewForColumn(column: Column, model: Backbone.Model): string | CellFieldView;
    getCell(column: Column, model: Backbone.Model): string;
    tryGetMultiValueCellPanel(column: Column, model: Backbone.Model, cellElement: Element): DropdownView | null;
}

class CellViewFactory implements ICellViewFactory {
    getCellViewForColumn(column: Column, model: Backbone.Model): string | CellFieldView {
        if (column.editable) {
            return CellFieldView;
        }

        return this.getCell(column, model);
    }

    getCell(column: Column, model: Backbone.Model): string {
        const value = model.get(column.key);

        if (this.__isEmpty(value) || column.getHidden?.(model)) {
            return `<td class="${this.__getCellClass(column, model)}" tabindex="-1"></td>`;
        }

        let values = Array.isArray(value) ? value : [value];

        switch (column.dataType || column.type) {
            case objectPropertyTypes.EXTENDED_STRING:
                return this.__createContextString({ values, column, model });
            case objectPropertyTypes.INSTANCE:
                return this.__getReferenceCell({ values, column, model });
            case objectPropertyTypes.ACCOUNT:
                return this.__getUserCell({ values, column, model });
            case objectPropertyTypes.ENUM:
                values = value ? value.valueExplained : '';
                return `<td class="${this.__getCellClass(column, model)}" title="${this.__getTitle({ values, column, model })}">${values}</td>`;
            case objectPropertyTypes.INTEGER:
            case objectPropertyTypes.DOUBLE:
            case objectPropertyTypes.DECIMAL:
                return this.__getNumberCell({ values, column, model });
            case objectPropertyTypes.DURATION:
                return this.__getDurationCell({ values, column, model });
            case objectPropertyTypes.BOOLEAN:
                return this.__getBooleanCell({ values, column, model });
            case objectPropertyTypes.DATETIME:
                return this.__getDateTimeCell({ values, column, model });
            case objectPropertyTypes.DOCUMENT:
                return this.__getDocumentCell({ values, column, model });
            case 'Complex':
                return this.__getComplexCell({ values, column, model });
            // case 'Code':
            //     return this.__getDocumentCell({ values, column, model });
            // case 'Code':
            //     return this.__getDocumentCell({ values, column, model });
            case objectPropertyTypes.STRING:
            default:
                return this.__getStringCell({ values, column, model });
        }
    }

    tryGetMultiValueCellPanel(column: Column, model: Backbone.Model, cellElement: Element): DropdownView | null {
        let value = model.get(column.key);

        if (value === null || value === undefined || !Array.isArray(value) || value.length < 2) {
            return null;
        }
        value = value.slice(1);
        let template;
        let formattedValues;
        switch (column.dataType || column.type) {
            case objectPropertyTypes.INSTANCE:
                template = compiledCompositeReferenceCell;
                formattedValues = value.map(v => this.__getFormattedReferenceValue({ value: v, column }));
                break;
            case objectPropertyTypes.ACCOUNT:
                template = compiledCompositeUserCell;
                formattedValues = value.map(v => this.__getFormattedUserValue({ value: v, column }));
                break;
            case objectPropertyTypes.INTEGER:
            case objectPropertyTypes.DOUBLE:
            case objectPropertyTypes.DECIMAL:
                template = compiledValueCell;
                formattedValues = value.map(v => ({ value: this.__getFormattedNumberValue({ value: v, column }) }));
                break;
            case objectPropertyTypes.DURATION:
                template = compiledValueCell;
                formattedValues = value.map(v => ({ value: this.__getFormattedDurationValue({ value: v, column }) }));
                break;
            case objectPropertyTypes.DATETIME:
                template = compiledValueCell;
                formattedValues = value.map(v => ({ value: this.__getFormattedDateTimeValue({ value: v, column }) }));
                break;
            case objectPropertyTypes.DOCUMENT:
                template = compiledCompositeDocumentCell;
                formattedValues = value.map(v => this.__getFormattedDocumentValue({ value: v, column }));
                break;
            case objectPropertyTypes.BOOLEAN:
                return null;
            case objectPropertyTypes.STRING:
            default:
                template = compiledStringValueCell;
                formattedValues = value.map(v => ({ value }));
                break;
        }
        const panelViewOptions = {
            collection: new Backbone.Collection(formattedValues),
            className: 'grid-composite_panel',
            childView: Marionette.View,
            childViewOptions: {
                tagName: 'div',
                className: 'composite-cell_container',
                template
            }
        };
        const menu = Core.dropdown.factory.createDropdown({
            class: 'grid_composite-cell dropdown_root',
            buttonView: Marionette.View,
            panelView: Marionette.CollectionView,
            panelViewOptions,
            element: cellElement
        });
        return menu;
    }

    __getFormattedNumberValue({ value, column }: ValueFormatOption) {
        if (value == null) {
            return '';
        }
        if (column.formatOptions) {
            if (column.formatOptions.intlOptions) {
                return new Intl.NumberFormat(Localizer.langCode, column.formatOptions.intlOptions).format(value);
            } else if (column.formatOptions.allowFloat === false) {
                return Math.floor(value);
            }
        }
        return value;
    }

    __getFormattedDateTimeValue({ value, column }: ValueFormatOption) {
        if (column.formatOptions) {
            const dateDisplayValue = column.formatOptions.dateDisplayFormat ? DateTimeService.getDateDisplayValue(value, column.formatOptions.dateDisplayFormat) : '';
            const timeDisplayValue = column.formatOptions.timeDisplayFormat ? DateTimeService.getTimeDisplayValue(value, column.formatOptions.timeDisplayFormat) : '';
            return `${dateDisplayValue} ${timeDisplayValue}`;
        }
        return dateHelpers.dateToDateTimeString(value, 'generalDateShortTime');
    }

    __getFormattedDurationValue({ value, column }: ValueFormatOption) {
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
    }

    __getFormattedBooleanValue({ value, column, model }: ValueFormatOption) {
        // if (value === true) {
        //     result = '<svg class="svg-grid-icons svg-icons_flag-yes"><use xlink:href="#icon-checked"></use></svg>';
        // } else if (value === false) {
        //     result = '<svg class="svg-grid-icons svg-icons_flag-none"><use xlink:href="#icon-remove"></use></svg>';
        // }
        const trueIcon = '<i class="fas fa-check icon-true"></i>';
        if (!column.editable || column.getReadonly?.(model)) {
            if (value === true) {
                return trueIcon;
            } else if (value === false) {
                return '<i class="fas fa-times icon-false"></i>';
            }
            return '';
        }
        const innerHTML = value === true ? trueIcon : '';
        return `<div class="checkbox js-checbox">${innerHTML}</div>`;
    }

    __getFormattedReferenceValue({ value, column }: ValueFormatOption) {
        const result = {
            text: value.name,
            ...value
        };
        if (!value.url && typeof column.createValueUrl === 'function') {
            result.url = column.createValueUrl({ value, column });
        }

        return result;
    }

    __getFormattedDocumentValue({ value }: ValueFormatOption) {
        const { name, text, isLoading, extension } = value;
        value.icon = ExtensionIconService.getIconForDocument({ isLoading, extension });
        value.name = name || text;
        return {
            icon: ExtensionIconService.getIconForDocument({ isLoading, extension }),
            name: value.text,
            ...value
        };
    }

    __getFormattedUserValue({ value }: ValueFormatOption) {
        return {
            avatar: UserService.getAvatar(value),
            ...value
        };
    }

    __getTaggedCellHTML({ column, model, cellInnerHTML, title }: { column: Column, model: Backbone.Model, cellInnerHTML: string, title: string }): string {
        return `<td class="${this.__getCellClass(column, model)}" title="${title}" tabindex="-1">${cellInnerHTML}</td>`;
    }

    __getStringCellInnerHTML({ values, column, model }: GetCellOptions): GetCellInnerHTMLResult {
        const title = this.__getTitle({ values, column, model });
        let cellInnerHTML;
        if (values.length === 1) {
            cellInnerHTML = values[0] || '';
        } else {
            cellInnerHTML = compiledWrappedStringValueCell({ value: values[0], count: values.length - 1 });
        }
        return { cellInnerHTML, title };
    }

    __getStringCell({ values, column, model }: GetCellOptions): string {
        const { title, cellInnerHTML } = this.__getStringCellInnerHTML({ values, column, model });
        return this.__getTaggedCellHTML({ column, model, cellInnerHTML, title });
    }

    __getNumberCellInnerHTML({ values, column, model }: GetCellOptions): GetCellInnerHTMLResult {
        const mappedValues = values.map(value => this.__getFormattedNumberValue({ value, column }));

        const title = this.__getTitle({ column, model, values: mappedValues });

        let cellInnerHTML;
        if (values.length === 1) {
            cellInnerHTML = mappedValues[0];
        } else {
            cellInnerHTML = compiledWrappedValueCell({ value: mappedValues[0], count: values.length - 1 });
        }
        return { cellInnerHTML, title };
    }

    __getNumberCell({ values, column, model }: GetCellOptions): string {
        const { title, cellInnerHTML } = this.__getNumberCellInnerHTML({ values, column, model });
        return this.__getTaggedCellHTML({ column, model, cellInnerHTML, title });
    }

    __getDateTimeCellInnerHTML({ values, column, model }: GetCellOptions): GetCellInnerHTMLResult {
        const mappedValues = values.map(value => this.__getFormattedDateTimeValue({ value, column }));

        const title = this.__getTitle({ column, model, values: mappedValues });

        let cellInnerHTML;
        if (values.length === 1) {
            cellInnerHTML = mappedValues[0];
        } else {
            cellInnerHTML = compiledWrappedValueCell({ value: mappedValues[0], count: values.length - 1 });
        }
        return { cellInnerHTML, title };
    }

    __getDateTimeCell({ values, column, model }: GetCellOptions): string {
        const { title, cellInnerHTML } = this.__getDateTimeCellInnerHTML({ values, column, model });
        return this.__getTaggedCellHTML({ column, model, cellInnerHTML, title });
    }

    __getDurationCellInnerHTML({ values, column, model }: GetCellOptions): GetCellInnerHTMLResult {
        const mappedValues = values.map(value => this.__getFormattedDurationValue({ value, column }));

        const title = this.__getTitle({ column, model, values: mappedValues });

        let cellInnerHTML;
        if (values.length === 1) {
            cellInnerHTML = mappedValues[0];
        } else {
            cellInnerHTML = compiledWrappedValueCell({ value: mappedValues[0], count: values.length - 1 });
        }
        return { cellInnerHTML, title };
    }

    __getDurationCell({ values, column, model }: GetCellOptions): string {
        const { title, cellInnerHTML } = this.__getDurationCellInnerHTML({ values, column, model });
        return this.__getTaggedCellHTML({ column, model, cellInnerHTML, title });
    }

    __getBooleanCellInnerHTML({ values, column, model }: GetCellOptions): GetCellInnerHTMLResult {
        const mappedValues = values.map(value => this.__getFormattedBooleanValue({ value, column, model }));
        const cellInnerHTML = mappedValues.join('');
        return { cellInnerHTML, title: '' };
    }

    __getBooleanCell({ values, column, model }: GetCellOptions): string {
        const { title, cellInnerHTML } = this.__getBooleanCellInnerHTML({ values, column, model });
        return this.__getTaggedCellHTML({ column, model, cellInnerHTML, title });
    }

    __getReferenceCellInnerHTML({ values, column, model }: GetCellOptions): GetCellInnerHTMLResult {
        const mappedValues = values.map(value => this.__getFormattedReferenceValue({ value, column }));

        const title = this.__getTitle({ column, model, values: mappedValues.map(v => v.text) });

        let cellInnerHTML;
        if (mappedValues.length === 1) {
            cellInnerHTML = compiledCompositeReferenceCell(mappedValues[0]);
        } else {
            cellInnerHTML = compiledWrappedCompositeReferenceCell({ ...mappedValues[0], count: values.length - 1 });
        }
        return { cellInnerHTML, title };
    }

    __getReferenceCell({ values, column, model }: GetCellOptions): string {
        const { title, cellInnerHTML } = this.__getReferenceCellInnerHTML({ values, column, model });
        return this.__getTaggedCellHTML({ column, model, cellInnerHTML, title });
    }

    __getDocumentCellInnerHTML({ values, column, model }: GetCellOptions): GetCellInnerHTMLResult {
        const mappedValues = values.map(value => this.__getFormattedDocumentValue({ value, column }));

        const title = this.__getTitle({ column, model, values: mappedValues.map(v => v.name) });

        let cellInnerHTML;
        if (mappedValues.length === 1) {
            cellInnerHTML = compiledCompositeDocumentCell(mappedValues[0]);
        } else {
            cellInnerHTML = compiledWrappedCompositeDocumentCell({ ...mappedValues[0], count: values.length - 1 });
        }
        return { cellInnerHTML, title };
    }

    __getDocumentCell({ values, column, model }: GetCellOptions): string {
        const { title, cellInnerHTML } = this.__getDocumentCellInnerHTML({ values, column, model });
        return this.__getTaggedCellHTML({ column, model, cellInnerHTML, title });
    }

    __getUserCellInnerHTML({ values, column, model }: GetCellOptions): GetCellInnerHTMLResult {
        const mappedValues = values.map(value => this.__getFormattedUserValue({ value, column }));

        const title = this.__getTitle({ column, model, values: mappedValues.map(v => v.name) });

        let cellInnerHTML;
        if (mappedValues.length === 1) {
            cellInnerHTML = compiledCompositeUserCell(mappedValues[0]);
        } else {
            cellInnerHTML = compiledWrappedCompositeUserCell({ ...mappedValues[0], count: values.length - 1 });
        }
        return { cellInnerHTML, title };
    }

    __getUserCell({ values, column, model }: GetCellOptions): string {
        const { title, cellInnerHTML } = this.__getUserCellInnerHTML({ values, column, model });
        return this.__getTaggedCellHTML({ column, model, cellInnerHTML, title });
    }

    __createContextString({ values, column, model }: GetCellOptions): string{
        const type = contextIconType[model.get('type').toLocaleLowerCase()];
        const getIcon = getIconPrefixer(type);
        return `
            <td class="js-extend_cell_content extend_cell_content ${model.get('isDisabled') ? 'archiveTemplate' : ''}" title="${this.__getTitle({ values, column, model })}">
                <i class="${getIcon(type)} context-icon" aria-hidden="true"></i>
                <div class="extend_cell_text">
                    <span class="extend_cell_header">${values.join(', ')}</span>
                    <span class="extend_info">${model.get('alias') || ''}</span>
                </div>
            </td>`;
    }

    __getComplexCell({ values, column, model }: GetCellOptions): string {
        let valueHTMLResult;
        let valueInnerHTML = '';
        let title = '';
        const value = values[0];
        const valueTypeHTML = getComplexValueTypesLocalization(value.type);
        if (value.value === null || value.value === undefined) {
            valueInnerHTML = '';
        } else {
            switch (value.type) {
                case complexValueTypes.value:
                    valueHTMLResult = this.__getHTMLbyValueEditor({ value: value.value, column, model });
                    title = valueHTMLResult.title;
                    valueInnerHTML = valueHTMLResult.cellInnerHTML;
                    break;
                case complexValueTypes.context: {
                    if (!value.value || value.value === 'False' || !column.context || !column.recordTypeId) {
                        valueInnerHTML = '';
                    } else if (typeof value.value === 'string') {
                        valueInnerHTML = value.value;
                    } else {
                        let instanceTypeId = column.recordTypeId;
                        valueInnerHTML = '';

                        value.value.forEach((item: string, index: number) => {
                            const searchItem = column.context[instanceTypeId]?.find((contextItem: any) => contextItem.id === item);

                            if (searchItem) {
                                valueInnerHTML += index ? ` - ${searchItem.name}` : searchItem.name;
                                instanceTypeId = searchItem[column.instanceValueProperty || 'instanceTypeId'];
                            }
                        });
                    }
                    title = valueInnerHTML;
                    break;
                }
                case complexValueTypes.expression:
                case complexValueTypes.script:
                    if (value.value) {
                        if (column.getReadonly?.(model)) {
                            valueInnerHTML = Localizer.get('CORE.FORM.EDITORS.CODE.SHOW');
                        } else {
                            valueInnerHTML = Localizer.get('CORE.FORM.EDITORS.CODE.EDIT');
                        }
                    } else {
                        valueInnerHTML = Localizer.get('CORE.FORM.EDITORS.CODE.EMPTY');
                    }
                    title = value.value;
                    break;
                case complexValueTypes.template:
                    title = valueInnerHTML = value.value.name;
                    break;
                default:
                    break;
            }
        }
        const cellInnerHTML = `${valueTypeHTML}: ${valueInnerHTML}`;
        const cellTitle = `${valueTypeHTML}: ${title}`;
        return this.__getTaggedCellHTML({ column, model, cellInnerHTML, title: cellTitle });
    }

    __getHTMLbyValueEditor({ value, column, model }: GetCellOptions): GetCellInnerHTMLResult {
        const columnWithExtension = { ...column, ...(column.schemaExtension?.(model) || {}) };
        let valueCellInnerHTMLResult;
        const values = Array.isArray(value) ? value : [value];
        switch (columnWithExtension.valueEditor) {
            case 'Number':
                valueCellInnerHTMLResult = this.__getNumberCellInnerHTML({ values, column, model });
                break;
            case 'DateTime':
                valueCellInnerHTMLResult = this.__getDateTimeCellInnerHTML({ values, column, model });
                break;
            case 'Duration':
                valueCellInnerHTMLResult = this.__getDurationCellInnerHTML({ values, column, model });
                break;
            case 'Datalist':
                valueCellInnerHTMLResult = this.__getReferenceCellInnerHTML({ values, column, model });
                break;
            case 'Boolean':
                valueCellInnerHTMLResult = this.__getBooleanCellInnerHTML({ values, column, model });
                break;
            case 'MembersSplit':
                valueCellInnerHTMLResult = this.__getUserCellInnerHTML({ values, column, model });
                break;
            case 'Document':
                valueCellInnerHTMLResult = this.__getDocumentCellInnerHTML({ values, column, model });
                break;
            default:
                valueCellInnerHTMLResult = this.__getStringCellInnerHTML({ values, column, model });
        }
        return valueCellInnerHTMLResult;
    }

    __getTitle({ values, column, model }: GetCellOptions): string {
        let title;
        if (column.format === 'HTML') {
            title = '';
        } else if (column.titleAttribute) {
            title = model.get(column.titleAttribute);
        } else {
            title = Array.isArray(values) ? values.join(', ') : values;
        }
        title = title !== null && title !== undefined ? title.toString().replace(/"/g, '&quot;') : '';
        return title;
    }

    __getCellClass(column: Column, model: Backbone.Model) {
        return `cell ${column.customClass ? column.customClass : ''}
         ${(column.required || column.getRequired?.(model)) && this.__isEmpty(model.get(column.key)) ? 'required' : ''}
         ${column.hasErrors?.(model) ? 'error' : ''}        
        `;
    }

    __isEmpty(value: any): boolean {
        return value === null || value === undefined || (Array.isArray(value) && value.length === 0);
    }
}

export default new CellViewFactory();
