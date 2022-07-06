export const contextTypes = {
    void: 'void',
    any: 'any',
    one: 'one'
};

export const getDefaultActions = () => [
    {
        id: 'add',
        name: Localizer.get('CORE.GRID.ACTIONS.CREATE'),
        iconClass: 'plus',
        contextType: contextTypes.void
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
    getDefaultActions,
    classes,
    configurationConstants
};
