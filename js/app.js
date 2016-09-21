/**
* Created by akakaze on 2016/2/4.
*/
define(["jquery", "underscore", "backbone", "d3"], function ($, _, Backbone, d3) {
    "use strict";
    const modelGameMedia_test = function (view) {
        var $t = this,
            $v = document.createElement("video"),
            $i;
        Object.defineProperties(this, {
            view: {
                value: view
            },
            video: {
                value: $v
            },
            source: {
                set: function (source) {
                    ajax("GET", source, "arraybuffer", $t._ajaxProgress)
                        .then($t._ajaxResolve, $t._ajaxReject);
                }
            },
            height: {
                value: 0,
                writable: true
            },
            width: {
                value: 0,
                writable: true
            },
            top: {
                value: 0,
                writable: true
            },
            left: {
                value: 0,
                writable: true
            },
            videoToggle: {
                value: function () {
                    $t.video.paused ?
                        $t.video.play() : $t.video.pause();
                }
            },
            _loadedmetadata: {
                value: function () {
                    var p = $v.videoHeight / $v.videoWidth;
                    if (p <= 0.5625) {
                        $t.height = Math.floor(1920 * p);
                        $t.width = 1920;
                    }
                    else {
                        $t.height = 1080;
                        $t.width = Math.floor(1080 / p);
                    }
                    $t.left = (1920 - $t.width) / 2;
                    $t.top = (1080 - $t.height) / 2;
                }
            },
            _play: {
                value: function () {
                    $i = setInterval($t.view.media2canvas, 0, $t);
                }
            },
            _pause: {
                value: function () {
                    clearInterval($i);
                }
            },
            _ajaxProgress: {
                value: function (event) {
                    var prog = Math.floor(event.loaded * 100 / event.total);
                    console.log("progress : " + prog + "%");
                }
            },
            _ajaxResolve: {
                value: function (data) {
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
                    $t.video.src = URL.createObjectURL(blob);
                    $t.view.media2canvas($t);
                    $t.video.pause();
                }
            },
            _ajaxReject: {
                value: function (data) {
                    console.error(JSON.parse(data));
                }
            }
        });
        $v.addEventListener("loadedmetadata", $t._loadedmetadata);
        $v.addEventListener("play", $t._play);
        $v.addEventListener("loadedmetadata", $t._pause);
    };
    const viewApp = Backbone.View.extend({
        el: "#game_app",
        initialize: function () {
            this.templateGameMedia = this.el.querySelector("#game_media");
            this.templateGameMain = this.el.querySelector("#game_main");
            this.templateGameControls = this.el.querySelector("#game_control");

            this.modelGameMedia = new modelGameMedia_test(this);
            this.modelGameMedia.source = "resource/video/xyy_rg_test.mp4";
            this.media2canvas = this.media2canvas.bind(this);
        },
        media2canvas: function (mod) {
            this.templateGameMedia.getContext("2d").drawImage(
                mod.video,
                mod.left,
                mod.top,
                mod.width,
                mod.height
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