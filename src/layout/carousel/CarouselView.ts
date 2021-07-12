import CarouselContentView from './CarouselContentView';
import CarouselDotsView from './CarouselDotsView';
import template from './carousel.hbs';
import Backbone from 'backbone';

const defaultOptions = {
    slidesToShow: 3,
    slidesToScroll: 1
};

export default Marionette.View.extend({
    initialize() {
        _.defaults(this.options, defaultOptions);
        this.parentCollection = this.options.collection;
        this.currentIndex = 0;
        this.collection = new Backbone.Collection();
        this.__resetCurrentCollection();
        const dotsCollection = this.__getDotsCollection();
        this.contentView = new CarouselContentView({
            collection: this.collection,
            childView: this.options.view,
            childViewOptions: this.options.viewOptions,
            emptyView: this.options.emptyView,
            emptyViewOptions: this.options.emptyViewOptions
        });
        this.dotsView = new CarouselDotsView({
            collection: dotsCollection,
            slidesToShow: this.options.slidesToShow,
            currentIndex: this.currentIndex
        });
        this.listenTo(this.collection, 'update', this.__onCollectionUpdate);
        this.listenTo(this.dotsView, 'select:page', (index: number) => this.__onSelectPage(index));
    },

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
        this.__inactivateArrows();
        this.showChildView('content', this.contentView);
        this.showChildView('dots', this.dotsView);
        this.dotsView.updateActive(this.currentIndex);
    },

    __onCollectionUpdate() {
        this.__inactivateArrows();
        this.dotsView.updateActive(this.currentIndex);
    },

    __inactivateArrows() {
        this.ui.arrowLeft.toggleClass('carousel__arrow_inactive', this.currentIndex - this.options.slidesToScroll < 0);
        this.ui.arrowRight.toggleClass('carousel__arrow_inactive', this.options.slidesToShow + this.currentIndex >= this.parentCollection.length);
    },

    __onLeftArrowClick() {
        if (this.currentIndex - this.options.slidesToScroll < 0) {
            return;
        }
        this.currentIndex -= this.options.slidesToScroll;
        this.__resetCurrentCollection();
    },

    __onRightArrowClick() {
        if (this.options.slidesToShow + this.currentIndex >= this.parentCollection.length) {
            return;
        }
        this.currentIndex += this.options.slidesToScroll;
        this.__resetCurrentCollection();
    },

    __onSelectPage(index: number) {
        this.currentIndex = index;
        this.__resetCurrentCollection();
    },

    __getCurrentCollection() {
        return this.parentCollection.slice(Math.max(0, this.currentIndex), Math.min(this.options.slidesToShow + this.currentIndex, this.parentCollection.length));
    },

    __resetCurrentCollection() {
        this.collection.set(this.__getCurrentCollection(), { merge: true });
    },

    __getDotsCollection() {
        const dots = this.parentCollection.reduce((dotsArray: Array<{ id: number }>, model: Backbone.Model, index: number) => {
            const lastIndex = this.parentCollection.length - this.options.slidesToShow;
            if (lastIndex === index) {
                dotsArray.push({ id: lastIndex });
                return dotsArray;
            }

            if (index % this.options.slidesToShow === 0 && index < lastIndex) {
                dotsArray.push({ id: index });
            }
            return dotsArray;
        }, []);
        return new Backbone.Collection(dots);
    }
});
