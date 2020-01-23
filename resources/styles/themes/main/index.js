/*eslint-env node*/
const variables = {
    // colors
    white: '#ffffff',
    red: '#ba0c08',
    'blue-extra-light': '#eaf5fc',
    'blue-100': '#278ed9',
    'blue-200': '#0575bd',

    'grey-100': '#f3f3f3',
    'grey-200': '#edeff0',
    'grey-300': '#d2dbe2',
    'grey-400': '#dfe4e8',
    'grey-500': '#d3d5d6',
    'grey-600': '#b9bcbd',
    'grey-700': '#aab5be',
    'grey-800': '#70787F',
    'grey-900': '#838c92',

    'text-color': '#384650',
    'link-color': 'var(--blue-200)',
    'link-hover-color': 'var(--blue-100)',
    'main-color': 'var(--blue-200)',
    'error-color': 'var(--red)',
    'warning-color': '#ffda44',
    'selected-background-color': 'var(--blue-extra-light)',
    'disabled-text-color': 'var(--grey-400)',

    'border-color': 'var(--grey-400)',
    border: '1px solid #dfe4e8',
    'border-radius': '2px',

    focus: '1px solid var(--blue-200)',

    // font
    'base-font-size': '13px',
    'line-height': '1.3',
    font: "normal var(--base-font-size)/var(--line-height) 'OpenSans', Arial, sans-serif",

    'form-input-padding': '5px',

    'form-field-margin': '10px',
    'form-label-font-size': '12px',
    'form-label-font-weight': '600',
    'form-label-color': 'var(--grey-800)',
    'form-label-margin': '2px',
    'form-label-padding': '0 0 0 var(--form-input-padding)',
    'form-label-icon-size': '12px',
    'form-label-icon-margin-x': '3px',

    // form editor
    'editor-height': '20px',
    'editor-textarea-height': 'auto',
    'editor-line-height': '20px',
    'editor-textarea-line-height': '18px',
    'editor-font-size': 'var(--base-font-size)',
    'editor-text-color': 'var(--text-color)',
    'editor-empty-text-color': 'var(--grey-500)',

    // input
    'input-padding': '5px 18px 5px 5px',
    'input-height': 'inherit',
    'input-hover-color': 'var(--grey-600)',
    'input-search-padding': '2px 20px 2px 24px',
    'input-search-bg':
        'no-repeat 6px 50% transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAMJJREFUeNpinDlzJgMU2ANxERAbQ/lngbgPiA8yIAEmKF0BxPOBeAEQm0PxAqhYBbIGFqjJUUBsCMQfkeTWA/E+ID4MxEegGGxDCxDXoCmGgY9QuRZkJ+miuxMNgGwxQPcDIcCMrOEy1B+4gBM0xOAaYG7kx6IYJNYOVQPXAHL/MiA+D8SBQCwBxYFQMZBzkmHOgvmhA4gTgTgBqug8lJ0IDW5pIJ4D0sSCZP1BPKHlD8RbgHgRsaH0HYh9gPgXQIABAKFrJnBTJSNWAAAAAElFTkSuQmCC)',

    // textarea
    'textarea-padding': '3px 5px',
    'textarea-line-height': 'inherit',
    'textarea-min-height': '24px',

    // custom control
    'custom-control-spacer-y': '0',

    // checkbox
    'checkbox-size': '16px',
    'checkbox-radius': '2px',
    'checkbox-border-color': 'var(--grey-900)',
    'checkbox-intermediate-color': 'var(--blue-100)',
    'checkbox-intermediate-size': '8px',

    // radio
    'radio-size': '12px',
    'radio-margin': '0 5px 0 0',
    'radio-checked-color': 'var(--blue-200)',
    'radio-inner-size': '6px',
    'radio-checked-disabled-color': 'var(--grey-800)',

    // grid
    'grid-toolbar-padding': '2px 0',
    'grid-toolbar-bg-color': 'var(--grey-100)',

    'grid-checkbox-size': '14px',
    'grid-checkbox-icon-size': '12px',
    'grid-header-font-size': 'var(--base-font-size)',
    'grid-header-color': 'var(--white)',
    'grid-header-bg': 'var(--blue-200)',
    'grid-header-border-color': 'var(--grey-400)',
    'grid-header-height': '26px',
    'grid-header-padding': '0 10px 0 5px',
    'grid-header-border': 'inset -1px -1px 0 0 var(--grid-header-border-color), inset 0 1px 0 0 var(--grid-header-border-color)',
    'grid-header-border-last': 'var(--grid-header-border)',
    'grid-header-selection-bg': 'var(--grey-100)',

    'grid-cell-bg': 'var(--white)',
    'grid-cell-border': '1px solid var(--grid-header-border-color)',
    'grid-cell-border-first': 'inset -1px -1px 0 0 var(--grid-header-border-color), inset 1px 0 0 0 var(--grid-header-border-color)',
    'grid-cell-border-headless': 'inset -1px -1px 0 0 var(--grid-header-border-color), inset 0px 1px 0 0 var(--grid-header-border-color)',
    'grid-cell-border-first-headless': 'inset -1px -1px 0 0 var(--grid-header-border-color), inset 1px 1px 0 0 var(--grid-header-border-color)',
    'grid-cell-height': '25px',
    'grid-cell-padding': '0 5px',
    'grid-cell-size': '13px',
    'grid-cell-input-padding': '0 2px 0 0',
    'grid-dots-width': '30px',
    'grid-dots-padding': '0 25px 0 2px',
    'grid-dots-color': 'var(--grey-600)',
    'grid-row-selected-color': 'var(--blue-extra-light)',
    'grid-row-hover-color': 'var(--grey-100)',

    'grid-selection-color': 'var(--grey-900)',
    'grid-selection-width': '26px',
    'grid-selection-bg': 'var(--grid-cell-bg)',
    'grid-selection-index-width': '53px',
    'grid-selection-index-padding-x': '10px',
    'grid-selection-index-padding-checkbox': '21px',

    'grid-sort-icon-size': '11px',
    'grid-sort-icon-offset-y': '2px',

    'columns-select-border': 'var(--border)',
    'columns-select-cell-border': 'inset -1px -1px 0 0 var(--grey-400)',

    'dropdown-padding': '0 20px 1px var(--form-input-padding)',
    'dropdown-font-size': 'var(--base-font-size)',
    'dropdown-group-fontsize': '11px',
    'dropdown-group-color': '#000',
    'dropdown-item-padding': '5px 10px',
    'dropdown-item-checkbox-padding': '5px',
    'dropdown-item-hover-color': 'var(--grey-100)',
    'bubbles-item-delete-padding': '17px',
    'bubbles-item-edit-delete-padding': '38px',
    'bubbles-icon-offset-x': '1px',

    'collapse-icon':
        'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjlFRUI4RTM2NDk2NDExRThBMzI4OTMyMzI4MjYxQjJGIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjlFRUI4RTM3NDk2NDExRThBMzI4OTMyMzI4MjYxQjJGIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OUVFQjhFMzQ0OTY0MTFFOEEzMjg5MzIzMjgyNjFCMkYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OUVFQjhFMzU0OTY0MTFFOEEzMjg5MzIzMjgyNjFCMkYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz42Z48yAAAAeklEQVR42mL8//8/AzmAiYFMwILMYWRkxKsY2XW4bPwHxH0gs/CaAsNIIAyIfwDxSiBmx6oWh0YQcADi90C8H4gFSNEIAjpA/AiIL6NrJBSqIGeykeJHEHAG4k+kOjUKiH+SEzig6OhHjy5ktSzkpiiykxwjuYkcIMAA6W6BsPef8/UAAAAASUVORK5CYII=)',

    // tabs
    'tab-item-padding': '4px 15px',
    'tab-item-font-size': 'var(--base-font-size)',
    'tab-panel-container-padding': '20px 15px',
    'tab-header-justify': 'flex-start',

    'btn-separator-width': '20px',

    'popup-window-bg': '#fff',
    'popup-content-padding': '0 15px',
    'popup-header-btn-font-size_equate': '22px',
    'system-message-font-size': '15px'
};

