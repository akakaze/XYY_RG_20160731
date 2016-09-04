/**
* Created by akakaze on 2016/2/4.
*/
define(["jquery", "underscore", "backbone", "d3"], function ($, _, Backbone, d3) {
    // var Model = Backbone.Model.extend({
    //     initialize: function () {}
    // });
    // var Collection = Backbone.Collection.extend({
    //     model: Model,
    //     initialize: function () {}
    // });
    // var AppView = Backbone.View.extend({
    //     el: $("body"),
    //     initialize: function () {
    //         this.collection = new Collection();
    //     },
    //     events: {}
    // });
    "use strict";

    const modelGameMedia = Backbone.Model.extend({
        defaults: {
            video: document.createElement("video")
        },
        initialize: function (options) {
            var attr = this.attributes;
            attr.video.addEventListener("loadedmetadata", this._loadedmetadata.bind(attr));
            attr.video.addEventListener("play", this._play.bind(attr));
            attr.video.addEventListener("pause", this._pause.bind(attr));
            attr.ctx = attr.view.templateGameMedia.getContext("2d");
        },
        setSource: function (source) {
            this.attributes.source = source;

            ajax("GET", source, "arraybuffer", this._ajaxProgress)
                .then(this._ajaxResolve, this._ajaxReject);
        },
        videoPlay: function () {
            this.attributes.video.play();
        },
        _loadedmetadata: function () {
            var p = this.video.videoHeight / this.video.videoWidth;
            if (p <= 0.5625) {
                this.height = Math.floor(1920 * p);
                this.width = 1920;
            }
            else {
                this.height = 1080;
                this.width = Math.floor(1080 / p);
            }
            this.left = (1920 - this.width) / 2;
            this.top = (1080 - this.height) / 2;
        },
        _play: function () {
            this.interval = setInterval(this.view.media2canvas.bind(this), 0);
        },
        _pause: function () {
            clearInterval(this.interval);
        },
        _ajaxProgress: function (event) {
            var prog = Math.floor(event.loaded * 100 / event.total);
            console.log("progress : " + prog + "%");
        },
        _ajaxResolve: function (data) {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioCtx.decodeAudioData(data, function (buffer) {
                for (var channel = 0; channel < buffer.numberOfChannels; channel ++) {
                    console.dir(buffer.getChannelData(channel));
                }
            }, function (e) {
                console.error("Error with decoding audio data" + e.err);
            });
            var blob = new Blob([data], {
                type: "video/mpeg4"
            });
            var url = URL.createObjectURL(blob);
            this.attributes.video.setAttribute("src", url);
        },
        _ajaxReject: function (data) {
            console.error(JSON.parse(data));
        }
    });
    const viewApp = Backbone.View.extend({
        el: "#game_app",
        initialize: function () {
            this.templateGameMedia = this.el.querySelector("#game_media");
            this.templateGameMain = this.el.querySelector("#game_main");
            this.templateGameControls = this.el.querySelector("#game_control");
            this.modelGameMedia = new modelGameMedia({view: this});
            this.modelGameMedia.setSource("media/video/xyy_rg_test.mp4");
            this.modelGameMedia.videoPlay();
            console.log(this.modelGameMedia);
        },
        media2canvas: function () {
            this.ctx.drawImage(
                this.video,
                this.left,
                this.top,
                this.width,
                this.height
            );
        }
    });

    return {
        init: function () {
            new viewApp();
            Backbone.history.start();
        }
    }
});

function ajax (method, url, type, progress) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.responseType = type;
        req.open(method, url);
        req.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(this.response);
            } else {
                reject(this.statusText);
            }
        };
        req.onerror = function () {
            reject(this.statusText);
        };
        req.onprogress = progress;
        req.send();
    });
}