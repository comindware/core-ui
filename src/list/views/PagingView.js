import template from '../templates/paging.html';
import { pageSize, pagingControlsTypes } from '../meta';

export default Marionette.View.extend({
    initialize() {
        this.model.set('pageControls', this.__getPageControlsConfig());
    },

    updateView(newModel) {
        this.model.set(newModel.attributes);
        this.__updatePagination();
    },

    setSelectedRowsCount(count) {
        this.view.model.set('selectedRowsCount', count);
        this.view.render();
    },

    template: Handlebars.compile(template),

    className: 'dataset-footer',

    events() {
        return {
            'click .js-first-button': () => this.__switchPageTo(pagingControlsTypes.firstPage),
            'click .js-first-page-button': () => this.__switchPageTo(pagingControlsTypes.firstPage),
            'click .js-previous-button': () => this.__switchPageTo(pagingControlsTypes.previousPage),
            'click .js-prevPage-button': () => this.__switchPageTo(pagingControlsTypes.previousPage),
            'click .js-doublePrev-button': () => this.__switchPageTo(pagingControlsTypes.twoPagesBefore),
            'click .js-currentPage-button': () => this.__switchPageTo(pagingControlsTypes.currentPage),
            'click .js-nextPage-button': () => this.__switchPageTo(pagingControlsTypes.nextPage),
            'click .js-doubleNext-button': () => this.__switchPageTo(pagingControlsTypes.twoPagesNext),
            'click .js-next-button': () => this.__switchPageTo(pagingControlsTypes.nextPage),
            'click .js-last-button': () => this.__switchPageTo(pagingControlsTypes.lastPage),
            'click .js-last-page-button': () => this.__switchPageTo(pagingControlsTypes.lastPage)
        };
    },

    regions: {
        recordsPerPageRegion: '.js-records-per-page-region'
    },

    onRender() {
        const recordsPerPageView = this.__createRecordsPerPageView();

        this.showChildView('recordsPerPageRegion', recordsPerPageView);
        this.listenTo(recordsPerPageView, 'execute', this.__switchRecordsOnPage);
    },

    __createRecordsPerPageView() {
        const menuItems = Object.entries(pageSize).map(entrie => ({
            id: entrie[0],
            name: entrie[1]
        }));

        const sizeSelected = menuItems.find(num => num.id === this.model.get('size').toString());

        return Core.dropdown.factory.createMenu({
            text: `${Localizer.get('PROCESS.LISTS.LISTCONTEXT.PAGESIZE')}: ${sizeSelected.name}`,
            items: menuItems,
            direction: 'up',
            popoutFlow: 'left'
        });
    },

    __getPageControlsConfig() {
        const currentPageSize = +this.model.get('size');
        this.currentPage = this.model.get('page') || 1;

        if (isNaN(currentPageSize) || currentPageSize === 0 || this.model.get('totalRowsCount') === 0) {
            this.pageCount = 1;
        } else {
            this.pageCount = Math.ceil(this.model.get('totalRowsCount') / currentPageSize);
        }

        const countCurrentPageDiff = this.pageCount - this.currentPage;

        const pageControlsConfig = {
            currentPage: this.currentPage,
            firstPage: null,
            prevPage: null,
            doublePrevPage: null,
            nextPage: null,
            doubleNext: null,
            lastPage: null,
            hasPrevItems: false,
            hasPostItems: false
        };

        if (countCurrentPageDiff >= 0) {
            switch (this.currentPage) {
                case 1:
                    break;
                case 4:
                    pageControlsConfig.doublePrevPage = this.currentPage - 2;
                case 3:
                    pageControlsConfig.prevPage = this.currentPage - 1;
                case 2:
                    pageControlsConfig.firstPage = 1;
                    break;
                default:
                    pageControlsConfig.firstPage = 1;
                    pageControlsConfig.prevPage = this.currentPage - 1;
                    pageControlsConfig.doublePrevPage = this.currentPage - 2;
                    pageControlsConfig.hasPrevItems = true;
                    break;
            }

            switch (countCurrentPageDiff) {
                case 0:
                    break;
                case 3:
                    pageControlsConfig.doubleNext = this.currentPage + 2;
                case 2:
                    pageControlsConfig.nextPage = this.currentPage + 1;
                case 1:
                    pageControlsConfig.lastPage = this.pageCount;
                    break;
                default:
                    pageControlsConfig.lastPage = this.pageCount;
                    pageControlsConfig.nextPage = this.currentPage + 1;
                    pageControlsConfig.doubleNext = this.currentPage + 2;
                    pageControlsConfig.hasPostItems = true;
                    break;
            }
        }

        this.lastPage = this.pageCount;

        return pageControlsConfig;
    },

    __switchRecordsOnPage(menuItemId) {
        this.model.set({ size: menuItemId });
        this.trigger('paging:change:size');
    },

    __switchPageTo(pageType) {
        const newPageNumber = this.__getPageNumberFromEvent(pageType);

        if (this.model.get('page') !== newPageNumber) {
            this.model.set({ page: newPageNumber });
            this.trigger('paging:change:page');
        }
    },

    __updatePagination() {
        this.view.model.set('pageControls', this.__getPageControlsConfig());
        this.view.render();
    },

    __getPageNumberFromEvent(pageType) {
        let nextPage;

        if (this.pageCount > 1) {
            switch (pageType) {
                case pagingControlsTypes.firstPage:
                    nextPage = 1;
                    break;
                case pagingControlsTypes.previousPage:
                    nextPage = this.currentPage - 1;
                    break;
                case pagingControlsTypes.twoPagesBefore:
                    nextPage = this.currentPage - 2;
                    break;
                case pagingControlsTypes.currentPage:
                    nextPage = this.currentPage;
                    break;
                case pagingControlsTypes.nextPage:
                    nextPage = this.currentPage + 1;
                    break;
                case pagingControlsTypes.twoPagesNext:
                    nextPage = this.currentPage + 2;
                    break;
                case pagingControlsTypes.lastPage:
                    nextPage = this.lastPage;
                    break;
                default:
                    nextPage = this.currentPage;
                    break;
            }
        } else {
            nextPage = this.currentPage;
        }

        if (nextPage < 1) {
            nextPage = 1;
        } else if (nextPage > this.lastPage) {
            nextPage = this.lastPage;
        }

        return nextPage;
    }
});
