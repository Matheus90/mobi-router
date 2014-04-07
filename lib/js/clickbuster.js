(function(Meteor){

     cBuster = function(){

         var preventedCoordinates = [];

         var eventStartTagName = '';

         this.onClick = function(event){
             if( event.type == 'click' && mobileScrolling && !(['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].indexOf(event.target.tagName) != -1 && (eventStartTagName == event.target.tagName)) ){
                 event.preventDefault();
                 event.stopPropagation();
                 event.stopImmediatePropagation();
                 return false;
             }
             for (var i = 0; i < preventedCoordinates.length; i += 2) {
                 var x = preventedCoordinates[i];
                 var y = preventedCoordinates[i + 1];
                 if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25  && !(['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].indexOf(event.target.tagName) != -1 && (eventStartTagName == event.target.tagName)) ) {
                     event.preventDefault();
                     event.stopPropagation();
                     event.stopImmediatePropagation();
                     return false;
                 }
             }
         };

         this.preventGhostClick = function(event) {
             eventStartTagName = event.target.tagName;

             var elem = document.activeElement;
             if( ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].indexOf(elem.tagName) != -1 && ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].indexOf(event.target.tagName) == -1)
                elem.blur();

             var _this = this;
             preventedCoordinates.push(event.touches[0].clientX);
             preventedCoordinates.push(event.touches[0].clientY);
             Meteor.setTimeout(function(){ _this.popCoords() }, 1500);
         };

        this.popCoords = function() {
            preventedCoordinates.splice(0, 2);
         };

         this.init = function() {
             document.addEventListener('touchstart', this.preventGhostClick, true);
             document.addEventListener('touchend', this.preventGhostClick, true);
             document.addEventListener('touch', this.preventGhostClick, true);

             document.addEventListener('mousedown', this.onClick, true);
             document.addEventListener('mouseup', this.onClick, true);
             document.addEventListener('click', this.onClick, true);
         };

         this.destroy = function(){
             document.removeEventListener('touchstart', this.preventGhostClick, true);
             document.removeEventListener('touchend', this.preventGhostClick, true);
             document.removeEventListener('touch', this.preventGhostClick, true);

             document.removeEventListener('mousedown', this.onClick, true);
             document.removeEventListener('mouseup', this.onClick, true);
             document.removeEventListener('click', this.onClick, true);
         };
     };

    ClickBuster = new cBuster;

})(Meteor);
