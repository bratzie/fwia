/*jslint white: true */
/*jslint node: true */
/*global angular, $ */

'use strict';

var url = 'http://swedbank_jellyfish.findwise.com/rest/ident/demoident/searcher/default/search.jsonp';
var app = angular.module('fwia', []);

/**
* Fetch factory is used for sending request towards the API
* @returns {Promise} - T
*/
app.factory("Fetch", function($http) {
    return {
        jsonpData: function(params) {
            return $http({
                url: url,
                method: 'JSONP',
                params: params
            });
        }
    };
});

app.controller('mainCtrl', ['$scope', '$http', 'Fetch',
    function($scope, $http, Fetch) {
        var params, query;
        
        // initialize scope variables to use them in pre-request layout
        $scope.query = '';
        $scope.lastQuery = '';
        $scope.documents = '';
        $scope.fullData = '';
        $scope.hitsPerPage = 10;
        $scope.currentPage = 1;
        $scope.lastPage = 1;
        
        /**
        * Updates the search results list depending on the parameters supplied using the Fetch factory.
        * @param {Object} params - The parameter object.
        * @param {string} params.offset - Where to start returning results.
        * @param {string} params.q - The query for the search.
        */
        function updateData(params) {
            params.hits = $scope.hitsPerPage;
            params.callback = 'JSON_CALLBACK'; // add the callback param in order to parse the response correctly in AngularJS
            Fetch.jsonpData(params)
            .success(function(data) {
                $scope.fullData = data; // save the response
                $scope.lastQuery = $scope.query; // transfer the value so it doesn't update while we're typing new query
                if (data && data.components.doclists[0]) { // check if we actually got some documents as a reponse
                    $scope.documents = data.components.doclists[0].documents; // populate UI with new information
                    $scope.lastPage = Math.ceil(data.numberOfHits / $scope.hitsPerPage); // update last page based on user preferences
                } else { // no documents in our response
                    $scope.documents = ''; // clear the documents in order to clear the UI
                }
            })
            .error(function(err) {
                console.log(err);
            });
        }
        
        /**
        * Conducts a new search using the value of the input field / search bar
        * @param {Object} $event - The AngularJS event that was fired during interaction (automatic)
        */
        $scope.search = function($event) {
            // Only initiate a search if we pressed the enter key or interacted with search button
            if ($event.keyCode === 13 || $event.target.id === "search-button") {
                if (query === encodeURIComponent($scope.query)) {
                    return; // same query as last time, lets not send more requests
                }
                query = encodeURIComponent($scope.query); // encode it to avoid nasty things
                params = {
                    offset: 0, // initial search, get the first results
                    q: query
                };
                $scope.currentPage = 1;
                updateData(params);
            }
        };
        
        /**
        * Creates a new search call based on the current page in order to show the documents of the next page.
        */
        $scope.showNextPage = function() {
            if ($scope.currentPage >= 1 && $scope.currentPage < $scope.lastPage ) { // sanity check, buttons disabled, but who knows what could happen...
                $scope.currentPage += 1;
                params = {
                    offset: ($scope.hitsPerPage * $scope.currentPage) - $scope.hitsPerPage,
                    q: $scope.lastQuery // base the page swap on the last executed query. The user might change the input field.
                };
                updateData(params);
            } else {
                return;
            }
        };
        
        /**
        * Creates a new search call based on the current page in order to show the documents of the previous page.
        */
        $scope.showPreviousPage = function() {
            if ($scope.currentPage > 1 && $scope.currentPage <= $scope.lastPage ) { // sanity check, buttons disabled, but who knows what could happen...
                $scope.currentPage -= 1;
                params = {
                    offset: ($scope.hitsPerPage * $scope.currentPage) - $scope.hitsPerPage,
                    q: $scope.lastQuery // base the page swap on the last executed query. The user might change the input field.
                };
                updateData(params);
            } else {
                return;
            }
        };
        
        // TEST DATA q=bank
//        $http.get('../private/data2.json').success(function(data) {
//            $scope.fullData = data; // save the response
//            console.log(data);
//            if (data.components.doclists[0]) { // check if we actually got some documents as a reponse
//                $scope.documents = data.components.doclists[0].documents; // populate UI with new information
//            } else {
//                $scope.lastQuery = $scope.query; // transfer the value so it doesn't update while we're typing new query
//                $scope.documents = ''; // clear the documents in order to clear the UI
//            }
//        });
    }
]);