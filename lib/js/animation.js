(function($){

$.globalAnimationCue = {};
jQuery.fn.hardwareAnimate = function(endProperties, duration, easing, callback, cueName) {
    var element = this[0],
        duration = duration == undefined ? 600 : duration,
        easing = easing || 'easeInOutBack',
        callback = callback || function() {
            console.log('animation complete');
        };

    if(cueName) {
        $.globalAnimationCue[cueName] = $.globalAnimationCue[cueName] || [];
        var cue = $.globalAnimationCue[cueName];
    }
    else {
        element.cuedAnimations = element.cuedAnimations || [];
        var cue = element.cuedAnimations;
    }

    element.startProperties = element.startProperties || {
        translateX: element.style[transform].match(/translateX\((\w+)\)/) ? element.style[transform].match(/translateX\((\w+)\)/).replace('px', '') : 0,
        translateY: element.style[transform].match(/translateY\((\w+)\)/) ? element.style[transform].match(/translateY\((\w+)\)/).replace('px', '') : 0,
        translateZ: element.style[transform].match(/translateZ\((\w+)\)/) ? element.style[transform].match(/translateZ\((\w+)\)/).replace('px', '') : 0,
        scaleX: 0,
        scaleY: 0,
        scaleZ: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0
    };

    endProperties.translateZ = endProperties.translateZ || 0;

    var transformString = function(percentComplete, isComplete) {
        var transform='';

        transform = 'translateZ('+endProperties.translateZ+'px)';
        for(prop in endProperties) {
            if(prop != 'translateZ') {
                var change,
                    value,
                    start = element.startProperties[prop],
                    end = endProperties[prop];

                if(end.indexOf) {
                    if(end.indexOf('-=') === 0) change = parseInt(end.substring(2)) * -1;
                    else if (end.indexOf('+=') === 0) change = parseInt(end.substring(2));
                    else change = parseInt(end); //fuck it, a string is interpreted as '+='

                    value = start + (percentComplete*change);
                }
                else {
                    change = Math.abs(end - start);
                    if(end > start) value = start + (percentComplete*change);
                    else value = start - (percentComplete*change);
                }

                transform += prop+'('+value;

                if(prop.indexOf('rotate')===0) transform +='deg';
                if(prop.indexOf('translate')===0) transform +='px';
                transform += ')';

                if(isComplete) element.startProperties[prop] = value;
            }
        }

        return transform;
    }

    var beginAnimation = function() {
        var startAnimationTime = Date.now();
        var performAnimation = function() {

            var time = Date.now() - startAnimationTime,
                percentComplete = jQuery.easing[easing](time, time, 0, 1, duration);

            if(time < duration) {
                element.style[transform] = transformString(percentComplete);
                nextFrame(performAnimation);
            }
            else {
                element.style[transform] = transformString(1, true);
                callback.call(element);

                cue.shift();
                if(cue.length > 0) cue[0].call();
            }
        }
        performAnimation();
    };

    cue.push(beginAnimation);
    if(cue.length == 1) cue[0].call();

    return this;
};

jQuery.fn.hardwareCss = function(translateScaleRotate) {
    this[0].style[transform] = translateScaleRotate;
    return this;
};

jQuery.fn.hardwareAnimateCollection = function(options, duration, easing, latency, callback) {
    var itemCount = this.length,
        duration = duration || 500,
        easing = easing || 'easeInOutBack',
        latency = latency || 50,
        completeWait = itemCount * latency + duration,
        callback = callback || function() {};

    if(options.opacity || options.opacity === 0) {
        var opacity = options.opacity;
        delete options.opacity;
    }

    return this.each(function(index, el) {
        var $el = $(el),
            top = $el.offset().top + $el.height(),
            itemNumber = index + 1
        wait = itemNumber * latency;

        setTimeout(function() {
            $el.hardwareAnimate(options, duration, easing);
        }, wait);

        if(opacity || opacity === 0) $el.animate({opacity: opacity}, duration);

        setTimeout(callback, completeWait);
    });
};


jQuery.fn.reverse = [].reverse;

jQuery.fn.slideDownCollection = function(duration, easing, latency, callback) {
    var itemCount = this.length,
        duration = duration || 500,
        easing = easing || 'easeInOutBack',
        latency = latency || 50,
        completeWait = itemCount * latency + duration,
        callback = callback || function() {};

    setTimeout(callback, completeWait);
    return this.each(function(index, el) {
        var $el = $(el),
            top = $el.offset().top + $el.height(),
            itemNumber = index + 1
        wait = itemNumber * latency;

        $el.hardwareAnimate({translateY: top * -1}, 0, 'linear', function() {
            setTimeout(function() {
                $el.hardwareAnimate({translateY: 0}, duration, easing);
                $el.animate({opacity: 1}, duration);
            }, wait);
        });
    });
};



jQuery.fn.slideUpCollection = function(duration, easing, latency, callback) {
    var itemCount = this.length,
        duration = duration || 500,
        easing = easing || 'easeInOutBack',
        latency = latency || 50,
        completeWait = itemCount * latency + duration,
        callback = callback || function() {};

    setTimeout(callback, completeWait);
    return this.each(function(index, el) {
        var $el = $(el),
            top = $el.offset().top + $el.height(),
            itemNumber = index + 1
        wait = itemNumber * latency;

        setTimeout(function() {
            $el.hardwareAnimate({translateY: top * -1}, duration, easing);
            $el.animate({opacity: 0}, duration);
        }, wait);
    });
};


injectCSS = function(selector, rules, index) {
    var sheet = document.styleSheets[0],
        index = index || 1;

    sheet.addRule(selector, rules);
};


})(jQuery);