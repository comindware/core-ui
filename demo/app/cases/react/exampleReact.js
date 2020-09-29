import ListCanvasView from 'demoPage/views/ListCanvasView';
import React from 'react';
import ReactDOM from 'react-dom';

import Paragraph from './Paragraph';

export default function() {
    const data = _.times(100, i => ({
        id: i + 1
    }));

    const ListView = Marionette.View.extend({
        render() {
            ReactDOM.render(<Paragraph />, this.el);
        }
    });

    const listView = new Core.list.GridView({
        collection: data,
        childView: ListView,
        childHeight: 25
    });

    return new ListCanvasView({
        content: listView
    });
}
