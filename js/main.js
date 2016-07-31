/**
 * Created by user on 2016/2/4.
 */
requirejs.config({
    baseUrl: "lib/js",
    paths: {
        jquery: "jquery-2.1.4",
        underscore: "underscore",
        backbone: "backbone",
        metro: "metro",
        d3: "d3",
        app: "../../js/app"
    },
    shim: {
        jquery: {
            exports: "$"
        },
        underscore: {
            exports: "_"
        },
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        metro: {
            deps: ['jquery']
        },
        d3: {
            exports: 'd3'
        }
    }
});

requirejs(["app", "jquery", "underscore", "backbone", "metro", "d3"], function (app) {
    app.init();
});