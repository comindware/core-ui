import shared from 'modules/shared';
import { objectPropertyFormats as dateFormats } from 'modules/shared/Meta';
import DatasetViewReferenceCollection from '../collections/DatasetViewReferenceCollection';
import { filterPredicates, aggregationPredicates, booleanDropdown, columnType } from '../meta';
import formatService from 'services/FormatService';

const constants = {
    aggregationCountClass: 'icon-aggregation',
    aggregationSumClass: 'icon-sum'
};

export default {
    getFilterEditor(filtersConfigurationModel, model) {
        const editorColumnType = filtersConfigurationModel.get('columnType');

        switch (editorColumnType) {
            case columnType.decimal:
                return new Core.form.editors.NumberEditor({
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    autocommit: true,
                    min: null,
                    max: null,
                    allowFloat: true
                });
            case columnType.integer:
                return new Core.form.editors.NumberEditor({
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    autocommit: true,
                    min: null,
                    max: null,
                    allowFloat: false
                });
            case columnType.datetime: {
                const dateDisplayFormat = formatService.getDateDisplayFormat(filtersConfigurationModel.get('dataFormat'));
                const filterDateFormat = filtersConfigurationModel.get('dataFormat');
                if (
                    filterDateFormat === dateFormats.SHORT_DATE ||
                    filterDateFormat === dateFormats.SHORT_TIME ||
                    filterDateFormat === dateFormats.CONDENSED_DATE ||
                    filterDateFormat === dateFormats.MONTH_DAY ||
                    filterDateFormat === dateFormats.YEAR_MONTH
                ) {
                    return new Core.form.editors.DateEditor({
                        dateDisplayFormat,
                        model,
                        key: 'value',
                        changeMode: 'keydown',
                        autocommit: true
                    });
                }
                return new Core.form.editors.DateTimeEditor({
                    dateDisplayFormat,
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    autocommit: true
                });
            }
            case columnType.duration:
                return new Core.form.editors.DurationEditor({
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    autocommit: true,
                    showEmptyParts: true
                });
            case columnType.boolean:
                return new Core.form.editors.RadioGroupEditor({
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    autocommit: true,
                    radioOptions: [
                        {
                            id: booleanDropdown.yes,
                            displayText: Localizer.get('PROCESS.DATASET.EDITORPREDICATES.YES')
                        },
                        {
                            id: booleanDropdown.no,
                            displayText: Localizer.get('PROCESS.DATASET.EDITORPREDICATES.NO')
                        },
                        {
                            id: booleanDropdown.null,
                            displayText: Localizer.get('PROCESS.DATASET.EDITORPREDICATES.NULL')
                        }
                    ]
                });
            case columnType.document:
                return new Core.form.editors.RadioGroupEditor({
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    autocommit: true,
                    radioOptions: [
                        {
                            id: true,
                            displayText: Localizer.get('PROCESS.DATASET.EDITORPREDICATES.EXIST')
                        },
                        {
                            id: false,
                            displayText: Localizer.get('PROCESS.DATASET.EDITORPREDICATES.NOTEXIST')
                        }
                    ]
                });
            case columnType.string:
                return new Core.form.editors.TextEditor({
                    model,
                    key: 'value',
                    autocommit: true,
                    changeMode: 'keydown'
                });
            case columnType.id:
            case columnType.users:
            case columnType.reference:
            case columnType.enumerable: {
                const datasourceId = filtersConfigurationModel.get('datasourceId');
                model.set('datasourceId', datasourceId, { silent: true });
                let searchId = null;
                const editorValue = model.get('value');

                if (typeof editorValue === 'string' || typeof editorValue === 'number') {
                    searchId = editorValue;
                }
                return new Core.form.editors.DatalistEditor({
                    model,
                    key: 'value',
                    autocommit: true,
                    controller: new shared.controllers.DataSourceReferenceEditorController({
                        collection: new DatasetViewReferenceCollection([], { datasourceId, searchId, query: filtersConfigurationModel.get('query') })
                    }),
                    textFilterDelay: 1000,
                    showCheckboxes: true,
                    maxQuantitySelected: Infinity,
                    valueType: 'id'
                });
            }
            default:
                throw new Error(`Creation of filter's editor failed: Unknown column type ${editorColumnType}`);
        }
    },

    getAggregationPredicates(inputColumnType, model) {
        const aggregationMethodsList = [
            {
                id: aggregationPredicates.count,
                title: Localizer.get('PROCESS.DATASET.EDITORPREDICATES.COUNT'),
                displayHtml: `<span class=${constants.aggregationCountClass}></span>`
            }
        ];

        switch (inputColumnType) {
            case columnType.decimal:
            case columnType.integer:
            case columnType.duration:
                aggregationMethodsList.push({
                    id: aggregationPredicates.sum,
                    title: Localizer.get('PROCESS.DATASET.EDITORPREDICATES.SUM'),
                    displayHtml: `<span class=${constants.aggregationSumClass}></span>`
                });
                break;
            default:
                break;
        }

        return new Core.form.editors.RadioGroupEditor({
            model,
            key: 'aggregationMethod',
            changeMode: 'keydown',
            autocommit: true,
            radioOptions: aggregationMethodsList
        });
    },

    getFilterPredicates(inputColumnType, model) {
        let filterPredicateCollection;

        switch (inputColumnType) {
            case columnType.decimal:
            case columnType.integer:
            case columnType.duration:
            case columnType.datetime:
                filterPredicateCollection = new Backbone.Collection(
                    [
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.EQUALTO'),
                            id: filterPredicates.equal
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.NOTEQUALTO'),
                            id: filterPredicates.notEqual
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.GREATERTHAN'),
                            id: filterPredicates.greaterThan
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.LESSTHAN'),
                            id: filterPredicates.lessThan
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.BETWEEN'),
                            id: filterPredicates.between
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.SET'),
                            id: filterPredicates.set
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.NOTSET'),
                            id: filterPredicates.notSet
                        }
                    ],
                    { comparator: null }
                );
                break;
            case columnType.string:
                filterPredicateCollection = new Backbone.Collection(
                    [
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.SUBSTRINGOF'),
                            id: filterPredicates.substringOf
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.NOTSUBSTRINGOF'),
                            id: filterPredicates.notSubstringOf
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.STARTSWITH'),
                            id: filterPredicates.startsWith
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.ENDSWITH'),
                            id: filterPredicates.endsWith
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.EQUALTO'),
                            id: filterPredicates.equal
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.NOTEQUALTO'),
                            id: filterPredicates.notEqual
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.SET'),
                            id: filterPredicates.set
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.NOTSET'),
                            id: filterPredicates.notSet
                        }
                    ],
                    { comparator: null }
                );
                break;
            case columnType.users:
            case columnType.reference:
            case columnType.enumerable:
                filterPredicateCollection = new Backbone.Collection(
                    [
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.EQUALTO'),
                            id: filterPredicates.equal
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.SET'),
                            id: filterPredicates.set
                        },
                        {
                            text: Localizer.get('PROCESS.DATASET.EDITORVALUES.NOTSET'),
                            id: filterPredicates.notSet
                        }
                    ],
                    { comparator: null }
                );
                break;
            default:
                break;
        }

        return new Core.form.editors.DatalistEditor({
            model,
            key: 'operator',
            collection: filterPredicateCollection,
            allowEmptyValue: false,
            valueType: 'id',
            autocommit: true
        });
    }
};
