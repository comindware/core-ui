import { objectPropertyTypes } from '../Meta';

export const contextTypes = {
    void: 'void',
    any: 'any',
    one: 'one'
};

export const queryBuilderActions = {
    sort: 'sort',
    group: 'group',
    filter: 'filters',
    aggregation: 'aggregation'
};

export const sortDirection = {
    ascending: 'Asc',
    descending: 'Desc'
};

export const columnTypes = {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    DATETIME: 'dateTime',
    HTML: 'html',
    DOCUMENT: 'document',
    decimal: 'Decimal',
    integer: 'Integer',
    datetime: 'DateTime',
    duration: 'Duration',
    string: 'String',
    boolean: 'Boolean',
    users: 'AccountProperty',
    role: 'RoleProperty',
    reference: 'InstanceProperty',
    enumerable: 'EnumProperty',
    document: 'DocumentProperty',
    collection: 'Collection',
    id: 'id'
};

export const columnType = columnTypes;

export const columnWidthByType = {
    [objectPropertyTypes.ACCOUNT]: 120,
    [objectPropertyTypes.BOOLEAN]: 120,
    [objectPropertyTypes.COLLECTION]: 120,
    [objectPropertyTypes.DATETIME]: 120,
    [objectPropertyTypes.DECIMAL]: 120,
    [objectPropertyTypes.DOCUMENT]: 120,
    [objectPropertyTypes.DOUBLE]: 120,
    [objectPropertyTypes.DURATION]: 120,
    [objectPropertyTypes.ENUM]: 120,
    [objectPropertyTypes.EXTENDED_STRING]: 120,
    [objectPropertyTypes.INSTANCE]: 120,
    [objectPropertyTypes.INTEGER]: 120,
    [objectPropertyTypes.STRING]: 120
};

export const getDefaultActions = () => [
    {
        id: 'add',
        name: Localizer.get('CORE.GRID.ACTIONS.ADD'),
        iconClass: 'plus'
    },
    {
        id: 'archive',
        name: Localizer.get('CORE.GRID.ACTIONS.ARCHIVE'),
        contextType: contextTypes.any
    },
    {
        id: 'unarchive',
        name: Localizer.get('CORE.GRID.ACTIONS.UNARCHIVE'),
        contextType: contextTypes.any
    },
    {
        id: 'delete',
        name: Localizer.get('CORE.GRID.ACTIONS.DELETE'),
        contextType: contextTypes.any
    }
];

export const filterPredicates = {
    between: 'between',
    substringOf: 'substringof',
    notSubstringOf: 'notsubstringof',
    startsWith: 'startsWith',
    endsWith: 'endswith',
    equal: 'eq',
    notEqual: 'ne',
    greaterThan: 'gt',
    greaterOrEquals: 'ge',
    lessThan: 'lt',
    lessOrEquals: 'le',
    greateThan: 'gt',
    notSet: 'ns',
    set: 'se'
};

export const aggregationPredicates = {
    sum: 'sum',
    count: 'count'
};

export const booleanDropdown = {
    yes: true,
    no: false,
    null: null
};

export const pageSize = {
    10: '10',
    25: '25',
    50: '50',
    100: '100',
    500: '500',
    1000000000: 'ALL'
};

export const enabledFilterEditor = model => {
    const operator = model.get('operator');
    return ![filterPredicates.set, filterPredicates.notSet].includes(operator);
};

export const pagingControlsTypes = {
    firstPage: 'fp',
    previousPage: 'pp',
    twoPagesBefore: 'tpb',
    currentPage: 'cp',
    nextPage: 'np',
    twoPagesNext: 'tpn',
    lastPage: 'lp'
};

export const configurationConstants = {
    VISIBLE_COLLECTION_RESERVE: 2,
    VISIBLE_COLLECTION_RESERVE_HALF: 1,
    VISIBLE_COLLECTION_AUTOSIZE_RESERVE: 100,
    HEIGHT_STOCK_TO_SCROLL: 1, //px, border-collapse property for table (grid-content-wrp) add this 1 px
};

export const classes = {
    checked: 'editor_checked',
    checked_some: 'editor_checked_some',
    has_checked: 'hasChecked',
    selected: 'selected',
    dragover: 'dragover',
    hover: 'hover',
    hover__transition: 'hover__transition',
    rowChecked: 'row-checked',
    rowCheckedSome: 'row-checked-some',
    expanded: 'collapsible-btn_expanded',
    collapsible: 'js-collapsible-button',
    collapsibleIcon: 'js-tree-first-cell',
    checkboxCell: 'js-cell_selection',
    cellFocused: 'cell-focused',
    cellEditable: 'cell_editable',
    cell: 'cell',
    errorButton: 'js-error-button',
    hiddenByTreeEditorClass: 'hidden-by-tree-editor',
    hiddenColumns: 'hidden-columns',
    sortingUp: 'arrow-up',
    sortingDown: 'arrow-down',
    selectedSorting: 'sorting-selected',
    required: 'required',
    readonly: 'readonly',
    error: 'error',
    tableWidthAuto: 'grid-content-wrp_width-auto',
    dropdownRoot: 'js-dropdown__root',
    timeIcon: 'cell-time-icon__wrap',
    dateIcon: 'cell-date-icon__wrap'
};

export default {
    pageSize,
    contextTypes,
    columnTypes,
    getDefaultActions,
    classes,
    configurationConstants
};
