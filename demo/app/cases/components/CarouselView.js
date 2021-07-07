
import CanvasView from 'demoPage/views/CanvasView';

const innerView = Marionette.View.extend({ 
    template: Handlebars.compile(`<div style="width: 200px; height: 200px; background-color: var(--theme-colors__primary); display:flex; flex-flow: column nowrap; justify-content: center; align-items: center">
        <div style="font-size: x-large; color: var(--theme-colors__main)">{{index}}</div>
    </div>`)
});

export default function() {
    const elements = [];
    for (let index = 0; index < 12; index++) {
        elements.push({ index });
    }
    return new CanvasView({
        view: new Core.layout.Carousel({
            collection: new Backbone.Collection(elements),
            view: innerView
        }),
        canvas: {
            width: '500px'
        }
    });
}
