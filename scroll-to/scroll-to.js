var MS = MS || {};
MS.ScrollTo = function () {
    "use strict";
    var self = this;
    var element;
    var speed = 50;
    var step = Math.floor(window.innerHeight / 5);
    var axis = 'y';
    var left;
    var top;
    var stop;
    var start;
    var iniTop = document.body.scrollTop || document.documentElement.scrollTop;
    var interval;
    self.setElement = function(value){
        element = value;
        return self;
    };
    self.setSpeed = function(value){
        speed = value;
        return self;
    };
    self.setStep = function(value){
        step = value;
        return self;
    };
    self.setAxis = function(value){
        axis = value;
        return self;
    };
    self.setResult = function(){
        var shape = new MS.Position().setElement(element).setResult();
        left = shape.getOffsetLeft();
        top = shape.getOffsetTop();
        if (step === 0) {
            if (axis.toLowerCase() === 'y') {
                window.scrollTo(0, top);
            }
        } else {
            if (axis.toLowerCase() === 'y') {
                stop = top;
                step = stop > iniTop ? step : -step;
                start = iniTop + step;
                interval = window.setInterval(function () {
                    if ((step > 0 && start <= stop) || (step < 0 && start >= stop)) {
                        window.scrollTo(0, start);
                        start += step;
                    } else {
                        window.scrollTo(0, top);
                        window.clearInterval(interval);
                    }
                }, speed);
            } else if (axis.toLowerCase() === 'x') {
                window.scrollTo(left, 0);
            }
        }
        return self;
    };
};