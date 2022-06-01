export default {
    makeStub() {
        function ajax_response(response) {
            return function(request) {
                switch (request.url) {
                    case '/api/UploadAttachment': {
                        let count = 0;

                        while (true) {
                            if (request.data.has(`file${count + 1}`)) {
                                count++;
                            } else {
                                const promise = new Promise((resolve, reject) => {
                                    setTimeout(() => {
                                        request.success(JSON.stringify({ fileIds: _.times(count, () => _.guid()) }));
                                    }, 5000);
                                });
                                return promise;
                            }
                        }
                    }
                    case 'Documents/GetDocumentRevisions': {
                        const responseData = {
                            success: true,
                            data: [
                                {
                                    id: _.guid(),
                                    creatorName: 'Sergey Sergeev',
                                    revisionLink: 'images/image2.jpg',
                                    creationDate: Date.now() + _.random(-100, 100) * 1000 * 60,
                                    revisionIndex: 1
                                }
                            ]
                        };

                        return new Promise(resolve => {
                            setTimeout(() => {
                                resolve(responseData);
                            }, 1000);
                        });
                    }
                    default: {
                        request.success(response);
                    }
                }
            };
        }

        $.ajax = ajax_response('{ "title": "My dummy JSON" }');
    }
};
