$(document).ready(function () {
  var s = $(".header")
  var pos = s.position()
  $(window).scroll(function () {
    var windowpos = $(window).scrollTop()

    if (windowpos >= 100) {
      s.addClass("stick")
    } else {
      s.removeClass("stick")
    }
  })

  if ($('.menuContainer').css('display') === 'block') {

    $('.menuContainer').addClass('original').clone().insertAfter('.menuContainer').addClass('cloned').css('position', 'fixed').css('top', '0').css('margin-top', '0').css('z-index', '2').removeClass('original').hide();

    scrollIntervalID = setInterval(stickIt, 10)


    function stickIt() {

      var orgElementPos = $('.original').offset();
      orgElementTop = orgElementPos.top;

      if ($(window).scrollTop() >= (orgElementTop)) {
        orgElement = $('.original');
        coordsOrgElement = orgElement.offset();
        leftOrgElement = coordsOrgElement.left;
        widthOrgElement = orgElement.css('width');
        $('.cloned').css('left', leftOrgElement + 'px').css('top', 0).css('width', widthOrgElement).show();
        $('.original').css('visibility', 'hidden');
      } else {
        $('.cloned').hide();
        $('.original').css('visibility', 'visible');
      }
    }

  }

})


function goto(where) {

  var o = $('#' + where).offset().top
  $(window).scrollTop(o - 50)

}
