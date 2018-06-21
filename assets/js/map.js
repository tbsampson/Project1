
/**
 * Customize UI components for Google Map and pre-define marker categories to use.
 */
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            database.ref('location').set({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            })

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }


var RestaurantMap = CategorizableMap.extend({
	init: function(el, templateDirectory) {
		// simple map controls on bottom right w/ category legend on top left
		var options = {
			mapOptions: {
				mapTypeControl: false,
				panControl: true,
				panControlOptions: {
					position: google.maps.ControlPosition.RIGHT_BOTTOM
				},
				zoomControl: true,
				zoomControlOptions: {
					style: google.maps.ZoomControlStyle.LARGE,
					position: google.maps.ControlPosition.RIGHT_BOTTOM
				},
				streetViewControl: true,
				streetViewControlOptions: {
					position: google.maps.ControlPosition.RIGHT_BOTTOM
				},
			},
		};

		if (this.isMobile()) {
			// zoom to Carlton North, VIC on mobile
			options.latLng = new google.maps.LatLng(29.7325483,-95.5512395),
			options.zoom = 9;
		}

		this._super(el, options);

		this.addCategory('american', {
			url: templateDirectory + 'google-icon-american.png',
			size: new google.maps.Size(50, 33),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(25, 33)
		});

		this.addCategory('mexican', {
			url: templateDirectory + 'google-icon-mexican.png',
			size: new google.maps.Size(50, 33),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(25, 33)
		});

		this.addCategory('chinese', {
			url: templateDirectory + 'google-icon-chinese.png',
			size: new google.maps.Size(50, 33),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(25, 33)
		});

		this.addCategory('indian', {
			url: templateDirectory + 'google-icon-indian.png',
			size: new google.maps.Size(50, 33),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(25, 33)
		});

		this.addCategory('japanese', {
			url: templateDirectory + 'google-icon-japanese.png',
			size: new google.maps.Size(50, 33),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(25, 33)
		});

		this.addCategory('korean', {
			url: templateDirectory + 'google-icon-korean.png',
			size: new google.maps.Size(50, 33),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(25, 33)
		});

		this.addCategory('vietnamese', {
			url: templateDirectory + 'google-icon-vietnamese.png',
			size: new google.maps.Size(50, 33),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(25, 33)
		});

		this.addCategory('thai', {
			url: templateDirectory + 'google-icon-thai.png',
			size: new google.maps.Size(50, 33),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(25, 33)
		});		

		this.initializeEvents();

		return this;
	},

	/**
	 * Bind events for handling map legend for category selection.
	 */
	initializeEvents: function() {
		var this_ = this;

		$('.google-map-categories li').on('click', function() {
			var locationCategory = $(this).data('location-category');

			this_.toggleCategory(locationCategory);
		});

		return this;
	},

	/**
	 * Fit all markers on screen for desktop and tablet devices.
	 */
	finalize: function() {
		if (!this.isMobile()) {
			this.zoomToMarkers();
		}
	},

	/**
	 * Make an estimate on whether current viewport is on mobile.
	 * e.g., reduced width
	 *
	 * @return True if the viewport width is less than Bootstrap's xs-min-width.
	 */
	isMobile: function() {
		return $('.google-map-legend').is(':hidden');
	},

	/**
	 * Override parent method to change HTML that appears in the InfoWindow
	 * that pops when clicking a marker.
	 *
	getLocationHtml: function(location) {
	},
	*/
});
