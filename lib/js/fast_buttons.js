
(function(Meteor){
    FastButtons = {

        preventedCoordinates: [],

        onClick: function(event){
            for (var i = 0; i < FastButtons.preventedCoordinates.length; i += 2) {
                var x = FastButtons.preventedCoordinates[i];
                var y = FastButtons.preventedCoordinates[i + 1];
                if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
                    event.stopPropagation();
                    event.preventDefault();
                }
            }
        },

        preventGhostClick: function(x, y) {
            FastButtons.preventedCoordinates.push(x, y);
            Meteor.setTimeout(FastButtons.preventedCoordinates.pop, 1500);
        },

        pop: function() {
            FastButtons.preventedCoordinates.splice(0, 2);
        },

        init: function() {
            document.addEventListener('touchstart', FastButtons.preventGhostClick, false);
            document.addEventListener('touchend', FastButtons.preventGhostClick, false);
            document.addEventListener('touchmove', FastButtons.preventGhostClick, false);
            document.addEventListener('click', FastButtons.onClick, true);
        },

        destroy: function(){
            document.removeEventListener('touchstart', FastButtons.preventGhostClick, false);
            document.removeEventListener('touchend', FastButtons.preventGhostClick, false);
            document.removeEventListener('touchmove', FastButtons.preventGhostClick, false);
            document.removeEventListener('click', FastButtons.onClick, false);
        }
    };


})(Meteor);