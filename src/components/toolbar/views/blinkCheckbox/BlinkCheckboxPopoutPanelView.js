/* eslint-disable */
import template from '../../templates/blinkCheckbox/blinkCheckboxPopoutPanel.html';
import BlinkCheckboxVisibilityView from './BlinkCheckboxVisibilityView';
import BlinkCheckboxVisibilityDragView from './BlinkCheckboxVisibilityDragView';

const constants = {
    dragElOffsetX: 190,
    dragElOffsetY: 20,
    filterIconListTop: 'filter-icon-list__i_area-top',
    filterIconListBottom: 'filter-icon-list__i_area-bottom',
    colunmItem: 'js-item',
    filtersListDragging: '.js-filters-list-dragging',
    iconClassConst: 'filter',
    colorIconEnabled: 'filter-enabled',
    colorIconDisabled: 'filter-disabled'
};

export default Marionette.CollectionView.extend({
    initialize() {
        const columns = this.options.model.get('columns');
        this.collection = columns instanceof Backbone.Collection ? columns : new Backbone.Collection(columns);
        this.listenTo(this, 'childview:click', this.__itemClick);
        _.bindAll(this, '__documentMouseMove', '__documentMouseUp');
    },

    events: {
        'pointerdown @ui.saveButton': '__onSaveButtonClick',
        'pointerdown @ui.showAllColumnsButton': '__onShowAllColumnClick'
    },

    childViewEvents: {
        drag: '__onDrag'
    },

    ui: {
        showAllColumnsButton: '.js-show-all-columns',
        saveButton: '.js-save',
        visibilitySettings: '.js-visibility-settings'
    },

    className: 'filter-icon-lists',

    template: Handlebars.compile(template),

    templateContext() {
        let hideAll = true;

        this.collection.models.forEach(value => {
            hideAll = hideAll && value.get('isHidden') === true;
        });

        return {
            text: hideAll ? Localizer.get('CORE.COMMON.HIDEALL') : Localizer.get('CORE.COMMON.SHOWALL'),
            iconClass: constants.iconClassConst,
            iconColor: hideAll ? constants.colorIconDisabled : constants.colorIconEnabled
        };
    },

    childViewContainer: '.js-visibility-settings',

    childView: BlinkCheckboxVisibilityView,

    __onSaveButtonClick() {
        this.trigger('save:columns');
    },

    __itemClick() {
        const isHiddenKey = this.collection.at(0).get('isHidden');
        const canRender = this.collection.every(value => value.get('isHidden') === isHiddenKey);

        if (canRender) {
            this.render();
        }
    },

    __onDrag(view, options) {
        this.__stopDrag();
        this.__startDrag(view, options);
    },

    __startDrag(view, options) {
        const event = options.event;

        this.dragContext = {
            view,
            dragItemView: new BlinkCheckboxVisibilityDragView({ model: options.model }).render()
        };
        const ctx = this.dragContext;
        ctx.dragItemView.$el.css({
            top: event.pageY - constants.dragElOffsetY,
            left: event.pageX - constants.dragElOffsetX
        });
        this.$el.append(ctx.dragItemView.el);
        ctx.view.setDragging(true);
        document.addEventListener('mousemove', this.__documentMouseMove);
        document.addEventListener('mouseup', this.__documentMouseUp);
    },

    __stopDrag() {
        if (!this.dragContext) {
            return;
        }

        const ctx = this.dragContext;
        if (ctx.topItem) {
            ctx.topItem.removeClass(constants.filterIconListTop);
        }
        if (ctx.bottomItem) {
            ctx.bottomItem.removeClass(constants.filterIconListBottom);
        }
        document.removeEventListener('mousemove', this.__documentMouseMove);
        document.removeEventListener('mouseup', this.__documentMouseUp);
        ctx.view.setDragging(false);
        const dragItem = this.$el.find(constants.filtersListDragging);
        dragItem.remove();
        this.dragContext = null;
    },

    __onShowAllColumnClick() {
        let hideAll = true;
        this.collection.each(value => {
            hideAll = hideAll && value.get('isHidden') === true;
        });

        hideAll = !hideAll;
        this.collection.each(value => {
            value.set('isHidden', hideAll);
        });

        this.render();
    },

    __documentMouseMove(event) {
        if (!this.dragContext) {
            return;
        }

        const ctx = this.dragContext;
        ctx.dragItemView.$el.css({
            top: event.pageY - constants.dragElOffsetY,
            left: event.pageX - constants.dragElOffsetX
        });

        let itemEl = event.target;
        while (itemEl[0] !== document && !itemEl.classList.contains(constants.colunmItem)) {
            itemEl = itemEl.parentNode;
        }

        if (ctx.topItem) {
            ctx.topItem.removeClass(constants.filterIconListTop);
        }
        if (ctx.bottomItem) {
            ctx.bottomItem.removeClass(constants.filterIconListBottom);
        }
        if (itemEl[0] !== document) {
            const overTopHalf = event.pageY - itemEl.offset().y < itemEl.height() / 2;
            if (overTopHalf) {
                ctx.topItem = itemEl.prev();
                ctx.bottomItem = itemEl;
            } else {
                ctx.bottomItem = itemEl.next();
                ctx.topItem = itemEl;
            }
            if (ctx.topItem[0] === ctx.view.el || ctx.bottomItem[0] === ctx.view.el) {
                ctx.bottomItem = null;
                ctx.topItem = null;
            } else {
                ctx.topItem.addClass(constants.filterIconListTop);
                ctx.bottomItem.addClass(constants.filterIconListBottom);
            }
        }

        return false;
    },

    __documentMouseUp(event) {
        if (!this.dragContext) {
            return;
        }

        let itemEl = event.target;
        while (itemEl[0] !== document && !itemEl.classList.contains(constants.colunmItem)) {
            itemEl = itemEl.parentNode;
        }

        const ctx = this.dragContext;
        if (itemEl[0] !== document && (ctx.bottomItem || ctx.topItem)) {
            const model = ctx.view.model;
            const modelIndex = this.collection.indexOf(model);
            let newModelIndex = ctx.bottomItem && ctx.bottomItem.length ? ctx.bottomItem.prevAll().length : this.collection.length;
            if (newModelIndex > modelIndex) {
                newModelIndex--;
            }
            if (newModelIndex !== modelIndex) {
                const collection = model.collection;
                collection.remove(model);
                collection.add(model, { at: newModelIndex });
            }
        }
        this.__stopDrag();
        return false;
    }
});
