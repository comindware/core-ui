import template from './paging.hbs';
import Backbone from 'backbone';
import dropdown from 'dropdown';
import { pagingControlsTypes } from './meta';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize() {
        this.__updatePageControls();
    },

    className: 'dataset-footer',

    modelEvents: {
        'change:currentPage change:recordsPerPage': '__refreshControls',
        'change:recordsPerPage': '__changeRecordsPerPage'
    },

    ui: {
        firstButton: '.js-first-button',
        firstPageButton: '.js-first-page-button',
        previousButton: '.js-previous-button',
        prevPageButton: '.js-prevPage-button',
        doublePrevButton: '.js-doublePrev-button',
        currentPageButton: '.js-currentPage-button',
        nextPageButton: '.js-nextPage-button',
        doubleNextButton: '.js-doubleNext-button',
        nextButton: '.js-next-button',
        lastButton: '.js-last-button',
        lastPageButton: '.js-last-page-button'
    },

    events() {
        return {
            'click @ui.firstButton': () => this.__changeListPage(pagingControlsTypes.firstPage),
            'click @ui.firstPageButton': () => this.__changeListPage(pagingControlsTypes.firstPage),
            'click @ui.previousButton': () => this.__changeListPage(pagingControlsTypes.previousPage),
            'click @ui.prevPageButton': () => this.__changeListPage(pagingControlsTypes.previousPage),
            'click @ui.doublePrevButton': () => this.__changeListPage(pagingControlsTypes.twoPagesBefore),
            'click @ui.currentPageButton': () => this.__changeListPage(pagingControlsTypes.currentPage),
            'click @ui.nextPageButton': () => this.__changeListPage(pagingControlsTypes.nextPage),
            'click @ui.doubleNextButton': () => this.__changeListPage(pagingControlsTypes.twoPagesNext),
            'click @ui.nextButton': () => this.__changeListPage(pagingControlsTypes.nextPage),
            'click @ui.lastButton': () => this.__changeListPage(pagingControlsTypes.lastPage),
            'click @ui.lastPageButton': () => this.__changeListPage(pagingControlsTypes.lastPage)
        };
    },

    regions: {
        recordsPerPageRegion: {
            el: '.js-records-per-page-region',
            replaceElement: true
        }
    },

    onRender() {
        const recordsPerPageView = this.__createRecordsPerPageView();
        this.showChildView('recordsPerPageRegion', recordsPerPageView);
        this.listenTo(recordsPerPageView, 'execute', this.__proxyRecordsPerPageChange);
    },

    __proxyRecordsPerPageChange(data: string) {
        this.trigger('pagingView:change:recordsOnPage', data);
    },

    __changeListPage(pageFlag: string) {
        this.trigger('click:changeListPage', pageFlag);
    },

    __createRecordsPerPageView() {
        const menuItems = this.__getRecordsPerPageValuesList(this.model.get('recordsPerPageValues'));
        this.recordsPerPageCollection = new Backbone.Collection(menuItems);

        this.recordsPerPageModel = new Backbone.Model({
            text: this.__getRecordsPerPageText(this.model.get('recordsPerPage'))
        });

        return dropdown.factory.createMenu({
            buttonModel: this.recordsPerPageModel,
            items: this.recordsPerPageCollection,
            direction: 'up',
            popoutFlow: 'left'
        });
    },

    __changeRecordsPerPage() {
        this.recordsPerPageModel.set('text', this.__getRecordsPerPageText(this.model.get('recordsPerPage')));
    },

    __getRecordsPerPageText(value: number) {
        return `${Localizer.get('PROCESS.LISTS.LISTCONTEXT.PAGESIZE')}: <b>${isFinite(value) ? value.toString() : Localizer.get('PROCESS.LISTS.LISTCONTEXT.PAGESIZE.ALL')}</b>`;
    },

    __getRecordsPerPageValuesList(values: Array<number>) {
        return values.map((value: number) => ({
            id: value.toString(),
            name: isFinite(value) ? value.toString() : Localizer.get('PROCESS.LISTS.LISTCONTEXT.PAGESIZE.ALL')
        }));
    },

    __updateRecordsPerPageValues() {
        const menuItems = this.__getRecordsPerPageValuesList(this.model.get('recordsPerPageValues'));
        this.recordsPerPageCollection.reset(menuItems);
    },

    __refreshControls() {
        this.__updatePageControls();
        this.render();
    },

    __updatePageControls() {
        const naturalPage = this.model.get('currentPage') + 1;

        const bringToRange = (page: number) => {
            if (page < 1) {
                return 0;
            }
            if (page > this.model.pagesTotal()) {
                return 0;
            }
            return page;
        };

        const pageControls = {
            multiPage: this.model.pagesTotal() > 1,
            firstButton: true,
            previousButton: true,
            firstPage: naturalPage > 3 ? 1 : 0,
            hasPrevItems: naturalPage > 4,
            doublePrevPage: bringToRange(naturalPage - 2),
            prevPage: bringToRange(naturalPage - 1),
            currentPage: naturalPage,
            nextPage: bringToRange(naturalPage + 1),
            doubleNext: bringToRange(naturalPage + 2),
            hasPostItems: naturalPage + 3 < this.model.pagesTotal(),
            lastPage: naturalPage + 2 < this.model.pagesTotal() ? this.model.pagesTotal() : 0,
            nextButton: true,
            lastButton: true
        };

        this.model.set('pageControls', pageControls);
    }
});
