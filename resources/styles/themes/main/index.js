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
    'base-font-size': '12px',
    'line-height': '1.4',
    font: "normal var(--base-font-size)/var(--line-height) Arial, 'OpenSans', sans-serif",

    'form-field-margin': '10px',
    'form-label-font-size': '11px',
    'form-label-font-weight': '400',
    'form-label-color': 'var(--grey-800)',
    'form-label-margin': '2px',
    'form-label-padding': '0',
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
    'input-padding': '0 20px 0 0',
    'input-height': 'inherit',
    'input-hover-color': 'var(--grey-600)',
    'input-search-padding': '0 0 0 25px',
    'input-search-bg':
        'no-repeat 6px 50% transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAMJJREFUeNpinDlzJgMU2ANxERAbQ/lngbgPiA8yIAEmKF0BxPOBeAEQm0PxAqhYBbIGFqjJUUBsCMQfkeTWA/E+ID4MxEegGGxDCxDXoCmGgY9QuRZkJ+miuxMNgGwxQPcDIcCMrOEy1B+4gBM0xOAaYG7kx6IYJNYOVQPXAHL/MiA+D8SBQCwBxYFQMZBzkmHOgvmhA4gTgTgBqug8lJ0IDW5pIJ4D0sSCZP1BPKHlD8RbgHgRsaH0HYh9gPgXQIABAKFrJnBTJSNWAAAAAElFTkSuQmCC)',

    // textarea
    'textarea-padding': '0 0 2px',
    'textarea-line-height': 'inherit',
    'textarea-min-height': '26px',

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
    'radio-right-margin': '5px',
    'radio-checked-color': 'var(--blue-200)',
    'radio-inner-size': '6px',
    'radio-checked-disabled-color': 'var(--grey-800)',

    // grid
    'grid-toolbar-padding': '2px 0',
    'grid-toolbar-bg-color': 'var(--grey-100)',

    'grid-checkbox-size': '14px',
    'grid-checkbox-icon-size': '12px',
    'grid-header-font-size': 'var(--base-font-size)',
    'grid-header-color': 'var(--grey-900)',
    'grid-header-bg': 'transparent',
    'grid-header-border-color': 'var(--grey-400)',
    'grid-header-height': '20px',
    'grid-header-padding': '0 10px 0 2px',
    'grid-header-border': 'inset -1px -1px 0 0 var(--grid-header-border-color), inset 0 1px 0 0 var(--grid-header-border-color)',
    'grid-header-border-first': 'inset -1px -1px 0 0 var(--grid-header-border-color), inset 1px 1px 0 0 var(--grid-header-border-color)',
    'grid-header-border-last': 'var(--grid-header-border)',
    'grid-header-selection-bg': 'var(--grey-100)',

    'grid-cell-bg': 'var(--white)',
    'grid-cell-border': 'inset -1px -1px 0 0 var(--grid-header-border-color)',
    'grid-cell-border-first': 'inset -1px -1px 0 0 var(--grid-header-border-color), inset 1px 0 0 0 var(--grid-header-border-color)',
    'grid-cell-border-headless': 'inset -1px -1px 0 0 var(--grid-header-border-color), inset 0px 1px 0 0 var(--grid-header-border-color)',
    'grid-cell-border-first-headless': 'inset -1px -1px 0 0 var(--grid-header-border-color), inset 1px 1px 0 0 var(--grid-header-border-color)',
    'grid-cell-height': '25px',
    'grid-cell-padding': '0 2px',
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

    'grid-sort-icon-size': '11px',
    'grid-sort-icon-offset-y': '2px',
    'grid-sort-icon':
        'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozNDQ4NDJBRDQzQ0MxMUU0OTlENjlCNTY0NjYxODgwNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozNDQ4NDJBRTQzQ0MxMUU0OTlENjlCNTY0NjYxODgwNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjM0NDg0MkFCNDNDQzExRTQ5OUQ2OUI1NjQ2NjE4ODA3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjM0NDg0MkFDNDNDQzExRTQ5OUQ2OUI1NjQ2NjE4ODA3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+4m7sIQAAAKtJREFUeNqMkbENwkAMRe8o6KAlFbAAe4QMwAzZAJggrJARQAI6yB4sEEQTajqa8L7kk05RQHzpyTr72c354+nsLDPYQAYJNHCBHdwlDExM4QY5TGFoNbd+GuQ57GHk+qP+QZ7kLYw7gu9ZWEteuv+SSZ78uBi/E8nPqNFGgrd3SCP52rnWdmpIJbmA15eFEM0LyTWsehZiUfM6fEoFCyjhAW+rpfU1dx8BBgDWbSIkm9JfYQAAAABJRU5ErkJggg==)',

    'columns-select-border': 'var(--border)',
    'columns-select-cell-border': 'inset -1px -1px 0 0 var(--grey-400)',

    'dropdown-padding': 'var(--input-padding)',
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
    'tab-item-padding': '10px 0',
    'tab-item-font-size': '13px',
    'tab-panel-container-padding': '10px 5px',
    'tab-header-justify': 'space-between',
    'tab-header-padding-with-move': '0 20px',

    'btn-separator-width': '20px',

    'popup-window-bg': '#fff',
    'popup-content-padding': '0 20px',
    'popup-header-btn-font-size_equate': '42px',
    'system-message-font-size': '18px'
};

