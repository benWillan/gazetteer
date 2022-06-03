$(window).on('load', function () {
	if ($('#preloader').length) {
		$('#preloader').delay(4000).fadeOut('slow', function () {
			$(this).remove();
		});
	}
});