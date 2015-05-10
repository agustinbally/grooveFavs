var sqlite3 = require("sqlite3").verbose();
var json2csv = require("json2csv");
var fs = require('fs');

var storageFullPath = process.env.APPDATA;
storageFullPath = storageFullPath.replace('Roaming', 'Local\\Google\\Chrome\\User Data\\Default\\Local Storage\\http_grooveshark.com_0.localstorage');

exportGroovesharkFavsToCsv(storageFullPath);

function exportGroovesharkFavsToCsv(storageFullPath) {
  getGrooveFavs(storageFullPath, function(favs){
    favs.forEach(function (item, index) {

      json2csv({data: item, fields:['B', 'D', 'J'], fieldNames:['Album', 'Artist', 'Song']}, function(err, csv) {
        if (err) {
          console.log(err);
        }

        var csvFileName = 'groovesharkFavs' + (index+1) + '.csv';
        fs.writeFile(csvFileName, csv, function(err) {
          if (err) {
            throw err;
          }
          console.log('Generate fav: ' + csvFileName);
        });
      });
    });

    console.log('Favs processing: ' + favs.length);
  });
}

function getGrooveFavs(dbFileName, callback) {
  var db = new sqlite3.Database(dbFileName);

  db.all("SELECT * FROM ItemTable WHERE key like 'library1%' ", function(err, rows) {
    var songs = [];

    rows.forEach(function (row) {
      var jsonData = JSON.parse(row.value.toString('ucs2'));
      var jsonSongs = getSongsJSON(jsonData);

      songs.push(JSON.parse(jsonSongs));
    });

    callback(songs);
  });

  db.close();
}

function getSongsJSON(jsonData){
  var jsonSongs = '[';
  for(var item in jsonData.songs){
    jsonSongs += '{';

    jsonSongs += getFormatedField('D',jsonData.songs[item].D, ',');
    jsonSongs += getFormatedField('B',jsonData.songs[item].B, ',');
    jsonSongs += getFormatedField('J',jsonData.songs[item].J, '');

    jsonSongs += '},';
  }

  jsonSongs = jsonSongs.substring(0, jsonSongs.length-1) + ']';

  return jsonSongs;
}

function getFormatedField(fieldName, fieldValue, endChar){
  return '"' + fieldName +'": "' + fieldValue.replace(/"/g, '\'') + '"' + endChar;
}
