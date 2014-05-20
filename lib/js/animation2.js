(function($){

    $.globalAnimationCue = {};
    jQuery.fn.hardwareAnimate = function(endProperties, duration, easing, callback, cueName) {
        var element = this[0],
            duration = duration == undefined ? 600 : duration,
            easing = easing || 'easeInOutBack',
            callback = callback || function() {
                console.log('animation complete');
            },
            customCb = Boolean(callback);

        if(cueName) {
            $.globalAnimationCue[cueName] = $.globalAnimationCue[cueName] || [];
            var cue = $.globalAnimationCue[cueName];
        }
        else {
            element.cuedAnimations = element.cuedAnimations || [];
            var cue = element.cuedAnimations;
        }

        var elTransform = element.style[transform];

        element.startProperties = element.startProperties && _.compact(_.values(element.startProperties)).length ? element.startProperties : {
            translateX: _.isArray(elTransform.match(/translateX\(((-\w+|\w+))\)/)) ? parseFloat(elTransform.match(/translateX\(((-\w+|\w+))\)/)[1].replace('px', '')) : 0,
            translateY: _.isArray(elTransform.match(/translateY\(((-\w+|\w+))\)/)) ? parseFloat(elTransform.match(/translateY\(((-\w+|\w+))\)/)[1].replace('px', '')) : 0,
            translateZ: _.isArray(elTransform.match(/translateZ\(((-\w+|\w+))\)/)) ? parseFloat(elTransform.match(/translateZ\(((-\w+|\w+))\)/)[1].replace('px', '')) : 0,
            scaleX: _.isArray(elTransform.match(/scaleX\(((-\w+|\w+))\)/)) ? parseFloat(elTransform.match(/scaleX\(((-\w+|\w+))\)/)[1].replace('px', '')) : 0,
            scaleY: _.isArray(elTransform.match(/scaleY\(((-\w+|\w+))\)/)) ? parseFloat(elTransform.match(/scaleY\(((-\w+|\w+))\)/)[1].replace('px', '')) : 0,
            scaleZ: _.isArray(elTransform.match(/scaleZ\(((-\w+|\w+))\)/)) ? parseFloat(elTransform.match(/scaleZ\(((-\w+|\w+))\)/)[1].replace('px', '')) : 0,
            rotateX: _.isArray(elTransform.match(/rotateX\(((-\w+|\w+))\)/)) ? parseFloat(elTransform.match(/rotateX\(((-\w+|\w+))\)/)[1].replace('px', '')) : 0,
            rotateY: _.isArray(elTransform.match(/rotateY\(((-\w+|\w+))\)/)) ? parseFloat(elTransform.match(/rotateY\(((-\w+|\w+))\)/)[1].replace('px', '')) : 0,
            rotateZ: _.isArray(elTransform.match(/rotateZ\(((-\w+|\w+))\)/)) ? parseFloat(elTransform.match(/rotateZ\(((-\w+|\w+))\)/)[1].replace('px', '')) : 0
        };

        endProperties.translateZ = endProperties.translateZ || 0;

        var diff = 0;
        _.each(endProperties, function(end, key){
            diff += (end == element.startProperties[key]) ? 0 : 1;
        });

        if( diff == 0 ){
            //clog('hardwareAnimation stopped, endProps do not differ from startProps');
            if( customCb )
                return callback.call(element, false);
            return false;
        }

        //clog(endProperties);

        var transformString = function(percentComplete, isComplete) {
            var transform='',
                translate = ['0px', '0px', '0px'],
                rotate = [0, 0, 0, 0],
                scale = [0, 0, 0];

            /*for(prop in endProperties) {
                var change,
                    value,
                    start = element.startProperties[prop],
                    end = String(endProperties[prop]);

                if(end.indexOf('-=') === 0) change = parseInt(end.substring(2)) * -1;
                else if (end.indexOf('+=') === 0) change = parseInt(end.substring(2));
                else change = parseInt(end) == 0 ? start*(-1) : parseInt(end); //fuck it, a string is interpreted as '+='


                value = start + (percentComplete*change);
                clog(''+prop+': '+start+', '+value+', '+change );

                switch(prop){
                    case 'translateX': transform += ' translateX('+value+'px)'; translate[0] = value+'px'; break;
                    case 'translateY': transform += ' translateY('+value+'px)'; translate[1] = value+'px'; break;
                    case 'translateZ': transform += ' translateZ('+value+'px)'; translate[2] = value+'px'; break;
                    case 'scaleX': scale[0] = value; break;
                    case 'scaleY': scale[1] = value; break;
                    case 'scaleZ': scale[2] = value; break;
                    default: break;
                    //case 'rotateX': rotate[0] = value+'deg'; break;
                     //case 'rotateY': rotate[1] = value+'deg'; break;
                     //case 'rotateZ': rotate[2] = value+'deg'; break;
                     //case 'rotateZ': rotate[2] = value+'deg'; break;
                }

                if(isComplete) element.startProperties[prop] = value;
            }
            for(key in translate){
                translate[key]  = translate[key] || '0px';
            }

            //transform += translate.length ? ' translate3d('+translate.join(', ')+')' : '';

            return transform;*/


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

                    transform += ' '+prop+'('+value;

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

                var string = transformString(1, true);
                clog(string);
                element.style[transitionDuration] = (duration/1000)+'s';
                element.style[transform] = string;

                Meteor.setTimeout(function(){
                    element.style[transitionDuration] = '0';
                    callback.call(element, true);
                }, duration);

                cue.shift();
                if(cue.length > 0) cue[0].call();
            };

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