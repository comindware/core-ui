import CarouselContentView from './CarouselContentView';
import CarouselDotsView from './CarouselDotsView';
import template from './carousel.hbs';
import Backbone from 'backbone';

const MIN_MARGIN = 5;
const PADDING = 15;

const defaultOptions = {
    slidesToShow: 3,
    slidesToScroll: 1,
    ContentView: CarouselContentView,
    toggleUI: true,
    isAutoFill: true,
    childWidth: 240
};

export default Marionette.View.extend({
    initialize() {
        _.defaults(this.options, defaultOptions);
        this.parentCollection = this.options.collection;
        this.currentIndex = 0;
        this.collection = new Backbone.Collection();
        this.dotsCollection = new Backbone.Collection();
        this.slidesToShow = this.options.slidesToShow;
        const { collection, ...contentOptions } = this.options;
        this.contentView = new this.options.ContentView({
            collection: this.collection,
            parentCollection: this.parentCollection,
            ...contentOptions
        });
        this.dotsView = new CarouselDotsView({
            collection: this.dotsCollection,
            slidesToShow: this.slidesToShow,
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

    __countSlidesToShow(containerWidth: number) {
        this.slidesToShow = Math.floor((containerWidth - PADDING * 2) / (this.options.childWidth + 2 * MIN_MARGIN));
    },

    __onResize(entry: Array<ResizeObserverEntry>) {
        const containerWidth = entry[0].contentRect.width;
        if (containerWidth === 0) {
            return;
        }
        this.__countSlidesToShow(containerWidth);
        this.__refreshCollections();
    },

    __refreshCollections() {
        this.__resetDotsCollection();
        this.__resetCurrentCollection();
        this.__updateUI();
    },

    __updateUI() {
        this.__inactivateArrows();
        this.__updateDots();
    },

    __inactivateArrows() {
        if (this.options.toggleUI) {
            const isNothingToScroll = this.currentIndex - this.options.slidesToScroll < 0 && this.slidesToShow + this.currentIndex >= this.parentCollection.length;
            this.ui.arrowLeft.toggle(!isNothingToScroll);
            this.ui.arrowRight.toggle(!isNothingToScroll);
        }
        this.ui.arrowLeft.toggleClass('carousel__arrow_inactive', this.currentIndex - this.options.slidesToScroll < 0);
        this.ui.arrowRight.toggleClass('carousel__arrow_inactive', this.slidesToShow + this.currentIndex >= this.parentCollection.length);
    },

    __onLeftArrowClick() {
        if (this.currentIndex - this.options.slidesToScroll < 0) {
            return;
        }
        this.currentIndex -= this.options.slidesToScroll;
        this.__resetCurrentCollection();
        this.__updateUI();
    },

    __onRightArrowClick() {
        if (this.slidesToShow + this.currentIndex >= this.parentCollection.length) {
            return;
        }
        this.currentIndex += this.options.slidesToScroll;
        this.__resetCurrentCollection();
        this.__updateUI();
    },

    __onSelectPage(index: number) {
        this.currentIndex = index;
        this.__resetCurrentCollection();
    },

    __getCurrentCollection() {
        return this.parentCollection.slice(Math.max(0, this.currentIndex), Math.min(this.slidesToShow + this.currentIndex, this.parentCollection.length));
    },

    __resetCurrentCollection() {
        this.collection.set(this.__getCurrentCollection(), { merge: true });
    },

    __getDots() {
        const dots = this.parentCollection.reduce((dotsArray: Array<{ id: number }>, model: Backbone.Model, index: number) => {
            const lastIndex = this.parentCollection.length - this.slidesToShow;
            if (lastIndex === index) {
                dotsArray.push({ id: lastIndex });
                return dotsArray;
            }

            if (index % this.slidesToShow === 0 && index < lastIndex) {
                dotsArray.push({ id: index });
            }
            return dotsArray;
        }, []);
        return dots;
    },

    __resetDotsCollection() {
        this.dotsCollection.reset(this.__getDots());
    },

    __updateDots() {
        if (this.options.toggleUI) {
            const isNothingToScroll = this.currentIndex - this.options.slidesToScroll < 0 && this.slidesToShow + this.currentIndex >= this.parentCollection.length;
            this.dotsView.$el.toggle(!isNothingToScroll);
        }
        this.dotsView.updateActive(this.currentIndex);
    }
});
