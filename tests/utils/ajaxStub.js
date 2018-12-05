export default class AjaxStub {
    static initialize() {
        $.ajax = config => {
            switch (config.url) {
                case '/api/UploadAttachment':
                    const files = [];
                    let i = 1;
                    while (config.data.get(`file${i}`)) {
                        files.push(config.data.get(`file${i}`));
                        i++;
                    }
                    const promise = new Promise((resolve, reject) => {
                        setTimeout(() => {
                            config.success(
                                JSON.stringify({
                                    fileId: `${files[0].name}1`,
                                    fileIds: files.map((file, index) => `${file.name}${index + 1}`)
                                })
                            );
                        }, 100);
                    });
                    return promise;
                default:
                    config.success.call(this);
                    break;
            }
        };
        Ajax.Documents = {};
        Ajax.Documents.GetDocumentRevisions = documentId => [
            {
                creationDate: '2018-05-17T09:10:12.0778781Z',
                creatorId: 'account.1',
                creatorName: 'admin',
                id: 'drev.1884',
                revisionIndex: 0,
                revisionLink: '/DocumentContent?id=drev.1884'
            }
        ];
        Ajax.UploadAttacment = {};
    }
}
