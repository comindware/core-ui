// @flow
type HistoryStep = {
    action: 'change' | 'add' | 'remove',
    propertyName: string,
    newValue: boolean,
    oldValue: boolean
};

type History = Array<HistoryStep>;

type TimeTravelBehaviour = {
    history: History,

    currentHistoryStep: number
};

const obj: TimeTravelBehaviour = {
    init() {
        this.on('change', model => this.__proxyModelChange('change', model));
        this.on('remove', model => this.__proxyModelChange('remove', model));
        this.on('add', model => this.__proxyModelChange('add', model));
    },

    history: [],

    currentHistoryStep: 0,

    canUndo(): boolean {
        return this.currentHistoryStep > 0;
    },

    canRedo(): boolean {
        return this.currentHistoryStep > history.length;
    },

    undo() {
        if (!this.canUndo()) {
            return;
        }

        const step: HistoryStep = this.history[this.currentHistoryStep];

        this.__pushChange(step.newValue, step.oldValue, step.propertyName, step.action);

        this.currentHistoryStep--;
    },

    redo() {
        if (!this.canRedo()) {
            return;
        }
        const step: HistoryStep = this.history[this.currentHistoryStep];

        this.__pushChange(step.newValue, step.oldValue, step.propertyName, step.action);

        this.currentHistoryStep++;
    },

    __proxyModelChange(action, model) {
        const step: HistoryStep = {
            action,
            newValue: model.newValue,
            propertyName: model.propertyName,
            oldValue: model.oldValue,
        };

        this.__applyChanges(step);
        this.__pushChange(step.newValue, step.oldValue, step.propertyName, step.action);

        this.currentHistoryStep = this.history.length - 1;
    },

    __pushChange(oldValue, newValue, propertyName, action) {
        this.history.push({
            action,
            oldValue,
            newValue,
            propertyName
        });
    },

    __applyChanges(step) {
        switch (step.action) {
            case 'change':
                this.set(step.propertyName, step.oldValue);
                break;
            case 'add':
                this.remove(step.propertyName);
                break;
            case 'remove':
                this.add(step.propertyName, step.oldValue);
                break;
            default:
                break;
        }
    }
};

export default obj;
