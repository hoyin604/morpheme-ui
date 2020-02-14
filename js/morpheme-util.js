var Morpheme = Morpheme || {};
Morpheme["Util"] = Morpheme["Util"] || {};

Morpheme.Util.aniActive = function($el, classPrefix, aniIn_is, delay, callback) { // delay accept undefined
  if ($el != null && $el.length > 0) {
    if (classPrefix != "" && classPrefix.substr(classPrefix.length-1,1) != "-") {
      classPrefix += "-";
    }
    var timeout_id = Morpheme.Util.getMData($el, "timout-id", "int");
    if (timeout_id !== undefined) {
      clearTimeout(timeout_id);
      timeout_id = undefined;
    }
    if (aniIn_is) {
      // ani-active-in
      $el.addClass(classPrefix + "active").removeClass(classPrefix + "active-ready");
      if (delay !== undefined) {
        timeout_id = setTimeout(function() {
          $el.addClass(classPrefix + "active-ready");
          if (callback != null) {
            callback();
          }
        }, 50);
      }
    } else {
      // ani-active-out
      if (delay !== undefined) {
        $el.removeClass(classPrefix + "active-ready");
        timeout_id = setTimeout(function() {
          if (callback != null) {
            callback();
          }
          $el.removeClass(classPrefix + "active");
        }, delay);
      } else {
        $el.removeClass(classPrefix + "active " + classPrefix + "active-ready");
      }
    }
    Morpheme.Util.setMData($el, "timout-id", timeout_id);
  }
};

Morpheme.Util.getMData = function($el, nameSubfix, dataType, propName) { // propName: undefined, classname, __all__
  var result = undefined;
  var v = $el.data("m-" + nameSubfix);
  // if no propName(undefined), it should return normal data value, not conditional value
  if (v !== undefined && propName !== undefined && propName !== "") {
    var info = Morpheme.Util.toPropGroupInfo(v);
    if (!info.process_is) {
      propName = "__all__";
    }
    if (propName in info) {
      v = info[propName];
    } else {
      v = undefined;
    }
  }
  if (v !== undefined) {
    if (dataType == "classNameList") {
      result = Morpheme.Util.toSafeClassNameList(v).join(" ");
    } else {
      if (Array.isArray(v) && v.length > 0) v = v[0];
      if (dataType == "int") {
        result = parseInt(v, 10);
      } else if (dataType == "float") {
        result = parseFloat(v);
      } else if (dataType == "boolean") {
        v = String(v).toLowerCase();
        result = (v == "1" || v == "yes" || v == "true")?true:false;
      } else if (dataType == "className" || dataType == "cssProp") {
        result = Morpheme.Util.toSafeClassName(v);
      } else if (dataType == "cssSelector") {
        result = Morpheme.Util.toSafeCssSelector(v);
      } else if (dataType == "string") {
        result = v;
      } else if (v === "") {
        result = undefined;
      }
    }
  }
  return result;
};

Morpheme.Util.setMData = function($el, nameSubfix, val, useAttr_is) {
  if (val !== undefined && val !== null) {
    if (useAttr_is) {
      $el.attr("data-m-" + nameSubfix, val);
    } else {
      $el.data("m-" + nameSubfix, val);
    }
  }
};
Morpheme.Util.addMData = function($el, nameSubfix, val) {
  if ($el !== null && $el.length > 0 && val !== undefined && val !== null) {
    $el.each(function() {
      var $item = $(this);
      var origiVal = $item.attr("data-m-" + nameSubfix);
      if (origiVal !== undefined && origiVal !== "") {
        val = origiVal + " " + val;
      }
      $item.attr("data-m-" + nameSubfix, val);
    });
  }
};

