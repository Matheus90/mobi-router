doc = document;

prefixStyle = function(style) {
    if ( vendor === '' ) return style;

    style = style.charAt(0).toUpperCase() + style.substr(1);
    return vendor + style;
};

prefixCSSstyle = function(style, value) {
    if ( vendor === '' ) return style;

    return '-'+vendor+'-' + style +': '+value+';';
};

EV = {};

m = Math,
    dummyStyle = doc.createElement('div').style,
    vendor = (function () {
        var vendors = 't,webkitT,MozT,msT,OT'.split(','),
            t,
            i = 0,
            l = vendors.length;

        for ( ; i < l; i++ ) {
            t = vendors[i] + 'ransform';
            if ( t in dummyStyle ) {
                return vendors[i].substr(0, vendors[i].length - 1);
            }
        }

        return false;
    })(),
    cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',

// Style properties
    transform = prefixStyle('transform'),
    transitionProperty = prefixStyle('transitionProperty'),
    transitionDuration = prefixStyle('transitionDuration'),
    transformOrigin = prefixStyle('transformOrigin'),
    transitionTimingFunction = prefixStyle('transitionTimingFunction'),
    transitionDelay = prefixStyle('transitionDelay'),

// Browser capabilities
    isAndroid = EV.isAndroid = (/android/gi).test(navigator.appVersion),
    isIDevice = EV.isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
    isTouchPad = EV.isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
    isMobile = EV.isMobile = isAndroid || isIDevice || isTouchPad,

    has3d = EV.has3d = prefixStyle('perspective') in dummyStyle,
    hasTouch = EV.hasTouch = 'ontouchstart' in window && !isTouchPad,
    hasTransform = EV.hasTransform = vendor !== false,
    hasTransitionEnd = EV.hasTransitionEnd = prefixStyle('transition') in dummyStyle,

    RESIZE_EV = EV.RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
    START_EV = EV.START_EV = hasTouch ? 'touchstart' : 'mousedown',
    MOVE_EV = EV.MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
    END_EV = EV.END_EV = hasTouch ? 'touchend' : 'mouseup',
    CANCEL_EV = EV.CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
    CLICK_EV = EV.CLICK_EV = hasTouch ? 'touchend' : 'click',
    TRNEND_EV = EV.TRNEND_EV = (function () {
        if ( vendor === false ) return false;

        var transitionEnd = {
            ''			: 'transitionend',
            'webkit'	: 'webkitTransitionEnd',
            'Moz'		: 'transitionend',
            'O'			: 'otransitionend',
            'ms'		: 'MSTransitionEnd'
        };

        return transitionEnd[vendor];
    })(),

    nextFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) { return setTimeout(callback, 1); };
    })(),
    cancelFrame = (function () {
        return window.cancelRequestAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            clearTimeout;
    })(),

// Helpers
    translateZ = EV.translateZ = has3d ? ' translateZ(0)' : '';


dummyStyle = null;	// for the sake of it

if(isMobile) document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

