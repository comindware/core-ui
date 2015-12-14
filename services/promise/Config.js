define(['core/libApi'], function () {
    Promise.config({
        warnings: false,
        longStackTraces: true,
        cancellation: true
    });
});