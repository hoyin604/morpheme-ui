morpheme-ui
===========

- front-end css/js only ui plug-in/widget library
- to atomizise complex ui, so that it can be easiler mix and match

now problem:
- lots of plugins and some a very similar in a same project (e.g. use both slick and carousel)
- hard to choose plugin when they have limitation and wrong customization
- not well integrated, some need may implement of different plugin with different way
- lots of efford to customized plugin with css
  e.g. if a
- ui will be change between different view in a vary random usage case e.g.:
  - simple text link @mobile but multi-level hover menu @desktop
  - simple one-by-one photo @mobile but gallery ui @desktop (or reverse)
  - draggable gallery @mobile but nav button ui @desktop


now solution:
- for example some menu in bootstrap assume long wide menu @deskop and column menu @mobile and cannot be change
- complicate js widget e.g. slick can be disable on some responsive view

our concern:
- 2 types of data: collection/object
- use simple concept like active class to unify and simplify programming afford
- trigger (active state, exclutive / non-exclutive)
- item-list (a set of elements with the same kind)
- group (a set of elements with different kind)

- do you ever thinking about accordion / carousel / radio btn group / bar menu / tree menu etc. most the same thing but only little bit different?
- accordion :
  - a list of items
  - with trigger inside items,
  - trigger activate item by click, the target is its item
  - trigger will activate item exclutively with others (exclutive)
  - item itself will be deactivate when click while activate (trigger mode : toggler)

- radio btn group
  - a list of items
  - with trigger as its items
  - trigger activate itself by click
  - trigger will activate item exclutively with others (exclutive)
  - trigger/item itself will still be active when click again (trigger mode : activator)

- checkbox group
  - a list of items
  - with trigger as its items
  - trigger activate itself by click
  - trigger will not deactivate others when it activated (not exclutive)
  - trigger will be on/off when click again (trigger mode : toggler)

- carousel
  - a list of items
  - with arrow/circle ui as the trigger outside the item-list
  - arrow/circle trigger activate item by click. some carousel can be pan. the activated item control by the current active item's position
  - trigger will activate item exclutively with others (exclutive)
  - responsive carousel will become other form e.g. plain picture list without any navigation when @mobile or @desktop

- pagination ui
  - page number as a list of items
  - with number as trigger, and arrow outside the item-list
  - the target they want to control is outside the ui. it can be a page content or a carousel.
  - number trigger activate itself by click then number will send to target
  - arrow will send next/prev to item-list then item-list will fire changes to their target
  - trigger will activate item exclutively with others (exclutive)
  - trigger itself will still be active when click again (trigger mode : activator)

- overlay ui
  - overlay as a target of some trigger
  - an external btn can open a target overlay (trigger mode : activator)
  - close btn/border space can close their overlay (trigger mode : deactivator)
  - single overlay is also the item of a group of all other overlay on the same page (body as item-list). it should show exclutively

- overlay menu with hamburger menu


- every clickable can be a trigger, trigger can active or deactive something by adding/removing 'active' in their target class
- trigger have mode: toggler|activator|deactivator (on<->off | off->on | on->off)
- trigger will have their target, which not neccessary itself, multiple trigger can target the same element
- a concept of item-list / item introduced to group a set of items
- item can be set to active exclutively or non-exclutively, if non-exclutively which means multiple item can be active at the same time
- item-list can be nest inside other item-list
- when item have been activate, item-list will fire 'change' event which contain info of active item(s) such as value/text or index etc.
- change event can propagation so that parent node like container of item-list can also handle change event
- each item-list will have a unique name by their node id or morpheme generated id


e.g. all overlay belongs to a item-list call 'modal_ui' which include all overlay,selector,tips as items and 'body' as item-list
when any item like selector with id="country" have been activated. a class will be added to body named 'modal_ui__country_selector'
if this selector also belongs to other item-list(body) call 'overlay'. body will have 2 class added "modal_ui__country selector__country"

our solution:
- responive ui
- special trigger link pan, scroll
- animation/transition
- carousel/tab/overlay/modal alert/accordian/scroll_section
- btn/btn group/input/checkBox/radio
- selector/pulldown/menu
- custom number order list
- icon
- pagination:dot/number/arrow

css:
  - morpheme.css
    - tag reset
    - defined functional property, not visual property