Morpheme.Util.toSafeClassName = function(testClassName) {
  var result = "";
  if (testClassName != "" && testClassName != undefined) {
    result = testClassName.trim();
    result = result.replace(/\#/gi, "_");
    result = result.replace(/[^a-z0-9_]/gi, "-");
    result = result.replace(/\-{2,}/gi, "-"); // removed repeated -
    result = result.replace(/^\-+/gi, ""); // trim start -
    result = result.replace(/\-+$/gi, ""); // trim end -
    result = result.toLowerCase();
  }
  return result;
};

Morpheme.Util.toSafeCssSelector = function(testCssSelector) {
  var result = "";
  if (testCssSelector != "" && testCssSelector != undefined) {
    result = testCssSelector.trim();
    result = result.replace(/[@;\{\}]/gi, "");
    result = result.replace(/\s{2,}/gi, " ");
    result = result.toLowerCase();
  }
  return result;
};

Morpheme.Util.toSafeClassNameList = function(testClassNameListStr) {
  var result = [];
  if (testClassNameListStr !== "" && testClassNameListStr !== undefined) {
    var classNameList;
    if (Array.isArray(testClassNameListStr)) {
      classNameList = testClassNameListStr;
    } else {
      classNameList = String(testClassNameListStr).split(" ");
    }
    for (var i = 0; i < classNameList.length; i++) {
      var className = Morpheme.Util.toSafeClassName(classNameList[i]);
      if (className != "") {
        result.push(className);
      }
    }
  }
  return result;
};

Morpheme.Util.getOsSelectHtml = function($selectorItems, name) {
  var result = "";
  $selectorItems.each(function(i) {
    var $el = $(this);
    var html = "<option";
    var txt = "";
    var disabled_is = false;
    if ($el.hasClass("divider")) {
      html += " class=\"divider\"";
      txt = "----------";
      disabled_is = true;
    } else {
      txt = $(">*", $el).text();
    }
    var val = Morpheme.Util.getMData($el, "value", "string");
    if (val !== undefined) {
      html += " value=\"" + val + "\"";
    }
    if ($el.hasClass("active")) {
      html += " selected";
    }
    if ($el.hasClass("disabled")) {
      disabled_is = true;
    }
    if (disabled_is) {
      html += " disabled";
    }
    html += ">" + txt + "</option>\n";
    result += html;
  });
  if (result !== "") {
    var name_str = "";
    if (name != undefined) {
      name_str = " name=\"" + name + "\"";
    }
    result = "<select" + name_str + ">\n" + result + "</select>\n";
  }
  return result;
};

Morpheme.Util.toPropGroupInfo = function(str) {
  var result = {
    process_is:undefined
    , __all__:[]
  };
  var m1 = String(str).match(/[^@{};]+(\s*@{1}[a-z]+)+/ig); // any css selector format with one or more @xxx at the end e.g. ul.item-list>li>a@desktop
  if (m1 == null) {
    result.process_is = false;
    result.__all__ = [str];
  } else {
    if (m1.length > 0) {
      result.process_is = true;
      for (var i = 0; i < m1.length; i++) {
        var item = m1[i].trim();
        var m2 = item.match(/[^@]+/ig); // m2[0]: value, m2[1..n]: mobile|tablet|desktop
        if (m2 !== null && m2.length > 1) {
          var value = m2[0].trim();
          for (var j = 1; j < m2.length; j++) {
            var key = m2[j].trim().toLowerCase();
            if (!(key in result)) {
              result[key] = [];
            }
            if (result[key].indexOf(value) == -1) {
              result[key].push(value);
            }
          }
          if (result.__all__.indexOf(value) == -1) {
            result.__all__.push(value);
          }
        }
      }
    }
  }
  return result;
};

Morpheme.Util.deactivate = function(groupSelector, targetSelector, bodyClassPrefix) {
  var $target = Morpheme.Util.getTargetEl(groupSelector, targetSelector);
  if ($target != null && $target.length > 0) {
    $target.removeClass("active active-ready");
  }
  if (bodyClassPrefix !== undefined) {
    $("body").removeClass(bodyClassPrefix + "-active " + bodyClassPrefix + "-active-ready");
  }
};

Morpheme.Util.getTargetEl = function(groupSelector, targetSelector, index) {
  var $result = null;
  if (groupSelector !== undefined) {
    var $group = $(groupSelector);
    if ($group.length > 0 && targetSelector !== undefined) {
      $result = $(targetSelector, $group);
    }
  } else {
    if (targetSelector !== undefined) {
      $result = $(targetSelector);
    }
  }
  if (index !== undefined && $result !== null && $result.length > 0) {
    $result = $result.eq(index);
  }
  return $result;
};

Morpheme.Util.getCurView = function() {
  // use only inside m:viewStart, m:viewEnd  or m:resizeDelayDone
  if (!("el" in Morpheme)) Morpheme.el = {};
  if (!("$html" in Morpheme.el)) Morpheme.el.$html = $("html");
  var $html = Morpheme.el.$html;
  var result = "mobile";
  if ($html.hasClass("tablet")) result = "tablet";
  if ($html.hasClass("desktop")) result = "desktop";
  return result;
};

Morpheme.Util.changeActive = function($target, active_is, bodyClassPrefix, delay, cb) {
  var $body = $("body");
  if (delay === undefined) {
    if (active_is) {
      $target.addClass("active");
      if (bodyClassPrefix !== "" && bodyClassPrefix !== undefined) {
        $body.addClass(bodyClassPrefix + "-active");
      }
    } else {
      $target.removeClass("active");
      if (bodyClassPrefix !== "" && bodyClassPrefix !== undefined) {
        $body.removeClass(bodyClassPrefix + "-active");
      }
    }
    if (cb !== null) cb();
  } else {
    Morpheme.Util.aniActive($target, "", active_is, delay, cb);
    if (bodyClassPrefix !== "" && bodyClassPrefix !== undefined) {
      Morpheme.Util.aniActive($body, bodyClassPrefix, active_is, delay);
    }
  }
};

Morpheme.Util.link_is = function(href) {
  var result = false;
  if (href !== undefined && href != "" && href != "#" && href != "javascript:;") {
    result = true;
  }
  return result;
};

Morpheme.Util.getUnprocessedEl = function(selector, type) {
  var result = {$el:null, $unprocessed:null};
  result.$el = $(selector);
  result.$unprocessed = $(selector).not("[data-m-processed~='" + type + "']");
  return result;
}
Morpheme.Util.markProcessed = function($el, type) {
  if ($el !== null) {
    Morpheme.Util.addMData($el, "processed", type);
  }
}
console.log(Morpheme);
