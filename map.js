/*jslint browser: true, node: true */
/*global $, jQuery, alert, google*/
"use strict";
var directionsDisplay,
    map,
    marker,
    autocompleteDepart,
    autocompleteArrive,
    infowindow,
    place,
    i,
    markers = [],
    waypointMarker = [],
    request,
    valeurdepart,
    valeurArriver,
    markerRadar,
    service,
    ajoutBouton = document.getElementById('suppr'),
    ajoutTrajet = document.getElementById('enregistrer'),
    supprTrajet = document.getElementById('supprimer'),
    inputDepart = document.getElementById('depart'),
    inputArrive = document.getElementById('arrive'),
    inputSubmit = document.getElementById('rechercher');

/*recupère les information renvoyer par navigator.geolocalisation*/
function localisation(position) {
    var latitude = position.coords.latitude,
        longitude = position.coords.longitude;
    map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    marker = new google.maps.Marker({
        /*change la position de la map quand on est geolocalisé*/
        position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
        map: map,
        title: "Vous êtes ici !"
    });
    inputDepart.value = latitude + " " + longitude;
}

/*si la localisation n'est pas possible renvoie l'érreur en fonction du code erreur*/
function erreur(error) {
    switch (error.code) {
    case error.UNKNOWN_ERROR:
        alert("La geolocation a rencontré une erreur.");
        break;
    case error.PERMISSION_DENIED:
        alert("Vous n'avez pas autorisé l'accès à votre position.");
        break;
    case error.POSITION_UNAVAILABLE:
        alert("Vous n'avez pas pu être localisé.");
        break;
    case error.TIMEOUT:
        alert("La geolocation prend trop de temps.");
        break;
    }
}

/*ajoute des marker + waypoint sur le trajet et recalcule l'itinéraire*/
function addMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    markers.push(marker);
    waypointMarker = [];
    for (i = 0; i < markers.length; i += 1) {
        waypointMarker.push({
            location: new google.maps.LatLng(markers[i].position.k, markers[i].position.D),
            stopover: true
        });
    }
    ajoutBouton.style.display = "block";
}



/*créer les petites étoiles pour les place qui se trouve sur le trajet*/
function createMarker(place) {
    markerRadar = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: {
            // étoile en svg
            path: 'M 0,-24 6,-7 24,-7 10,4 15,21 0,11 -15,21 -10,4 -24,-7 -6,-7 z',
            fillColor: '#ffff00',
            fillOpacity: 1,
            scale: 1 / 4,
            strokeColor: '#bd8d2c',
            strokeWeight: 1
        },
        name: place.name
    });
    /* au clic ouvre une fenetre sur le marker avec le nom du lieux*/
    google.maps.event.addListener(markerRadar, 'mouseover', function () {
        infowindow = new google.maps.InfoWindow({
            content: this.name
        });
        infowindow.open(map, this);
    });
    /*ajoute un marker + un waypoint au clic*/
    google.maps.event.addListener(markerRadar, 'click', function (event) {
        addMarker(event.latLng);
    });
    /*ferme la fenetre quand la souri qui le marker*/
    google.maps.event.addListener(markerRadar, 'mouseout', function () {
        infowindow.close();
    });
}

/*appel pour chaque resultat de textSeach la fonction de création de marker*/
function appelCreate(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        var i = 0,
            result = results[0];
        do {
            createMarker(result);
            i += 2;
            result = results[i];
        } while (result); /*tant que resulte est défini*/
    }
}

/*enregistre les données de trajet dans le local storage*/
function supportlocalstorage(resultRoute) {
    if (window.localStorage && window.localStorage !== null) {
        var tabLegs = resultRoute.routes[0].legs.length,
            origine = resultRoute.routes[0].legs[0].start_address,
            destination = resultRoute.routes[0].legs[tabLegs - 1].end_address,
            instructions = "",
            tabstep = resultRoute.routes[0].legs[0].steps;
        /*converti chaque chaine de step en chaine de caractère*/
        for (i = 0; i < tabstep.length; i += 1) {
            instructions += JSON.stringify(resultRoute.routes[0].legs[0].steps[i].instructions) + "<br/>";
        }

        localStorage.setItem("depart", origine);
        localStorage.setItem("arrive", destination);
        localStorage.setItem("itineraire", instructions);
    } else {
        alert("le storage est pas pris en charge");
    }
}

