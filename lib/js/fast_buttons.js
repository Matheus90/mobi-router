
(function(Meteor, Math){
    FastButtons = {

        preventedCoordinates: [],

        onClick: function(event){
            //alert( FastButtons.preventedCoordinates.length );
            for (var i = 0; i < FastButtons.preventedCoordinates.length; i += 2) {
                var x = FastButtons.preventedCoordinates[i];
                var y = FastButtons.preventedCoordinates[i + 1];
                if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
                    //alert('touch detected in area');
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                }
            }
        },

        preventGhostClick: function(event) {
            FastButtons.preventedCoordinates.push(event.touches[0].clientX);
            FastButtons.preventedCoordinates.push(event.touches[0].clientY);
            Meteor.setTimeout(function(){ FastButtons.pop() }, 1500);
        },

        pop: function() {
            FastButtons.preventedCoordinates.splice(0, 2);
        },

        init: function() {
            document.addEventListener('touch', FastButtons.preventGhostClick, false);
            document.addEventListener('touchstart', FastButtons.preventGhostClick, false);
            document.addEventListener('touchend', FastButtons.preventGhostClick, false);
            document.addEventListener('touchmove', FastButtons.preventGhostClick, false);
            document.addEventListener('click', FastButtons.onClick, true);
            document.addEventListener('mousedown', FastButtons.onClick, true);
            document.addEventListener('mouseup', FastButtons.onClick, true);
        },

        destroy: function(){
            document.removeEventListener('touch', FastButtons.preventGhostClick, false);
            document.removeEventListener('touchstart', FastButtons.preventGhostClick, false);
            document.removeEventListener('touchend', FastButtons.preventGhostClick, false);
            document.removeEventListener('touchmove', FastButtons.preventGhostClick, false);
            document.removeEventListener('click', FastButtons.onClick, false);
            document.removeEventListener('mousedown', FastButtons.onClick, true);
            document.removeEventListener('mouseup', FastButtons.onClick, true);
        }
    };

    FastButtons.init();

})(Meteor, Math);