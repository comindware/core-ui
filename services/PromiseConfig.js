define(['module/lib'], function () {
    Promise.config({
        warnings: true,
        longStackTraces: true,
        cancellation: true
    });
});