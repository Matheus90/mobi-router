
if( Meteor.isClient ){
    slog = function(){
        Meteor.call('slog', arguments);
    };
}


if( Meteor.isServer ){

    slog = function(){
        Meteor.call('slog', arguments);
    };

    Meteor.methods({
        slog: function(params){
            for( i in params ){
                console.log(params[i]);
            }
        }
    });

}