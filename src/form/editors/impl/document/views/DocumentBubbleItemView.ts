import dropdown from 'dropdown';
import template from '../templates/documentBubbleItem.html';
import DocumentItemController from '../controllers/DocumentItemController';
import ExtensionIconService from '../services/ExtensionIconService';
import TooltipPanelView from './TooltipPanelView';
import { documentRevisionStatuses } from '../meta';
import LocalizationService from 'services/LocalizationService';

const classes = {
    selected: 'document-item_selected'
};

const tooltipButtonTemplate = `
    <span class="document-item__tooltip-btn" title="{{localize 'CORE.FORM.EDITORS.DOCUMENT.ACTIONS'}}">
        <i class="{{iconPrefixer 'ellipsis-v'}}"></i>
    </span>
`;

const tooltipButtonView = Marionette.View.extend({
    template: Handlebars.compile(tooltipButtonTemplate)
});

const actions = {
    DOWNLOAD: 'download',
    REMOVE: 'remove'
};

export default Marionette.View.extend({
    initialize(options: { attachmentsController: any }) {
        const controller = new DocumentItemController({ view: this });
        this.reqres = controller.reqres;
        this.readonly = this.options.readonly;
        this.allowDelete = this.options.allowDelete;
        this.showRevision = this.options.showRevision;
        this.attachmentsController = options.attachmentsController;
        this.listenTo(this.model, 'attachments:download', this.__download);
    },

    regions: {
        tooltipButtonRegion: '.js-btn-tooltip-region'
    },

    tagName: 'li',
    className() {
        const status = this.model.get('status');
        let className = 'document-item l-list__item';

        if (status === documentRevisionStatuses.REJECTED) {
            className += ' document-item_rejected';
        }
        if (status === documentRevisionStatuses.PROCESSING) {
            className += ' document-item_processing';
        }

        return className;
    },

    template: Handlebars.compile(template),

    templateContext() {
        const { text, name, isLoading, extension, embeddedType, status } = this.model.toJSON();
        let statusTitle = '';
        if (this.model.get('status') === documentRevisionStatuses.REJECTED) {
            statusTitle = LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.STATUSES.REJECTED');
        }
        if (this.model.get('status') === documentRevisionStatuses.PROCESSING) {
            statusTitle = LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.STATUSES.PROCESSING');
        }
        return {
            text: text || name,
            icon: ExtensionIconService.getIconForDocument({ isLoading, extension, name, status }),
            isInline: this.options.isInline && embeddedType,
            statusTitle
        };
    },
    ui: {
        remove: '.js-delete-button',
        link: '.js-link',
        downloadButton: '.js-download-button',
        edit: '.js-document-edit-btn'
    },

    triggers: {
        'click @ui.remove': 'remove'
    },

    events: {
        'click @ui.link': '__onLinkClick'
    },

    modelEvents: {
        'change:isLoading': 'render'
    },

    onRender() {
        const tooltipView = new dropdown.factory.createDropdown({
            buttonView: tooltipButtonView,
            buttonViewOptions: {
                model: new Backbone.Model()
            },
            panelView: TooltipPanelView,
            panelViewOptions: {
                collection: new Backbone.Collection(),
                clickHandler: (actionId: string) => tooltipView.trigger('item:execute', actionId),
                reqres: this.reqres,
                model: this.model,
                readonly: this.readonly,
                allowDelete: this.allowDelete,
                editorHasHistory: this.showRevision
            },
            panelOffsetLeft: -171,
            panelMinWidth: '180px',
            autoOpen: true
        });
        this.showChildView('tooltipButtonRegion', tooltipView);
        tooltipView.on('item:execute', (actionId: string) => {
            switch (actionId) {
                case actions.DOWNLOAD:
                    this.__isDownload = true;
                    this.ui.link.get(0).click();
                    break;
                case actions.REMOVE:
                    this.model.trigger('attachments:remove', this.model);
                    break;
                default:
                    break;
            }
        });
        tooltipView.on('open', () => {
            this.$el.addClass(classes.selected);
        });
        tooltipView.on('close', () => {
            this.$el.removeClass(classes.selected);
        });
    },

    __onLinkClick(linkDownloadEvent: MouseEvent) {
        if (this.__isDownload) {
            this.__isDownload = false;
            this.__executeDownload(linkDownloadEvent);
            return;
        }

        if (this.attachmentsController.isModelHasPreview(this.model)) {
            this.attachmentsController.showGallery(this.model);
            linkDownloadEvent.preventDefault();
        } else {
            this.__executeDownload(linkDownloadEvent);
        }
    },

    __executeDownload(linkDownloadEvent: MouseEvent) {
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(this.model.get('file'), this.model.get('name'));
            linkDownloadEvent.preventDefault();
        }
    }
});
