import CarouselContentView from './CarouselContentView';
import CarouselDotsView from './CarouselDotsView';
import template from './carousel.hbs';
import Backbone from 'backbone';

const PADDING = 15;
const TILE_MARGINS = 15;

const defaultOptions = {
    slidesPerPage: 3,
    slidesToScroll: 1,
    ContentView: CarouselContentView,
    toggleUI: true,
    isAutoFill: true,
    childWidth: 285
};

export default Marionette.View.extend({
    initialize() {
        _.defaults(this.options, defaultOptions);
        this.parentCollection = this.options.collection;

        this.currentIndex = 0;
        this.collection = new Backbone.Collection();
        this.dotsCollection = new Backbone.Collection();
        this.slidesPerPage = this.options.slidesPerPage;
        this.model.set('childWidth', this.options.childWidth);
        const { collection, ...contentOptions } = this.options;
        this.contentView = new this.options.ContentView({
            collection: this.collection,
            parentCollection: this.parentCollection,
            ...contentOptions
        });
        this.dotsView = new CarouselDotsView({
            collection: this.dotsCollection,
            slidesPerPage: this.slidesPerPage,
            currentIndex: this.currentIndex
        });
        this.listenTo(this.parentCollection, 'add remove reset', this.__refreshCollections);
        this.listenTo(this.dotsView, 'select:page', (index: number) => this.__onSelectPage(index));
        if (!this.options.isAutoFill) {
            this.__refreshCollections();
        } else {
            const resizeObserver = new ResizeObserver(this.__onResize.bind(this));
            resizeObserver.observe(this.el);
        }
    },

    className: 'carousel-wrapper',

    regions: {
        content: {
            el: '.js-content-region',
            replaceElement: true
        },
        dots: {
            el: '.js-dots-region',
            replaceElement: true
        }
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

    onRender() {
        this.showChildView('content', this.contentView);
        this.showChildView('dots', this.dotsView);
        if (!this.options.isAutoFill) {
            this.__updateUI();
        }
    },

    __countSlidesPerPage(containerWidth: number) {
        const slidesFit = Math.floor((containerWidth - PADDING * 2) / (this.model.get('childWidth') + TILE_MARGINS * 2));
        return Math.max(slidesFit, 1);
    },

    __onResize(entry: Array<ResizeObserverEntry>) {
        const containerWidth = entry[0].contentRect.width;
        if (containerWidth === 0) {
            return;
        }
        this.slidesPerPage = this.__countSlidesPerPage(containerWidth);
        this.currentIndex = 0;
        this.__refreshCollections();
    },

    __refreshCollections() {
        this.__resetDotsCollection();
        this.__resetCurrentCollection();
        this.__updateUI();
    },

    __updateUI() {
        this.__updateArrows();
        this.__updateDots();
    },

    __updateArrows() {
        const scrollLeftDisabled = this.currentIndex - this.slidesPerPage < 0;
        const scrollRightDisabled = this.slidesPerPage + this.currentIndex > this.parentCollection.length - 1;
        if (this.options.toggleUI) {
            const isNothingToScroll = scrollLeftDisabled && scrollRightDisabled;
            this.ui.arrowLeft.toggle(!isNothingToScroll);
            this.ui.arrowRight.toggle(!isNothingToScroll);
        }
        this.ui.arrowLeft.toggleClass('carousel__arrow_inactive', scrollLeftDisabled);
        this.ui.arrowRight.toggleClass('carousel__arrow_inactive', scrollRightDisabled);
    },

    __onLeftArrowClick() {
        const newIndexVal = this.currentIndex - this.slidesPerPage;
        if (newIndexVal < 0) {
            return;
        }
        this.currentIndex = newIndexVal;

        this.__resetCurrentCollection();
        this.__updateUI();
    },

    __onRightArrowClick() {
        const newIndexVal = this.currentIndex + this.slidesPerPage;
        if (newIndexVal > this.parentCollection.length - 1) {
            return;
        }
        this.currentIndex = newIndexVal;
        this.__resetCurrentCollection();
        this.__updateUI();
    },

    __onSelectPage(index: number) {
        this.currentIndex = index;
        this.__resetCurrentCollection();
        this.__updateUI();
    },

    __getCurrentCollection() {
        return this.parentCollection.slice(Math.max(0, this.currentIndex), Math.min(this.slidesPerPage + this.currentIndex, this.parentCollection.length));
    },

    __resetCurrentCollection() {
        this.collection.set(this.__getCurrentCollection(), { merge: true });
    },

    __getDots() {
        const dots: Array<{ id: number }> = [];
        let startTileForPage = 0;
        do {
            dots.push({ id: startTileForPage });
            startTileForPage += this.slidesPerPage;
        } while (startTileForPage < this.parentCollection.length);

        return dots;
    },

    __resetDotsCollection() {
        this.dotsCollection.reset(this.__getDots());
    },

    __updateDots() {
        if (this.options.toggleUI) {
            const isNothingToScroll = this.currentIndex - this.options.slidesToScroll < 0 && this.slidesPerPage + this.currentIndex >= this.parentCollection.length;
            this.dotsView.$el.toggle(!isNothingToScroll);
        }
        this.dotsView.updateActive(this.currentIndex);
    }
});
