'use strict';

var controllersSite = angular.module( 'controllersSite' , [] );

controllersSite.controller( 'siteProducts' , [ '$scope' , '$http' , 'cartService', function( $scope , $http, cartService ){

    $http.get( 'model/products.json' ).
    success( function( data ){
        $scope.products = data;
    }).error( function(){
        console.log( 'Error on loading json file.' );
    });

    $scope.addToCart = function (product) {
        cartService.add(product);
    };

}]);

controllersSite.controller( 'siteProduct' , [ '$scope' , '$http' , '$routeParams' , 'cartService', function( $scope , $http , $routeParams, cartService ){

    $http.post( 'model/products.json' ).
    success( function( data ){
        var products = data;
        $scope.product = products[$routeParams.id];
    }).error( function(){
        console.log( 'Error on loading json file.' );
    });

    $scope.addToCart = function (product) {
        cartService.add(product);
    };

}]);

controllersSite.controller( 'siteOrders' , [ '$scope' , '$http' , function( $scope , $http ){

    $http.get( 'model/orders.json' ).
    success( function( data ){
        $scope.orders = data;
    }).error( function(){
        console.log( 'Error on loading json file.' );
    });

}]);

controllersSite.controller( 'cartCtrl' , [ '$scope' , '$http' , '$filter', 'cartService', function( $scope , $http, $filter, cartService ){

    $scope.cart = cartService.show();

    $scope.emptyCart = function () {
        cartService.empty();
    };

    $scope.total = function () {
        var total = 0;
        angular.forEach($scope.cart, function(item) {
            total += item.amount * item.price;
        });
        total = $filter('number')(total, 2);
        return total;
    };

    $scope.removeItem = function ($index) {
        $scope.cart.splice($index, 1);
        cartService.update($scope.cart);
    };

    $scope.setOrder = function ($event) {

        //TODO: chceck if user is logged in
        var loggedIn = true;

        if (!loggedIn) {
            $scope.alert = {type: 'warning', msg: 'You have to be logged in.'};
            $event.preventDefault();
            return false;
        }

        //TODO: save order to db
        console.log($scope.total());
        console.log($scope.cart);

        $scope.alert = {type: 'success', msg: 'Order in process. Dont refresh the page.'};
        cartService.empty();

        $event.preventDefault();
        $('#paypalForm').submit();
    };

    $scope.$watch(function () {
       cartService.update($scope.cart);
    });

}]);