/*appeler lors de du clic sur recherche*/
function itineraire() {
    var directionsService = new google.maps.DirectionsService(),
        selectMode = document.getElementById("mode").value,
        request = {
            origin: inputDepart.value,
            destination: inputArrive.value,
            provideRouteAlternatives: true, /* affiche les route alternative*/
            waypoints: waypointMarker, /*tableu de marker*/
            optimizeWaypoints: true, /*reorganise les waypoint*/
            travelMode: google.maps.TravelMode[selectMode]/*choix du mode de transport value du select*/
        };
    directionsService.route(request, function (result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            var tab = result.routes[0].legs[0].steps,
                i,
                requestRadar;
            for (i = 0; i < tab.length; i += 1) {
                requestRadar = {
                    location: new google.maps.LatLng(result.routes[0].legs[0].steps[i].lat_lngs[0].k, result.routes[0].legs[0].steps[i].lat_lngs[0].D),
                    radius: 3000,
                    query: 'tourist attraction'
                };
                /*recherche de tout les places qui comporte tourist attraction dans un rayon de 3km autour des steps*/
                service.textSearch(requestRadar, appelCreate);
            }
            /*enregistre le trajet automatiquement dans le local storage*/
            supportlocalstorage(result);

            directionsDisplay.setDirections(result);
            /*affiche les infos de directions*/
            directionsDisplay.setPanel(document.getElementById('etape_itineraire'));
        } else {
            alert("Il n'existe pas d'itineraire pour votre destination");
        }
    });

}

function stopSubmit(evt) {
    evt.preventDefault();
}

/*efface les marker et vide les tableaux de marker*/
function deleteMarkers() {
    for (i = 0; i < markers.length; i += 1) {
        markers[i].setMap(null);
    }
    waypointMarker = [];
    markers = [];
    if (inputArrive.value !== "") {
        itineraire();
    }
}
/*première fonction appeler, affiche en premier la map sur paris, teste si la personne est on/offline, utilise la geolocalisation, instancie l'autocomplete*/
function initialize() {

    var msg,
        attrDraggable = {
            draggable: true
        },
        Paris = new google.maps.LatLng(48.866667, 2.333333),
        mapOptions = {
            zoom: 12,
            center: Paris
        };
        /*si la personne est offline affiche les infos stocker dans localstorage*/
    if (!window.navigator.onLine) {
        msg = "Vous êtes déconnecté, les informations affiché si dessous sont celles du dernier trajet que vous avez recherché";
        document.getElementById("box").innerHTML = msg;
        document.getElementById("map_content").innerHTML = "<p>Depart: " + localStorage.depart + "</p><p>Arrivé :" + localStorage.arrive + "</p><p></br> etape : " + localStorage.itineraire + "</p>";
    } else {

        directionsDisplay = new google.maps.DirectionsRenderer(attrDraggable);
        map = new google.maps.Map(document.getElementById("map_content"), mapOptions);
        directionsDisplay.setMap(map);
        service = new google.maps.places.PlacesService(map);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(localisation, erreur, {enableHighAccuracy: true});
        } else {
            alert("Votre navigateur ne prend pas en compte la géolocalisation HTML5");
        }
        /*autocomplete sur l'input depart*/
        autocompleteDepart = new google.maps.places.Autocomplete(inputDepart);

        autocompleteDepart.bindTo('bounds', map);

        /*autocomplete su l'input d'arrivé*/
        autocompleteArrive = new google.maps.places.Autocomplete(inputArrive);

        autocompleteArrive.bindTo('bounds', map);

        marker = new google.maps.Marker({
            map: map
        });
        /*change le centre de la carte pour le placer sur l'input de départ*/
        google.maps.event.addListener(autocompleteDepart, 'place_changed', function () {
            place = autocompleteDepart.getPlace();
            if (!place.geometry) {

                inputDepart.className = 'notfound';
                return;
            }

            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(14);

            }
            marker.setPosition(place.geometry.location);
        });
        /*ajoute des waypoint au clic sur n'importe quel endroit de la carte*/
        google.maps.event.addListener(map, 'click', function (event) {
            addMarker(event.latLng);
            /*au clic (a l'ajout de nouveau marker) recalcule l'itinéraire*/
            if (inputArrive.value !== "") {
                itineraire();
            }
        });
        /*si le stockage de donnée en cache pour l'utilisation hors ligne est desactivé alerte l'utilisateur*/
        if (!window.applicationCache) {
            alert("Votre navigateur ne permet pas les applications hors ligne, si la connexion est interrompue, nous ne pouvons pas stocker vos informations de trajet et vous n'y aurez plus accès.");
        }
    }
}

document.onload = initialize();

ajoutBouton.addEventListener('click', stopSubmit, false);

ajoutBouton.addEventListener("click", deleteMarkers);

inputSubmit.addEventListener('click', stopSubmit, false);

inputSubmit.addEventListener("click", itineraire);