module.exports.variables = variables;

// postcss apply добавляет правила по очереди в начало (prepend), что бы не переопределить свойства которые присутствуют изначально, в связи с этим приходится писать свойства в обратном порядке если нам нужно сначала сбросить свойство, а потом добавить его частично(https://github.com/pascalduez/postcss-apply/issues/43)

module.exports.apply = {
    'absolute-center-y-theme': {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)'
    },
    'relative-center-y-theme': {
        position: 'relative',
        'margin-top': 'auto',
        'margin-bottom': 'auto'
    },
    'button-theme': {
        'font-size': '12px',
        padding: '4px 10px',
        'white-space': 'nowrap',
        'text-overflow': 'clip',
        overflow: 'hidden',
        'border-radius': '4px',
        height: '28px'
    },
    'button-strong': {

    },
    'button-pale': {

    },
    'button-strong-hover-theme': {

    },
    'button-strong-active-theme': {

    },
    'button-pale-hover-theme': {

    },
    'button-pale-active-theme': {

    },
    'dropdown-theme': {
        'min-height': '20px'
    },
    'dropdown-caret-theme': {},
    'bubbles-item-theme': {

    },
    'input-theme': {

    },
    'input-disabled-theme': {

    },
    'input-search-clear-theme': {
        width: '20px',
        height: '20px',
        right: '0',
        top: '50%',
        'line-height': '21px',
        'font-size': '14px'
    },
    'textarea-theme': {

    },
    'custom-cotrol-disabled-theme': {
        filter: 'alpha(opacity=60)',
        opacity: '.6',
        cursor: 'auto'
    },
    'checkbox-theme': {
        'line-height': 'normal'
    },
    'checkbox-disabled-theme': {},
    'radio-disabled-theme': {},
    'svg-icon-wrp-theme': {
        right: '1px',
        top: '50%',
        width: '1em',
        height: '1em',
        'line-height': '1em',
        transform: 'translateY(-50%)'
    },
    'svg-icons-theme': {
        width: '1em',
        height: '1em',
        fill: 'currentColor',
        'pointer-events': 'none'
    },
    'tab-item-theme': {
        'min-height': '25px'
    },
    'tab-item-active-theme': {

    },
    'tab-item-error-theme': {

    },
    'tab-item-disabled-theme': {

    },
    'tab-item-hidden-theme': {

    },

    'tab-move-btn-prev-theme': {

    },
    'columns-select-list-theme': {},
    'columns-header-theme': {
        'font-size': '13px',
        'font-weight': '600',

    },

    'toolbar-btn-theme': {},
    'toolbar-btn-low-theme': {},
    'toolbar-btn-low-hover-theme': {},
    'toolbar-btn-low-active-theme': {},
    'toolbar-btn-normal-theme': {},
    'toolbar-btn-normal-hover-theme': {},
    'toolbar-btn-normal-active-theme': {},
    'toolbar-btn-major-theme': {},
    'toolbar-btn-major-hover-theme': {},
    'toolbar-btn-major-active-theme': {},
    'toolbar-btn-critical-theme': {},
    'toolbar-btn-critical-hover-theme': {},
    'toolbar-btn-critical-active-theme': {},
    'toolbar-btn-fatal-theme': {},
    'toolbar-btn-fatal-hover-theme': {},
    'toolbar-btn-fatal-active-theme': {},

    'group-theme': {
        padding: '5px 0',
        'margin-top': '5px'
    },
    'group-head-theme': {
        'max-width': 'calc(100% - 5px)',
        'font-size': '16px',
        'margin-bottom': '5px',
    },
    'group-title-theme': {
        'padding-left': '15px'
    },
    'group-content-theme': {
        padding: '10px'
    },

    'popup-header-theme': {
        'font-size': '16px',
        'font-weight': '600',
    },
    'popup-footer-theme': {
        padding: '10px',
    },
    'popup-close-theme': {},
    'drop-zone-theme': {
        padding: '6px'
    },
    'drop-zone-active-theme': {}
};