- responsive by reference the class in html tag e.g.
  - rv__mobile
  - rv__tablet
  - rv__desktop
  rv : property name (responsive view)
  __ : =
  (mobile|tablet|desktop) possible value

  or by viewport value:
  - vp_w__xs 0-479 (e.g. mobile)
  - vp_w__s  480-767 (larger but still mobile, e.g. note10)
  - vp_w__m  768-1023 (tablet-portrait 768x1024)
  - vp_w__l  1024-1399 (iPadPro-portrait/landscape 1024x1366)
  - vp_w__xl 1400-... (extra-large screen like iMac)

- by refer to html class we no need to change css everytime when breakpoint change
- and those method can also open up the ability like mobile/desktop only ui detect by device by not viewport e.g.
  - custom pulldown menu will only show on desktop whatever viewport size. mobile/tablet will use their native pulldown menu for better ux

  @dv__desktop,


example action:
- become custom selector only for desktop device (data-ac: add class value if not exist)
  `<div class="container" data-add-class="selector @dv__desktop">...</div>`
  - only mobile will be native, larger device such as iPad or iPad pro will use custon selector like desktop
  `<div class="container" data-add-class="selector @dv__desktop@dv__tablet">...</div>`

- responsive img:
  replace the loading image with responsive images (data-s-<attr>: set value of the attribute to this one)
  `<img src="data:..." data-set-src="/img/640x2w.jpg @rv__mobile|rv__desktop, /img/400w.jpg @rv_tablet">`

- use js fallback when no srcset support (like ie6-11) (data-s-<attr> (with special value __remove_attr__): remove the whole attribute)
  `<img srcset="/img/640x2w.jpg 480w,
                /img/400w.jpg 767w,
                /img/640x2w.jpg 1023w"
        data-set-src="/img/640x2w.jpg @no-srcset"
        data-set-srcset="__remove_attr__ @no-srcset" >`

- using js lazy loading plugin when no native support
  `<img loading="lazy" data-add-class="lazy @no-lazy" >`

command:
- action(add/replace/remove)
- target(object.property)
- value(template) (string|property)
- condition

- condition:
html@device__desktop (object@property__value) html/body/this can be omitt, just like window/document/this

- value(template):
- simple string:
  "abcdef"
  string with value:
  count:${list/count}

- path as object locator:
  /abc/def - "/" refer to global
  ../ - parent
  ./ - currrent
  abc - look up (current/default/global)

click example:

- click to highlight, further clicking will still be hightlight
  `<a class="btn" href="#" data-ac="active =click"></a>`

- click each time will on/off highlight (data-tc : trigger class)
  `<a class="btn" href="#" data-add-class="active =click"></a>`

- click each time will on/off highlight, btn is highlight initally
  `<a class="active btn" href="#" data-tc="active =click"></a>`
- click to off highlight, initial is highlight (data-rc : delete/remove class)
  `<a class="active btn" href="#" data-rc="active =click"></a>`

- trigger the activation with delay
  `<a class="btn" href="#" data-tc="active =click" data-tc-delay="500"></a>`
  when not click      : btn
  when just click     : active in btn
  10 ms after click   : active in animating btn
  when animation done : active btn
  when click to deactive : active out animating btn
  when animation done    : active out btn
  10 ms after click      : btn

- target other element to activate
  `<a class="btn" href="#" data-ac="active =click" data-target-selector="#my_overlay"></a>`

- example of custom selector
before changes:
```
<div class="dropdown container" data-add-class="selector-- @dv__desktop">
  <select name="cars" id="cars">
    <option value="volvo">Volvo</option>
    <option value="saab">Saab</option>
    <option value="mercedes">Mercedes</option>
    <option value="audi">Audi</option>
  </select>
</div>
```

```
<div class="dropdown selector-- container selector__i0" data-ac="selector @dv__desktop">
  <select name="cars" id="cars">
    <option value="volvo" selected>Volvo</option>
    <option value="saab">Saab</option>
    <option value="" disabled>==========</option>
    <option value="mercedes">Mercedes</option>
    <option value="audi">Audi</option>
  </select>
  <ul class="item-list">
    <li class="active"   data-value="volvo"    ><a href="javascript:;" title="Volvo"      >Volvo</a></li>
    <li                  data-value="saab"     ><a href="javascript:;" title="Saab"       >Saab</a></li>
    <li class="disabled" data-value=""         ><a href="javascript:;" title="==========" >==========</a></li>
    <li                  data-value="mercedes" ><a href="javascript:;" title="Mercedes"   >Mercedes</a></li>
    <li                  data-value="audi"     ><a href="javascript:;" title="Audi"       >Audi</a></li>
  </ul>
  <a class="toggler" href="#"><span class="icon triangle"></span> <label>Volvo</label></a>
</div>
```

item-list change event
----------------------
