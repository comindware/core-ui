import ShowcaseContentView from './ShowcaseContentView';
import DatalistEditorView from '../../form/editors/DatalistEditorView';
import template from './showcase.hbs';
import Backbone from 'backbone';

const defaultOptions = {
    groupBy: [3, 6, 10, Infinity],
    startPage: 0,
    ContentView: ShowcaseContentView
};

export default Marionette.View.extend({
    initialize() {
        _.defaults(this.options, defaultOptions);
        this.parentCollection = this.options.collection;
        this.currentPage = this.options.startPage;
        this.currentPaging = this.options.groupBy[0];
        this.collection = new Backbone.Collection();
        const { collection, ...contentViewOptions } = this.options;
        this.contentView = new this.options.ContentView({
            collection: this.collection,
            ...contentViewOptions
        });
        const groupingModel = new Backbone.Model({ groupBy: this.currentPaging });
        this.groupingView = new DatalistEditorView({
            key: 'groupBy',
            collection: new Backbone.Collection(this.__getGroupByCollection()),
            allowEmptyValue: false,
            autocommit: true,
            valueType: 'id',
            model: groupingModel
        });
        this.__resetCurrentCollection();
        this.listenTo(groupingModel, 'change:groupBy', this.__onChangeGroupBy);
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

    onRender() {
        this.__inactivateArrows();
        this.showChildView('content', this.contentView);
        this.showChildView('grouping', this.groupingView);
    },

    __onChangeGroupBy(model: Backbone.Model) {
        this.currentPage = 0;
        this.currentPaging = model.get('groupBy');
        this.__inactivateArrows();
        this.__resetCurrentCollection();
    },

    __getGroupByCollection() {
        return this.options.groupBy.map((n: number) => ({ id: n, name: n === Infinity ? Localizer.get('CORE.LAYOUT.SHOWCASE.SHOWALL') : n }));
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
