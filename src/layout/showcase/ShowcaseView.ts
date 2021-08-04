import ShowcaseContentView from './ShowcaseContentView';
import DatalistEditorView from '../../form/editors/DatalistEditorView';
import template from './showcase.hbs';
import Backbone from 'backbone';

const defaultOptions = {
    groupBy: [3, 6, 10, Infinity],
    startPage: 0,
    ContentView: ShowcaseContentView,
    toggleUI: true,
    isAutoFill: true,
    childWidth: 240
};

const MIN_MARGIN = 5;

export default Marionette.View.extend({
    initialize() {
        _.defaults(this.options, defaultOptions);
        this.parentCollection = this.options.collection;
        this.currentPage = this.options.startPage;
        this.collection = new Backbone.Collection();
        const { collection, ...contentViewOptions } = this.options;
        this.contentView = new this.options.ContentView({
            collection: this.collection,
            ...contentViewOptions
        });
        if (!this.options.isAutoFill) {
            this.groupByArray = this.options.groupBy;
            this.currentPaging = this.groupByArray[0];
            this.__resetGroupByCollection();
            this.__resetCurrentCollection();
        } else {
            const resizeObserver = new ResizeObserver(this.__onResize.bind(this));
            resizeObserver.observe(this.el);
        }
        this.groupingModel = new Backbone.Model({ groupBy: this.currentPaging });
        this.groupByCollection = new Backbone.Collection();
        this.groupingView = new DatalistEditorView({
            key: 'groupBy',
            collection: this.groupByCollection,
            allowEmptyValue: false,
            autocommit: true,
            valueType: 'id',
            model: this.groupingModel
        });
        this.listenTo(this.groupingModel, 'change:groupBy', this.__onChangeGroupBy);
    },

    className: 'showcase-wrapper',

    regions: {
        content: {
            el: '.js-content-region',
            replaceElement: true
        },
        grouping: '.js-grouping-region'
    },

    ui: {
        arrowLeft: '.js-left-arrow',
        arrowRight: '.js-right-arrow'
    },

    events: {
        'click @ui.arrowLeft': '__onLeftArrowClick',
        'click @ui.arrowRight': '__onRightArrowClick'
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            totalCount: this.parentCollection.length
        };
    },

    __onResize(entry: Array<ResizeObserverEntry>) {
        const newContainerWidth = entry[0].contentRect.width;
        if (newContainerWidth === 0 || Math.abs(newContainerWidth - this.containerWidth) < MIN_MARGIN + this.options.childWidth) {
            this.containerWidth = newContainerWidth;
            return;
        }
        this.containerWidth = newContainerWidth;
        this.__countGroupByArray(this.containerWidth);
        this.currentPaging = this.groupByArray[0];
        this.__resetGroupByCollection();
        this.groupingModel.set({ groupBy: this.currentPaging });
        this.__resetCurrentCollection();
    },

    onRender() {
        this.__inactivateArrows();
        this.showChildView('content', this.contentView);
        this.showChildView('grouping', this.groupingView);
    },

    __resetGroupByCollection() {
        this.groupByCollection.reset(this.__getGroupByCollection());
    },

    __countGroupByArray(containerWidth: number) {
        const firstEl = Math.floor(containerWidth / (this.options.childWidth + 2 * MIN_MARGIN));
        this.groupByArray = [firstEl, firstEl * 2, firstEl * 4, Infinity];
    },

    __onChangeGroupBy(model: Backbone.Model) {
        this.currentPage = 0;
        this.currentPaging = model.get('groupBy');
        this.__inactivateArrows();
        this.__resetCurrentCollection();
    },

    __getGroupByCollection() {
        return this.groupByArray.map((n: number) => ({ id: n, name: n === Infinity ? Localizer.get('CORE.LAYOUT.SHOWCASE.SHOWALL') : n }));
    },

    __onLeftArrowClick() {
        if (this.currentPage - 1 < 0) {
            return;
        }
        this.currentPage -= 1;
        this.__inactivateArrows();
        this.__resetCurrentCollection();
    },

    __onRightArrowClick() {
        if ((this.currentPage + 1) * this.currentPaging >= this.parentCollection.length) {
            return;
        }
        this.currentPage += 1;
        this.__inactivateArrows();
        this.__resetCurrentCollection();
    },

    __inactivateArrows() {
        this.ui.arrowLeft.toggleClass('showcase__arrow_inactive', this.currentPage - 1 < 0);
        this.ui.arrowRight.toggleClass('showcase__arrow_inactive', (this.currentPage + 1) * this.currentPaging >= this.parentCollection.length);
    },

    __getCurrentCollection() {
        return this.parentCollection.slice(this.currentPage * this.currentPaging, Math.min((this.currentPage + 1) * this.currentPaging, this.parentCollection.length));
    },

    __resetCurrentCollection() {
        this.collection.reset(this.__getCurrentCollection());
    }
});
