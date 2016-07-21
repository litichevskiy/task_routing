
//  Метод router.add первым параметром ждет шаблон в виде строки который должен начинаться
//  со '/' ('/user/{id}'), и любое колл-во переменных '{value}',вторым аргументом callback.
//  router подписан на событие 'hashchange', при наступлении которого router найдет первый
//  подходящий под текущий url шаблон, и вызовет callback, передав ему объект с переменными
//  '{value}' и их текущими значениями, ( если в шаблоне переменных не было '/user/id', то вернется
//   пустой объект ).
//  Все шаблоны добовляються по очереди, если есть два одинаковых то выполниться тот, который
//  был добавлен первым, т.е. выполняется всегда только один шаблон ( если есть подходящий ).


(function( exports ) {

    function Router() {

        var that = this;
        this.storageLinks = [];

        window.addEventListener('hashchange', function( event ){
            var url = location.hash.replace('#','');
            that.searchHandler( url );
        });
    }

    var validityCheckingUrl = (function() {

        var regExp = new RegExp('^(?:\/(?:\{[^\/\{\}]+\}|[^\/\{\}]+))+\/?$');

        return function ( url ) {

            var check = regExp.test( url );

            if ( check ) return true;
            else return false;
        }

    })();

    Router.prototype.add = function( url, callback ) {

        var result, regExp, check,
            cashUrl, values = [];

        if ( typeof callback !== 'function' ) {
            throw new Error( callback + ' is not function');
        }

        check = validityCheckingUrl( url );
        if ( !check ) throw new Error ( url + ' not valid' );

        cashUrl = url.split('/');

        cashUrl.forEach(function( item ) {

            if( item[0] === '{' ) {

                item = item.split('');
                item = item.slice(1, item.length - 1 ).join('');
                values.push( item );
            }
        });

        result = url.replace(/{.+?}/gi, function() {
            return '([^/]+)';
        });

        regExp = new RegExp( '^' + result + '$' );


        this.storageLinks.push({
            url     : url,
            handler : callback,
            regExp  : regExp,
            vars    : values
        });

    };

    Router.prototype.searchHandler = function( url ) {
        var result, data;

        this.storageLinks.every(function( item ){

            result = item.regExp.exec( url );

            if( result ) {

                data = getVariable( item.vars, result );
                item.handler( data );

                return false;
            }

            return true;
        });
    };


    function getVariable( listValues, result ) {

        var data = {},
            key;

        for( var i = 1, l = 0; i < result.length; i++, l++ ) {

            key = listValues[l];
            data[key] = result[i];
        }

        return data;
    }

    exports.Router = Router;

})( window );