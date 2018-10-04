import DatasetViewReferenceCollection from '../collections/DatasetViewReferenceCollection';
import { filterPredicates, aggregationPredicates, booleanDropdown, columnTypes } from '../meta';
import { objectPropertyFormats as dateFormats } from '../../Meta';
import formatService from 'services/FormatService';

const constants = {
    aggregationCountClass: 'icon-aggregation',
    aggregationSumClass: 'icon-sum'
};

export default {
    getFilterEditor(filtersConfigurationModel, model) {
        const editorColumnType = filtersConfigurationModel.get('columnType');

        switch (editorColumnType) {
            case columnTypes.decimal:
                return new Core.form.editors.NumberEditor({
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    autocommit: true,
                    min: null,
                    max: null,
                    allowFloat: true
                });
            case columnTypes.integer:
                return new Core.form.editors.NumberEditor({
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    autocommit: true,
                    min: null,
                    max: null,
                    allowFloat: false
                });
            case columnTypes.datetime: {
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
            case columnTypes.duration:
                return new Core.form.editors.DurationEditor({
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    autocommit: true,
                    showEmptyParts: true
                });
            case columnTypes.boolean:
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
            case columnTypes.document:
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
            case columnTypes.string:
                return new Core.form.editors.TextEditor({
                    model,
                    key: 'value',
                    autocommit: true,
                    changeMode: 'keydown'
                });
            case columnTypes.id:
            case columnTypes.users:
            case columnTypes.reference:
            case columnTypes.enumerable: {
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
                    controller: new Core.form.editors.reference.controllers.BaseReferenceEditorController({
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
            case columnTypes.decimal:
            case columnTypes.integer:
            case columnTypes.duration:
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
            case columnTypes.decimal:
            case columnTypes.integer:
            case columnTypes.duration:
            case columnTypes.datetime:
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
            case columnTypes.string:
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
            case columnTypes.users:
            case columnTypes.reference:
            case columnTypes.enumerable:
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
