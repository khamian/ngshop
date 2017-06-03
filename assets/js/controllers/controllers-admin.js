'use strict';

var controllersAdmin = angular.module( 'controllersAdmin' , [ 'angularFileUpload', 'myDirectives', 'ui.select', 'ngSanitize', 'angular-owl-carousel-2' ] );

controllersAdmin.controller( 'products' , [ '$scope' , '$http' , 'checkToken', 'productsService', function( $scope , $http, checkToken, productsService ){

    // get products
    $http.post( 'api/admin/products/get', {

       token: checkToken.raw()

    }).then( function( data ){

        $scope.products = data.data;

        angular.forEach($scope.products, function( item ) {

            productsService.getCategoryName( item.category ).then(function( data ) {

                item.categoryName = data.data.replace(/['"]+/g, '');

            });

        });

    }, ( function(){

        console.log( 'Error on communicate with API.' );

    }));

    $scope.delete = function(product, $index) {

        if (!confirm('Are you really want to delete this product?')) {
            return false;
        }

        $scope.products.splice($index, 1);

        $http.post( 'api/admin/products/delete/', {

            token: checkToken.raw(),
            product: product

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

    };

}]);

controllersAdmin.controller( 'productEdit' , [ '$scope' , '$http' , '$routeParams', 'FileUploader', '$timeout', 'checkToken', 'categoriesService', function( $scope , $http , $routeParams, FileUploader, $timeout, checkToken, categoriesService ){

    var productId = $routeParams.id;
    $scope.id = productId;

    // get product
    $http.post( 'api/admin/products/get/' + productId, {

       token: checkToken.raw()

    }).then( function( data ){

        $scope.product = data.data;

        // get categories
        categoriesService.getData().then(function(data) {

            $scope.categories = data.data;

            angular.forEach($scope.categories, function(item) {

                if(item.id == $scope.product.category) {

                    $scope.product.category = item;

                }

            });


        });

    }, ( function(){

        console.log( 'Error on communicate with API.' );

    }));

    // get images
    function getImages() {
        $http.post( 'api/admin/images/get/' + productId , {

            token: checkToken.raw()

        }).then( function( data ){

            $scope.images = data.data;

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));
    }

    getImages();

    // init uploader
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
        $scope.product.thumbnail = "uploads/" + productId + "/" + fileItem._file.name;

    };

    // delete image
    $scope.delImage = function (image, $index) {

        $scope.images.splice($index, 1);

        $http.post( 'api/admin/images/delete/' , {

            token: checkToken.raw(),
            id : productId,
            image : image

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

    };

    // set thumbnail
    $scope.setThumbnail = function (product, image) {

        if($scope.product.thumbnail == image) {

            $scope.product.thumbnail = '';

        } else {

            $scope.product.thumbnail = image;

        }

    };

    // save changes
    $scope.saveChanges = function(product) {

        if(product) {
            product.category = product.category.id;
        }

        // post product
        $http.post( 'api/admin/products/update/', {

            token: checkToken.raw(),
            product: product

        }).then( function(){

            $scope.success = true;

            angular.forEach($scope.categories, function(item) {

                if(item.id == $scope.product.category) {

                    $scope.product.category = item;

                }

            });

            $timeout(function(){

                $scope.success = false;

            }, 3000);

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

        // post thumbnail
        $http.post( 'api/admin/images/setThumbnail/', {

            token: checkToken.raw(),
            product: product,
            image: product.thumbnail

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

    };


}]);

controllersAdmin.controller( 'productCreate' , [ '$scope' , '$http' , '$timeout', 'checkToken', 'categoriesService', function( $scope , $http, $timeout, checkToken, categoriesService ){

    $scope.product = {};

    // get categories
    categoriesService.getData().then(function(data) {

        $scope.categories = data.data;
        $scope.product.category = data.data[0];

    });

    // post product
    $scope.createProduct = function(product) {

        if(product) {
            product.category = product.category.id;
        }

        $http.post( 'api/admin/products/create/', {

            token: checkToken.raw(),
            product: product

        }).then( function( ){

            $scope.success = true;
            $scope.product = {};
            $timeout(function(){
                $scope.success = false;
                categoriesService.getData().then(function(data) {

                    $scope.categories = data.data;
                    $scope.product.category = data.data[0];

                });
            }, 3000);

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

    };

}]);

controllersAdmin.controller( 'categories' , [ '$scope' , '$http' , 'categoriesService', 'productsService', 'checkToken', function( $scope , $http, categoriesService, productsService, checkToken ){


    // get categories
    categoriesService.getData().then(function(data) {

        $scope.categories = data.data;

    });

    // get products from given category
    $scope.products = [];
    $scope.productsCount = [];

    $scope.getProducts = function( id ){

        productsService.getByCategoryId( id ).then(function(data) {

            $scope.products[id] = data.data;
            $scope.productsCount[id] = $scope.products[id].length;

        });

    };

    $scope.delete = function(category, $index) {

        if (!confirm('Are you really want to delete this category?')) {
            return false;
        }

        $scope.categories.splice($index, 1);

        $http.post( 'api/admin/categories/delete/', {

            token: checkToken.raw(),
            category: category

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

    };

}]);

controllersAdmin.controller( 'categoryCreate' , [ '$scope' , '$http' , '$timeout', 'checkToken', 'categoriesService', 'productsService', function( $scope , $http, $timeout, checkToken, categoriesService, productsService ){

    $scope.category = {};

    // get categories
    categoriesService.getData().then(function(data) {

        $scope.categories = data.data;
        $scope.category['id'] = $scope.categories.length + 1;

    });

    // get products without category - category '1'
    productsService.getByCategoryId(1).then(function(data) {

        $scope.products = data.data;

    });

    // create category
    $scope.createCategory = function(category, products) {

        angular.forEach(products.selected, function(item) {

            item.category = category.id;

            $http.post( 'api/admin/products/update/', {

                token: checkToken.raw(),
                product: item

            }).then( function(){

                $scope.success = true;

            }, ( function(){

                console.log( 'Error on communicate with API.' );

            }));

        });

        $http.post( 'api/admin/categories/create/', {

            token: checkToken.raw(),
            category: category

        }).then( function( ){

            $scope.success = true;
            $scope.category = {};
            categoriesService.getData().then(function(data) {

                $scope.categories = data.data;
                $scope.category['id'] = $scope.categories.length + 1;

            });
            productsService.getByCategoryId(1).then(function(data) {

                $scope.products = data.data;

            });
            $timeout(function(){
                $scope.success = false;
            }, 3000);

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

    };

}]);

controllersAdmin.controller( 'categoryEdit', [ '$scope' , '$http' , '$q', '$timeout', '$routeParams', 'checkToken' , function( $scope , $http, $q, $timeout, $routeParams, checkToken ) {

    // arrays difference
    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };

    var categoryId = $routeParams.id;
    $scope.id = categoryId;

    // get category
    $http.post( 'api/admin/categories/get/' + categoryId, {

        token: checkToken.raw()

    }).then( function( data ){

        $scope.category = data;

    }, ( function(){

        console.log( 'Error on communicate with API.' );

    }));

    // get products from this category + uncategorized
    $scope.productsUncategorized = $http.get('api/site/products/getByCategoryId/1', {cache: false});
    $scope.productsFromCategory = $http.get('api/site/products/getByCategoryId/' + categoryId, {'cache': false});

    $q.all([$scope.productsUncategorized, $scope.productsFromCategory]).then(function(data) {
        $scope.products = data[0].data.concat(data[1].data);
    });

    $http.get( 'api/site/products/getByCategoryId/' + categoryId).then( function( data ){

        $scope.products.selected = data;

    }, ( function(){

        console.log( 'Error on communicate with API.' );

    }));

    // save changes
    $scope.saveChanges = function(category, products) {

        var productsArr = products.filter(function( obj ) {
            return obj.id !== products.length;
        });

        var unselectedProductsArr = [];

        if(productsArr.length === products.selected.length ) {

            unselectedProductsArr = [];

        } else {

            unselectedProductsArr = productsArr.diff(products.selected);

        }

        $http.post( 'api/admin/categories/update/', {

            token: checkToken.raw(),
            category: category

        }).then( function(){

            $scope.success = true;

            $timeout(function(){

                $scope.success = false;

            }, 3000);

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

        // update selected products category
        angular.forEach(products.selected, function(item) {

            item.category = category.id;

            $http.post( 'api/admin/products/update/', {

                token: checkToken.raw(),
                product: item

            }).then( function(){

                $scope.success = true;

            }, ( function(){

                console.log( 'Error on communicate with API.' );

            }));

        });

        if(unselectedProductsArr.length) {

            // update unselected products category
            angular.forEach(unselectedProductsArr, function(item) {

                item.category = 1;

                $http.post( 'api/admin/products/update/', {

                    token: checkToken.raw(),
                    product: item

                }).then( function(){

                    $scope.success = true;

                }, ( function(){

                    console.log( 'Error on communicate with API.' );

                }));

            });

        }

    };


}]);

controllersAdmin.controller( 'users' , [ '$scope' , '$http', 'checkToken', function( $scope , $http, checkToken ){

    $http.post( 'api/admin/users/get', {

        token: checkToken.raw()

    }).then( function( data ){

        $scope.users = data.data;

    }, ( function(){

        console.log( 'Error on communicate with API.' );

    }));

    $scope.delete = function(user, $index) {

        if (!confirm('Are you really want to delete this user?')) {
            return false;
        }

        $scope.users.splice($index, 1);

        $http.post( 'api/admin/users/delete/', {

            token: checkToken.raw(),
            user: user

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

    }

}]);

controllersAdmin.controller( 'userEdit' , [ '$scope' , '$http' , '$routeParams' , '$timeout', 'checkToken', function( $scope , $http , $routeParams, $timeout, checkToken ){

    var userId = $routeParams.id;
    $scope.id = userId;

    $http.post( 'api/admin/users/get/' + userId, {

       token: checkToken.raw()

    }).then( function( data ){

        $scope.user = data.data;

    }, ( function(){

        console.log( 'Error on communicate with API.' );

    }));

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

        }).then( function(errors){

            $scope.submit = true;

            if (errors) {

                $scope.errors = errors.data;

            } else {

                $scope.success = true;
                $timeout(function(){
                    $scope.success = false;
                }, 3000);

            }

            $scope.submit = true;

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

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

        }).then( function( errors ){

            if (errors.data) {

                $scope.errors = errors.data;

            } else {

                $scope.user = {};
                $scope.success = true;
                $scope.errors = {};

                $timeout(function(){

                    $scope.success = false;

                }, 3000);

            }

            $scope.submit = true;

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

    }

}]);

controllersAdmin.controller( 'orders' , [ '$scope' , '$http' , 'checkToken', function( $scope , $http, checkToken ){

    $http.post( 'api/admin/orders/get/' , {

        token: checkToken.raw(),
        payload: checkToken.payload()

    }).then( function( data ){

        $scope.orders = data;

        angular.forEach( $scope.orders , function( order , key ){

            var parsed = JSON.parse( order.items );
            $scope.orders[key].items = parsed;

        });

    }, ( function(){

        console.log( 'Error on communicate with API.' );

    }));

    $scope.delete = function(order, $index) {

        if (!confirm('Are you really want to delete this order?')) {

            return false;

        }

        $scope.orders.splice($index, 1);

        $http.post( 'api/admin/orders/delete/' , {

            token: checkToken.raw(),
            id: order.id

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

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

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

    };

}]);

controllersAdmin.controller( 'adminCategory' , [ '$scope', '$http', '$location', '$window', '$routeParams', 'productsService', 'categoriesService', 'checkToken', function( $scope, $http, $location, $window, $routeParams, productsService, categoriesService, checkToken ){

    var slug = $routeParams.slug;

    // get products
    productsService.getByCategorySlug(slug).then(function(data) {

        $scope.products = data.data;

    });

    // get categories
    categoriesService.getByCategorySlug(slug).then(function(data) {

        $scope.category = data.data;

    });

    $scope.deleteProduct = function(product, $index) {

        if (!confirm('Are you really want to delete this product?')) {
            return false;
        }

        $scope.products.splice($index, 1);

        $http.post( 'api/admin/products/delete/', {

            token: checkToken.raw(),
            product: product

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

    };

    $scope.deleteCategory = function(category) {

        if (!confirm('Are you really want to delete this category?')) {
            return false;
        }

        $http.post( 'api/admin/categories/delete/', {

            token: checkToken.raw(),
            category: category

        }).then( function(){

            $location.path('/admin/categories');

        }, ( function(){

            console.log( 'Error on communicate with API.' );

        }));

    };

}]);

controllersAdmin.controller( 'adminHome' , [ '$scope', function( $scope){

    var owlAPi;
    $scope.showModal = false;
    $scope.items = [1, 2, 3, 4, 5, 6, 7, 8, 10];

    $scope.properties = {

        animateIn: 'fadeIn',
        lazyLoad: true,
        loop: true,
        items: 1,
        autoplay: false,
        autoplayHoverPause: true,
        nav: true,
        dots: false,
        navText: [
            "<span class='glyphicon glyphicon-chevron-left'></span>",
            "<span class='glyphicon glyphicon-chevron-right'></span>"
        ]

    };

    $scope.ready = function ($api) {
        owlAPi = $api;
    };

}]);