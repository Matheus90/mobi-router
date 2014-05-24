(function(Meteor){

     cBuster = function(){

         var preventedCoordinates = [];

         var touchEventTarget = '';

         var clickBusterSet = false;

         this.onClick = function(event){
             for (var i = 0; i < preventedCoordinates.length; i += 2) {
                 var x = preventedCoordinates[i];
                 var y = preventedCoordinates[i + 1];
                 if ( mobileScrolling ||
                     (touchEventTarget.tagName.match(/^(INPUT|TEXTAREA|BUTTON|SELECT)$/) && touchEventTarget != event.target) ||
                     Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25 && touchEventTarget != event.target) {
                     event.preventDefault();
                     event.stopPropagation();
                     event.stopImmediatePropagation();
                     return false;
                 }
             }
         };

         this.preventGhostClick = function(event) {
             touchEventTarget = event.target;

             var elem = document.activeElement;
             if( event.type == 'touchend' && !mobileScrolling && !!elem.tagName.match(/^(INPUT|TEXTAREA|BUTTON|SELECT)$/) && !event.target.tagName.match(/^(INPUT|TEXTAREA|BUTTON|SELECT)$/))
                 elem.blur();
             if( event.type == 'touchend' && !mobileScrolling && !!event.target.tagName.match(/^(INPUT|TEXTAREA)$/))
                 event.target.focus();

             var _this = this;
             if( !event.touches.length ) return;
             preventedCoordinates.push(event.touches[0].clientX);
             preventedCoordinates.push(event.touches[0].clientY);

             Meteor.setTimeout(function(){ ClickBuster.popCoords() }, 1500);
         };

        this.popCoords = function() {
            preventedCoordinates.splice(0, 2);
         };

         this.init = function() {
             if( clickBusterSet ) return false;

             document.addEventListener('touchstart', this.preventGhostClick, true);
             document.addEventListener('touchend', this.preventGhostClick, true);
             document.addEventListener('touch', this.preventGhostClick, true);

             document.addEventListener('mousedown', this.onClick, true);
             document.addEventListener('mouseup', this.onClick, true);
             document.addEventListener('click', this.onClick, true);
             clickBusterSet = true;
         };

         this.destroy = function(){
             document.removeEventListener('touchstart', this.preventGhostClick, true);
             document.removeEventListener('touchend', this.preventGhostClick, true);
             document.removeEventListener('touch', this.preventGhostClick, true);

             document.removeEventListener('mousedown', this.onClick, true);
             document.removeEventListener('mouseup', this.onClick, true);
             document.removeEventListener('click', this.onClick, true);
             clickBusterSet = false;
         };
     };

    ClickBuster = new cBuster;

})(Meteor);
