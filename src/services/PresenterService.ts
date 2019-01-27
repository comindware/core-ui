import { presentingComponentsTypes } from '../Meta';

type typeIdPare = {
    type: string,
    id: string
};

export default class CTEventsService {
    static presentComponentSequence(componentSequenceString: string) {
        const componentSequence = this.__getComponentSequenceFromString(componentSequenceString);

        componentSequence.forEach(component => {
            const parsedComponent = this.__getTypeIdPare(component);

            this.__executeActionForComponent(parsedComponent);
        });

        this.__navigateToComponent(this.__getTypeIdPare(componentSequence[componentSequence.length - 1]));
    }

    static __getComponentSequenceFromString(componentSequenceString: string): Array<string> {
        return componentSequenceString.split(';');
    }

    static __getTypeIdPare(component: string): typeIdPare {
        const params = component.split(':');

        return {
            type: params[0],
            id: params[1]
        };
    }

    static __executeActionForComponent(component: typeIdPare): void {
        const element = document.getElementById(component.id);
        if (!element) {
            return;
        }

        switch (component.type) {
            case presentingComponentsTypes.form:
                element.click();
                break;
            case presentingComponentsTypes.popup:
                element.click();
                break;
            case presentingComponentsTypes.group:
                element.click();
                break;
            case presentingComponentsTypes.field:
                element.click();
                break;
            case presentingComponentsTypes.tab:
                element.click();
                break;
            default:
                break;
        }
    }

    static __navigateToComponent(component: typeIdPare): void {
        const element = document.getElementById(component.id);
        if (!element) {
            return;
        }

        switch (component.type) {
            case presentingComponentsTypes.form:
                element.scrollIntoView();
                break;
            case presentingComponentsTypes.popup:
                element.scrollIntoView();
                break;
            case presentingComponentsTypes.group:
                element.scrollIntoView();
                break;
            case presentingComponentsTypes.field:
                element.scrollIntoView();
                break;
            case presentingComponentsTypes.tab:
                element.scrollIntoView();
                break;
            default:
                break;
        }
    }
}
