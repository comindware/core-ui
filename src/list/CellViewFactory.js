//@flow
import { objectPropertyTypes } from '../Meta';
import { dateHelpers } from 'utils';
import EditableGridFieldView from './views/EditableGridFieldView';

let factory;

export default (factory = {
    getCellViewForColumn(column, model) {
        if (column.editable) {
            return EditableGridFieldView;
        }

        return factory.getCellHtml(column, model);
    },

    getCellViewByDataType(type) {
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

    __getSimpleView(simpleTemplate, extention) {
        return Marionette.View.extend(
            Object.assign(
                {
                    template: Handlebars.compile(simpleTemplate),
                    modelEvents: {
                        'change:highlightedFragment': '__handleHighlightedFragmentChange',
                        highlighted: '__handleHighlightedFragmentChange',
                        unhighlighted: '__handleHighlightedFragmentChange'
                    },
                    __handleHighlightedFragmentChange() {
                        this.render();
                    },
                    className: 'grid-cell'
                },
                extention
            )
        );
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
            template: Handlebars.compile('{{#each documents}}<a href="{{url}}">{{text}}</a>{{#unless @last}}, {{/unless}}{{/each}}'),

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

    getCellHtml(column, model) {
        const type = column.type;
        const value = model.get(column.key);

        if (value === null || value === undefined) {
            return `<div class="cell ${column.columnClass}"></div>`;
        }
        switch (type) {
            case objectPropertyTypes.STRING:
                return `<div class="cell ${column.columnClass}">${value}</div>`;
            case objectPropertyTypes.INSTANCE:
                return `<div class="cell ${column.columnClass}">${value ? value.name : ''}</div>`;
            case objectPropertyTypes.ACCOUNT:
                if (value && value.length > 0) {
                    return `<div class="cell ${column.columnClass}">${value
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
                        }, null)}</div>`;
                } else if (value && value.name) {
                    return `<div class="cell ${column.columnClass}">${value.name}</div>`;
                }
            case objectPropertyTypes.ENUM:
                return `<div class="cell ${column.columnClass}">${value ? value.valueExplained : ''}</div>`;
            case objectPropertyTypes.INTEGER:
            case objectPropertyTypes.DOUBLE:
            case objectPropertyTypes.DECIMAL:
                return `<div class="cell cell-right ${column.columnClass}">${value ? value.toString() : ''}</div>`;
            case objectPropertyTypes.DURATION: {
                if (value === 0) {
                    return `<div class="cell ${column.columnClass}">${'0'}</div>`;
                }
                if (!value) {
                    return `<div class="cell ${column.columnClass}"></div>`;
                }
                let result = '';
                const duration = dateHelpers.durationISOToObject(value);
                if (duration.days) {
                    result += `${duration.days + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.DAYS')} `;
                }
                if (duration.hours) {
                    result += `${duration.hours + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.HOURS')} `;
                }
                if (duration.minutes) {
                    result += `${duration.minutes + Localizer.get('CORE.FORM.EDITORS.DURATION.WORKDURATION.MINUTES')} `;
                }
                return `<div class="cell ${column.columnClass}">${result.trim()}</div>`;
            }
            case objectPropertyTypes.BOOLEAN:
                if (value === true) {
                    return `<div class="cell ${column.columnClass}"><svg class="svg-grid-icons svg-icons_flag-yes"><use xlink:href="#icon-checked"></use></svg></div>`;
                } else if (value === false) {
                    return `<div class="cell ${column.columnClass}"><svg class="svg-grid-icons svg-icons_flag-none"><use xlink:href="#icon-remove"></use></svg></div>`;
                }
            case objectPropertyTypes.DATETIME:
                return `<div class="cell ${column.columnClass}">${dateHelpers.dateToDateTimeString(value, column.format || 'condensedDateTime')}</div>`;
            case objectPropertyTypes.DOCUMENT:
                if (value && value.length > 0) {
                    return `<div class="cell ${column.columnClass}">${value
                        .map(item => {
                            const text = item.text || item.name || (item.columns && item.columns[0]);
                            const url = item.url || (item.columns && item.columns[1]);
                            return `<a href="${url}">${text}</a>`;
                        })
                        .sort((a, b) => a.text > b.text)
                        .join(', ')}</div>`;
                }
            default:
                return `<div class="cell ${column.columnClass}">${value}</div>`;
        }
    }
});
