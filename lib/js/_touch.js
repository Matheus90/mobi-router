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
isAndroid = (/android/gi).test(navigator.appVersion),
isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
isMobile = isAndroid || isIDevice || isTouchPad,

has3d = prefixStyle('perspective') in dummyStyle,
hasTouch = 'ontouchstart' in window && !isTouchPad,
hasTransform = vendor !== false,
hasTransitionEnd = prefixStyle('transition') in dummyStyle,

RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
START_EV = hasTouch ? 'touchstart' : 'mousedown',
MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
END_EV = hasTouch ? 'touchend' : 'mouseup',
CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
TRNEND_EV = (function () {
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
translateZ = has3d ? ' translateZ(0)' : '';


dummyStyle = null;	// for the sake of it

if(isMobile) document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
document.addEventListener('click', function (e) { if( (new Date) - touchEventStarted < 1000 ) return false; }, false);


