import ShowcaseContentView from './ShowcaseContentView';
import ShowcasePagingView from './ShowcasePagingView';
import template from './showcase.hbs';
import Backbone from 'backbone';
import PaginationModel from './PaginationModel';
import { pagingControlsTypes } from './meta';

const defaultOptions = {
    recordsPerPageValues: [6, 12, 24, Infinity],
    startPage: 0,
    ContentView: ShowcaseContentView,
    paginationView: null,
    toggleUI: true,
    isAutoFill: true,
    childWidth: 255,
    childMargins: 0
};

export default Marionette.View.extend({
    initialize() {
        _.defaults(this.options, defaultOptions);
        this.parentCollection = this.options.collection;
        this.collection = new Backbone.Collection();
        const { collection, ...contentViewOptions } = this.options;
        this.contentView = new this.options.ContentView({
            collection: this.collection,
            ...contentViewOptions
        });
        if (!this.options.isAutoFill) {
            this.recordsPerPageValues = this.options.recordsPerPageValues;
            this.recordsPerPage = this.recordsPerPageValues[0];
            this.__resetGroupByCollection();
            this.__resetCurrentCollection();
        } else {
            const resizeObserver = new ResizeObserver(this.__onResize.bind(this));
            resizeObserver.observe(this.el);
        }

        this.paginationModel = new PaginationModel({
            currentPage: this.options.startPage,
            recordsPerPage: this.options.recordsPerPageValues[0],
            recordsPerPageValues: this.options.recordsPerPageValues,
            recordsTotal: this.parentCollection.length,
            pageControls: null
        });
        this.paginationView = new ShowcasePagingView({ model: this.paginationModel });
        this.listenTo(this.paginationView, 'click:changeListPage', this.__switchPageTo);
        this.listenTo(this.paginationView, 'pagingView:change:recordsOnPage', this.__switchRecordsPerPage);
    },

    className: 'showcase-wrapper',

    regions: {
        content: {
            el: '.js-content-region',
            replaceElement: true
        },
        grouping: '.js-grouping-region',
        pagination: '.js-pagination'
    },

    template: Handlebars.compile(template),

    __onResize(entry: Array<ResizeObserverEntry>) {
        this.containerWidth = entry[0].contentRect.width;
        this.recordsPerPageValues = this.__countRecordsPerPageValues(this.containerWidth + this.options.childMargins * 2);

        if (this.containerWidth !== this.containerWidthOld && this.recordsPerPageValues[0] !== this.paginationModel.get('recordsPerPage')) {
            this.containerWidthOld = this.containerWidth;

            this.paginationModel.set({ recordsPerPage: this.recordsPerPageValues[0], recordsPerPageValues: this.recordsPerPageValues });
            if (this.paginationModel.get('currentPage') > this.paginationModel.pagesTotal() - 1) {
                this.paginationModel.set('currentPage', this.paginationModel.pagesTotal() - 1);
            }
            this.paginationView.__updateRecordsPerPageValues();
        }

        this.__resetCurrentCollection();
    },

    onRender() {
        this.showChildView('content', this.contentView);
        this.showChildView('pagination', this.paginationView);
    },

    __countRecordsPerPageValues(containerWidth: number) {
        const recordsPerPageCount = Math.floor(containerWidth / (this.options.childWidth + this.options.childMargins * 2));
        const recordsPerPageValues = [recordsPerPageCount, recordsPerPageCount * 2, recordsPerPageCount * 4, Infinity];
        return recordsPerPageValues;
    },

    __switchPageTo(pageType: string) {
        const newPageNumber = this.__getPageNumberFromEvent(pageType);

        if (this.paginationModel.get('currentPage') !== newPageNumber) {
            this.paginationModel.set({ currentPage: newPageNumber });
        }
        this.__resetCurrentCollection();
    },

    __getPageNumberFromEvent(pageType: string) {
        const currentPage = this.paginationModel.get('currentPage');
        const pagesTotal = this.paginationModel.pagesTotal();
        let nextPage;

        if (pagesTotal > 1) {
            switch (pageType) {
                case pagingControlsTypes.firstPage:
                    nextPage = 0;
                    break;
                case pagingControlsTypes.previousPage:
                    nextPage = currentPage - 1;
                    break;
                case pagingControlsTypes.twoPagesBefore:
                    nextPage = currentPage - 2;
                    break;
                case pagingControlsTypes.currentPage:
                    nextPage = currentPage;
                    break;
                case pagingControlsTypes.nextPage:
                    nextPage = currentPage + 1;
                    break;
                case pagingControlsTypes.twoPagesNext:
                    nextPage = currentPage + 2;
                    break;
                case pagingControlsTypes.lastPage:
                    nextPage = pagesTotal - 1;
                    break;
                default:
                    nextPage = currentPage;
                    break;
            }
        } else {
            nextPage = currentPage;
        }

        if (nextPage < 0) {
            nextPage = 0;
        } else if (nextPage > pagesTotal - 1) {
            nextPage = pagesTotal - 1;
        }

        return nextPage;
    },

    __switchRecordsPerPage(recordsPerPageValue: string) {
        this.paginationModel.set('currentPage', 0);
        this.paginationModel.set('recordsPerPage', Number(recordsPerPageValue));
        this.__resetCurrentCollection();
    },

    __getCurrentCollection() {
        const currentPage = this.paginationModel.get('currentPage');
        const recordsPerPage = this.paginationModel.get('recordsPerPage');

        return this.parentCollection.slice(currentPage * recordsPerPage, Math.min((currentPage + 1) * recordsPerPage, this.parentCollection.length));
    },

    __resetCurrentCollection() {
        this.collection.reset(this.__getCurrentCollection());
    }
});
