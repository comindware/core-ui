//@flow
import template from '../templates/verticalLayoutComponent.html';
import DropzoneView from './DropzoneView';
import ComponentBehavior from '../behaviors/ComponentBehavior';
import VerticalDropzoneView from './VerticalDropzoneView';
import { helpers } from 'utils';

const collapsedClass = 'dev-collapsed';

export default Marionette.CompositeView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'model');

        this.reqres = options.reqres;
        this.componentReqres = options.componentReqres;

        this.collection = this.model.get(this.model.get('childrenAttribute') || 'rows');
        this.dropzones = {};
        this.listenTo(options.canvasAggregator, 'drop-zone:collect', this.__collectDropzones);
    },

    behaviors: [ComponentBehavior],

    className: 'ld-canvas-wrp js-system-container',

    template: Handlebars.compile(template),

    events: {
        'click @ui.toggleCollapseButton': '__toggleCollapse'
    },

    ui: {
        container: '.js-container',
        toggleCollapseButton: '.js-toggle',
        name: '.js-name'
    },

    modelEvents: {
        'change:collapsed': '__onCollapsedChange'
    },

    childViewContainer: '.js-container',

    childViewOptions() {
        return {
            reqres: this.reqres,
            canvasAggregator: this.getOption('canvasAggregator'),
            canvasReqres: this.getOption('canvasReqres'),
            componentReqres: this.componentReqres
        };
    },

    childView(childModel) {
        return this.reqres.request('component:resolve', childModel);
    },

    onBeforeRender() {
        if (!this.dropzones) {
            this.dropzones = {};
        }
    },

    onBeforeAttach() {
        if (this.model.get('horizontalDrops')) {
            this.__addOneDropZone();
            return;
        }
        if (this.model.get('horizontalDrops')) {
            this.__addDropZones(this.children);

            this.__renderColumnDropZones();
        }
    },

    onBeforeRemoveChild(view) {
        if (!this.dropzones) {
            return;
        }

        const dropzoneView = this.dropzones[view.model.cid];
        const dropzoneColumnViewLeft = this.dropzones[`addColumn${view.model.cid}left`];
        const dropzoneColumnViewRight = this.dropzones[`addColumn${view.model.cid}right`];

        delete this.dropzones[view.model.cid];

        if (dropzoneView) {
            dropzoneView.destroy();
        }
        if (dropzoneColumnViewLeft) {
            delete this.dropzones[`addColumn${view.model.cid}left`];
            dropzoneColumnViewLeft.destroy();
        }
        if (dropzoneColumnViewRight) {
            delete this.dropzones[`addColumn${view.model.cid}right`];
            dropzoneColumnViewRight.destroy();
        }
    },

    onRemoveChild(view) {
        if (this.collection.length && view.dropzones && view.dropzones[`addColumn${view.model.cid}left`]) {
            const newFirstView = this.children.findByModel(this.collection.at(0));

            newFirstView && newFirstView.$el.prepend(newFirstView.renderNewColumnZone(newFirstView.model, 'left'));
        }
    },

    renderNewColumnZone(modelBefore, prefix) {
        const verticalDropzoneView = new VerticalDropzoneView({
            prefix,
            context: {
                containerModel: this.model,
                modelBefore,
                axis: 'x'
            }
        });

        let id = modelBefore ? modelBefore.cid : null;
        id = `addColumn${id}${prefix}`;

        this.dropzones[id] = verticalDropzoneView;
        this.listenTo(verticalDropzoneView, 'drop', context => this.__onNewColumnDrop(context, prefix));

        return verticalDropzoneView.render().$el;
    },

    __collectDropzones(dragContext, zones) {
        const isDropPossible = this.componentReqres && this.componentReqres.request('component:validate:drop', { container: this, context: dragContext });

        if (isDropPossible !== false) {
            Object.values(this.dropzones).forEach(v => {
                const containerModel = v.context.containerModel;
                const parent = containerModel && containerModel.parent;
                let childMaxDesc;
                let collection;
                if (!parent) {
                    return;
                }
                if (v.context.axis === 'x') {
                    childMaxDesc = parent.get('maximumDescendantsByX');
                    collection = containerModel.collection;
                } else {
                    childMaxDesc = containerModel.get('maximumDescendantsByY');
                    collection = containerModel.getChildren();
                }
                if (!childMaxDesc || !collection || collection.length < childMaxDesc) {
                    zones.push(v);
                }
            });
        }
    },

    __toggleCollapse() {
        this.model.set('collapsed', !this.model.get('collapsed'));
        return false;
    },

    __onCollapsedChange(model, collapsed) {
        this.ui.toggleCollapseButton.toggleClass(collapsedClass, collapsed);
        return false;
    },

    __renderColumnDropZones() {
        const index = this.model.collection.indexOf(this.model);

        if (index === 0) {
            this.$el.prepend(this.renderNewColumnZone(this.model, 'left'));
        }

        this.$el.append(this.renderNewColumnZone(this.model, 'right'));
    },

    __onDrop(context) {
        const index = this.collection.indexOf(context.zoneContext.modelBefore) + 1;
        switch (context.dragContext.operation) {
            case 'create':
                this.reqres.request('component:add', context.dragContext.model, this.collection, index);
                break;
            case 'move':
                this.reqres.request('component:move', context.dragContext.model, this.collection, index);
                break;
            default:
                Core.utils.helpers.throwInvalidOperationError();
        }
    },

    onAddChild(view) {
        const index = this.collection.indexOf(view.model);

        if (index === 0 && this.collection.length > 1) {
            const oldMostLeftView = this.children.findByModel(this.collection.at(1));

            if (oldMostLeftView && oldMostLeftView.dropzones) {
                const leftDZId = `addColumn${oldMostLeftView.model.cid}left`;

                if (oldMostLeftView.dropzones[leftDZId]) {
                    oldMostLeftView.dropzones[leftDZId].destroy();
                    delete oldMostLeftView.dropzones[leftDZId];
                }
            }
        }

        if (this.model.get('horizontalDrop')) {
            view.$el.after(this.__renderDropzone(view.model));
        }
    },

    __onNewColumnDrop(context, prefix) {
        const index = this.model.collection.indexOf(this.model);

        if (context.dragContext.operation === 'create') {
            this.reqres.request('component:add:column', context.dragContext.model, this.collection, prefix, index);
        } else if (context.dragContext.operation === 'move') {
            this.reqres.request('component:move:column', context.dragContext.model, this.collection, prefix, index);
        }
    },

    __addDropZones(children) {
        this.ui.container.prepend(this.__renderDropzone(null));
        children.forEach(child => child.$el.after(this.__renderDropzone(child.model)));
    },

    __addOneDropZone() {
        this.ui.container.after(this.__renderDropzone(this.model.cid));
    },

    __renderDropzone(modelBefore) {
        const dropzoneView = new DropzoneView({
            context: {
                containerModel: this.model,
                modelBefore,
                axis: 'y'
            }
        });
        this.dropzones[modelBefore ? modelBefore.cid : null] = dropzoneView;
        this.listenTo(dropzoneView, 'drop', this.__onDrop);
        return dropzoneView.render().$el;
    }
});
