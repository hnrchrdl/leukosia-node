var socket = io();
var __aorta, __playlist;

jQuery.fx.interval = 100;

$(document).ready(function() {

	var init = true;
	renderAorta(init);

	// misc initialization
	registerButtonStyles();

	$(window).on('resize', function() {
		setHeightOfScrollable();
	});

	$(document).on('click','#logout',function(){
		window.location = '/logout';
	});
});

socket.on('error', function (reason){
	console.error('Unable to connect Socket.IO', reason);
});

socket.on('connect', function (){
	console.log('established socket connection');
});

socket.on('change', function(system) {
	console.log('subsystem changed: ' + system);
	var init = false;
	renderAorta(init);
});

function renderAorta(init) {
	__aorta = new MpdAorta(function(err, aorta) {
		console.log('rendering aorta');
		aorta.render();
		aorta.registerHandler();
		aorta.renderProgressBar();
		init ? renderPlaylist() : aorta.indicate();
	});
}

function renderPlaylist() {
	__playlist = new MpdPlaylist(function(err, playlist) {
		playlist.render();
		playlist.indicate();
		playlist.registerFunctionality();
		registerButtonStyles();
		setHeightOfScrollable();
	});
}

//styling
function registerButtonStyles(){
	// make buttons bigger on hover
	$('.control').on('mouseenter',function(){
		$(this).addClass('bigger');
	});
	$('.control').on('mouseleave',function(){
		$(this).removeClass('bigger');
	});
}

function setHeightOfScrollable () {
	var scrollable = $('.scrollable');
	var offset_top = scrollable.offset().top;
	var window_height = $(window).height();
	scrollable.height(window_height - offset_top-70);

}

function secondsToTimeString (seconds) {
	var date = new Date(1970,0,1);
	date.setSeconds(seconds);
	return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}