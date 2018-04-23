/**
	∆
	J U N I O R M A G A L H A E S

	MAIN.JS
	2018
	;)
	*/

	;(function(window) {

		'use strict';

	// Helper vars and functions.
	function extend( a, b ) {
		for( var key in b ) {
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	/**
	 * Line obj.
	 */
	 function Line(options) {
	 	this.options = extend({}, this.options);
	 	extend(this.options, options);
	 	this._init();
	 }

	 Line.prototype.options = {
		// top, left, width, height: numerical for pixels or string for % and viewport units. Examples: 2 || '20%' || '50vw'.
		// color: the (bg)color of the line.
		// hidden: defines if the line is rendered initially or hidden by default.
		// animation: animation properties for the line
		// 		duration: animation speed.
		// 		easing: animation easing (animejs easing. To see all possible values console animejs.easings).
		// 		delay: animation delay.
		// 		direction: line animation direction. Possible values: TopBottom || BottomTop || LeftRight || RightLeft || CenterV || CenterH.
		width: 1,
		height: '100%',
		left: '50%',
		top: '0%',
		color: '#000',
		hidden: false,
		animation: {
			duration: 500,
			easing: 'linear',
			delay: 0,
			direction: 'TopBottom'
		}
	};

	/**
	 * Set style.
	 */
	 Line.prototype._init = function() {
	 	this.el = document.createElement('div');
	 	this.el.className = 'decoline';
	 	var opts = this.options;
	 	this.el.style.width = typeof opts.width === 'number' ? opts.width + 'px' : opts.width;
	 	this.el.style.height = typeof opts.height === 'number' ? opts.height + 'px' : opts.height;
	 	this.el.style.left = typeof opts.left === 'number' ? opts.left + 'px' : opts.left;
	 	this.el.style.top = typeof opts.top === 'number' ? opts.top + 'px' : opts.top;
	 	this.el.style.background = opts.color || opts.color;
	 	this.el.style.opacity = opts.hidden ? 0 : 1;
	 	this._setOrigin();
	 	this.rendered = !opts.hidden;
	 };

	/**
	 * Transform origin is set according to the animation direction.
	 */
	 Line.prototype._setOrigin = function() {
	 	var opts = this.options, tOrigin = '50% 50%';

	 	if( opts.animation.direction === 'TopBottom' ) {
	 		tOrigin = '50% 0%';
	 	}
	 	else if( opts.animation.direction === 'BottomTop' ) {
	 		tOrigin = '50% 100%';
	 	}
	 	else if( opts.animation.direction === 'LeftRight' ) {
	 		tOrigin = '0% 50%';
	 	}
	 	else if( opts.animation.direction === 'RightLeft' ) {
	 		tOrigin = '100% 50%';
	 	}

	 	this.el.style.WebkitTransformOrigin = this.el.style.transformOrigin = tOrigin;
	 };

	/**
	 * Animates the line.
	 */
	 Line.prototype.animate = function(settings) {
	 	if( this.isAnimating ) {
	 		return false;
	 	}
	 	this.isAnimating = true;

	 	var animeProps = {
	 		targets: this.el,
	 		duration: settings && settings.duration != undefined ? settings.duration : this.options.animation.duration,
	 		easing: settings && settings.easing != undefined ? settings.easing : this.options.animation.easing,
	 		delay: settings && settings.delay != undefined ? settings.delay : this.options.animation.delay
	 	};

	 	if( settings && settings.direction ) {
	 		this.options.animation.direction = settings.direction;
	 	}

		// Sets origin again. Settings might contain a different animation direction?
		this._setOrigin();

		if( this.options.animation.direction === 'TopBottom' || this.options.animation.direction === 'BottomTop' || this.options.animation.direction === 'CenterV' ) {
			animeProps.scaleY = this.rendered ? [1, 0] : [0, 1];
		}
		else {
			animeProps.scaleX = this.rendered ? [1, 0] : [0, 1];
		}

		if( !this.rendered ) {
			this.el.style.opacity = 1;
		}

		var self = this;
		animeProps.complete = function() {
			self.rendered = !self.rendered;
			if( settings && settings.complete ) {
				settings.complete();
			}
			self.isAnimating = false;
		}

		anime(animeProps);
	};

	/**
	 * Show the line.
	 */
	 Line.prototype.show = function() {
	 	this.el.style.opacity = 1;
	 	this.el.style.WebkitTransform = this.el.style.transform = 'scale3d(1,1,1)';
	 	this.rendered = true;
	 };

	/**
	 * Hide the line.
	 */
	 Line.prototype.hide = function() {
	 	this.el.style.opacity = 0;
	 	this.rendered = false;
	 };

	/**
	 * LineMaker obj.
	 */
	 function LineMaker(options) {
	 	this.options = extend({}, this.options);
	 	extend(this.options, options);
	 	this._init();
	 }

	/**
	 * LineMaker options.
	 */
	 LineMaker.prototype.options = {
		// Where to insert the lines container.
		// element: the DOM element or a string to specify the selector, e.g. '#id' or '.classname'.
		// position: Whether to prepend or append to the parent.element
		parent: {element: document.body, position: 'prepend'},
		// position: if fixed the lines container will have fixed position.
		position: 'absolute',
		// The lines settings.
		lines: []
	};

	/**
	 * Create the lines and its structure.
	 */
	 LineMaker.prototype._init = function() {
	 	this.lines = [];

	 	this.decolines = document.createElement('div');
	 	this.decolines.className = 'decolines';
	 	if( this.options.position === 'fixed' ) {
	 		this.decolines.className += ' decolines--fixed';
	 	}

	 	for(var i = 0, len = this.options.lines.length; i < len; ++i) {
	 		var lineconfig = this.options.lines[i],
	 		line = new Line(lineconfig);

	 		this.decolines.appendChild(line.el);
	 		this.lines.push(line);
	 	}

	 	var p = this.options.parent,
	 	pEl = typeof p.element === 'string' ? document.querySelector(p.element) : p.element;

	 	if( p.position === 'prepend' ) {
	 		pEl.insertBefore(this.decolines, pEl.firstChild);
	 	}
	 	else {
	 		pEl.appendChild(this.decolines);
	 	}
	 };

	/**
	 * Shows/Hides one line with an animation.
	 */
	 LineMaker.prototype._animateLine = function(lineIdx, dir, settings) {
	 	var line = this.lines[lineIdx];
	 	if( line && dir === 'in' && !line.rendered || dir === 'out' && line.rendered ) {
	 		line.animate(settings);
	 	}
	 };

	/**
	 * Shows/Hides all lines with an animation.
	 */
	 LineMaker.prototype._animateLines = function(dir, callback) {
	 	var completed = 0, totalLines = this.lines.length;

	 	if( totalLines === 0 ) {
	 		callback();
	 		return;
	 	}

	 	var checkCompleted = function() {
	 		completed++;
	 		if( completed === totalLines && typeof callback === 'function' ) {
	 			callback();
	 		}
	 	};

	 	for(var i = 0; i < totalLines; ++i) {
	 		var line = this.lines[i];
	 		if( dir === 'in' && !line.rendered || dir === 'out' && line.rendered ) {
	 			line.animate({
	 				complete: function() {
	 					checkCompleted();
	 				}
	 			});
	 		}
	 		else {
	 			checkCompleted();
	 		}
	 	}
	 };

	/**
	 * Shows/Hides one line.
	 */
	 LineMaker.prototype._toggleLine = function(lineIdx, action) {
	 	var line = this.lines[lineIdx];
	 	if( !line ) { return; }

	 	if( action === 'show' && !line.rendered ) {
	 		line.show();
	 	}
	 	else if( action === 'hide' && line.rendered ) {
	 		line.hide();
	 	}
	 };

	/**
	 * Shows/Hides all lines.
	 */
	 LineMaker.prototype._toggleLines = function(action) {
	 	for(var i = 0, len = this.lines.length; i < len; ++i) {
	 		this._toggleLine(i, action);
	 	}
	 };

	/**
	 * Shows one line with an animation.
	 * lineIndex: index/position of the line in the LineMaker.options.lines array.
	 * animationSettings is optional: if not passed, the animation settings defined in LineMaker.options.lines for each line will be used.
	 */
	 LineMaker.prototype.animateLineIn = function(lineIdx, settings) {
	 	this._animateLine(lineIdx, 'in', settings);
	 };

	/**
	 * Hides one line with an animation.
	 * lineIndex: index/position of the line in the LineMaker.options.lines array.
	 * animationSettings is optional: if not passed, the animation settings defined in LineMaker.options.lines for each line will be used.
	 */
	 LineMaker.prototype.animateLineOut = function(lineIdx, settings) {
	 	this._animateLine(lineIdx, 'out', settings);
	 };

	/**
	 * Shows all lines with an animation.
	 */
	 LineMaker.prototype.animateLinesIn = function(callback) {
	 	this._animateLines('in', callback);
	 };

	/**
	 * Hides all lines with an animation.
	 */
	 LineMaker.prototype.animateLinesOut = function(callback) {
	 	this._animateLines('out', callback);
	 };

	/**
	 * Shows one line.
	 * lineIndex: index/position of the line in the LineMaker.options.lines array.
	 */
	 LineMaker.prototype.showLine = function(lineIdx) {
	 	this._toggleLine(lineIdx, 'show');
	 };

	/**
	 * Hides one line.
	 * lineIndex: index/position of the line in the LineMaker.options.lines array.
	 */
	 LineMaker.prototype.hideLine = function(lineIdx) {
	 	this._toggleLine(lineIdx, 'hide');
	 };

	/**
	 * Shows all lines.
	 */
	 LineMaker.prototype.showLines = function() {
	 	this._toggleLines('show');
	 };

	/**
	 * Hides all lines.
	 */
	 LineMaker.prototype.hideLines = function() {
	 	this._toggleLines('hide');
	 };

	/**
	 * Removes a line.
	 * lineIndex: index/position of the line in the LineMaker.options.lines array.
	 */
	 LineMaker.prototype.removeLine = function(lineIdx) {
	 	var line = this.lines[lineIdx];
	 	if( line ) {
	 		this.lines.splice(lineIdx, 1);
	 		this.decolines.removeChild(this.decolines.children[lineIdx]);
	 	}
	 };

	/**
	 * Removes all lines.
	 */
	 LineMaker.prototype.removeLines = function() {
	 	this.lines = [];
	 	this.decolines.innerHTML = '';
	 };

	/**
	 * Creates a line.
	 * settings is optional: same settings passed in LineMaker.options.lines for one line.
	 */
	 LineMaker.prototype.createLine = function(settings) {
	 	var line = new Line(settings);
	 	this.decolines.appendChild(line.el);
	 	this.lines.push(line);
	 };

	/**
	 * Returns the total number of lines.
	 */
	 LineMaker.prototype.getTotalLines = function() {
	 	return this.lines.length;
	 }

	 window.LineMaker = LineMaker;

	})(window);

// ∆ MOVIMENTO DE UM ELEMENTO DE ACORDO COM O MOUSE

$(document).mousemove(function(e) {
	$('.dot').offset({
		left: e.pageX,
		top: e.pageY
	});
});

setTimeout(function () {
 	$('.avatar').addClass('animated fadeInDown');
 }, 3500);
setTimeout(function () {
	$('.intro').show().addClass('animated fadeInDown');
}, 3500);
setTimeout(function () {
	$('.wavy').show().addClass('animated fadeInLeft');
}, 3200);

// ∆ TEXTOS

function hello(ctnt){
$(document).ready(function(){
var theLetters = "juniormagalhaes"; //You can customize what letters it will cycle through
var speed = 5; // ms per frame
var increment = 3; // frames per step. Must be >2


var clen = ctnt.length;
var si = 0;
var stri = 0;
var block = "";
var fixed = "";
//Call self x times, whole function wrapped in setTimeout
(function rustle (i) {
	setTimeout(function () {
		if (--i){rustle(i);}
		nextFrame(i);
		si = si + 1;
	}, speed);
})(clen*increment+1);
function nextFrame(pos){
	for (var i=0; i<clen-stri; i++) {
    //Random number
    var num = Math.floor(theLetters.length * Math.random());
    //Get random letter
    var letter = theLetters.charAt(num);
    block = block + letter;
}
if (si == (increment-1)){
	stri++;
}
if (si == increment){
  // Add a letter;
  // every speed*10 ms
  fixed = fixed +  ctnt.charAt(stri - 1);
  si = 0;
}
$(".intro").html(fixed + block);
block = "";
}
});
}




// IMAGENS RANDOMICAS

var images = [
"img/13_2v2.gif",
"img/13_2v3.gif",
"img/13_2v3.gif",
"img/13_2v2.gif",
"img/avatarpic5.png",
"img/avatarpic4.png",
"img/avatarpic3.png",
"img/avatarpic2.png",
"img/avatarpic1.png",
"img/avatarpic7.png",
"img/avatarpic6.png",
"img/avatarpic7.png"
];

function randImg() {
	var size = images.length
	var x = Math.floor(size * Math.random())
	document.getElementById('avatar').src = images[x];
}

randImg();


var txtsizes = [
"30",
"20"
];

function randtxt() {
		var types = txtsizes.length
		var x = Math.floor(types * Math.random());
		var KerningRandom = Math.floor((Math.random() * 100) + 33);
		 $('.wrapper svg .circle-text').css('letter-spacing', KerningRandom);
		 $('.wrapper svg .circle-text').css('font-size', txtsizes[x]);

};
//
// var things = ['Rock', 'Paper', 'Scissor'];
// var thing = things[Math.floor(Math.random()*things.length)];
// alert('The computer chose:' + thing);

setInterval(function () {
	randtxt();
}, 3500);

// SLIDERS

var swiper = new Swiper('.swiper-container', {
	direction: 'horizontal',
	preloadImages: true,
	lazy: true,
	// speed: 1000,
	loop: true,
	shortSwipes: true,
	touchRatio: 3,
	// autoplay: {
  //   delay: 2000,
  // },
        // autoHeight: true,
        slidesPerView: 1,
        spaceBetween: 100,
        // loop: true,
        centeredSlides: true,
        spaceBetween: 200,
        drag: true,
        pagination: {
        	el: '.swiper-pagination',
        	type: 'progressbar',
        	clickable: true,
        },
				// ARRUMAR BREAKPOINTS AQ
	    breakpoints: {
	    // when window width is <= 320px
	    320: {
	      slidesPerView: 1,
	      spaceBetween: 10
	    },
	    // when window width is <= 480px
	    480: {
	      slidesPerView: 1,
	      spaceBetween: 10
	    },
	    // when window width is <= 640px
	    640: {
	      slidesPerView: 1,
	      spaceBetween: 10
	    }
	  }
    });

// MUDANÇA DOS TEXTOS CONFORME SCROLL

$.fn.isOnScreen = function(){

	var win = $(window);

	var viewport = {
		top : win.scrollTop(),
		left : win.scrollLeft()
	};
	viewport.right = viewport.left + win.width();
	viewport.bottom = viewport.top + win.height();

	var bounds = this.offset();
	bounds.right = bounds.left + this.outerWidth();
	bounds.bottom = bounds.top + this.outerHeight();

	return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

};

$('body').scroll(function(){
	alert($('.orange').isOnScreen());
});

var fired = false;
var aplacetxt = false;
var introtxt = false;
var ferreritxt = false;
var musicmoodtxt = false;
var zagtxt = false;
var whentxt = false;
var phototxt = false;
var abouttxt = false;
var instagramtxt = false;
var contacttxt = false;
var artworktxt = false;
var saturdaytxt = false;

$(document).scroll(function(){

	if($('.main h2').isOnScreen()){
		$('.main h2').addClass('animated').addClass( 'fadeInUp' );
		setTimeout(function () {$('.main h3').addClass('animated').addClass( 'fadeInUp' )}, 400);
	}

	if($('.square').isOnScreen() && introtxt === false) {
		$('.intro').removeClass('reduce');
		$('.intro').css('color', '#fff');
		$('.intro').css('right', '102px');
		setTimeout(function () {$('.wavy').removeClass('fadeOut').addClass( 'fadeInLeft' )}, 200);
		setTimeout(function () {hello('Hello.')}, 500);
		abouttxt = false;
		introtxt = true;
		fired = false;
		whentxt = false;
		ferreritxt = false;
		aplacetxt = false;
		phototxt = false;
		instagramtxt = false;
		contacttxt = false;
		artworktxt = false;
		saturdaytxt = false;
		// $('h1').css('left', '1200');
	}

	if($('.main').isOnScreen() && abouttxt === false){
		// $('.intro').css('color', '#212121');
		$('.intro').removeClass('reduce');
		$('.intro').css('right', '102px');
		hello('About me.');
		abouttxt = true;
		introtxt = false;
		fired = false;
		whentxt = false;
		ferreritxt = false;
		aplacetxt = false;
		phototxt = false;
		instagramtxt = false;
		contacttxt = false;
		artworktxt = false;
		saturdaytxt = false;
	}


	if ($('.honda').isOnScreen() && fired === false) {
		$('.intro').css('color', '#fff');
		$('.intro').removeClass('reduce');
		$('.intro').css('right', '102px');
		// $('body').css('background', 'purple');
		hello('Honda +.');
		fired = true;
		introtxt = false;
		ferreritxt = false;
		musicmoodtxt = false;
		zagtxt = false;
		aplacetxt = false;
		phototxt = false;
		introtxt = false;
		instagramtxt = false;
		contacttxt = false;
		artworktxt = false;
		saturdaytxt = false;
		$('.intro').removeClass('reduce');
		// $('h1').css('text-align', 'left');
	}

	if ($('.aplace').isOnScreen() && aplacetxt === false) {
		$('.intro').css('color', '#fff');
		$('.intro').addClass('reduce');
		$('.intro').css('right', '102px');
		// $('body').css('background', 'blue');
		hello('A Place to  Departure.');
		aplacetxt = true;
		fired = false;
		ferreritxt = false;
		musicmoodtxt = false;
		zagtxt = false;
		phototxt = false;
		introtxt = false;
		instagramtxt = false;
		contacttxt = false;
		artworktxt = false;
		saturdaytxt = false;
	}
	if ($('.ferreri').isOnScreen() && ferreritxt === false) {
		$('.intro').removeClass('reduce');
		$('.intro').css('right', '102px');
		$('.intro').css('color', '#fff');
		// $('body').css('background', 'pink');
		hello('Ferreri.');
		ferreritxt = true;
		fired = false;
		whentxt = false;
		musicmoodtxt = false;
		zagtxt = false;
		aplacetxt = false;
		phototxt = false;
		introtxt = false;
		instagramtxt = false;
		contacttxt = false;
		artworktxt = false;
		saturdaytxt = false;
	}
	if ($('.musicmood').isOnScreen() && musicmoodtxt === false) {
		$('.intro').css('color', '#fff');
		$('.intro').css('right', '102px');
		$('.intro').removeClass('reduce');
		// $('body').css('background', 'pink');
		hello('Music mood.');
		musicmoodtxt = true;
		ferreritxt = false;
		fired = false;
		whentxt = false;
		zagtxt = false;
		aplacetxt = false;
		phototxt = false;
		introtxt = false;
		instagramtxt = false;
		contacttxt = false;
		artworktxt = false;
		saturdaytxt = false;
	}
	if ($('.zag').isOnScreen() && zagtxt === false) {
		$('.intro').css('color', '#fff');
		$('.intro').css('right', '102px');
		$('.intro').removeClass('reduce');
		// $('body').css('background', 'pink');
		hello('Zag.');
		zagtxt = true;
		musicmoodtxt = false;
		ferreritxt = false;
		fired = false;
		whentxt = false;
		aplacetxt = false;
		phototxt = false;
		introtxt = false;
		instagramtxt = false;
		contacttxt = false;
		artworktxt = false;
		saturdaytxt = false;
	}

	if ($('.whenareyou').isOnScreen() && whentxt === false) {
		$('.intro').css('color', '#fff');
		$('.intro').css('right', '102px');
		$('.intro').removeClass('reduce');
		// $('body').css('background', 'pink');
		hello('When are you.');
		whentxt = true;
		zagtxt = false;
		musicmoodtxt = false;
		ferreritxt = false;
		fired = false;
		aplacetxt = false;
		phototxt = false;
		introtxt = false;
		instagramtxt = false;
		contacttxt = false;
		artworktxt = false;
		saturdaytxt = false;
	}

	// if ($('.projectdescription').isOnScreen()) {
	// 	$('.intro').css('z-index', '-9');
	// 	$('.intro').css('color', '#212121');
	// }

	if ($('.photography').isOnScreen() && phototxt === false) {
		$('.intro').css('color', '#fff');
		$('.intro').css('right', '102px');
		$('.intro').css('z-index', '-999999');
		$('.intro').removeClass('reduce');
		// $('body').css('background', 'pink');
		hello('Photo graphy.');
		introtxt = false;
		phototxt = true;
		whentxt = false;
		zagtxt = false;
		musicmoodtxt = false;
		ferreritxt = false;
		fired = false;
		aplacetxt = false;
		instagramtxt = false;
		contacttxt = false;
		artworktxt = false;
		saturdaytxt = false;
		$('.intro').removeClass( 'fadeOut' ).addClass( 'fadeInDown' );
	}

	if ($('.contact').isOnScreen() && contacttxt === false) {
		// $('.intro').addClass( 'fadeO' );
		$('.intro').css('color', '#000');
		$('.intro').css('right', '102px');
		$('.intro').removeClass('mobart');
		$('.intro').removeClass('reduce');
		$('.intro').removeClass('saturdaysmove');
		hello('');
		introtxt = false;
		phototxt = false;
		whentxt = false;
		zagtxt = false;
		musicmoodtxt = false;
		ferreritxt = false;
		fired = false;
		aplacetxt = false;
		instagramtxt = false;
		artworktxt = false;
		contacttxt = true;
		saturdaytxt = false;
	}

var windowsize = $(window).width();

$(window).resize(function() {
  var windowsize = $(window).width();
});

	if ($('.artworks').isOnScreen() && artworktxt === false) {
		// $('.intro').removeClass( 'fadeInDown' ).addClass('swing');
		$('.intro').css('color', '#000');
		$('.intro').css('z-index', '999999');
		$('.intro').css('right', '102px');
		$('.intro').removeClass('reduce');
		if (windowsize < 440) {
			$('.intro').css('right', '30px');
		}
		$('.intro').addClass('mobart');
		$('.intro').removeClass('saturdaysmove');
		hello('Artworks');
		introtxt = false;
		phototxt = false;
		whentxt = false;
		zagtxt = false;
		musicmoodtxt = false;
		ferreritxt = false;
		fired = false;
		aplacetxt = false;
		instagramtxt = false;
		artworktxt = true;
		contacttxt = false;
		saturdaytxt = false;
	}

	if ($('.saturdays').isOnScreen() && saturdaytxt === false) {
		// $('.intro').removeClass( 'fadeInDown' ).addClass('swing');
		$('.intro').css('color', '#000');
		$('.intro').css('z-index', '999999');
		// $('.intro').css('right', '302px');
		$('.intro').css('width', '720px');
		$('.intro').css('right', '182px');
		$('.intro').addClass('saturdaysmove');
		$('.intro').removeClass('mobart');
		$('.intro').removeClass('reduce');
		hello('Saturdays');
		introtxt = false;
		phototxt = false;
		whentxt = false;
		zagtxt = false;
		musicmoodtxt = false;
		ferreritxt = false;
		fired = false;
		aplacetxt = false;
		instagramtxt = false;
		artworktxt = false;
		contacttxt = false;
		saturdaytxt = true;
	}
	// if ($('.projectdescription').isOnScreen()){
	// 	$('.intro').css('color', '#232323');
	// }else {
	// 	$('.intro').css('color', '#fff');
	// }

	if ($('.saturdays').isOnScreen()){
		setTimeout(function () {
			$('.instalink svg').addClass( 'fadeIn' );
		}, 1500);
	}

	if ($(window).width() < 960) {
	   // alert('Less than 960');
	}

	if ($('article:nth-child(7) img').isOnScreen() && instagramtxt === false) {
		instagramtxt = true;
		$('.intro').removeClass('reduce');
		$('.intro').removeClass('mobart');
		$('.intro').removeClass('saturdaysmove');
		$('.intro').css('right', '182px');
		$('.intro').css('color', '#000');
		$('.intro').css('z-index', '999999');
		hello('Instagram.');
		// $('.intro').removeClass( 'fadeOut' ).addClass( 'fadeInDown' );
		artworktxt = false;
		introtxt = false;
		phototxt = false;
		whentxt = false;
		zagtxt = false;
		musicmoodtxt = false;
		ferreritxt = false;
		fired = false;
		aplacetxt = false;
		contacttxt = false;
		saturdaytxt = false;
	}

	// $('.instalink svg').css('opacity', '0');
	// ∆
	// IMPLEMENTAR TOGGLE DO H1 CHEGANDO NA SECAO DE CONTATO
	// juniormagalhes 17 Jan, 2018 - push. 5h35AM


	// if ($('.contact').isOnScreen()) {
	// 	$('header h1').addClass('animated').addClass( 'fadeOut' );
	// }

	if($(window).scrollTop() >= 200) {
		$('.wavy').removeClass('fadeInLeft').addClass( 'fadeOut' );
	}

});


instafetch.init({
    accessToken: '265700641.d90570a.51eae6bc750044ee9efe923a081d7525',
    target: 'instafetch',
    numOfPics: 10,
    caption: false
  });

	/* lazyload.js (c) Lorenzo Giuliani
 * MIT License (http://www.opensource.org/licenses/mit-license.html)
 *
 * jQuery version by Gavin Grubb
 * (includes a fix for splice(), as the first image in array (index 0) was never getting removed)
 * (ALSO I would suggest using a loading animation gif image (ALA www.ajaxload.info) in place of blank.gif)
 *
 * expects a list of:
 * `<img src="blank.gif" data-src="my_image.png" width="600" height="400" class="lazy">`
 */

!function(window){

    function loadImage($el, $fn) {
        jQuery($el).attr('src', jQuery($el).attr('data-src'));
        $fn ? $fn() : null;
    }

    function elementInViewport($el) {
        var $rect = $el.getBoundingClientRect();
        return ($rect.top >= 0 && $rect.left >= 0 && $rect.top <= (window.innerHeight || document.documentElement.clientHeight)
        );
    }

    jQuery(document).ready(function() {

        var images = new Array()
        , query = jQuery('img.lazy')
        , processScroll = function() {
            jQuery.each(images, function(i, img) {
                if (elementInViewport(img)) {
                    loadImage(img, function () {
                        images.splice(i, 1);
                    });
                }
            });
        };

        query.each(function() {
           images.push(this);
        });

        processScroll();
        jQuery(window).bind('scroll', processScroll);

    });

}(this);


window.addEventListener('load', function(){
    var allimages= document.getElementsByTagName('img');
    for (var i=0; i<allimages.length; i++) {
        if (allimages[i].getAttribute('data-src')) {
            allimages[i].setAttribute('src', allimages[i].getAttribute('data-src'));
        }
    }
}, false);

(function() {
	var lineMaker = new LineMaker({
		// position: if fixed the lines container will have fixed position.
		position: 'fixed',
		// The lines settings:
		//
		// top, left, width, height: numerical for pixels or string for % and viewport units. Examples: 2 || '20%' || '50vw'.
		// color: the (bg)color of the line.
		// hidden: defines if the line is rendered initially or hidden by default.
		// animation: animation properties for the line
		// 		duration: animation speed.
		// 		easing: animation easing (animejs easing. To see all possible values console animejs.easings).
		// 		delay: animation delay.
		// 		direction: line animation direction. Possible values: TopBottom || BottomTop || LeftRight || RightLeft || CenterV || CenterH.
		lines: [
		{top: 0, left: '10%', width: 1, height: '100vh', color: '#ccc', hidden: true, animation: { duration: 2000, easing: 'easeInOutExpo', delay: 100, direction: 'TopBottom' }},
		{top: 0, left: '10%', width: 1, height: '100vh', color: '#ccc', hidden: true, animation: { duration: 2000, easing: 'easeInOutExpo', delay: 500, direction: 'TopBottom' }},
		{top: 0, left: '49.8%', width: 1, height: '100vh', color: '#ccc', hidden: true, animation: { duration: 2000, easing: 'easeInOutExpo', delay: 2000, direction: 'TopBottom' }},
		{top: 0, left: '70%', width: 1, height: '100vh', color: '#ccc', hidden: true, animation: { duration: 2000, easing: 'easeInOutExpo', delay: 500, direction: 'TopBottom' }},
		{top: 0, left: '90%', width: 1, height: '100vh', color: '#ccc', hidden: true, animation: { duration: 2000, easing: 'easeInOutExpo', delay: 100, direction: 'TopBottom' }},
		]
	});

	setTimeout(function() {
		disableButtons();
		lineMaker.animateLinesIn(enableButtons);
	}, 500);

var ctrls = [].slice.call(document.querySelectorAll('.actions > button'));
ctrls.forEach(function(ctrl) {
	ctrl.setAttribute('disabled', true);
});

function enableButtons() {
	ctrls.forEach(function(ctrl) {
		ctrl.removeAttribute('disabled');
	});
}

function disableButtons() {
	ctrls.forEach(function(ctrl) {
		ctrl.setAttribute('disabled', true);
	});
}

/**
 * from: http://stackoverflow.com/a/1527820
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
 function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
 }

})();
