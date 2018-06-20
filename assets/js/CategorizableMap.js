/*

Copyright (c) 2015 Derek MacDonald

Permission to use, copy, modify, and/or distribute this software
for any purpose with or without fee is hereby granted, provided
that the above copyright notice and this permission notice appear
in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL
WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE
AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,
NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*/

/**
 * Categorize markers on a Google Maps instance.
 */
var CategorizableMap = Class.extend({
	options: {
		isInitialized: false,
		latLng: new google.maps.LatLng(-31.5, 133.416667), // Centre o' Straya, mate
		mapOptions: {},
		markers: {},
		categories: {},
		scrollwheel: true,
		style: [],
		zoom: 5
	},

	/**
	 * Assign parameters for this map's instance and launch Google Maps if the
	 * library is found.
	 *
	 * @param {object} el DOM node or selector for the element that will display the
	 *                 actual map.
	 * @parameter {object} options List of parameters:
	 *            - {google.maps.LatLng} latLng, where to center map (default:
	 *              approx visual centre of populated Australia)
	 *            - boolean scrollwheel, enable mousewheel on mobile (default: true)
	 *            - integer zoom, level when map first loads (default: 5)
	 *            - {object} mapOptions, second parameter of google.maps.Map constructor
	 *            - {object} style, look-and-feel customisations
	 */
	init: function(el, options) {
		this.el = el;
		this.$el = el;

		this.options = $.extend({}, this.options, options);

		if ('undefined' !== typeof google && 'undefined' !== typeof google.maps) {
			this.initializeMap();
		}

		return this;
	},

	/**
	 * The rote Google Maps API ramp up implemented for every use.
	 * Assign events, style, and set zoom level when ready.
	 */
	initializeMap: function() {
		var mapOptions = {
			center: this.options.latLng,
			scrollwheel: this.options.scrollwheel,
			zoom: this.options.zoom
		};

		mapOptions = $.extend({}, this.options.mapOptions, mapOptions);

		var googleMap = new google.maps.Map($(this.el).get(0), mapOptions);

		if (this.options.style && this.options.style.length > 0) {
			googleMap.setOptions({styles: this.options.style});
		}

		// disable dragging in Google Map but allow scrolling past it. Prevents
		// mobile devices from being trapped in a fullscreen map.
		if ('ontouchend' in document && !this.options.scrollwheel) {
			googleMap.setOptions({draggable: false});
			new MobileTouchDisabler(googleMap);
		}

		var self = this;
		google.maps.event.addListener(googleMap, 'tilesloaded', function() {
			// First time the Google Map loads, draw location markers and center
			// map according to user's current location.
			if (!self.options.isInitialized) {
				self.showRequestedMarkers();

				if (self.options.useGeolocation) {
					self.discoverLatLng();
				}

				self.options.isInitialized = true;
			}
		});

		this.googleMap = googleMap;
	},

	/**
	 * If allowed by the end-user, centre the map to their current GPS coords.
	 * Prompts are naggy on mobile so not everyone will approve it.
	 */
	discoverLatLng: function() {
		var self = this;

		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var lat = position.coords.latitude,
				    lng = position.coords.longitude;

				self.setCenter(lat, lng);
			});
		}
	},

	/**
	 * With Google Map tiles loaded, centre map focus to new GPS coords.
	 */
	setCenter: function(lat, lng) {
		if (this.googleMap) {
			var latLng = new google.maps.LatLng(lat, lng);

			this.googleMap.setCenter(latLng);
		}
	},

	/**
	 * Define a new category. If addMarker() is called where 'category' isn't
	 * defined by this method call, that marker will be uncategorized.
	 *
	 * If only one parameter for an 'icon' is included, marker categorization
	 * isn't used. Any existing categories are cleared.
	 *
	 * @param {string} category Unique taxonomy label.
	 * @param {object} The category marker icon definition.
	 *                 https://developers.google.com/maps/documentation/javascript/markers#complex_icons
	 */
	addCategory: function(category, icon) {
		if ('undefined' === typeof icon) {
			// only one marker type, override all
			if ('object' === typeof category && null !== category) {
				this.options.markers = [];
				this.options.categories = category;
			}
		} else {
			// multiple marker types
			this.options.categories[category] = icon;
			this.options.markers[category] = [];
		}

		return this;
	},

	/**
	 * Categorize a new marker. Or exclude the category parameter and don't.
	 *
	 * @param {string} category (optional)
	 * @param number lat Latitude coordinate.
	 * @param number lng Longitude coordinate.
	 * @param {object} location Metadata for the marker, used by callback
	 *        method getLocationHtml().
	 *        IT IS ASSUMED THIS METADATA CONTAINS attribute .name
	 * @param boolean visible (optional)
	 * @param int animation Constant google.maps.Animation.DROP or
	 *        google.maps.Animation.BOUNCE (optional)
	 */
	addMarker: function(category, lat, lng, location, visible, animation) {
		// 'category' not provided in argument list if lat/lng are first two
		// arguments so shift values across each variable.
		var floatPattern = /^-?\d*(\.\d+)?$/;
		if (floatPattern.exec(category) !== null && floatPattern.exec(lat) !== null) {
			animation = visible;
			visible = location;
			location = lng;
			lng = lat;
			lat = category;
			category = null;
		}

		var latLng = new google.maps.LatLng(lat, lng);

		var markerOptions = {
			position: latLng,
			map: this.googleMap,
			title: location.name,
			visible: true === visible
		};

		if (category in this.options.categories) {
			markerOptions.icon = this.options.categories[category];
		}

		if (visible && (animation === google.maps.Animation.DROP || animation === google.maps.Animation.BOUNCE)) {
			markerOptions.animation = animation;
		}

		var marker = new google.maps.Marker(markerOptions);

		if (category in this.options.categories) {
			this.options.markers[category][this.options.markers[category].length] = marker;
		} else {
			if ($.isEmptyObject(this.options.categories)) {
				this.clearCategories();
			}

			this.options.markers[this.options.markers.length] = marker;
		}

		var infoWindow = new google.maps.InfoWindow({
			content: this.getLocationHtml(location)
		});

		var self = this;
		google.maps.event.addListener(marker, 'click', function() {
			if(marker.infoWindow) {
				marker.infoWindow.close();
				marker.infoWindow = null;
			} else {
				infoWindow.open(self.googleMap, marker);
				marker.infoWindow = infoWindow;

				self.hideVisibleInfoWindow(marker);
			}
		});

		return this;
	},

	/**
	 * Build HTML for a marker's InfoWindow. This implementation is
	 * Aussie-centric so feel free to override the method.
	 *
	 * @param {Object} location Metadata for the marker as passed into addMarker()
	 *
	 * @return {string}
	 */
	getLocationHtml: function(location) {
		var html = '<h4>' + location.name + '</h4>';

		if (location.address && location.address.length > 0) {
			html += location.address + '<br>';
		}

		var suburbHtml = '';

		if (location.suburb && location.suburb.length > 0) {
			suburbHtml += location.suburb + ' ';
		}

		if (location.state && location.state.length > 0) {
			suburbHtml += location.state + ' ';
		}

		if (location.postcode && location.postcode.length > 0) {
			suburbHtml += location.postcode;
		}

		suburbHtml = $.trim(suburbHtml);
		if (suburbHtml.length > 0) {
			html += suburbHtml + '<br>';
		}

		if (location.url && location.url.length > 0 && location.url !== 'http://') {
			html += '<a href="' + location.url + '" target="_blank">' +
				location.url +
				'</a><br>';
		}

		var directionsDestination = '';

		if (location.address && location.suburb && location.state && location.postcode) {
			 directionsDestination = $.trim(location.address + ' ' +
				location.suburb + ' ' +
				location.state + ' ' +
				location.postcode);
		}

		if (directionsDestination.length === 0 && location.map) {
			directionsDestination = $.trim(location.map);
		}

		if (directionsDestination.length > 0) {
			html += '<br><div class="google-map-infowindow-actions"><a href="https://maps.google.com?daddr=' +
				encodeURIComponent(directionsDestination) +
				'">Get directions</a></div>';
		}

		return html;
	},

	/**
	 * Hide popup details of an InfoWindow visible and attached to a marker.
	 *
	 * @param {google.maps.Marker} exceptForMarker Exclude search on this instance.
	 * @returns Class instance for method chaining.
	 */
	hideVisibleInfoWindow: function(exceptForMarker) {
		var otherMarkers = this.getMarkers();

		for (var i = 0; i < otherMarkers.length; i++) {
			var otherMarker = otherMarkers[i];

			if (otherMarker !== exceptForMarker && otherMarker.infoWindow) {
				otherMarker.infoWindow.close();
				otherMarker.infoWindow = null;
			}
		}

		return this;
	},

	/**
	 * Retrieve flat array of all markers displayed on the map.
	 *
	 * @returns {Array} of google.maps.Marker instances.
	 */
	getMarkers: function() {
		var markers;

		if ('undefined' !== typeof this.options.markers.length) {
			markers = this.options.markers;
		} else {
			markers = [];

			for (var category in this.options.markers) {
				for (var i = 0; i < this.options.markers[category].length; i++) {
					markers[markers.length] = this.options.markers[category][i];
				}
			}
		}

		return markers;
	},

	/**
	 * Retrieve labels for categories already added (not necessarily with
	 * markers defined.)
	 *
	 * @return Array of strings
	 */
	getCategories: function() {
		return $.map(this.options.categories, function(el, i) {
			return i;
		});
	},

	/**
	 * Show/hide all markers for a category.
	 *
	 * DOM elements with the attribute 'data-location-category' equal to the
	 * category value will have the 'active' class added/removed, depending
	 * on the toggle state.
	 *
	 * @param string category Label of category to toggle.
	 * @param animation Constant google.maps.Animation.DROP or
	 *        animation === google.maps.Animation.BOUNCE. Default behaviour
	 *        is to use no transition animation.
	 */
	toggleCategory: function(category, animation) {
		if (category in this.options.markers) {
			var markers = this.options.markers[category];

			for (var i = 0; i < markers.length; i++) {
				var marker = markers[i];

				if (!marker.getVisible() && (animation === google.maps.Animation.DROP || animation === google.maps.Animation.BOUNCE)) {
					// Bounce each marker for 1.4 seconds.
					marker.setAnimation(animation);
					(function(bouncingMarker) {
						setTimeout(function() {
							bouncingMarker.setAnimation(null);
						}, 1400);
					})(marker);
				}

				marker.setVisible(!marker.getVisible());
			}
		}

		$('[data-location-category="' + category + '"]').toggleClass('active');
	},

	/**
	 * Change visibility of markers in all categories.
	 */
	toggleCategories: function() {
		var self = this;

		// ensure each category is only shown/hidden once
		var categoriesToggled = [];

		$('[data-location-category]').each(function() {
			var locationCategory = $(this).data('location-category');

			if ($.inArray(locationCategory, categoriesToggled) === -1) {
				self.toggleCategory(locationCategory);

				categoriesToggled[categoriesToggled.length] = locationCategory;
			}
		});
	},

	/**
	 * Remove all category icon definitions and containing markers.
	 */
	clearCategories: function() {
		this.options.markers = [];
		this.options.categories = [];
	},

	/**
	 * Use #hash on the location URL to pre-filter markers displayed.
	 * e.g., #yellow will only diplay markers in category labelled 'yellow'.
	 */
	showRequestedMarkers: function() {
		// Locations for one category requested, only on tablet/desktop.
		if(document.location.hash.length > 0 && $('[data-location-category]:visible').size() > 0) {
			var category = document.location.hash.substring(1);

			if ($.inArray(category, this.getCategories()) > -1) {
				// filter to only one category
				this.toggleCategory(category);
			} else {
				// show all categories	
				this.toggleCategories();
			}
		} else {
			// show all categories
			this.toggleCategories();
		}
	},

	/**
	 * Zoom map canvas to fit around bounds of all markers on the map.
	 * Not too useful on mobile.
	 */
	zoomToMarkers: function() {
		var bound = new google.maps.LatLngBounds();
		var markers = this.getMarkers();

		for(var i in markers) {
			bound.extend(markers[i].getPosition());
		}
 
		this.googleMap.fitBounds(bound);
	}
});
