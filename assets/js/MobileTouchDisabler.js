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
 * Disable inline touch scrolling. e.g., for the Google Map content area on
 * mobile. It still allows flicking over the element.
 *
 * @param {type} el DOM or jQuery element to disable touch events on.
 * @returns {MobileTouchDisabler}
 */
var MobileTouchDisabler = function (el) {
	this.canDrag = false;
	this.start = 0;
	this.end = 0;

	var touchStart = function (ev) {
		this.canDrag = true;
		this.start = ev.originalEvent.touches[0].pageY; 
	};

	var touchEnd = function () {
		this.canDrag = false;
	};

	var touchMove = function (ev) {
		if (this.canDrag) {
			this.end = ev.originalEvent.touches[0].pageY;
			window.scrollBy(0, this.start - this.end);
		}
	};

	$(el).bind('touchstart', touchStart);
	$(el).bind('touchend', touchEnd);
	$(el).bind('touchmove', touchMove);
};