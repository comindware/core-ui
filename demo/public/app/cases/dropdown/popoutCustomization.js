
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';
import DemoProfilePanelView from 'demoPage/views/DemoProfilePanelView';

export default function() {
    const DemoButtonView = Marionette.ItemView.extend({
        template() {
            return Handlebars.compile('Demo Button');
        },
        tagName: 'span'
    });

    const popout = core.dropdown.factory.createPopout({
        buttonView: DemoButtonView,
        panelView: DemoProfilePanelView,
        popoutFlow: 'right'
    });

    return new CanvasView({
        view: popout,
        canvas: {
            height: '30px'
        }
    });
}
