import { helpers } from 'utils';
import template from './templates/wizard.hbs';
import StepHeadersView from './StepHeadersView';
import ButtonView from '../button/ButtonView';
import LayoutBehavior from '../behaviors/LayoutBehavior';
import LoadingBehavior from '../../views/behaviors/LoadingBehavior';
import WizardStepModel from './models/WizardStepModel';
import Backbone from 'backbone';

type Step = { view: Backbone.View, id: string, name: string, visible?: any, error?: string };
type StepsList = Array<Step>;
type ShowStepOptions = {
    region: Marionette.Region,
    stepModel: Backbone.Model,
    view: Backbone.View,
    buttonsView: Backbone.View,
    contentRegionEl: HTMLElement,
    buttonsRegionEl: HTMLElement
};

const classes = {
    CLASS_NAME: 'layout__wizard',
    PANEL_REGION: 'layout__wizard__panel-region',
    HIDDEN: 'layout__wizard__step-hidden',
    BUTTONS_LAYOUT: 'layout__wizard__buttons-layout',
    BACK_BUTTON: 'layout__wizard__back-button'
};

const defaultOptions = {
    headerClass: '',
    bodyClass: ''
};

const buttonIds = {
    back: 'back',
    next: 'next',
    skip: 'skip',
    close: 'close'
};

const buttonIconClasses = {
    next: 'chevron-right',
    back: 'chevron-left'
};

const buttonIconPositions = {
    right: 'right',
    left: 'left'
};

