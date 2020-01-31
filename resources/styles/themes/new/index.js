/*eslint-env node*/
const utils = require('../utils');

const icons = {
    arrowIcon:
        "data:image/svg+xml,%3Csvg fill='{{fill}}' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath d='M413.1 222.5l22.2 22.2c9.4 9.4 9.4 24.6 0 33.9L241 473c-9.4 9.4-24.6 9.4-33.9 0L12.7 278.6c-9.4-9.4-9.4-24.6 0-33.9l22.2-22.2c9.5-9.5 25-9.3 34.3.4L184 343.4V56c0-13.3 10.7-24 24-24h32c13.3 0 24 10.7 24 24v287.4l114.8-120.5c9.3-9.8 24.8-10 34.3-.4z'/%3E%3C/svg%3E",
    angleRight:
        "data:image/svg+xml,%3Csvg fill='{{fill}}' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 512'%3E%3Cpath d='M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z'/%3E%3C/svg%3E"
};

const variables = {
    // colors
    white: '#ffffff',
    black: '#313131',
    red: '#e1462c!important',
    'red-dark': '#d63a1f',

    'grey-50': '#f9f9f9',
    'grey-100': '#f5f5f5',
    'grey-200': '#efefef',
    'grey-300': '#e2e2e2',
    'grey-400': '#c1c1c1',

    'blue-100': '#d6e7f2',
    'blue-200': '#90c3eb',
    'blue-300': '#0575bd',
    'blue-400': '#04619d',
    'text-color': '#404040',
    'link-color': 'var(--blue-300)',
    'link-hover-color': 'var(--blue-200)',
    'main-color': 'var(--blue-300)',
    'error-color': 'var(--red)',
    'warning-color': '#e19e35',
    'selected-background-color': 'var(--grey-100)',
    'disabled-text-color': 'var(--grey-400)',
    'icon-remove': 'var(--grey-400)',

    'convex-gradient': 'linear-gradient(#ffffff 35%, #e9e9e9)',
    'concave-gradient': 'linear-gradient(#e2e2e2 35%, #ffffff)',

    'border-color': 'var(--grey-400)',
    'border-radius': '4px',
    'border-radius-big': '5px',
    border: '1px solid #c1c1c1',

    focus: '1px solid var(--blue-300)',

    // font
    'base-font-size': '14px',
    'line-height': '1.4',
    font: "normal var(--base-font-size)/var(--line-height) 'OpenSans', Arial, sans-serif",

    'form-input-padding': '10px',

    'form-field-margin': '15px',
    'form-label-font-size': 'var(--base-font-size)',
    'form-label-font-weight': '600',
    'form-label-color': 'var(--black)',
    'form-label-margin': '8px',
    'form-label-padding': '0 0 0 var(--form-input-padding)',
    'form-label-icon-size': '14px',
    'form-label-icon-margin-x': '5px',

    // form editor
    'editor-font-size': 'inherit',
    'editor-text-color': 'var(--text-color)',
    'editor-empty-text-color': 'rgba(0,0,0,.3)',

    // input
    'input-padding': '4px 20px 4px var(--form-input-padding)',
    'input-height': 'auto',
    'input-active-border-color': 'var(--blue-300)',
    'input-error-color': 'var(--red)',
    'input-search-padding': '4px 20px 4px 25px',
    'input-search-bg':
        'no-repeat 6px 50% transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAMJJREFUeNpinDlzJgMU2ANxERAbQ/lngbgPiA8yIAEmKF0BxPOBeAEQm0PxAqhYBbIGFqjJUUBsCMQfkeTWA/E+ID4MxEegGGxDCxDXoCmGgY9QuRZkJ+miuxMNgGwxQPcDIcCMrOEy1B+4gBM0xOAaYG7kx6IYJNYOVQPXAHL/MiA+D8SBQCwBxYFQMZBzkmHOgvmhA4gTgTgBqug8lJ0IDW5pIJ4D0sSCZP1BPKHlD8RbgHgRsaH0HYh9gPgXQIABAKFrJnBTJSNWAAAAAElFTkSuQmCC)',

    // textarea
    'textarea-padding': '4px 20px 4px 10px',
    'textarea-line-height': 'inherit',
    'textarea-min-height': '29px',

    // custom control
    'custom-control-spacer-y': '10px',

    // checkbox
    'checkbox-size': '18px',
    'checkbox-checked-color': 'var(--blue-300)',
    'checkbox-border-color': 'var(--border-color)',
    'checkbox-radius': 'var(--border-radius)',
    'checkbox-intermediate-color': 'var(--blue-300)',
    'checkbox-intermediate-size': '10px',

    // radio
    'radio-size': 'var(--checkbox-size)',
    'radio-margin': '0 10px 0 0',
    'radio-checked-color': 'var(--checkbox-checked-color)',
    'radio-inner-size': '10px',
    'radio-checked-disabled-color': 'var(--grey-400)',
    'radio-margin_reduced': '5px 0',

    // grid
    'grid-toolbar-padding': '10px 6px 10px 0',
    'grid-toolbar-bg-color': 'transparent',

    'grid-checkbox-size': '16px',
    'grid-checkbox-icon-size': '12px',
    'grid-header-font-size': 'var(--base-font-size)',
    'grid-header-color': 'var(--white)',
    'grid-header-bg': 'var(--blue-300)',
    'grid-header-border-color': 'var(--grid-header-bg)',
    'grid-header-height': '35px',
    'grid-header-padding': '0 15px',
    'grid-header-border': 'inset -1px 0 0 0 var(--blue-200), inset 0 1px 0 0 var(--grid-header-border-color)',
    'grid-header-border-last': 'inset -1px -1px 0 0 var(--grid-header-border-color), inset 0 1px 0 0 var(--grid-header-border-color)',
    'grid-header-selection-bg': 'var(--grid-header-bg)',

    'grid-cell-bg': 'var(--white)',
    'grid-cell-border': 'inset -1px -1px 0 0 var(--grey-300)',
    'grid-cell-border-first': 'inset -1px -1px 0 0 var(--grey-300), inset 1px 0 0 0 var(--grey-300)',
    'grid-cell-border-headless': 'inset -1px -1px 0 0 var(--grey-300), inset 0px 1px 0 0 var(--grey-300)',
    'grid-cell-border-first-headless': 'inset -1px -1px 0 0 var(--grey-300), inset 1px 1px 0 0 var(--grey-300)',
    'grid-cell-height': '34px',
    'grid-cell-padding': '0 15px',
    'grid-cell-size': '13px',
    'grid-cell-input-padding': '0',
    'grid-row-selected-color': 'var(--blue-100)',
    'grid-row-hover-color': 'var(--grid-row-selected-color)',

    'grid-selection-color': 'var(--grey-400)',
    'grid-selection-width': '50px',
    'grid-selection-bg': 'var(--grid-cell-bg)',
    'grid-selection-index-width': '58px',
    'grid-selection-index-padding-x': '10px',
    'grid-selection-index-padding-checkbox': '21px',

    'grid-dots-width': 'var(--grid-selection-index-width)',
    'grid-dots-padding': '0 20px 0 4px',
    'grid-dots-color': 'var(--blue-200)',

    'grid-sort-icon-size': 'var(--base-font-size)',
    'grid-sort-icon-offset-y': '1px',

    'columns-select-border': '0',

    'dropdown-padding': '2px 20px 2px var(--form-input-padding)',
    'dropdown-font-size': 'var(--base-font-size)',
    'dropdown-group-fontsize': '12px',
    'dropdown-group-color': 'var(--black)',
    'dropdown-item-padding': '8px 20px',
    'dropdown-item-checkbox-padding': '10px',
    'dropdown-item-hover-color': 'var(--blue-100)',
    'bubbles-item-delete-padding': '0',
    'bubbles-item-edit-delete-padding': '20px',
    'bubbles-icon-offset-x': '5px',

    'collapse-icon-header': `url(${utils.buildIcon(icons.angleRight, 'var(--white)')})`,
    'collapse-icon': `url(${utils.buildIcon(icons.angleRight, 'var(--text-color)')})`,

    // tabs
    'tab-item-padding': '4px 15px',
    'tab-item-font-size': 'var(--base-font-size)',
    'tab-panel-container-padding': '20px 15px',
    'tab-header-justify': 'flex-start',

    'btn-separator-width': '15px',

    'popup-window-bg': 'var(--grey-100)',
    'popup-content-padding': '0 15px',
    'popup-header-btn-font-size_equate': '22px',
    'system-message-font-size': '15px'
};

