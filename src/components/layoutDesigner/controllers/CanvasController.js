//@flow
import CanvasView from '../views/CanvasView';

export default Marionette.Object.extend({
    initialize(options = {}) {
        _.bindAll(this, 'handleElementDragMove', 'handleElementDragStart', 'handleElementDragStop');
        this.model = options.model;
        const canvasReqres = this.createAndBindChannel(this.getOption('config').dropZoneType);
        this.canvasAggregator = Backbone.Radio.channel(_.uniqueId());
        this.view = this.createView(options.config, canvasReqres, options.reqres);
        this.activeDropZones = [];
    },

    createAndBindChannel(dropZoneType) {
        const canvasReqres = Backbone.Radio.channel(_.uniqueId());
        if (dropZoneType === 'fixed') {
            canvasReqres.reply('component:drag:start', this.handleElementDragStart, this);
            canvasReqres.reply('component:drag:move', this.handleElementDragMove, this);
            canvasReqres.reply('component:drag:stop', this.handleElementDragStop, this);
        }
        canvasReqres.reply('component:hover', this.hoverComponent, this);
        canvasReqres.reply('component:select', this.selectComponent, this);
        canvasReqres.reply('select:canvas', this.selectCanvasComponent, this);
        canvasReqres.reply('component:collapse', this.__toggleCollapse, this);
        this.canvasReqres = canvasReqres;

        return canvasReqres;
    },

    createView(config, canvasReqres, reqres) {
        return new CanvasView({
            model: this.model,
            reqres,
            canvasAggregator: this.canvasAggregator,
            canvasReqres,
            config,
            componentReqres: this.getOption('componentReqres')
        });
    },

    hoverComponent(model) {
        this.unhoverAll();

        if (model === this.model.get('root')) {
            return;
        }

        model.hover();
    },

    selectComponent(model) {
        this.deselectAll();
        if (model === this.model.get('root')) {
            this.selectCanvasComponent(model);
            return;
        }
        if (model.select) {
            model.select();
            this.trigger('component:selected', model);
        }
    },

    selectCanvasComponent(model) {
        this.deselectAll();
        model.select();
        this.trigger('component:selected', model.parent);
    },

    deselectAll() {
        this.model.get('root').deselect();
        this.model.eachComponent(componentModel => componentModel.deselect && componentModel.deselect());
    },

    unhoverAll() {
        this.model.eachComponent(componentModel => componentModel.unhover && componentModel.unhover());
    },

    handleElementDragStart(dragContext, event, ui) {
        const minCount = dragContext.model.parent && dragContext.model.parent.get('minimumDescendants');
        if (minCount && minCount >= dragContext.model.parent.getChildren().length) {
            return false;
        }
        if (this.getOption('config').dropZoneType !== 'fixed') {
            this.canvasReqres.request('component:drag:start', dragContext, event, ui);
        } else {
            this.activeDropZones = this.collectDropZones(dragContext).filter(dropzone => this.__validateDropzone(dragContext, dropzone.context));
            this.activeDropZones.forEach(zone => zone.activate());
        }
        return true;
    },

    collectDropZones(dragContext = {}) {
        const zones = [];
        this.canvasAggregator.trigger('drop-zone:collect', dragContext, zones);
        return zones;
    },

    handleElementDragStop(dragContext, event, ui) {
        if (this.getOption('config').dropZoneType !== 'fixed') {
            this.canvasReqres.request('component:drag:stop', dragContext, event, ui);
        } else {
            try {
                if (!this.__isDropBack(dragContext)) {
                    if (this.view.canDrop) {
                        if (event.ctrlKey) {
                            const model = dragContext.model.clone();
                            model.unset('id');
                            dragContext.model = model;
                            dragContext.operation = 'create';
                        }
                        const closestZone = this.__findClosestDropZone(event);
                        if (closestZone) {
                            closestZone.drop(dragContext);
                            this.selectComponent(dragContext.model);
                        }
                    } else {
                        this.trigger('remove:attribute', dragContext.model);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                this.activeDropZones.forEach(zone => {
                    zone.deactivate();
                    zone.leave();
                });
                this.activeDropZones = [];
            }
        }
    },

    handleElementDragMove(dragContext, event, ui) {
        if (this.getOption('config').dropZoneType !== 'fixed') {
            this.canvasReqres.request('component:drag:move', dragContext, event, ui);
        } else {
            this.activeDropZones.forEach(zone => zone.leave());
            if (this.view.canDrop && !this.__isDropBack(dragContext)) {
                const closestZone = this.__findClosestDropZone(event);
                if (closestZone) {
                    closestZone.enter();
                }
                ui.helper.removeClass('dev-removing-helper');
            } else if (!this.view.canDrop) {
                ui.helper.addClass('dev-removing-helper');
            }
        }
    },

    handleElementDblclick(model) {
        this.canvasReqres.request('element:dblclick', model);
    },

    __validateDropzone(dragContext, dropContext) {
        switch (dragContext.operation) {
            case 'create':
                return this.__checkModelNesting(dropContext.containerModel, dragContext.model);
            case 'move': {
                const draggedModelCid = dragContext.model.cid;
                const siblingModels = dropContext.containerModel.getChildren();

                // disabling zones above and below the dragged model
                if (siblingModels.length > 0) {
                    const modelBefore = dropContext.modelBefore;
                    if (modelBefore) {
                        if (modelBefore.cid === draggedModelCid) {
                            return false;
                        }
                        const modelAfter = siblingModels.at(siblingModels.indexOf(dropContext.modelBefore) + 1);
                        if (modelAfter && modelAfter.cid === draggedModelCid) {
                            return false;
                        }
                    } else if (siblingModels.at(0).cid === draggedModelCid) {
                        return false;
                    }
                }
                // disabling all zones if the model is a child of
                if (dropContext.containerModel === dragContext.model) {
                    return false;
                }
                let parentModel = dropContext.containerModel.getParent();
                while (parentModel) {
                    if (parentModel === dragContext.model) {
                        return false;
                    }
                    parentModel = parentModel.getParent();
                }
                // disabling some nesting
                return this.__checkModelNesting(dropContext.containerModel, dragContext.model);
            }
            default:
                return false;
        }
    },

    __checkModelNesting(parent, child) {
        let canBeNested = child.get('canBeNested') || parent.get('fieldType') === 'SystemView';
        if (!canBeNested && !child.get('canBeNestedIn')) {
            return canBeNested;
        }
        const nestingRules = child.get('canBeNestedIn');
        canBeNested = nestingRules ? nestingRules.find(containerType => containerType === parent.get('fieldType')) : true;
        if (!canBeNested) {
            return canBeNested;
        }
        const nestedRules = parent.get('canBeNestedBy');
        return nestedRules ? nestedRules.find(containerType => containerType === child.get('fieldType') || containerType === child.get('type')) : true;
    },

    __findClosestDropZone(event) {
        let closestZone;
        let closestDistance = Number.MAX_VALUE;
        const position = {
            x: event.pageX,
            y: event.pageY
        };
        this.activeDropZones.forEach(zone => {
            const distance = zone.getDistance(position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestZone = zone;
            }
        });
        return closestZone;
    },

    __isDropBack(dragContext) {
        //todo wtf
        return false; //!!(dragContext.operation === 'move' && view.isOver());
    },

    __toggleCollapse(model, collapsed, options) {
        if (options.skip) {
            return;
        }
        const root = this.model.get('root');
        if (model === root) {
            this.model.eachComponent(component => {
                if (component.isContainer && component !== root) {
                    component.set('collapsed', collapsed);
                }
            });
        } else if (!options.skip) {
            let rootCollapsed = true;
            root.getChildren().forEach(child => {
                if (!child.get('collapsed') && child.isContainer) {
                    rootCollapsed = false;
                }
            });
            root.set('collapsed', rootCollapsed, { skip: true });
        }
    },

    onBeforeDestroy() {
        this.canvasReqres.stopReplying();
        this.canvasAggregator.stopReplying();
    }
});
