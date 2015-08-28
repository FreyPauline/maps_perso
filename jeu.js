/*jslint browser: true, node: true */
/*global $, jQuery, alert, google*/
"use strict";
var map,
    count = 0,
    score;
function initialize() {
    var Paris = new google.maps.LatLng(35.870185, -5.946806),
        mapOptions = {
            zoom: 2,
            center: Paris
        };
    map = new google.maps.Map(document.getElementById("map_content"), mapOptions);
    document.getElementById('map_content').style.height = "800px";
    document.getElementById('map_content').style.width = "1100px";
    document.getElementById('content').style.width = "1102px";
    google.maps.event.addListener(map, 'click', function () {
        count += 1;
        document.getElementById('score').innerHTML = "essaie " + count;
    });
}

var question1 = ["Dans quel pays ce trouve Paris?", 46.5794252, 2.4184131, 500000],
    question2 = ["Où ce trouve le mont Everest ?", 27.98833, 86.92528, 600000],
    question3 = ["Quel est le continent le plus pauvre du monde?", 4.895984,  17.230013, 4000000],
    question4 = ["Quel pays a pour capitale La Havane?", 22.130006, -79.669898, 500000],
    question5 = ["Ou se trouve le canal de suez?", 30.436017, 32.307980, 300000],
    question6 = ["Placer le détroit de Gibraltar?", 35.980037, -5.627230, 300000],
    question7 = ["Situez le triangle des Bermudes?", 25.020752, -71.153809, 800000],
    question8 = ["Sur quel continent ce trouve Brisbane?", -25.200125, 133.433591, 2000000],
    question9 = ["Dans quel pays ce trouve le volcan Eyjafjallajökull", 63.631638, -19.605761, 300000],
    question10 = ["Ou ce trouve le Machu Picchu la cité Inca", -13.163245, -72.545049, 600000],
    tabQuestion = [question1, question2, question3, question4, question5, question6, question7, question8, question9, question10],
    i = 0,
    x,
    repCircle;

function shuffle(array) {
    var j,
        temp;
    for (x = 0; x < array.length; x += 1) {
        j = Math.floor(Math.random() * (x + 1));
        temp = array[x];
        array[x] = array[j];
        array[j] = temp;
    }
    return array;
}


function question(i) {
    if (tabQuestion[i] === undefined) {
        if (count === 0) {
            alert("Vous avez gagné! Et en plus vous navez fait aucune erreur! vous êtes un pro de géographie!");
            location.reload();
        } else if (count === 1) {
            alert("A une erreur près c'est le sans faute! Féllicitation");
            location.reload();
        } else if (count > 5 && count < 10) {
            alert(count + " Fautes c'est pas mal, mais des révisions s'imposent");
            location.reload();
        } else if (count > 10 && count < 15) {
            alert(count + "! Aie voici le site d'acadomia http://www.acadomia.fr/");
            location.reload();
        } else if (count > 15) {
            alert("Peine perdu " + count + " pour " + tabQuestion.length + "... Je crain qu'on ne puisse plus rien pour vous!");
            location.reload();
        }
    }
    var infowindow = new google.maps.InfoWindow({
        content: tabQuestion[i][0]
    }),
        marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(tabQuestion[i - 1][1], tabQuestion[i - 1][2])
        }),
        cicleOption = {
            strokeOpacity: 0,
            strokeWeight: 2,
            fillOpacity: 0,
            map: map,
            center: new google.maps.LatLng(tabQuestion[i][1], tabQuestion[i][2]),
            radius: tabQuestion[i][3]
        };

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
    });

    repCircle = new google.maps.Circle(cicleOption);
    google.maps.event.addListener(repCircle, 'click', function () {
        infowindow.close();
        marker.setMap(null);
        repCircle.setMap(null);
        i += 1;
        question(i);
    });
}

function jeu() {

    tabQuestion = shuffle(tabQuestion);

    var infowindow = new google.maps.InfoWindow({
        content: tabQuestion[i][0]
    }),
        firstMarker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(35.516012, -40.162565)
        }),
        firstrepCircle,
        firtcicleOption = {
            strokeOpacity: 0,
            strokeWeight: 2,
            fillOpacity: 0,
            map: map,
            center: new google.maps.LatLng(tabQuestion[i][1], tabQuestion[i][2]),
            radius: tabQuestion[i][3]
        };

    google.maps.event.addListener(firstMarker, 'click', function () {
        infowindow.open(map, firstMarker);
    });

    firstrepCircle = new google.maps.Circle(firtcicleOption);

    google.maps.event.addListener(firstrepCircle, 'click', function () {
        infowindow.close();
        firstMarker.setMap(null);
        firstrepCircle.setMap(null);
        i += 1;
        question(i);
    });

}


document.onload = initialize();
document.onload = jeu();


