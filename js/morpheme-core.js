function m_init(m, init_cb) {

  m.windowInitLoad_is = undefined;
  m.domReadyInit_is = undefined;
  var u = m.Util;
  var $window = $(window);
  var $html = null;
  var $body = null;

  $window.on("load", function() {
    if (m.windowInitLoad_is === undefined) {
      m.windowInitLoad_is = true;
    }
    if (m.windowInitLoad_is === true && m.domReadyInit_is === true) {
      onWindowInitLoad();
    }
  });
  $(document).ready(function() {
    $html = $("html");
    $body = $("body");
    if (!("Modernizr" in window)) {
      console.log("no Modernizr");
      $html.removeClass("no-js").addClass("js");
    }
    if (m.domReadyInit_is === undefined) {
      m.domReadyInit_is = true;
      onDomReadyInit();
    }
    if (m.windowInitLoad_is === true) {
      onWindowInitLoad();
    }
  });


  function onDomReadyInit() {
    $html.addClass("loading");
    initViewChangeEvent();
    initResponsiveMDataEl();
    initLayoutAdjust();
    initSelector();
    if (init_cb != null) init_cb(m);
    initIntersectionObserver();
    initActiveEl();
    m_domUpdate(m);
  }

  function onWindowInitLoad() {
    $html.removeClass("loading");
    console.log("onWindowInitLoad");
    $window.trigger("m:layoutChange");
  }

  function initSelector() {
    var elSet = null;
    var groupSelector = "body";
    var targetSelector = ".selector";
    var bodyClassPrefix = "selector";
    $window.on("m:doDomUpdate", function() {
      elSet = u.getUnprocessedEl(targetSelector, bodyClassPrefix);
      if (elSet.$unprocessed.length > 0) {
        elSet.$unprocessed.each(function(i) {
          var $selector = $(this);
          // setup $toggler
          var $toggler = $(">.toggler", $selector);
          if ($toggler.length > 0) {
            u.setMData($toggler, "active-group", groupSelector);
            u.setMData($toggler, "active-target", targetSelector);
            u.setMData($toggler, "active-index", i);
            u.setMData($toggler, "active-exclusive", "true");
            u.setMData($toggler, "active-body-class", bodyClassPrefix);
            u.setMData($toggler, "active-cancelable", "true", true);
          }
          var $select = $(">select", $selector);
          // setup item-list item
          var $selectorItems = $(".item-list>li", $selector);
          if ($selectorItems.length > 0) {
            $selectorItems.each(function(j) {
              var $item = $(this);
              var val = u.getMData($item, "value", "string");
              if (val === undefined) {
                u.setMData($item, "value", j, true); // should update the dom since there are later query
              }
              // setup activator
              var $activator = $(">a", $item);
              if ($activator.length > 0) {
                $activator.addClass("activator");
                u.setMData($activator, "active-group", ".selector:eq(" + i + ") .item-list");
                u.setMData($activator, "active-target", ">li");
                u.setMData($activator, "active-index", j);
                u.setMData($activator, "active-exclusive", "true");
                $activator.on("m:activate", function(ev, param) {
                  var $el = $(this);
                  var $selector = $el.parent().parent().parent();
                  var $toggler = $(">.toggler", $selector);
                  if ($toggler.length > 0) {
                    var $label = $("label", $toggler);
                    if ($label.length > 0) {
                      $label.html($el.html());
                    }
                  }
                  if ($select.length > 0) {
                    $select.val(param.val);
                  }
                }).on("click",function() {
                  u.deactivate(groupSelector, targetSelector, bodyClassPrefix);
                });
              }
              // setup label
              if ($item.hasClass("active")){
                var $targetLabel = $("label", $toggler);
                if ($targetLabel.length > 0) {
                  $targetLabel.html($activator.html());
                }
              }
            });
          }
          // setup <select> tag
          var useOsSelect_is = (String(u.getMData($selector, "class", "classNameList", "__all__")).indexOf("use-os-select") == -1)?false:true;
          //console.log("useOsSelect_is: " + useOsSelect_is);
          if (useOsSelect_is && $select.length == 0) {
            $selector.prepend(u.getOsSelectHtml($selectorItems, "selector_" + i ));
            $(">select", $selector).change(function(ev) {
              var $el = $(this);
              var val = $el.val();
              var $target = $(".item-list>li[data-m-value='" + val + "']>a", $el.parent());
              // console.log("select: change");
              // console.log($target);
              $target.trigger("click");
            });
          }
        });
        u.markProcessed(elSet.$unprocessed, bodyClassPrefix);
        m.domDirty_is = true;

      }
    });
  }


  function initLayoutAdjust() {
    var elSet = null;
    //var $maxContainer = null;
    $window.on("m:doDomUpdate", function() {
      //$ratioH = $("[data-m-ratioh]");
      elSet = u.getUnprocessedEl(".maxw, .maxh, .ratioh", "layout-adjust");
      if (elSet.$unprocessed.length > 0) {
        u.markProcessed(elSet.$unprocessed, "layout-adjust");
        m.domDirty_is = true;
      }
      //onResizeRatioEl();
      //onResizeContainer();
    }).on("m:layoutChange", function() {
      //onResizeRatioEl();
      console.log("initLayoutAdjust: m:layoutChange");
      if (m.newImgSrc_is) {
        console.log("initLayoutAdjust: resetContainer");
        resetContainer();
      }
      onResizeContainer();
    }).on("m:resizeStart", function() {
      console.log("initLayoutAdjust: m:resizeStart");
      resetContainer();
    });

    function onResizeRatioEl() {
      // ratio element
      if ($ratioH.length > 0) {

        var curView = u.getCurView();

        $ratioH.each(function() {
          var $el = $(this);
          var ratioH = u.getMData($el, "ratioh", "float", curView);
          if (ratioH !== undefined) {
            $el.outerHeight(($el.outerWidth() * ratioH) >> 0);
          } else {
            $el.css("height","");
          }
        });
      }
    }

    function onResizeContainer() {
      // equal height child element
      if (elSet != null && elSet.$el.length > 0) {

        var curView = u.getCurView();

        elSet.$el.each(function() {
          var $el = $(this);
          var maxW_is = $el.hasClass("maxw");
          var maxH_is = $el.hasClass("maxh");
          var ratioH_is = $el.hasClass("ratioh");
          //console.log("onResizeContainer: " + maxW_is + " " + maxH_is);

          if (maxW_is || maxH_is) {
            var selector  = u.getMData($el, "max-target", "cssSelector", curView);
            var adjustCss = u.getMData($el, "max-adjust-css", "cssProp", curView);

            var $target = $el;
            if (selector !== undefined) {
              $target = $(selector, $el);
            }
            $target.each(function() {
              var $el = $(this);
              var maxW = undefined;
              var maxH = undefined;
              var $maxW_el = undefined;
              var $maxH_el = undefined;
              $el.children().each(function() {

                var $child = $(this);

                if (maxW_is) {
                  var w = $child.outerWidth() >> 0;
                  if ($child.css("display") == "inline-block") {
                    w = w - 7; /* hard code to adjust the height for inline elements */
                  }
                  if (maxW == undefined || maxW < w) {
                    maxW = w;
                    $maxW_el = $child;
                  }
                }

                if (maxH_is) {
                  var h = $child.outerHeight() >> 0;
                  if ($child.css("display") == "inline-block") {
                    h = h - 7; /* hard code to adjust the height for inline elements */
                  }
                  if (maxH == undefined || maxH < h) {
                    maxH = h;
                    $maxH_el = $child;
                  }
                }

              });
              // change container w / h
              var origW = $el.innerWidth();
              var origH = $el.innerHeight();
              if (maxW !== undefined) {
                $el.innerWidth(maxW);
              }
              if (maxH !== undefined) {
                $el.innerHeight(maxH);
              }

              if ($maxW_el !== undefined || $maxH_el !== undefined) {
                $el.children().each(function() {
                  var $el = $(this);
                  var outerW = $el.outerWidth();
                  var outerH = $el.outerHeight();
                  if ($el.css("display") == "inline-block") {
                    outerW = outerW - 7;
                    outerH = outerH - 7;
                  }
                  var w = $el.width();
                  var h = $el.height();
                  if ($maxW_el !== undefined && this !== $maxW_el.get(0)) {
                    if (adjustCss == "margin-left") {
                      $el.css(adjustCss, ((maxW - outerW) >> 1) + "px");
                    } else if (adjustCss == "padding-left-right") {
                      var paddingW = (maxW - w);
                      var paddingLeft = (paddingW >> 1);
                      var paddingRight = paddingW - paddingLeft;
                      $el.css({"padding-left":paddingLeft +"px", "padding-right":paddingRight +"px"});
                    }
                  } else if ($maxH_el !== undefined && this !== $maxH_el.get(0)) {
                    if (adjustCss == "margin-top") {
                      $el.css(adjustCss, ((maxH - outerH) >> 1) + "px");
                    } else if (adjustCss == "padding-top-bottom") {
                      var paddingH = (maxH - h);
                      var paddingTop = (paddingH >> 1);
                      var paddingBotttom = paddingH - paddingTop;
                      $el.css({"padding-top":paddingTop +"px", "padding-bottom":paddingBotttom +"px"});
                    }
                  }
                });
              }
            });
          }
          if (ratioH_is) {
            var ratioH = u.getMData($el, "ratio", "float", curView);
            if (ratioH !== undefined) {
              $el.outerHeight(($el.outerWidth() * ratioH) >> 0);
            }
          }
        });
      }
    }

    function resetContainer() {
      if (elSet.$el.length > 0) {
        var curView = u.getCurView();

        elSet.$el.each(function() {
          var $el = $(this);
          var maxH_is = $el.hasClass("maxh");
          var maxW_is = $el.hasClass("maxw");

          var selector  = u.getMData($el, "max-target", "cssSelector", curView);
          var adjustCss = u.getMData($el, "max-adjust-css", "cssProp", curView);
          var $target = $el;
          if (selector !== undefined) {
            $target = $(selector, $el);
          }

          if (maxW_is) $target.css({"width":""});
          if (maxH_is) $target.css({"height":""});

          if (adjustCss !== undefined) {
            if (adjustCss == "padding-left-right") {
              $target.children().css({"padding-left":"", "padding-right":""});
            } else if (adjustCss == "padding-top-bottom") {
                $target.children().css({"padding-top":"", "padding-bottom":""});
            } else {
              $target.children().css(adjustCss, "");
            }
          }
        });
      }
    }

  }

  function initResponsiveMDataEl() {
    var elSet = null;
    $window.on("m:doDomUpdate", function() {
      elSet = u.getUnprocessedEl("[data-m-class], [data-m-src]", "responsive-m-data-el");
      if (elSet.$unprocessed.length > 0) {
        elSet.$unprocessed.each(function() {
          var $el = $(this);
          var origSrc = $el.attr("src");
          if (origSrc !== undefined && origSrc !== ""){
            u.setMData($el, "orig-src", origSrc, true);
          }
        });
        u.markProcessed(elSet.$unprocessed, "responsive-m-data-el");
        m.domDirty_is = true;
      }
      var curView = u.getCurView();
      viewChange(curView, true);
    }).on("m:viewStart", function(ev, curView) {
      //console.log("m:viewStart: " + curView);
      viewChange(curView, true);
    }).on("m:viewEnd", function(ev, curView) {
      //console.log("m:viewEnd: " + curView);
      viewChange(curView, false);
    });

    function viewChange(viewName, show_is) {
      if (elSet !== null && elSet.$el.length > 0) {
        elSet.$el.each(function() {
          var $el = $(this);
          // update class attr
          var classNameList_s = u.getMData($el, "class", "classNameList", viewName);
          if (classNameList_s !== undefined) {
            if (show_is) {
              $el.addClass(classNameList_s);
            } else {
              $el.removeClass(classNameList_s);
            }
          }
          // update src attr or background image
          var src = u.getMData($el, "src", "string", viewName);
          if (src !== undefined) {
            if (show_is) {
              if (this.tagName.toLowerCase() == 'img') {
                $el.attr("src", src);
                console.log("imagesLoaded: src: " + src);
                m.newImgSrc_is = true;
              } else {
                $el.css("background-image", "url(" + src + ")");
              }
            } else {
              if (this.tagName.toLowerCase() == 'img') {
                var mOrigSrc = u.getMData($el, "orig-src", "string");
                if (mOrigSrc === undefined) mOrigSrc = "";
                $el.attr("src", mOrigSrc);
              } else {
                $el.css("background-image", "");
              }
            }
          }
        });
      }
    }
  }

  function initIntersectionObserver() {
    var intersectionObserver = new IntersectionObserver(cb);
    var elSet = null;
    var selectorName = "intersection-observer";
    $window.on("m:doDomUpdate", function() {
      elSet = u.getUnprocessedEl("." + selectorName + ", ." + selectorName + "-parent>*", selectorName);
      if (elSet.$unprocessed.length > 0) {
        elSet.$unprocessed.each(function() {
          intersectionObserver.observe(this);
        });
        u.markProcessed(elSet.$unprocessed, selectorName);
        m.domDirty_is = true;
      }
    });
    function cb(item_list) {
      item_list.forEach(function(item) {
        var $el = $(item.target);
        if (item.intersectionRatio > 0) {
          $el.addClass("intersect");
          if (!$el.hasClass("intersect-once")) {
            $el.addClass("intersect-once");
          }
          if (item.boundingClientRect.bottom >= 0) {
            $el.removeClass("upper-flow");
          }
        } else {
          $el.removeClass("intersect");
          if (item.boundingClientRect.bottom < 0) {
            $el.addClass("upper-flow");
          }
        }
        console.log("initIntersectionObserver: " + item.boundingClientRect.bottom);
        //console.log(item);
      });
    }
  }

  function initViewChangeEvent() {
    // m:resizeStart, m:layoutChange, m:viewStart, m:viewEnd
    var win_w = undefined;
    var view_is = {
      "desktop"  : undefined
      , "tablet" : undefined
      , "mobile" : undefined
      , "desktop": undefined
    };
    var delayResizeDoneTimer_id = undefined;
    $window.on("resize orientationchange", onResize);
    onResize(true); // html.mobile / .tablet / .desktop

    function onResize(init_is) {

      var new_win_w = $window.outerWidth();

      // m:resizeStart
      // m:layoutChange
      if (init_is !== true) {
        if (delayResizeDoneTimer_id === undefined) {
          $html.addClass("resizing");
          $window.trigger("m:resizeStart");
        } else {
          clearTimeout(delayResizeDoneTimer_id);
        }
        delayResizeDoneTimer_id = setTimeout(function() {
          $html.removeClass("resizing");
          $window.trigger("m:layoutChange");
          delayResizeDoneTimer_id = undefined;
        }, 500);
      }

      // m:viewStart
      // m:viewEnd
      var newView_is = {};
      newView_is["desktop"] = (new_win_w >= m.minW_desktop)?true:false;
      newView_is["tablet"]  = (new_win_w >= m.minW_tablet && new_win_w < m.minW_desktop)?true:false;
      newView_is["mobile"]  = (new_win_w < m.minW_tablet)?true:false;
      // newView_is["smallMobile"] = (new_win_w < m.minW_sm)?true:false;

      var viewNameList = undefined;
      if (new_win_w > win_w) { // to make sure end event before start event
        viewNameList = ["mobile","tablet","desktop"];
      } else {
        viewNameList = ["desktop","tablet","mobile"];
      }

      for (var i = 0; i < viewNameList.length; i++) {
        var viewName = viewNameList[i];
        if (view_is[viewName] === undefined || view_is[viewName] != newView_is[viewName]) {
          if (!newView_is[viewName]) {
            // end event first
            if (view_is[viewName] !== undefined) {
              $html.removeClass(viewName);
              if (init_is !== true) {
                //console.log("initResponsiveView:onResize: trigger m:viewEnd");
                $window.trigger("m:viewEnd", viewName);
              }
            }
            view_is[viewName] = false;
          } else {
            $html.addClass(viewName);
            if (init_is !== true) {
              m.newImgSrc_is = false;
              $window.trigger("m:viewStart", viewName);
              if (m.newImgSrc_is) {
                // console.log("imagesLoaded: init");
                $('body').imagesLoaded().always(function(instance) {
                  // console.log('imagesLoaded: always');
                  $window.trigger("m:layoutChange");
                });
              }
            }
            view_is[viewName] = true;
          }
        }
      }
      win_w = new_win_w;
    }
  }

  function initActiveEl() {

    var $el = null;
    $("body").on("click", ".toggler, .activator, .deactivator", onAction).on("click", onDeactivate);
    function onAction(ev) {
      //console.log("onAction");
      var $el = $(this);
      if (ev != null) ev.preventDefault(); // always preventDefault and trigger href by js
      if (ev != null) ev.stopPropagation();
      var curView = u.getCurView();
      var groupSelector   = u.getMData($el, "active-group", "cssSelector", curView);
      var targetSelector  = u.getMData($el, "active-target", "cssSelector", curView); // get on group element
      var index           = u.getMData($el, "active-index", "int", curView);
      var exclusive_is    = u.getMData($el, "active-exclusive", "boolean", curView);
      var delay           = u.getMData($el, "active-deactivate-delay", "int", curView);
      var bodyClassPrefix = u.getMData($el, "active-body-class", "className", curView);
      //data-m-active-cancelable
      var $group = null;
      var $target = null;
      var $targetList = null;
      var $curActiveItems = null;

      if (groupSelector !== undefined && index !== undefined) {
        // group of active elements
        $group = $(groupSelector);
        if ($group.length > 0 && targetSelector !== undefined) {
          $targetList = $(targetSelector, $group);
          if ($targetList.length > 0) {
            $target = $targetList.eq(index);
            $curActiveItems = $targetList.filter(".active");
            if (exclusive_is && !$curActiveItems.is($target) && !$target.hasClass("disabled") && ($el.hasClass("toggler") || $el.hasClass("activator"))) {
              // deactivate previous active element
              var param = {};
              param.target = groupSelector + " " + targetSelector;
              param.index = $targetList.index($curActiveItems.get(0));
              param.val = u.getMData($curActiveItems, "value", "string", curView);
              var $curActiveItemA = $(">a", $curActiveItems.get(0));
              $curActiveItemA.trigger("m:deactivate", param);
              u.changeActive($curActiveItems, false, "", delay, function() {
                $curActiveItemA.trigger("m:deactivateDone", param);
              });
            }
          }
        }
      } else {
        // single active element
        if (targetSelector !== undefined) {
          $target = $(targetSelector); // target query from root
        }
      }

      if ($target !== null && $target.length > 0 && !$target.hasClass("disabled")) {
        var param = {};
        param.target = (groupSelector === undefined)?targetSelector:(groupSelector + " " + targetSelector);
        param.index = index;
        param.val = u.getMData($target, "value", "string", curView);
        if (!$target.hasClass("active") && ($el.hasClass("activator") || $el.hasClass("toggler"))) {
          // activate
          $el.trigger("m:activate", param);
          u.changeActive($target, true, bodyClassPrefix, delay, function() {
            $el.trigger("m:activateDone", param);
          });
          if (u.link_is($el.attr("href"))) {
            window.location.href = $el.attr("href");
          }

        } else if ($target.hasClass("active") && ($el.hasClass("deactivator") || $el.hasClass("toggler"))) {
          // deactivate
          $el.trigger("m:deactivate", param);
          u.changeActive($target, false, bodyClassPrefix, delay, function() {
            $el.trigger("m:deactivateDone", param);
          });
        }
      }
    }

    function onDeactivate(ev) {
      //console.log("onCancel");
      var $el = $("[data-m-active-cancelable=true]");
      $el.each(function() {
        var $item = $(this);
        var groupSelector   = u.getMData($item, "active-group", "cssSelector");
        var targetSelector  = u.getMData($item, "active-target", "cssSelector");
        var bodyClassPrefix = u.getMData($item, "active-body-class", "className");
        u.deactivate(groupSelector, targetSelector, bodyClassPrefix);
      });
    }

  }

}

function m_domUpdate(m, run_count) {
  var $window = $(window);
  m.domDirty_is = false;
  m.newImgSrc_is = false;
  $window.trigger("m:doDomUpdate");
  if (run_count === undefined) run_count = 0;
  run_count++;
  console.log("m_domUpdate: " + m.domDirty_is + " " + run_count);
  if (m.domDirty_is && run_count <= 4) {
    m_domUpdate(m, run_count);
  } else {
    if (m.windowInitLoad_is) {
      if (m.newImgSrc_is) {
        console.log("imagesLoaded: init");
        $('body').imagesLoaded().always(function(instance) {
          console.log('imagesLoaded: always');
          $window.trigger("m:layoutChange");
        });
      } else {
        $window.trigger("m:layoutChange");
      }
    }
  }
}