module.exports.variables = variables;

// postcss apply добавляет правила по очереди в начало (prepend), что бы не переопределить свойства которые присутствуют изначально, в связи с этим приходится писать свойства в обратном порядке если нам нужно сначала сбросить свойство, а потом добавить его частично(https://github.com/pascalduez/postcss-apply/issues/43)

module.exports.apply = {
    'absolute-center-theme': {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)'
    },
    'button-theme': {
        'font-size': '12px',
        padding: '4px 10px',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis',
        overflow: 'hidden',
        border: `1px solid ${variables['grey-400']}`,
        'border-radius': '2px'
    },
    'button-strong': {
        'background-color': variables['grey-100'],
        color: variables['text-color']
    },
    'button-pale': {
        'background-color': variables['text-color'],
        color: variables['grey-100']
    },
    'button-strong-hover-theme': {
        'border-color': variables['grey-600'],
        'box-shadow': 'inset 0 2px 3px #fff'
    },
    'button-strong-active-theme': {
        'border-color': variables['grey-800'],
        'box-shadow': 'inset 0 1px 5px rgba(180,180,180,.5)'
    },
    'button-pale-hover-theme': {
        'border-color': variables['grey-600'],
        'box-shadow': 'inset 0 2px 3px #fff'
    },
    'button-pale-active-theme': {
        'border-color': variables['grey-800'],
        'box-shadow': 'inset 0 1px 5px rgba(180,180,180,.5)'
    },
    'dropdown-theme': {
        'min-height': '20px'
    },
    'dropdown-caret-theme': {
        display: 'none'
    },
    'bubbles-item-theme': {
        color: variables['text-color'],
        margin: '0 2px 2px 0',
        'border-radius': '5px',
        padding: '2px 5px',
        transition: 'padding-right .2s'
    },
    'input-theme': {
        'border-bottom': `1px solid ${variables['grey-200']}`,
        border: '0',
        background: 'transparent none 100% 50% no-repeat',
        'line-height': variables['line-height']
    },
    'input-disabled-theme': {
        'border-bottom-color': 'transparent',
        background: 'none'
    },
    'input-search-clear-theme': {
        width: '26px',
        height: '26px',
        right: '0',
        opacity: '.8',
        background:
            'no-repeat 50% 50% url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHZJREFUeNpinDlzpj0DA0M7EPsD8WsGCBAF4i1AXMYEJLqA2BKId0ElQHgvEJuB5FiAhA9UwABKg4AuEF8GybFAjXWGSupCFVyGir1mYiAAmJDshBl7GcoGiYmyQF2ri2QsA5KGLSATKoH4FMxOJDedBckBBBgAX6IbvaqTe1UAAAAASUVORK5CYII=)'
    },
    'textarea-theme': {
        'border-bottom': `1px solid ${variables['grey-200']}`,
        border: '0'
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
        right: '0',
        top: '0',
        width: '16px',
        height: '16px'
    },
    'svg-icons-theme': {
        width: '20px',
        height: '20px',
        'pointer-events': 'none'
    },
    'tab-item-theme': {
        flex: '1 1'
    },
    'tab-item-active-theme': {
        color: variables['blue-200'],
        'border-bottom': `2px solid ${variables['blue-200']}`
    },
    'tab-item-error-theme': {
        color: variables.red,
        'border-bottom-color': variables.red
    },
    'tab-item-disabled-theme': {
        color: variables['grey-500'],
        'border-bottom-color': variables['grey-500']
    },
    'tab-item-hidden-theme': {
        dispay: 'none'
    },
    'tab-panel-container-theme': {},
    'tab-move-btn-theme': {
        width: '20px',
        right: '0',
        padding: '0 2px'
    },
    'tab-move-btn-prev-theme': {
        left: '0',
        right: 'auto'
    },
    'columns-select-list-theme': {},
    'columns-header-theme': {
        'font-size': '13px',
        'font-weight': '600',
        color: '#182026'
    },

    'toolbar-btn-theme': {},
    'toolbar-btn-low-theme': {
        'background-color': '#e1e1e1',
        'border-color': '#e1e1e1'
    },
    'toolbar-btn-low-hover-theme': {},
    'toolbar-btn-low-active-theme': {},

    'toolbar-btn-normal-theme': {
        'background-color': '#d7fdf4',
        'border-color': '#d7fdf4'
    },
    'toolbar-btn-normal-hover-theme': {},
    'toolbar-btn-normal-active-theme': {},

    'toolbar-btn-major-theme': {
        'background-color': '#d6f4fa',
        'border-color': '#d6f4fa'
    },
    'toolbar-btn-major-hover-theme': {},
    'toolbar-btn-major-active-theme': {},

    'toolbar-btn-critical-theme': {
        'background-color': '#f9f8c9',
        'border-color': '#f9f8c9'
    },
    'toolbar-btn-critical-hover-theme': {},
    'toolbar-btn-critical-active-theme': {},

    'toolbar-btn-fatal-theme': {
        'background-color': '#fbe2e2',
        'border-color': '#fbe2e2'
    },
    'toolbar-btn-fatal-hover-theme': {},
    'toolbar-btn-fatal-active-theme': {},

    'group-theme': {
        border: `1px solid ${variables['grey-600']}`,
        padding: '10px',
        'margin-top': '5px'
    },
    'group-head-theme': {
        height: '16px',
        'line-height': '16px',
        'max-width': 'calc(100% - 20px)',
        'background-color': '#fff',
        padding: '0 5px',
        position: 'absolute',
        top: '-8px'
    },
    'group-title-theme': {
        color: variables['grey-800'],
        cursor: 'pointer'
    },
    'group-content-theme': {},

    'popup-header-theme': {
        padding: '5px 40px',
        'font-size': '18px',
        color: variables['grey-800'],
        'text-align': 'center'
    },
    'popup-footer-theme': {
        padding: '7px',
        'background-color': variables['grey-100'],
        'border-top': `1px solid ${variables['grey-400']}`
    },
    'popup-close-theme': {
        'font-size': '35px',
        padding: '4px',
        position: 'absolute',
        right: '4px',
        top: '4px',
        border: '1px solid transparent',
        'border-radius': '2px'
    },
    'drop-zone-theme': {
        'background-color': variables['grey-100'],
        padding: '6px'
    },
    'drop-zone-active-theme': {
        'background-color': variables['grey-500']
    }
};
