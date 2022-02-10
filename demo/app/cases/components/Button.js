

export default function() {

    return new Core.layout.VerticalLayout({
        rows: [
            new Core.form.editors.TextEditor({
                value: 'foo'
            }),
            new Core.layout.HorizontalLayout({
                columns: [
                    new Core.form.editors.NumberEditor({
                        value: 123
                    }),
                    new Core.form.editors.DateTimeEditor({
                        value: '2015-07-20T10:46:37Z'
                    })
                ]
            }),
            new Core.form.editors.TextAreaEditor({
                value: 'bar\nbaz'
            }),
            new Core.form.editors.BooleanEditor({
                value: true,
                displayText: 'Make me some tea!'
            }),
            new Core.layout.HorizontalLayout({
                columns: [
                    new Core.layout.Button({
                        text: 'Solid',
                        iconClass: 'plus',
                        isSolid: true,
                        handler() {
                            alert('Hello!');
                        }
                    }),
                    new Core.layout.Button({
                        text: 'Clear',
                        iconClass: 'plus',
                        isSolid: false,
                        handler() {
                            alert('Cheese!');
                        }
                    }),
                    new Core.layout.Button({
                        text: 'Say nothing!',
                        iconClass: 'plus',
                        isSolid: true,
                        isCancel: true,
                        handler() {
                            alert('Nothing!');
                        }
                    }),
                    new Core.layout.Button({
                        text: 'Say nothing!',
                        iconClass: 'plus',
                        isCancel: true,
                        handler() {
                            alert('Nothing!');
                        }
                    })
                ]
            }),
            new Core.layout.HorizontalLayout({
                columns: [
                    new Core.layout.Button({
                        text: 'None?',
                        iconClass: 'plus',
                        isSolid: false,
                        customClass: 'toolbar-btn_none',
                        handler() {
                            alert('What?');
                        }
                    }),
                    new Core.layout.Button({
                        text: 'Low?',
                        iconClass: 'plus',
                        isSolid: false,
                        customClass: 'toolbar-btn_low',
                        handler() {
                            alert('What?');
                        }
                    }),
                    new Core.layout.Button({
                        text: 'Normal?',
                        iconClass: 'plus',
                        isSolid: false,
                        customClass: 'toolbar-btn_normal',
                        handler() {
                            alert('What?');
                        }
                    }),
                    new Core.layout.Button({
                        text: 'Critical?',
                        iconClass: 'plus',

                        customClass: 'toolbar-btn_critical',
                        handler() {
                            alert('What?');
                        }
                    }),
                    new Core.layout.Button({
                        text: 'Major?',
                        iconClass: 'plus',

                        customClass: 'toolbar-btn_major',
                        handler() {
                            alert('What?');
                        }
                    }),                    
                    new Core.layout.Button({
                        text: 'Fatal?',
                        iconClass: 'plus',

                        customClass: 'toolbar-btn_fatal',
                        handler() {
                            alert('What?');
                        }
                    })
                ]
            }),
            new Core.layout.HorizontalLayout({
                columns: [
                    new Core.components.Toolbar({
                        toolbarItems: [
                            {
                                iconClass: 'save',
                                id: 'none',
                                visibleOptions: true,
                                name: 'None',
                                isSolid: true,
                            },
                            {
                                iconClass: 'save',
                                id: 'low',
                                visibleOptions: true,
                                name: 'Low',
                                isSolid: true,
                                severity: 'Low'
                            },
                            {
                                iconClass: 'save',
                                id: 'normal',
                                visibleOptions: true,
                                name: 'Normal',
                                isSolid: true,
                                severity: 'Normal'
                            },
                            {
                                iconClass: 'save',
                                id: 'critical',
                                visibleOptions: true,
                                name: 'Critical',
                                isSolid: true,
                                severity: 'Critical'
                            },
                            {
                                iconClass: 'save',
                                id: 'major',
                                visibleOptions: true,
                                name: 'Major',
                                isSolid: true,
                                severity: 'Major'
                            },
                            {
                                iconClass: 'save',
                                id: 'fatal',
                                visibleOptions: true,
                                name: 'Fatal',
                                isSolid: true,
                                severity: 'Fatal'
                            }
                        ]
                    })
                ]
            }),
        ]
    });
}
