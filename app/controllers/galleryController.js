(function() {
    var injectParams = ['$scope', 'toaster'];

    var galleryController = function($scope, toaster) {
        var imagesPerPage = 6;
        var nextStack = [];

        function init() {
            $scope.galleryImages = [];    
            $scope.previousStack = [];
            nextStack = [];
            $scope.nextReusltPage = null;
        }
        
        $scope.searchTopic = function() {
            init();
            getImages();
        }

        //second chance for option that all results are bad
        function getImages(after = '', secondChance = false) {
            reddit.new($scope.topicSearch)
                .limit(imagesPerPage)
                .after(after)
                .fetch(function(res) {
                if (res == undefined || res == null || res.error == 404) {
                    toaster.pop('warning', 'Results not found. Please try again');
                    return;
                }

                if(res.data == undefined || res.data == null) return;

                var images = [];

                res.data.children.forEach(function(child) {

                    var imageUrl = getImageUrl(child.data);
                    if (imageUrl == null) {
                        return;
                    }

                    //set gif images to be able to present
                    if (imageUrl.includes('.gifv')){
                        imageUrl = imageUrl.replace('.gifv', '.gif');
                    }

                    var image = {
                        name: child.data.name,
                        link: child.data.permalink,
                        title: child.data.title,
                        imageUrl: imageUrl
                    };                  
        
                    images.push(image);
                });
                
                $scope.nextReusltPage = res.data.children[res.data.children.length - 1].data.name;

                if (images.length == 0 && !secondChance) {
                    getImages(after, true);
                } else {
                    updateImages(images);
                }
            },
            function(err) {
                toaster.pop('error', 'Error has occurred, please try again');
            });
        }

        $scope.nextPage = function() {
            if ($scope.galleryImages.length == 0) {
                if ($scope.nextReusltPage == null) return;

                getImages($scope.nextReusltPage);
            } else {
                $scope.previousStack.push($scope.galleryImages);
                
                if (nextStack.length == 0){
                    getImages($scope.nextReusltPage);
                } else {
                    updateImages(nextStack.pop());
                }
            }
        }

        $scope.previousPage = function() {
            if ($scope.previousStack.length == 0) return;

            nextStack.push($scope.galleryImages);

            updateImages($scope.previousStack.pop());
        }

        function getImageUrl(image) {
            var imageUrl = image.url;

            if (checkExtension(imageUrl)) return imageUrl;

            if (image.preview != undefined && image.preview != null && image.preview.images > 0) {
                imageUrl = image.preview.images[0].source.url;

                if (checkExtension(imageUrl)) return imageUrl;
            } 
            
            if (image.thumbnail != undefined && image.thumbnail != null) {
                imageUrl = image.thumbnail;
                if (checkExtension(imageUrl)) return imageUrl;
            } 
            
            return null;
        }

        function checkExtension(str) {
            var lower = str.toLowerCase();

            if (lower.includes('.jpg') ||
                lower.includes('.jpeg') ||
                lower.includes('.gif'))
                return true;

            return false;
        }

        function updateImages(images) {
            $scope.galleryImages = images;
            if(!$scope.$$phase){
                $scope.$apply();
            }
        }

        init();
    }

    galleryController.$inject = injectParams;

    angular.module('galleryApp').controller('galleryController', galleryController);
}());