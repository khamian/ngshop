'use strict';

var controllersAdmin = angular.module( 'controllersAdmin' , ['angularFileUpload', 'myDirectives'] );

controllersAdmin.controller( 'products' , [ '$scope' , '$http' , 'checkToken', function( $scope , $http, checkToken ){

    $http.post( 'api/admin/products/get', {

       token: checkToken.raw()

    }).success( function( data ){

        $scope.products = data;

    }).error( function(){
        console.log( 'Error on communicate with API.' );
    });

    $scope.delete = function(product, $index) {

        if (!confirm('Are you really want to delete this product?')) {
            return false;
        }

        $scope.products.splice($index, 1);

        $http.post( 'api/admin/products/delete/', {

            token: checkToken.raw(),
            product: product

        }).error( function(){
            console.log( 'Error on communicate with API.' );
        });

    }

}]);

controllersAdmin.controller( 'productEdit' , [ '$scope' , '$http' , '$routeParams', 'FileUploader', '$timeout', 'checkToken', function( $scope , $http , $routeParams, FileUploader, $timeout, checkToken ){

    var productId = $routeParams.id;
    $scope.id = productId;

    $http.post( 'api/admin/products/get/' + productId, {

       token: checkToken.raw()

    }).success( function( data ){
        $scope.product = data;
    }).error( function(){
        console.log( 'Error on communicate with API.' );
    });

    function getImages() {
        $http.post( 'api/admin/images/get/' + productId , {

            token: checkToken.raw()

        }).success( function( data ){

            $scope.images = data;

        }).error( function(){
            console.log( 'Error on communicate with API.' );
        });
    }

    getImages();

    var uploader = $scope.uploader = new FileUploader({
        token: checkToken.raw(),
        url: 'api/admin/images/upload/' + productId
    });

    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        getImages();
        //$scope.product.thumbnail = fileItem._file.name;
    };

    $scope.delImage = function (image, $index) {

        $scope.images.splice($index, 1);

        $http.post( 'api/admin/images/delete/' , {

            token: checkToken.raw(),
            id : productId,
            image : image

        }).error( function(){
            console.log( 'Error on communicate with API.' );
        });

    };

    $scope.setThumbnail = function (product, image) {

        if($scope.product.thumbnail == image) {
            $scope.product.thumbnail = '';
        } else {
            $scope.product.thumbnail = image;
        }

    };

    $scope.saveChanges = function(product) {


        $http.post( 'api/admin/products/update/', {

            token: checkToken.raw(),
            product: product

        }).success( function(){
            $scope.success = true;

            $timeout(function(){
                $scope.success = false;
            }, 3000);
        }).error( function(){
            console.log( 'Error on communicate with API.' );
        });

        $http.post( 'api/admin/images/setThumbnail/', {

            token: checkToken.raw(),
            product: product,
            image: product.thumbnail

        }).error( function(){
            console.log( 'Error on communicate with API.' );
        });

    };


}]);

controllersAdmin.controller( 'productCreate' , [ '$scope' , '$http' , '$timeout', 'checkToken', function( $scope , $http, $timeout, checkToken ){

    $scope.createProduct = function(product) {

        $http.post( 'api/admin/products/create/', {

            token: checkToken.raw(),
            product: product

        }).success( function( ){
            $scope.success = true;
            $scope.product = {};
            $timeout(function(){
                $scope.success = false;
            }, 3000);
        }).error( function(){
            console.log( 'Error on communicate with API.' );
        });

    }

}]);


controllersAdmin.controller( 'users' , [ '$scope' , '$http', 'checkToken', function( $scope , $http, checkToken ){

    $http.post( 'api/admin/users/get', {

        token: checkToken.raw()

    }).success( function( data ){
        $scope.users = data;
    }).error( function(){
        console.log( 'Error on communicate with API.' );
    });

    $scope.delete = function(user, $index) {

        if (!confirm('Are you really want to delete this user?')) {
            return false;
        }

        $scope.users.splice($index, 1);

        $http.post( 'api/admin/users/delete/', {
            user: user
        }).error( function(){
            console.log( 'Error on communicate with API.' );
        });

    }

}]);

controllersAdmin.controller( 'userEdit' , [ '$scope' , '$http' , '$routeParams' , '$timeout', 'checkToken', function( $scope , $http , $routeParams, $timeout, checkToken ){

    var userId = $routeParams.id;
    $scope.id = userId;

    $http.post( 'api/admin/users/get/' + userId, {

       token: checkToken.raw()

    }).success( function( data ){
        $scope.user = data;
    }).error( function(){
        console.log( 'Error on communicate with API.' );
    });

    $scope.saveChanges = function(user) {

        $http.post( 'api/admin/users/update/', {

            token: checkToken.raw(),
            id: userId,
            user : user,
            firstName : user.firstName,
            lastName : user.lastName,
            email : user.email,
            password : user.password,
            passconf : user.passconf

        }).success( function(errors){

            $scope.submit = true;

            if (errors) {
                $scope.errors = errors;
            } else {
                $scope.success = true;
                $timeout(function(){
                    $scope.success = false;
                }, 3000);
            }

            $scope.submit = true;
        }).error( function(){
            console.log( 'Error on communicate with API.' );
        });

    };

}]);

controllersAdmin.controller( 'userCreate' , [ '$scope' , '$http' , '$timeout', 'checkToken', function( $scope , $http, $timeout, checkToken ){

    $scope.user = {};
    $scope.user.role = 'user';

    $scope.createUser = function(user) {

        $http.post( 'api/admin/users/create/', {

            token: checkToken.raw(),
            user : user,
            firstName : user.firstName,
            lastName : user.lastName,
            email : user.email,
            password : user.password,
            passconf : user.passconf

        }).success( function( errors ){

            if (errors) {
                $scope.errors = errors;
            } else {
                $scope.user = {};
                $scope.success = true;
                $timeout(function(){
                    $scope.success = false;
                }, 3000);
            }

            $scope.submit = true;

        }).error( function(){
            console.log( 'Error on communicate with API.' );
        });

    }

}]);

controllersAdmin.controller( 'orders' , [ '$scope' , '$http' , 'checkToken', function( $scope , $http, checkToken ){

    $http.post( 'api/admin/orders/get/' , {

        token: checkToken.raw(),
        payload: checkToken.payload()

    }).success( function( data ){

        $scope.orders = data;

        angular.forEach( $scope.orders , function( order , key ){
            var parsed = JSON.parse( order.items );
            $scope.orders[key].items = parsed;
        });

    }).error( function(){
        console.log( 'Error on communicate with API.' );
    });

    $scope.delete = function(order, $index) {

        if (!confirm('Are you really want to delete this order?')) {
            return false;
        }

        $scope.orders.splice($index, 1);

        $http.post( 'api/admin/orders/delete/' , {

            token: checkToken.raw(),
            id: order.id

        }).error( function(){
            console.log( 'Error on communicate with API.' );
        });

    };

    $scope.changeStatus = function(order) {

        if(order.status == 0) {
            order.status = 1;
        } else {
            order.status = 0;
        }

        $http.post( 'api/admin/orders/update/' , {

            token: checkToken.raw(),
            id: order.id,
            status: order.status

        }).error( function(){
            console.log( 'Error on communicate with API.' );
        });

    };

}]);