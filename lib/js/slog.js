
if( Meteor.isClient ){
    slog = function(){
        Meteor.call('slog', arguments);
    };
}


if( Meteor.isServer ){

    Meteor.methods({
        slog: function(params){
            for( i in params ){
                console.log(params[i]);
            }
        }
    });

}