jQuery.fn.hardwareAnimate = function(endProperties, duration, easing, callback, before) {
	var element = this[0],
		duration = duration || 1000,
		easing = easing || 'easeOutExpo',
		callback = callback || function() {
			MobiRouter.speak('animation complete');
		},
        before = before || function(){};
	
	element.startProperties = element.startProperties || {
			translateX: 0,
			translateY: 0,
			translateZ: 0,
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
				
				var value = element.startProperties[prop] + (percentComplete*endProperties[prop]);
				
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
			}
		}
		performAnimation();
	};

    before.call(element);
	beginAnimation();
	return this;
}

jQuery.fn.hardwareCss = function(translateScaleRotate) {
	this[0].style[transform] = translateScaleRotate;
	return this;
}