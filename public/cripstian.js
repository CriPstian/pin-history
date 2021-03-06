var earthPath = 'https://api.nasa.gov/planetary/earth/';
var results = [];
var resultsIndex = 0;
var timeoutFunc;
var stopped = false;
var loadedImages = 0;
var loadedLinks = 0;
var speed = 250;
var assetsArray = [];
   
function imageSrcLoad() {
  if(resultsIndex == results.length) resultsIndex = 0;
  $('#images').children().hide();
  results[resultsIndex++].image.parent().show();
  timeoutFunc = window.setTimeout(imageSrcLoad, speed);
};

function prev() {
  stopped = true;
  window.clearTimeout(timeoutFunc);
  var btn = $('#play-pause');
  btn.addClass('glyphicon-play');
  btn.removeClass('glyphicon-pause');
  resultsIndex--;
  if(resultsIndex < 0) resultsIndex = results.length - 1;
  $('#images').children().hide();
  results[resultsIndex].image.parent().show();
}

function next() {
  stopped = true;
  window.clearTimeout(timeoutFunc);
  var btn = $('#play-pause');
  btn.addClass('glyphicon-play');
  btn.removeClass('glyphicon-pause');
  resultsIndex++;
  if(resultsIndex >= results.length) resultsIndex = 0;
  $('#images').children().hide();
  results[resultsIndex].image.parent().show();
}

function stop() {
  resultsIndex = 0;
  stopped = true;
  window.clearTimeout(timeoutFunc);
  var btn = $('#play-pause');
  btn.removeClass('glyphicon-pause');
  btn.addClass('glyphicon-play');
  $('#images').children().hide();
  results[0].image.parent().show();
}
   
function playStop() {
  var btn = $('#play-pause');
  if(stopped) {
    stopped = false;
    imageSrcLoad();
    btn.removeClass('glyphicon-play');
    btn.addClass('glyphicon-pause');
  }
  else {
    stopped = true;
    window.clearTimeout(timeoutFunc);
    btn.addClass('glyphicon-play');
    btn.removeClass('glyphicon-pause');
  }
};

function getAssetsForLocation(paramLocation) {
  $.get(assetsLink, function(data) {
    assetsArray = data.results;
  })
};

function getImages() {
  showProgressBar();
  $.get(assetsLink, function(data) {
    var frames = parseInt($('#frameNumber').val());
    if(frames === 'NaN') {
      frames = assetsArray.length;
    }
    var array = data.results.slice(data.results.length - frames, data.results.length);
    var len = array.length;
    
    $('#images-length').text('Numar poze: ' + len);

    jQuery.each(array, function(index, item) {
      results[index] = item;
      window.setTimeout(
        function() {
          $.get(imageLink + item.date.substr(0,10), function(imageData) {
            results[index].src = imageData.url;
            loadedLinks = loadedLinks + 1;
            console.log('loadedLinks ' + loadedLinks);
            move(((loadedLinks)*100)/(len*2));
            if(loadedLinks == len) {
              console.log('Done loading links.');
              jQuery.each(results, function(resultIndex, result) {
                setImageObject(result, resultIndex);
              });
            }
          });
        }, 1000*(index + 1));
    });
  });
};

function setImageObject(result, index) {
  var header = $('<div>');
  header.text('data: ' + result.date + '; index: ' + index);
  var len = results.length;
  var image = $('<img>');
  window.setTimeout(function(imageIndex, image) {
    image.attr('src', result.src);
    image.on('load', function() {
      loadedImages = loadedImages + 1;
      console.log('loadedLinks ' + loadedLinks + ';loadedImages ' + loadedImages);    
      move(((loadedLinks + loadedImages)*100)/(len*2));
      if(loadedImages == len) {
        hideProgressBar();
        console.log('Done loading images.');
        timeoutFunc = window.setTimeout(imageSrcLoad, speed);
        stopped = false;
      }
    });
  }, (index+1)*1000, index, image);
  var div = $('<div>');
  div.append(image);
  div.append(header);
  div.appendTo($('#images'));
  div.hide();
  results[index].image = image;
}

function showProgressBar() {
  $('#progress-bar').removeClass('hidden');
  var progressBar = $('#image-progress');
  progressBar.css('width', '0');
  progressBar.text('0%');
}

function hideProgressBar() {
  $('#progress-bar').addClass('hidden');
  $('#images-row').removeClass('hidden');
}

function findLocation(event) {
  event.preventDefault();

  var latInput = $('#lat');
  var lonInput = $('#lon');
  var apiKeyInput = $('#apiKey');

  var lat = latInput.val();
  var lon = lonInput.val();
  var apiKey = apiKeyInput.val();
  setLinks(lon, lat, apiKey);
  setDefaults();
  getImages();
  return false;
};

function setLinks(lon, lat, apiKey) {
  imageLink = earthPath + 'imagery?api_key=' + apiKey + '&lon=' + lon + '&lat=' + lat + '&date=';
  assetsLink = earthPath + 'assets?api_key=' + apiKey + '&lon=' + lon + '&lat=' + lat + '&begin=2000-01-01';
}

function setDefaults() {
  resultsIndex = 0;
  results = [];
  loadedImages = 0;
  $('#images').empty();
  stopped = true;
}

function move(percent) {
  console.log('moving to ' + percent + ' %');
  var rounded = Math.round(percent * 100)/100;
  var imageProgress = $('#image-progress');
  imageProgress.css('width', rounded + '%');
  imageProgress.text(rounded + '%');
};

function initMap() {
  var myLatlng = {
    lat: 44.425541,
    lng: 26.129124
  };

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: myLatlng,
    mapTypeId: 'satellite'
  });

  var marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    title: 'Selected location'
  });

  map.addListener('click', function(data) {
    var lat = data.latLng.lat();
    var lng = data.latLng.lng();

    $('#lat').val(lat);
    $('#lon').val(lng);

    myLatlng = {
      lat: lat,
      lng: lng
    };

    this.setCenter(myLatlng);
    this.setZoom(14);
    marker.setPosition(myLatlng)
  });
}




