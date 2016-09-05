/**
* Created by akakaze on 2016/2/4.
*/
define(["jquery", "underscore", "backbone", "d3"], function ($, _, Backbone, d3) {
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
        },
        setSource: function (source) {
            this.attributes.source = source;
            ajax("GET", source, "arraybuffer", this._ajaxProgress)
                .then(this._ajaxResolve.bind(this.attributes), this._ajaxReject);
        },
        videoToggle: function () {
            this.attributes.video.paused ?
                this.attributes.video.play() : this.attributes.video.pause();
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
            this.interval = setInterval(this.view.media2canvas, 0, this);
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
            this.video.setAttribute("src", URL.createObjectURL(blob));
            this.view.media2canvas(this);
            this.video.pause();
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
            this.media2canvas = this.media2canvas.bind(this);
        },
        media2canvas: function (opt) {
            this.templateGameMedia.getContext("2d").drawImage(
                opt.video,
                opt.left,
                opt.top,
                opt.width,
                opt.height
            );
        },
        events: {
            "click": "videoToggle"
        },
        videoToggle: function () {
            this.modelGameMedia.videoToggle();
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
        req.onprogress = progress;
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
        req.send();
    });
}