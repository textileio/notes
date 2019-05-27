$(function() {
    "use strict";
    $('#preloader').on('click', function() {
        $(this).fadeOut();
    });
    /*-----------------------------------
     * STICKY MENU - HEADER
     *-----------------------------------*/
    var $navmenu = $('.nav-menu');
    $(window).on('scroll', function() {
        if ($navmenu.hasClass('not-sticky')) {
            return false;
        }
        if ($(window).scrollTop() > 500) {
            $navmenu.addClass('sticky-top');
        } else {
            $navmenu.removeClass("sticky-top");
        }
    });
    /*-----------------------------------
     * ONE PAGE SCROLLING
     *-----------------------------------*/
    // Select all links with hashes
    $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').on('click', function(event) {
        // On-page links
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            // Figure out element to scroll to
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            // Does a scroll target exist?
            if (target.length) {
                // Only prevent default if animation is actually gonna happen
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000, function() {
                    // Callback after animation
                    // Must change focus!
                    var $target = $(target);
                    $target.focus();
                    if ($target.is(":focus")) { // Checking if the target was focused
                        return false;
                    } else {
                        $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                        $target.focus(); // Set focus again
                    };
                });
            }
        }
    });
    /*-----------------------------------
     * CAROUSEL / SLIDERS
     *-----------------------------------*/
    var $screenSlider = $('.screen-slider');
    if ($screenSlider.length && $.fn.owlCarousel) {
        // Screen Slider
        $screenSlider.owlCarousel({
            loop: true,
            autoplay: true,
            margin: 0,
            nav: false,
            items: 1,
            dots: false,
        });
    }
    var $clientSlider = $('.client-slide');
    if ($clientSlider.length && $.fn.owlCarousel) {
        // Client Slider
        $('.client-slide').owlCarousel({
            margin: 30,
            loop: true,
            autoWidth: true,
            autoplay: true,
            items: 5
        });
    }
    var $galleryCarouselDiv = $('.screen-carousel-1');
    if ($galleryCarouselDiv.length && $.fn.owlCarousel) {
        // Gallery Slider
        $galleryCarouselDiv.owlCarousel({
            loop: true,
            center: true,
            autoplay: true,
            responsive: {
                0: {
                    items: 1,
                    margin: 50,
                    autoWidth: false,
                    dots: true
                },
                600: {
                    items: 4,
                    margin: 100,
                    autoWidth: true,
                    dots: false
                }
            }
        });
    }
    var $detailedCarousel = $('.detailed-carousel');
    if ($detailedCarousel.length && $.fn.owlCarousel) {
        $detailedCarousel.owlCarousel({
            loop: true,
            margin: 10,
            nav: true,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 3
                },
                1000: {
                    items: 5
                }
            }
        })
    }
    var $loopDiv = $('.loop');
    if ($loopDiv.length && $.fn.slick) {
        $loopDiv.slick({
            centerMode: true,
            centerPadding: '60px',
            autoplay: true,
            autoplaySpeed: 5000,
            arrows: true,
            dots: true,
            slidesToShow: 3,
            responsive: [{
                breakpoint: 992,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
                }
            }, {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
                }
            }, {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
                }
            }]
        });
    }
    /*-----------------------------------
     * MAGNIFIC POPUP
     *-----------------------------------*/
    var $videoPlay = $('.video-play');
    if ($videoPlay.length && $.fn.magnificPopup) {
        $videoPlay.magnificPopup({
            type: 'iframe',
            iframe: {
                patterns: {
                    youtube: {
                        src: '//www.youtube.com/embed/%id%?autoplay=1&controls=1&showinfo=0&rel=0' // URL that will be set as a source for iframe.
                    }
                }
            }
        });
    }
    /*-----------------------------------
     * VERTICAL TABS
     *-----------------------------------*/
    $(document).off('click.bs.tab.data-api', '[data-hover="tab"]');
    $(document).on('mouseenter.bs.tab.data-api', '[data-toggle="tab"], [data-hover="tab"]', function() {
        $(this).tab('show');
    });
    /*-----------------------------------
     * VERTICAL TABS
     *-----------------------------------*/
    var $fullpageDiv = $('#fullpage');
    if ($fullpageDiv.length && $.fn.fullpage) {
        $fullpageDiv.fullpage({
            scrollBar: true,
            navigation: true,
            navigationPosition: 'right',
            navigationTooltips: ['Home', 'Content', 'Landscape', 'Right Image', 'Left Image', 'Call to action', 'Footer'],
            responsiveWidth: 1100
        });
    }
    /*-----------------------------------
     * STICKY PARALLAX
     *-----------------------------------*/
    function initSkrollr() {
        if ($(window).width() >= 992) {
            var s = skrollr.init({
                smoothScrolling: false,
                forceHeight: false
            });
        }
    }
    var $stickyDiv = $('.sticky-phone-wrap');
    if ($stickyDiv.length) {
        initSkrollr();
    }
    $(window).on('resize', function() {
        if ($stickyDiv.length && $.fn.skrollr) {
            if ($(window).width() < 991) {
                skrollr.init().destroy();
            } else {
                initSkrollr();
            }
        }
    });
});
// mobileCheck: function() {
//     return !(/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera);
// }
/*end fn*/
$(window).on('load', function() {
    /*-----------------------------------
     * PRELOADER
     *-----------------------------------*/
    $("#preloader").fadeOut();
    /*-----------------------------------
     * ON SCROLL ANIMATION
     *-----------------------------------*/
    var scrollAnimate = $('body').data('scroll-animation');
    if (scrollAnimate === true) {
        new WOW({
            boxClass: 'reveal',
            mobile: false
        }).init()
    }
    /*-----------------------------------
     * Load Google Maps
     *-----------------------------------*/
    if ($('#gmaps').length) {
        loadGoogleMapsAPI()
    }
});
/*-----------------------------------
 * Google Maps
 *-----------------------------------*/
function loadGoogleMapsAPI() {
    var script = document.createElement("script");
    var mapdiv = document.getElementById('gmaps');
    var mapsapi = mapdiv.getAttribute('data-maps-apikey');
    // This script has a callback function that will run when the script has
    // finished loading.
    script.src = "https://maps.googleapis.com/maps/api/js?callback=loadMap&key=" + mapsapi;
    script.type = "text/javascript";
    document.getElementsByTagName("body")[0].appendChild(script);
}

function loadMap() {
    var mapdiv = $('#gmaps');
    var latitude = mapdiv.data('lat') || '40.6700';
    var longitude = mapdiv.data('lon') || '-73.9400';
    var zoom = mapdiv.data('zoom') || '12';
    var mapOptions = {
        zoom: zoom,
        center: new google.maps.LatLng(latitude, longitude),
        scrollwheel: false,
        // How you would like to style the map. 
        styles: [{ "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#dedede" }, { "lightness": 21 }] }, { "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }] }, { "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#fefefe" }, { "lightness": 17 }, { "weight": 1.2 }] }]
    };
    var mapElement = document.getElementById('gmaps');
    var map = new google.maps.Map(mapElement, mapOptions);
    // Let's also add a marker while we're at it
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: map,
        title: 'We are here!'
    });
}