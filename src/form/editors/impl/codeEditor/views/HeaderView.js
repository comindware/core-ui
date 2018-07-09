export default function() {
    return new Core.layout.PlainText({
        title: 'Scc',
        text: 'Script',
        helpText: 'Some help information'
    });
    // return new Core.layout.Form({
    //     initialize() {
    //         this.addClass('region');
    //     },
    //     model: new Backbone.Model({
    //         title: 'foo'
    //     }),
    //     schema: {
    //         title: {
    //             title: 'Title',
    //             type: 'Plaintext',
    //             helpText: 'Some help information'
    //         },
    //     },
    //     content: new Core.layout.VerticalLayout({
    //         rows: [
    //             Core.layout.createFieldAnchor('title')
    //         ]
    //     })
    // });
}