module.exports.variables = variables;

module.exports.apply = {
    'absolute-center-y-theme': {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)'
    },
    'button-theme': {
        'vertical-align': 'middle',
        cursor: 'pointer',
        'font-size': '15px',
        padding: '3px 15px',
        'border-radius': '4px'
    },
    'button-strong': {
        'background-color': variables['blue-300'],
        color: variables['blue-100'],
        border: `1px solid ${variables['blue-300']}`
    },
    'button-pale': {
        'background-color': variables.white,
        color: variables['blue-300'],
        border: `1px solid ${variables['grey-400']}`
    },
    'button-strong-hover-theme': {
        'background-color': variables['blue-400'],
        'border-color': variables['blue-400']
    },
    'button-strong-active-theme': {
        'border-color': variables['blue-400'],
        'background-color': variables['blue-400'],
        'box-shadow': 'inset 0 3px 5px rgba(0,0,0,.125)'
    },
    'button-pale-hover-theme': {
        'background-color': variables['grey-400'],
        'border-color': variables['grey-400']
    },
    'button-pale-active-theme': {
        'border-color': variables['grey-400'],
        'background-color': variables['grey-400'],
        'box-shadow': 'inset 0 3px 5px rgba(0,0,0,.125)'
    },
    'button-outline-theme': {
        'background-color': variables.white,
        'border-color': variables['grey-400'],
        color: variables['blue-300']
    },
    'button-outline-hover-theme': {
        color: variables['blue-400']
    },
    'button-outline-active-theme': {
        color: variables['blue-400'],
        'box-shadow': 'inset 0 3px 5px rgba(0,0,0,.125)'
    },
    'button-icon-theme': {
        width: '30px',
        'min-width': '30px',
        height: '30px',
        padding: '3px 0',
        'text-align': 'center'
    },
    'dropdown-theme': {
        background: variables['convex-gradient']
    },
    'dropdown-caret-theme': {
        'font-size': '16px',
        right: '6px',
        color: variables['blue-300']
    },
    'bubbles-item-theme': {
        color: variables['text-color']
    },
    'bubbles-item-theme-hover': {
        padding: '2px 20px 2px 0'
    },
    'input-theme': {
        border: variables.border,
        'background-color': variables.white,
        'border-radius': '4px'
    },
    'input-disabled-theme': {
        'background-color': 'transparent',
        'border-color': 'transparent'
    },
    'cell-input-disabled-theme': {
        'background-color': 'transparent'
    },
    'input-search-clear-theme': {
        width: '22px',
        height: '29px',
        opacity: '.8',
        right: '0',
        top: '10px',
        'font-size': '16px',
        'text-align': 'center'
    },
    'textarea-theme': {
        border: variables.border,
        'border-radius': '4px',
        'line-height': '1.5'
    },
    'custom-cotrol-disabled-theme': {
        cursor: 'default'
    },
    'checkbox-theme': {
        display: 'flex',
        'flex-shrink': '0',
        'align-items': 'center',
        'justify-content': 'center'
    },
    'checkbox-disabled-theme': {
        color: variables['grey-400'],
        'border-color': variables['grey-400'],
        background: variables['grey-300']
    },
    'radio-disabled-theme': {
        background: variables['grey-300']
    },
    'svg-icon-wrp-theme': {
        right: '5px',
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
        border: variables.border,
        color: variables['text-color'],
        position: 'relative',
        'z-index': '1',
        'background-color': variables['grey-100'],
        'margin-right': '5px',
        'margin-bottom': '0px',
        'border-radius': '4px 4px 0 0',
        flex: '0 0 auto',
        'min-height': '30px'
    },
    'tab-item-active-theme': {
        'background-color': variables.white,
        'border-bottom-color': variables.white
    },
    'tab-item-error-theme': {
        color: variables.red,
        'border-top-color': variables.red,
        'border-right-color': variables.red,
        'border-left-color': variables.red
    },
    'tab-item-disabled-theme': {
        color: variables['grey-400'],
        cursor: 'default'
    },
    'tab-item-hidden-theme': {
        display: 'none'
    },
    'tab-panel-container-theme': {
        border: variables.border,
        'background-color': variables.white,
        'border-radius': '0 0 4px 4px'
    },
    'tab-move-btn-theme': {
        right: '0',
        padding: '4px',
        display: 'flex',
        transform: 'rotate(-90deg)'
    },
    'tab-move-btn-prev-theme': {
        left: '0',
        right: 'auto',
        transform: 'rotate(90deg)'
    },
    'columns-select-list-theme': {
        'background-color': variables.white,
        padding: '10px 9px 10px 15px',
        border: variables.border,
        'border-radius': '0 4px 4px 4px'
    },
    'columns-header-theme': {
        'font-size': variables['base-font-size'],
        'font-weight': variables['form-label-font-weight'],
        color: variables.black,
        'margin-bottom': variables['form-label-margin']
    },
    'toolbar-btn-theme': {
        'margin-right': '5px'
    },
    'toolbar-btn-low-theme': {
        'background-color': '#e1e1e1',
        'border-color': '#e1e1e1',
        color: 'black'
    },
    'toolbar-btn-low-hover-theme': {
        'background-color': '#e1e1e1',
        'border-color': '#e1e1e1',
        color: 'black'
    },
    'toolbar-btn-low-active-theme': {
        'background-color': '#e1e1e1',
        'border-color': '#e1e1e1',
        color: 'black'
    },

    'toolbar-btn-normal-theme': {
        'background-color': '#d7fdf4',
        'border-color': '#d7fdf4',
        color: 'black'
    },
    'toolbar-btn-normal-hover-theme': {
        'background-color': '#d7fdf4',
        'border-color': '#d7fdf4',
        color: 'black'
    },
    'toolbar-btn-normal-active-theme': {
        'background-color': '#d7fdf4',
        'border-color': '#d7fdf4',
        color: 'black'
    },

    'toolbar-btn-major-theme': {
        color: variables.white,
        'background-color': variables['warning-color'],
        'border-color': variables['warning-color']
    },
    'toolbar-btn-major-hover-theme': {
        'background-color': '#de9621',
        'border-color': '#de9621'
    },
    'toolbar-btn-major-active-theme': {
        'background-color': '#de9621',
        'border-color': '#de9621'
    },

    'toolbar-btn-critical-theme': {
        color: variables.white,
        'background-color': '#e1742c',
        'border-color': '#e1742c'
    },
    'toolbar-btn-critical-hover-theme': {
        'background-color': '#d6681f',
        'border-color': '#d6681f'
    },
    'toolbar-btn-critical-active-theme': {
        'background-color': '#d6681f',
        'border-color': '#d6681f'
    },

    'toolbar-btn-fatal-theme': {
        color: variables.white,
        'background-color': variables.red,
        'border-color': variables.red
    },
    'toolbar-btn-fatal-hover-theme': {
        'background-color': variables['red-dark'],
        'border-color': variables['red-dark']
    },
    'toolbar-btn-fatal-active-theme': {
        'background-color': variables['red-dark'],
        'border-color': variables['red-dark']
    },

    'group-theme': {},
    'group-head-theme': {
        'font-size': '18px',
        'font-weight': '700',
        'margin-bottom': '15px',
        'align-items': 'center'
    },
    'group-title-theme': {
        'padding-left': '20px'
    },
    'group-content-theme': {
        padding: '20px',
        'border-radius': '4px',
        'background-color': variables['grey-50']
    },

    'popup-header-theme': {
        padding: '15px',
        'font-size': '18px',
        'font-weight': '600',
        display: 'flex',
        'align-items': 'center',
        flex: 'none'
    },
    'popup-footer-theme': {
        padding: '15px'
    },
    'popup-close-theme': {
        'font-size': '17px' //if icons style = solid, then 19px
    },
    'popup-form-content-theme': {
        padding: '15px',
        'background-color': variables.white,
        'border-radius': variables['border-radius-big'],
        'overflow-y': 'auto',
        flex: '1'
    },
    'drop-zone-theme': {
        'background-color': variables['grey-100'],
        padding: '6px'
    },
    'drop-zone-active-theme': {
        'background-color': variables['blue-100']
    }
};
