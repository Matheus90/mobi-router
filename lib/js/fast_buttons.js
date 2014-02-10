
(function(Meteor){
   /* FastButtons = {

        preventedCoordinates: [],

        onClick: function(event){
            for (var i = 0; i < FastButtons.preventedCoordinates.length; i += 2) {
                var x = FastButtons.preventedCoordinates[i];
                var y = FastButtons.preventedCoordinates[i + 1];
                if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                    //alert(event.type+': stopPropagation');
                }
            }
            //alert(event.type+': '+event.clientX+', '+event.clientY);
        },

        preventGhostClick: function(event) {
            //alert(event.type);
            FastButtons.preventedCoordinates.push(event.touches[0].clientX);
            FastButtons.preventedCoordinates.push(event.touches[0].clientY);
            Meteor.setTimeout(function(){ FastButtons.popCoords() }, 1500);
        },

        popCoords: function() {
            FastButtons.preventedCoordinates.splice(0, 2);
        },

        init: function() {
            document.addEventListener('touchstart', FastButtons.preventGhostClick, true);
            document.addEventListener('touchend', FastButtons.preventGhostClick, true);
            //document.addEventListener('touch', FastButtons.preventGhostClick, false);
            //document.addEventListener('touchmove', FastButtons.preventGhostClick, false);

            document.addEventListener('click', FastButtons.onClick, false);
        },

        destroy: function(){
            document.removeEventListener('touch', FastButtons.preventGhostClick, false);
            document.removeEventListener('touchstart', FastButtons.preventGhostClick, false);
            document.removeEventListener('touchend', FastButtons.preventGhostClick, false);
            document.removeEventListener('touchmove', FastButtons.preventGhostClick, false);
            document.removeEventListener('click', FastButtons.onClick, false);
            document.removeEventListener('mousedown', FastButtons.onClick, false);
            document.removeEventListener('mouseup', FastButtons.onClick, false);
        }
    };

    FastButtons.init();*/

    /*FastButton = function(element, handler) {
        this.element = element;
        this.handler = handler;

        element.addEventListener('touchstart', this, false);
        element.addEventListener('click', this, false);
    };

    FastButton.prototype.handleEvent = function(event) {
        switch (event.type) {
            case 'touchstart': this.onTouchStart(event); break;
            case 'touchmove': this.onTouchMove(event); break;
            case 'touchend': this.onClick(event); break;
            case 'click': this.onClick(event); break;
        }
    };

    FastButton.prototype.onTouchStart = function(event) {
        event.stopPropagation();

        this.element.addEventListener('touchend', this, false);
        document.body.addEventListener('touchmove', this, false);

        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
    };

    FastButton.prototype.onTouchMove = function(event) {
        if (Math.abs(event.touches[0].clientX - this.startX) > 100 ||
            Math.abs(event.touches[0].clientY - this.startY) > 100) {
            this.reset();
        }
    };

    clickbuster = {

        preventGhostClick: function(x, y) {
            clickbuster.coordinates.push(x, y);
            Meteor.setTimeout(clickbuster.pop, 2500);
        },

        pop: function() {
            clickbuster.coordinates.splice(0, 2);
        },

        onClick: function(event) {
            for (var i = 0; i < clickbuster.coordinates.length; i += 2) {
                    var x = clickbuster.coordinates[i];
                    var y = clickbuster.coordinates[i + 1];
                    if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
        },

        coordinates: []
    };

    document.addEventListener('click', clickbuster.onClick, true);*/

})(Meteor);