export default Marionette.View.extend({
    initialize(options: { steps: StepsList, showTreeEditor?: boolean }) {
        helpers.ensureOption(options, 'steps');
        _.defaults(options, defaultOptions);
        this.__initializeStepsCollection(options.steps);
    },

    template: Handlebars.compile(template),

    className(): string {
        const bodyClass = this.getOption('bodyClass');

        return `${classes.CLASS_NAME} ${bodyClass || ''}`;
    },

    regions: {
        headerRegion: {
            el: '.js-header-region',
            replaceElement: true
        },
        loadingRegion: '.js-loading-region'
    },

    ui: {
        panelContainer: '.js-panel-container'
    },

    behaviors: {
        LayoutBehavior: {
            behaviorClass: LayoutBehavior
        },
        LoadingBehavior: {
            behaviorClass: LoadingBehavior,
            region: 'loadingRegion'
        }
    },

    onRender(): void {
        const stepHeadersView = new StepHeadersView({
            collection: this.__stepsCollection,
            headerClass: this.getOption('headerClass')
        });

        this.showChildView('headerRegion', stepHeadersView);

        this.listenTo(this.__stepsCollection, 'change:selected', this.__onSelectedChanged);

        if (this.getOption('deferRender')) {
            this.__renderStep(this.__stepsCollection.at(0), false);
        } else {
            this.__stepsCollection.forEach((stepModel: Backbone.Model) => {
                this.__renderStep(stepModel, false);
            });
        }

        this.__updateState();
    },

    update(): void {
        this.__stepsCollection.forEach(step => {
            const view = step.get('view');
            if (view && typeof view.update === 'function') {
                view.update();
            }
        });
        if (this.buttonsView) {
            this.buttonsView.update();
        }
        this.__updateState();
    },

    validate() {
        const currentStep = this.__getSelectedStep();
        let result = false;
        const view = currentStep.get('view');
        if (view && typeof view.validate === 'function') {
            const error = view.validate();
            this.setStepError(currentStep.id, error);
            if (error) {
                result = true;
            }
        }
        return result;
    },

    getViewById(stepId: string) {
        return this.__findStep(stepId).get('view');
    },

    selectStep(stepId: string): void | boolean {
        const step = this.__findStep(stepId);

        if (step.get('selected')) {
            return;
        }

        const previousStep = this.__getSelectedStep();

        if (previousStep) {
            if (this.getOption('validateBeforeMove')) {
                const errors = !previousStep.get('view').form || previousStep.get('view').form.validate();
                this.setStepError(previousStep.id, errors);
                if (errors) {
                    return false;
                }
            }
        }
        // For IE (scroll position jumped up when steps reselected)
        if (previousStep) {
            previousStep.set('selected', false);
        }

        step.set('selected', true);
        if (!step.get('isRendered') && this.isRendered()) {
            this.__renderStep(step, Boolean(this.getOption('deferRender')));
        }

        this.selectedVisibleStepIndex = this.__getVisibleStepIndex(step);
        if (this.selectedVisibleStepIndex === this.visibleStepsCollection.length - 1) {
            step.set('completed', true);
        }
    },

    setVisible(stepId: string, visible: boolean): void {
        this.__findStep(stepId).set({ visible });
    },

    setCompleted(stepId: string, completed: boolean): void {
        this.__findStep(stepId).set({ completed });
    },

    getStepsCollection() {
        return this.__stepsCollection;
    },

    setStepError(stepId: string, error: string): void {
        this.__findStep(stepId).set({ error });
    },

    setLoading(state: Boolean | Promise<any>): void {
        this.loading.setLoading(state);
    },

    __initializeStepsCollection(stepsCollection: Backbone.Collection | StepsList): void {
        if (!stepsCollection) {
            Core.InterfaceError.logError('Steps collection must be passed');
        }

        this.__stepsCollection = stepsCollection instanceof Backbone.Collection ? stepsCollection : new Backbone.Collection(stepsCollection, { model: WizardStepModel });
        this.visibleStepsCollection = new Backbone.Collection();

        this.setStepsVisibility();

        const currentStep = this.__stepsCollection.at(0);
        this.selectStep(currentStep.id);
    },

    setStepsVisibility(): void {
        this.visibleStepsCollection.reset();
        let stepNumber = 1;
        this.__stepsCollection.forEach((stepModel: Backbone.Model) => {
            const visible = stepModel.get('visible');
            if (typeof visible === 'function') {
                stepModel.set('isVisible', visible());
            } else if (visible === false) {
                stepModel.set('isVisible', visible);
            }

            if (stepModel.get('isVisible') === true) {
                stepModel.set({ stepNumber });
                this.visibleStepsCollection.add(stepModel);
                stepNumber += 1;
            }
        });
    },

    __renderStep(stepModel: Backbone.Model, isLoadingNeeded: boolean): void {
        const stepIndex = this.__getStepIndex(stepModel);

        const contentRegionEl = document.createElement('div');
        const buttonsRegionEl = document.createElement('div');
        contentRegionEl.className = classes.PANEL_REGION;
        this.ui.panelContainer.append(contentRegionEl);
        this.ui.panelContainer.append(buttonsRegionEl);
        this.addRegions({
            [`content${stepIndex}`]: { el: contentRegionEl },
            [`buttons${stepIndex}`]: { el: buttonsRegionEl }
        });
        const buttonsView = this.__createButtonsView(stepModel);
        const view = stepModel.get('view');

        if (isLoadingNeeded) {
            this.setLoading(true);
            setTimeout(() => {
                this.__showStep({ stepModel, view, buttonsView, contentRegionEl, buttonsRegionEl });
                this.setLoading(false);
            });
        } else {
            this.__showStep({ stepModel, view, buttonsView, contentRegionEl, buttonsRegionEl });
        }
    },

    __showStep(options: ShowStepOptions): void {
        const { stepModel, view, buttonsView, contentRegionEl, buttonsRegionEl } = options;
        const stepIndex = this.__getStepIndex(stepModel);

        this.getRegion(`content${stepIndex}`).show(view);
        this.getRegion(`buttons${stepIndex}`).show(buttonsView);
        stepModel.set({
            contentRegionEl,
            buttonsRegionEl,
            isRendered: true
        });

        this.__updateStepRegion(stepModel);
    },

    __getSelectedStep(): Backbone.Model {
        const currentStep = this.visibleStepsCollection.find((stepModel: Backbone.Model) => stepModel.get('selected'));

        return currentStep;
    },

    __getStepIndex(stepModel: Backbone.Model): number {
        return this.__stepsCollection.indexOf(stepModel);
    },

    __getVisibleStepIndex(stepModel: Backbone.Model): number {
        return this.visibleStepsCollection.indexOf(stepModel);
    },

    __findStep(stepId: string): Backbone.Model {
        const stepModel = this.__stepsCollection.find((x: Backbone.Model) => x.id === stepId);
        if (!stepModel) {
            helpers.throwInvalidOperationError(`Wizard: step '${stepId}' is not present in the collection.`);
        }
        return stepModel;
    },

    __onSelectedChanged(model: Backbone.Model): void {
        this.__updateStepRegion(model);
    },

    __updateStepRegion(model: Backbone.Model): void {
        const contentRegionEl = model.get('contentRegionEl');
        const buttonsRegionEl = model.get('buttonsRegionEl');
        if (!contentRegionEl) {
            return;
        }
        const selected = model.get('selected');

        contentRegionEl.classList.toggle(classes.HIDDEN, !selected);
        buttonsRegionEl.classList.toggle(classes.HIDDEN, !selected);

        Core.services.GlobalEventService.trigger('popout:resize', false);
    },

    __createButtonsView(step: Backbone.Model) {
        const buttons = step.get('buttons').map(
            item =>
                new ButtonView({
                    ...item,
                    iconClass: this.__getButtonIconClass(item.id),
                    iconPosition: this.__getButtonIconPosition(item.id),
                    class: `${item.class || ''} ${item.id === buttonIds.back ? classes.BACK_BUTTON : ''}`
                })
        );
        buttons.forEach(button => {
            this.listenTo(step.get('view').model, 'change', () => button.update());
            button.on('click', async () => {
                const prevStep = this.visibleStepsCollection.at(this.selectedVisibleStepIndex - 1);
                const nextStep = this.visibleStepsCollection.at(this.selectedVisibleStepIndex + 1);

                switch (button.id) {
                    case buttonIds.back:
                        this.setCompleted(prevStep.id, false);
                        this.selectStep(prevStep.id);
                        break;
                    case buttonIds.next: {
                        const errors = this.validate();
                        if (!errors) {
                            this.setLoading(true);
                            try {
                                const handlerResult = await button.handlerResult;
                                if (!handlerResult?.isFailed) {
                                    this.selectStep(nextStep.id);
                                    this.setCompleted(step.id, true);
                                }
                            } finally {
                                this.setLoading(false);
                            }
                        }
                        break;
                    }
                    case buttonIds.skip: {
                        const targetStep = this.__findStep(button.options.targetId);
                        const targetStepIndex = this.__getVisibleStepIndex(targetStep);
                        const stepIndex = this.__getVisibleStepIndex(step);
                        for (let i = stepIndex; i < targetStepIndex; i += 1) {
                            this.setCompleted(this.visibleStepsCollection.at(i).id, true);
                        }
                        this.selectStep(targetStep.id);
                        break;
                    }
                    default:
                        break;
                }
            });
        });

        return new Core.layout.HorizontalLayout({
            columns: buttons,
            class: classes.BUTTONS_LAYOUT
        });
    },

    __getButtonIconClass(id: string): string {
        return buttonIconClasses[id];
    },

    __getButtonIconPosition(id: string): string {
        return id === buttonIds.next ? buttonIconPositions.right : buttonIconPositions.left;
    }
});
