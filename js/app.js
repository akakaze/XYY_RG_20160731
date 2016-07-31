/**
* Created by akakaze on 2016/2/4.
*/
define(["jquery", "underscore", "backbone", "d3"], function ($, _, Backbone, d3) {
    var Model = Backbone.Model.extend({
        defaults: {
            id: null
        }
    });

    var Collection = Backbone.Collection.extend({
        model: Model,
        initialize: function () {}
    });

    var AppView = Backbone.View.extend({
        el: $("body"),
        initialize: function () {
            this.collection = new Collection();
        },
        events: {}
    });

    return {
        init: function () {
            new AppView();
            Backbone.history.start();
        }
    }
});
