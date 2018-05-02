//@flow
import { objectPropertyTypes } from '../Meta';
import { dateHelpers } from 'utils';
import EditableGridFieldView from './views/EditableGridFieldView';

export default {
    getCellViewForColumn(column, model) {
        if (column.editable) {
            return EditableGridFieldView;
        }

        return this.getCellHtml(column, model);
    },

    getCellViewByDataType(type) {
        //Used by Product server Grid
        let result;

        switch (type) {
            case objectPropertyTypes.STRING:
                result = this.getTextCellView();
                break;
            case objectPropertyTypes.INSTANCE:
                result = this.getReferenceCellView();
                break;
            case objectPropertyTypes.ACCOUNT:
                result = this.getUserCellView();
                break;
            case objectPropertyTypes.ENUM:
                result = this.getEnumCellView();
                break;
            case objectPropertyTypes.INTEGER:
            case objectPropertyTypes.DOUBLE:
            case objectPropertyTypes.DECIMAL:
                result = this.getNumberCellView();
                break;
            case objectPropertyTypes.DURATION:
                result = this.getDurationCellView();
                break;
            case objectPropertyTypes.BOOLEAN:
                result = this.getBooleanCellView();
                break;
            case objectPropertyTypes.DATETIME:
                result = this.getDateTimeCellView();
                break;
            case objectPropertyTypes.DOCUMENT:
                result = this.getDocumentCellView();
                break;
            default:
                result = this.getHtmlCellView();
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
        return this.__getSimpleView('{{highlightFragment value highlightedFragment}}', extention);
    },

    getReferenceCellView() {
        const extention = {
            templateContext() {
                return {
                    value: this.model.get(this.options.key)
                };
            }
        };
        return this.__getSimpleView('{{#if value}}{{#if value.name}}{{highlightFragment value.name highlightedFragment}}{{/if}}{{/if}}', extention);
    },

    getUserCellView() {
        return this.__getAccountView();
    },

    getEnumCellView() {
        return this.__getEnumView();
    },

    getNumberCellView() {
        const extention = {
            templateContext() {
                return {
                    value: this.model.get(this.options.key)
                };
            }
        };
        return this.__getSimpleView('{{value}}', extention);
    },

    getDurationCellView() {
        const extention = {
            templateContext() {
                return {
                    value: this.model.get(this.options.key)
                };
            }
        };
        return this.__getSimpleView('{{renderShortDuration value}}', extention);
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

        return this.__getSimpleView(
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
        return this.__getSimpleView('{{#if value}}{{renderFullDateTime value}}{{/if}}', extention);
    },

    getDocumentCellView() {
        return this.__getDocumentView();
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
            return '';
        }
        switch (type) {
            case objectPropertyTypes.STRING:
                return value;
            case objectPropertyTypes.INSTANCE:
                return value ? value.name : '';
            case objectPropertyTypes.ACCOUNT:
                if (value && value.length > 0) {
                    return value
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
                } else if (value && value.name) {
                    return value.name;
                }
            case objectPropertyTypes.ENUM:
                return value ? value.valueExplained : '';
            case objectPropertyTypes.INTEGER:
            case objectPropertyTypes.DOUBLE:
            case objectPropertyTypes.DECIMAL:
                return value ? value.toString() : '';
            case objectPropertyTypes.DURATION: {
                if (value === 0) {
                    return '0';
                }
                if (!value) {
                    return '';
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
                return result.trim();
            }
            case objectPropertyTypes.BOOLEAN:
                if (value === true) {
                    return '<svg class="svg-grid-icons svg-icons_flag-yes"><use xlink:href="#icon-checked"></use></svg>';
                } else if (value === false) {
                    return '<svg class="svg-grid-icons svg-icons_flag-none"><use xlink:href="#icon-remove"></use></svg>';
                }
            case objectPropertyTypes.DATETIME:
                return dateHelpers.dateToDateTimeString(value, column.format || 'condensedDateTime');
            case objectPropertyTypes.DOCUMENT:
                if (value && value.length > 0) {
                    return value
                        .map(item => {
                            const text = item.text || item.name || (item.columns && item.columns[0]);
                            const url = item.url || (item.columns && item.columns[1]);
                            return `<a href="${url}">${text}</a>`;
                        })
                        .sort((a, b) => a.text > b.text)
                        .join(', ');
                }
            default:
                return value;
        }
    }
};
