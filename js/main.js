var Morpheme = Morpheme || {};

Morpheme.minW_sm = 576;
Morpheme.minW_tablet = 768;
Morpheme.minW_desktop = 992;

m_init(Morpheme, function(m) {

  var u = m.Util;
  var $window = $(window);
  var $html = $("html");
  var $body = $("body");

  initGallery();
  initParaY();
  initOverlayScroll();

  function initOverlayScroll() {
    var curScrollTop = 0;
    var $contentWrapper = $(".content-wrapper");
    var $act = $(".tnc.toggler, .nav-main.toggler, .close.deactivator");
    $act.on("m:activate", function() {
      if ($html.hasClass("touchevents")) {
        curScrollTop = $window.scrollTop();
        // console.log("activate: " + curScrollTop);
        $contentWrapper.css("top", "-" + curScrollTop + "px");
      }
    }).on("m:deactivateDone", onDeactivate);
    $("header nav.main .item-list a").click(function() {
      var $el = $(this);
      var href = $el.attr("href");
      var i = href.indexOf("#");
      if (i != -1 && href.length > 1) {
        var $anchorEl = $(href.substr(i));
        if ($anchorEl.length > 0) {
          var offset = $anchorEl.offset();
          curScrollTop = curScrollTop + offset.top;
        }
      }
      $("nav.main .close.deactivator").trigger("click");
    });

    function onDeactivate() {
      if ($html.hasClass("touchevents")) {
        // console.log("deactivateDone");
        $contentWrapper.css("top", "");
        setTimeout(function() {
          $window.scrollTop(curScrollTop);
        }, 20);
      }
    }

  }


  function initGallery() {
    var init_is = false;
    var option = {
      infinite: true
      , dots: false
      , arrows: true
      , slidesToShow: 1
    };
    var $el = $('.gallery .item-list');
    if ($el.length > 0) {
      $window.on("m:layoutChange", update);
      update();
    }

    function update() {
      var curView = u.getCurView();
      if (curView == "mobile" && !init_is) {
        $el.slick(option);
        init_is = true;
      } else if (curView != "mobile" && init_is) {
        $el.slick("unslick");
        init_is = false;
      }
    }
  }


  function initParaY() {
    var $window = $(window);
    var $body = $("body");
    var $scrollerC = $('.para-c');
  	var $scrollerInC = $('.para-scroller', $scrollerC);
    var $scrollerG = $('.para-scroller').not($scrollerInC);
  	if ($scrollerInC.length > 0 || $scrollerG.length > 0) {
  		$window.on('scroll', onScroll);
      onScroll();
  	}

  	function onScroll() {
  		var y = $window.scrollTop();
      var win_h = $window.innerHeight();
      if ($scrollerG.length > 0) {
        $scrollerG.each(function() {
          var $el = $(this);
          var d = $el.data('para-d');
          if (d !== undefined & d !== "") {
            d = parseFloat(d);
            $el.css('transform', "translateY(" +(y*d >> 0)+'px)');
          }
        });
      }
      if ($scrollerC.length > 0) {
        $scrollerC.each(function() {
          var $container = $(this);
          var $scroller = $(".para-scroller", $container);
          if ($scroller.length > 0) {
            var offset = $container.offset();
            var container_y = offset.top;
            var dy = y + win_h - container_y;
            if (dy > 0) {
              $scroller.each(function() {
                var $el = $(this);
                var d = $el.data('para-d');
                if (d !== undefined & d !== "") {
                  d = parseFloat(d);
                  $el.css('transform', "translateY(" +(dy*d >> 0)+'px)');
                }
              });
            }
          }
        });
      }
  	}

  }
});
