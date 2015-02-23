
(function () {
  
  angular.module('app')
    .factory('SearchFactory', SearchFactory);



  /* Search Request Factory */

  function SearchFactory($http, $q, lastfmFactory) {

    return {
      search: search,
      getAlbums: getAlbums,
      getJoinedAlbums: getJoinedAlbums,
      getAlbumByName: getAlbumByName,
      getArtistsAndAlbums: getArtistsAndAlbums
    }

    ///////////////////////////////////////////////

    function search(artistname, type) {

      var deferred = $q.defer();

      $http.get('api/search/' + type + '/' + artistname)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }


    function getAlbums(artistname) {
      var deferred = $q.defer();

      if (!artistname || artistname.length === 0) return deferred.reject(null);

      $http.get('api/search/albums/' + artistname)
        .success(function(data) { deferred.resolve(data); })
        .error(function(err) { deferred.reject(err); });

      return deferred.promise;
    }


    function getJoinedAlbums(artistname) {
      var deferred = $q.defer();

      $q.all([
        getAlbums(artistname),
        lastfmFactory.topAlbums(artistname)
      ]).then(function(results) {
        var joined = [];
        var albums = results[0].albums;
        var topalbums = results[1].topalbums.album;
        // top albums
        _.each(topalbums,function(topalbum) {
          topalbum.imageUrl = topalbum.image[3]['#text'];
          var topalbumname = topalbum.name.toLowerCase();
          if (_.has(albums, topalbumname)) {
            topalbum.songs = albums[topalbumname];
            topalbum.inDatabase = true;
            delete albums[topalbumname];
          } else {
            topalbum.songs = null;
            topalbum.inDatabase = false;
          }
          joined.push(topalbum);
        });
        //other albums
        _.each(albums, function(album, key) {
          if (key) {
            joined.push({
              name: key,
              songs: album,
              inDatabase: true,
              imageUrl: 'http://static.last.fm/flatness/catalogue/noimage/noalbum_g3.png'
            });
          }
        });
        deferred.resolve(joined);
      });

      return deferred.promise;
    }

    
    function getAlbumByName(artist, album) {

      var deferred = $q.defer();

      if (!artist || !artist.length > 0 || !album || !album.length > 0) {
        return deferred.reject('argument error');
      }     

      getAlbums(artist).then(function(results) {
        if (results.albums) {
          var albums = results.albums;
          var albumname = album.toLowerCase();
          
          if(_.has(albums, albumname)) {
            deferred.resolve(albums[albumname]);
          } else deferred.reject('album not found');

        } else deferred.reject('no albums found');

      });
      
      return deferred.promise;
    }


    function getArtistsAndAlbums(name) {

      var deferred = $q.defer();

      $q.all([
        search(name, 'Artist'),
        search(name, 'Album')
      ]).then(function(data) {
        console.log(data);
        deferred.resolve(data);
      });

      return deferred.promise;
    }

  }

})();
