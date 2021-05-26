import { objectPropertyFormats as dateFormats } from '../../Meta';
import DatasetViewReferenceCollection from '../collections/DatasetViewReferenceCollection';
import { filterPredicates, aggregationPredicates, booleanDropdown, columnType, enabledFilterEditor } from '../meta';
import formatService from 'services/FormatService';

const constants = {
    aggregationCountClass: 'icon-aggregation',
    aggregationSumClass: 'icon-sum'
};

export default {
    getFilterEditorOptions(filtersConfigurationModel, model, parentModel) {
        const editorColumnType = filtersConfigurationModel.get('columnType');

        const requiredValidator = Core.form.repository.validators.required();
        const requiredIfEnabled = function required(value) {
            return enabledFilterEditor(parentModel) ? requiredValidator(value) : undefined;
        };

        switch (editorColumnType) {
            case columnType.decimal:
                return {
                    type: 'Number',
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    autocommit: true,
                    validators: [requiredIfEnabled],
                    min: null,
                    max: null,
                    allowFloat: true
                };
            case columnType.integer:
                return {
                    type: 'Number',
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    autocommit: true,
                    validators: [requiredIfEnabled],
                    min: null,
                    max: null,
                    allowFloat: false
                };
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
                    return {
                        type: 'Date',
                        dateDisplayFormat,
                        model,
                        key: 'value',
                        validators: [requiredIfEnabled],
                        changeMode: 'keydown',
                        autocommit: true
                    };
                }
                return {
                    type: 'DateTime',
                    dateDisplayFormat,
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    validators: [requiredIfEnabled],
                    autocommit: true
                };
            }
            case columnType.duration:
                return {
                    type: 'Duration',
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    validators: [requiredIfEnabled],
                    autocommit: true,
                    showEmptyParts: true
                };
            case columnType.boolean:
                return {
                    type: 'BooleanGroup',
                    model,
                    key: 'value',
                    changeMode: 'keydown',
                    autocommit: true,
                    items: [
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
                };
            case columnType.document:
                return {
                    type: 'RadioGroup',
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
                            displayText: Localizer.get('PROCESS.DATASET.EDITORPREDICATES.NOTEXIST'),
                            isCancel: true
                        }
                    ]
                };
            case columnType.string:
                return {
                    type: 'Text',
                    model,
                    key: 'value',
                    validators: [requiredIfEnabled],
                    autocommit: true,
                    changeMode: 'keydown'
                };
            case columnType.id:
            case columnType.users:
            case columnType.reference:
            case columnType.role:    
            case columnType.enumerable: {
                const datasourceId = filtersConfigurationModel.get('datasourceId');
                model.set('datasourceId', datasourceId, { silent: true });
                let searchId = null;
                const editorValue = model.get('value');

                if (typeof editorValue === 'string' || typeof editorValue === 'number') {
                    searchId = editorValue;
                }
                return {
                    type: 'Datalist',
                    model,
                    key: 'value',
                    autocommit: true,
                    controller: new Core.form.editors.reference.controllers.BaseReferenceEditorController({
                        collection: new DatasetViewReferenceCollection([], { datasourceId, searchId, query: filtersConfigurationModel.get('query') })
                    }),
                    textFilterDelay: 1000,
                    showCheckboxes: true,
                    validators: [requiredIfEnabled],
                    maxQuantitySelected: Infinity,
                    valueType: 'id'
                };
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
                displayText: Localizer.get('PROCESS.DATASET.EDITORPREDICATES.COUNT')
            }
        ];

        switch (inputColumnType) {
            case columnType.decimal:
            case columnType.integer:
            case columnType.duration:
                aggregationMethodsList.push({
                    id: aggregationPredicates.sum,
                    title: Localizer.get('PROCESS.DATASET.EDITORPREDICATES.SUM'),
                    displayText: Localizer.get('PROCESS.DATASET.EDITORPREDICATES.SUM')
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
            case columnType.role:    
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
