
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-query/index.js", Function("exports, require, module",
"\n\
function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
};\n\
//@ sourceURL=component-query/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  if (el.addEventListener) {\n\
    el.addEventListener(type, fn, capture || false);\n\
  } else {\n\
    el.attachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  if (el.removeEventListener) {\n\
    el.removeEventListener(type, fn, capture || false);\n\
  } else {\n\
    el.detachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
//@ sourceURL=component-event/index.js"
));
require.register("component-throttle/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module exports.\n\
 */\n\
\n\
module.exports = throttle;\n\
\n\
/**\n\
 * Returns a new function that, when invoked, invokes `func` at most one time per\n\
 * `wait` milliseconds.\n\
 *\n\
 * @param {Function} func The `Function` instance to wrap.\n\
 * @param {Number} wait The minimum number of milliseconds that must elapse in between `func` invokations.\n\
 * @return {Function} A new function that wraps the `func` function passed in.\n\
 * @api public\n\
 */\n\
\n\
function throttle (func, wait) {\n\
  var rtn; // return value\n\
  var last = 0; // last invokation timestamp\n\
  return function throttled () {\n\
    var now = new Date().getTime();\n\
    var delta = now - last;\n\
    if (delta >= wait) {\n\
      rtn = func.apply(this, arguments);\n\
      last = now;\n\
    }\n\
    return rtn;\n\
  };\n\
}\n\
//@ sourceURL=component-throttle/index.js"
));
require.register("matthewmueller-debounce/index.js", Function("exports, require, module",
"/**\n\
 * Debounces a function by the given threshold.\n\
 *\n\
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/\n\
 * @param {Function} function to wrap\n\
 * @param {Number} timeout in ms (`100`)\n\
 * @param {Boolean} whether to execute at the beginning (`true`)\n\
 * @api public\n\
 */\n\
\n\
module.exports = function debounce(func, threshold, execAsap){\n\
  var timeout;\n\
  if (false !== execAsap) execAsap = true;\n\
\n\
  return function debounced(){\n\
    var obj = this, args = arguments;\n\
\n\
    function delayed () {\n\
      if (!execAsap) {\n\
        func.apply(obj, args);\n\
      }\n\
      timeout = null;\n\
    }\n\
\n\
    if (timeout) {\n\
      clearTimeout(timeout);\n\
    } else if (execAsap) {\n\
      func.apply(obj, args);\n\
    }\n\
\n\
    timeout = setTimeout(delayed, threshold || 100);\n\
  };\n\
};\n\
//@ sourceURL=matthewmueller-debounce/index.js"
));
require.register("danzajdband-vanilla-masonry/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Export the constructor\n\
 */\n\
\n\
module.exports = require('./masonry');\n\
//@ sourceURL=danzajdband-vanilla-masonry/index.js"
));
require.register("danzajdband-vanilla-masonry/masonry.js", Function("exports, require, module",
"/**\n\
 * Vanilla Masonry v1.0.7\n\
 * Dynamic layouts for the flip-side of CSS Floats\n\
 * http://vanilla-masonry.desandro.com\n\
 *\n\
 * Licensed under the MIT license.\n\
 * Copyright 2012 David DeSandro\n\
 */\n\
\n\
(function( window, undefined ) {\n\
\n\
  'use strict';\n\
\n\
  var document = window.document;\n\
\n\
  // -------------------------- DOM Utility -------------------------- //\n\
\n\
  // from bonzo.js, by Dustin Diaz - https://github.com/ded/bonzo\n\
\n\
  // use classList API if available\n\
  var supportClassList = 'classList' in document.createElement('div');\n\
\n\
  function classReg(c) {\n\
    return new RegExp(\"(^|\\\\s+)\" + c + \"(\\\\s+|$)\");\n\
  }\n\
\n\
  var hasClass = supportClassList ? function (el, c) {\n\
    return el.classList.contains(c);\n\
  } : function (el, c) {\n\
    return classReg(c).test(el.className);\n\
  };\n\
\n\
  var addClass = supportClassList ? function (el, c) {\n\
    el.classList.add(c);\n\
  } : function (el, c) {\n\
    if ( !hasClass(el, c) ) {\n\
      el.className = el.className + ' ' + c;\n\
    }\n\
  };\n\
\n\
  var removeClass = supportClassList ? function (el, c) {\n\
    el.classList.remove(c);\n\
  } : function (el, c) {\n\
    el.className = el.className.replace(classReg(c), ' ');\n\
  };\n\
\n\
  // -------------------------- getStyle -------------------------- //\n\
\n\
  var defView = document.defaultView;\n\
\n\
  var getStyle = defView && defView.getComputedStyle ?\n\
    function( elem ) {\n\
      return defView.getComputedStyle( elem, null );\n\
    } :\n\
    function( elem ) {\n\
      return elem.currentStyle;\n\
    };\n\
\n\
  // -------------------------- Percent Margin support -------------------------- //\n\
\n\
  // hack for WebKit bug, which does not return proper values for percent-margins\n\
  // Hard work done by Mike Sherov https://github.com/jquery/jquery/pull/616\n\
\n\
  var body = document.getElementsByTagName(\"body\")[0],\n\
      div = document.createElement('div'),\n\
      fakeBody = body || document.createElement('body');\n\
\n\
  div.style.marginTop = '1%';\n\
  fakeBody.appendChild( div );\n\
\n\
  var supportsPercentMargin = getStyle( div ).marginTop !== '1%';\n\
\n\
  fakeBody.removeChild( div );\n\
\n\
  // TODO remove fakebody if it's fake?\n\
\n\
  // https://github.com/mikesherov/jquery/blob/191c9c1be/src/css.js\n\
\n\
  function hackPercentMargin( elem, computedStyle, marginValue ) {\n\
    if ( marginValue.indexOf('%') === -1 ) {\n\
      return marginValue;\n\
    }\n\
\n\
    var elemStyle = elem.style,\n\
        originalWidth = elemStyle.width,\n\
        ret;\n\
\n\
    // get measure by setting it on elem's width\n\
    elemStyle.width = marginValue;\n\
    ret = computedStyle.width;\n\
    elemStyle.width = originalWidth;\n\
\n\
    return ret;\n\
  }\n\
\n\
  // -------------------------- getWH -------------------------- //\n\
\n\
  // returns width/height of element, refactored getWH from jQuery\n\
  function getWH( elem, measure, isOuter ) {\n\
    // Start with offset property\n\
    var isWidth = measure !== 'height',\n\
        val = isWidth ? elem.offsetWidth : elem.offsetHeight,\n\
        dirA = isWidth ? 'Left' : 'Top',\n\
        dirB = isWidth ? 'Right' : 'Bottom',\n\
        computedStyle = getStyle( elem ),\n\
        paddingA = parseFloat( computedStyle[ 'padding' + dirA ] ) || 0,\n\
        paddingB = parseFloat( computedStyle[ 'padding' + dirB ] ) || 0,\n\
        borderA = parseFloat( computedStyle[ 'border' + dirA + 'Width' ] ) || 0,\n\
        borderB = parseFloat( computedStyle[ 'border' + dirB + 'Width' ] ) || 0,\n\
        computedMarginA = computedStyle[ 'margin' + dirA ],\n\
        computedMarginB = computedStyle[ 'margin' + dirB ],\n\
        marginA, marginB;\n\
\n\
    if ( !supportsPercentMargin ) {\n\
      computedMarginA = hackPercentMargin( elem, computedStyle, computedMarginA );\n\
      computedMarginB = hackPercentMargin( elem, computedStyle, computedMarginB );\n\
    }\n\
\n\
    marginA = parseFloat( computedMarginA ) || 0;\n\
    marginB = parseFloat( computedMarginB ) || 0;\n\
\n\
    if ( val > 0 ) {\n\
\n\
      if ( isOuter ) {\n\
        // outerWidth, outerHeight, add margin\n\
        val += marginA + marginB;\n\
      } else {\n\
        // like getting width() or height(), no padding or border\n\
        val -= paddingA + paddingB + borderA + borderB;\n\
      }\n\
\n\
    } else {\n\
\n\
      // Fall back to computed then uncomputed css if necessary\n\
      val = computedStyle[ measure ];\n\
      if ( val < 0 || val === null ) {\n\
        val = elem.style[ measure ] || 0;\n\
      }\n\
      // Normalize \"\", auto, and prepare for extra\n\
      val = parseFloat( val ) || 0;\n\
\n\
      if ( isOuter ) {\n\
        // Add padding, border, margin\n\
        val += paddingA + paddingB + marginA + marginB + borderA + borderB;\n\
      }\n\
    }\n\
\n\
    return val;\n\
  }\n\
\n\
  // -------------------------- addEvent / removeEvent -------------------------- //\n\
\n\
  // by John Resig - http://ejohn.org/projects/flexible-javascript-events/\n\
\n\
  function addEvent( obj, type, fn ) {\n\
    if ( obj.addEventListener ) {\n\
      obj.addEventListener( type, fn, false );\n\
    } else if ( obj.attachEvent ) {\n\
      obj[ 'e' + type + fn ] = fn;\n\
      obj[ type + fn ] = function() {\n\
        obj[ 'e' + type + fn ]( window.event );\n\
      };\n\
      obj.attachEvent( \"on\" + type, obj[ type + fn ] );\n\
    }\n\
  }\n\
\n\
  function removeEvent( obj, type, fn ) {\n\
    if ( obj.removeEventListener ) {\n\
      obj.removeEventListener( type, fn, false );\n\
    } else if ( obj.detachEvent ) {\n\
      obj.detachEvent( \"on\" + type, obj[ type + fn ] );\n\
      obj[ type + fn ] = null;\n\
      obj[ 'e' + type + fn ] = null;\n\
    }\n\
  }\n\
\n\
  // -------------------------- Masonry -------------------------- //\n\
\n\
  function Masonry( elem, options ) {\n\
    if ( !elem ) {\n\
      // console.error('Element not found for Masonry.')\n\
      return;\n\
    }\n\
\n\
    this.element = elem;\n\
\n\
    this.options = {};\n\
\n\
    for ( var prop in Masonry.defaults ) {\n\
      this.options[ prop ] = Masonry.defaults[ prop ];\n\
    }\n\
\n\
    for ( prop in options ) {\n\
      this.options[ prop ] = options[ prop ];\n\
    }\n\
\n\
    this._create();\n\
    this.build();\n\
  }\n\
\n\
  // styles of container element we want to keep track of\n\
  var masonryContainerStyles = [ 'position', 'height' ];\n\
\n\
  Masonry.defaults = {\n\
    isResizable: true,\n\
    gutterWidth: 0,\n\
    isRTL: false,\n\
    isFitWidth: false\n\
  };\n\
\n\
  Masonry.prototype = {\n\
\n\
    _getBricks: function( items ) {\n\
      var item;\n\
      for (var i=0, len = items.length; i < len; i++ ) {\n\
        item = items[i];\n\
        item.style.position = 'absolute';\n\
        addClass( item, 'masonry-brick' );\n\
        this.bricks.push( item );\n\
      }\n\
    },\n\
\n\
    _create: function() {\n\
\n\
      // need to get bricks\n\
      this.reloadItems();\n\
\n\
      // get original styles in case we re-apply them in .destroy()\n\
      var elemStyle = this.element.style;\n\
      this._originalStyle = {};\n\
      for ( var i=0, len = masonryContainerStyles.length; i < len; i++ ) {\n\
        var prop = masonryContainerStyles[i];\n\
        this._originalStyle[ prop ] = elemStyle[ prop ] || '';\n\
      }\n\
\n\
      this.element.style.position = 'relative';\n\
\n\
      this.horizontalDirection = this.options.isRTL ? 'right' : 'left';\n\
      this.offset = {};\n\
\n\
      // get top left/right position of where the bricks should be\n\
      var computedStyle = getStyle( this.element ),\n\
          paddingX = this.options.isRTL ? 'paddingRight' : 'paddingLeft';\n\
\n\
      this.offset.y = parseFloat( computedStyle.paddingTop ) || 0;\n\
      this.offset.x = parseFloat( computedStyle[ paddingX ] ) || 0;\n\
\n\
      this.isFluid = this.options.columnWidth && typeof this.options.columnWidth === 'function';\n\
\n\
      // add masonry class first time around\n\
      var instance = this;\n\
      setTimeout( function() {\n\
        addClass( instance.element, 'masonry' );\n\
      });\n\
\n\
      // bind resize method\n\
      if ( this.options.isResizable ) {\n\
        addEvent( window, 'resize', function(){\n\
          instance._handleResize();\n\
        });\n\
      }\n\
\n\
    },\n\
\n\
    // build fires when instance is first created\n\
    // and when instance is triggered again -> myMasonry.build();\n\
    build: function( callback ) {\n\
      this._getColumns();\n\
      this._reLayout( callback );\n\
    },\n\
\n\
    // calculates number of columns\n\
    // i.e. this.columnWidth = 200\n\
    _getColumns: function() {\n\
      var container = this.options.isFitWidth ? this.element.parentNode : this.element,\n\
          containerWidth = getWH( container, 'width' );\n\
\n\
                         // use fluid columnWidth function if there\n\
      this.columnWidth = this.isFluid ? this.options.columnWidth( containerWidth ) :\n\
                    // if not, how about the explicitly set option?\n\
                    this.options.columnWidth ||\n\
                    // Okay then, use the size of the first item\n\
                     getWH( this.bricks[0], 'width', true ) ||\n\
                    // Whatevs, if there's no items, use size of container\n\
                    containerWidth;\n\
\n\
      this.columnWidth += this.options.gutterWidth;\n\
\n\
      this.cols = Math.floor( ( containerWidth + this.options.gutterWidth ) / this.columnWidth );\n\
      this.cols = Math.max( this.cols, 1 );\n\
\n\
    },\n\
\n\
    // goes through all children again and gets bricks in proper order\n\
    reloadItems: function() {\n\
      this.bricks = [];\n\
      this._getBricks( this.element.children );\n\
    },\n\
\n\
    // ====================== General Layout ======================\n\
\n\
    _reLayout: function( callback ) {\n\
      // reset columns\n\
      var i = this.cols;\n\
      this.colYs = [];\n\
      while (i--) {\n\
        this.colYs.push( 0 );\n\
      }\n\
      // apply layout logic to all bricks\n\
      this.layout( this.bricks, callback );\n\
    },\n\
\n\
    // used on collection of atoms (should be filtered, and sorted before )\n\
    // accepts bricks-to-be-laid-out to start with\n\
    layout: function( bricks, callback ) {\n\
\n\
      // bail out if no bricks\n\
      if ( !bricks || !bricks.length ) {\n\
        return;\n\
      }\n\
\n\
      // layout logic\n\
      var brick, colSpan, groupCount, groupColY, j, colGroup;\n\
\n\
      for ( var i=0, len = bricks.length; i < len; i++ ) {\n\
        brick = bricks[i];\n\
\n\
        // don't try nothing on text, imlookinachu IE6-8\n\
        if ( brick.nodeType !== 1 ) {\n\
          continue;\n\
        }\n\
\n\
        //how many columns does this brick span\n\
        colSpan = Math.ceil( getWH( brick, 'width', true ) / this.columnWidth );\n\
        colSpan = Math.min( colSpan, this.cols );\n\
\n\
        if ( colSpan === 1 ) {\n\
          // if brick spans only one column, just like singleMode\n\
          colGroup = this.colYs;\n\
        } else {\n\
          // brick spans more than one column\n\
          // how many different places could this brick fit horizontally\n\
          groupCount = this.cols + 1 - colSpan;\n\
          colGroup = [];\n\
\n\
          // for each group potential horizontal position\n\
          for ( j=0; j < groupCount; j++ ) {\n\
            // make an array of colY values for that one group\n\
            groupColY = this.colYs.slice( j, j + colSpan );\n\
            // and get the max value of the array\n\
            colGroup[j] = Math.max.apply( Math, groupColY );\n\
          }\n\
\n\
        }\n\
\n\
        // get the minimum Y value from the columns\n\
        var minimumY = Math.min.apply( Math, colGroup );\n\
\n\
        // Find index of short column, the first from the left\n\
        for ( var colI = 0, groupLen = colGroup.length; colI < groupLen; colI++ ) {\n\
          if ( colGroup[ colI ] === minimumY ) {\n\
            break;\n\
          }\n\
        }\n\
\n\
        // position the brick\n\
        brick.style.top = ( minimumY + this.offset.y ) + 'px';\n\
        brick.style[ this.horizontalDirection ] = ( this.columnWidth * colI + this.offset.x ) + 'px';\n\
\n\
        // apply setHeight to necessary columns\n\
        var setHeight = minimumY + getWH( brick, 'height', true ),\n\
            setSpan = this.cols + 1 - groupLen;\n\
        for ( j=0; j < setSpan; j++ ) {\n\
          this.colYs[ colI + j ] = setHeight;\n\
        }\n\
\n\
      }\n\
\n\
      // set the size of the container\n\
      this.element.style.height = Math.max.apply( Math, this.colYs ) + 'px';\n\
      if ( this.options.isFitWidth ) {\n\
        var unusedCols = 0;\n\
        i = this.cols;\n\
        // count unused columns\n\
        while ( --i ) {\n\
          if ( this.colYs[i] !== 0 ) {\n\
            break;\n\
          }\n\
          unusedCols++;\n\
        }\n\
        // fit container to columns that have been used;\n\
        this.element.style.width = ( (this.cols - unusedCols) * this.columnWidth -\n\
          this.options.gutterWidth ) + 'px';\n\
      }\n\
\n\
      // provide bricks as context for the callback\n\
      if ( callback ) {\n\
        callback.call( bricks );\n\
      }\n\
\n\
    },\n\
\n\
    // ====================== resize ======================\n\
\n\
    // original debounce by John Hann\n\
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/\n\
\n\
    // this fires every resize\n\
    _handleResize: function() {\n\
      var instance = this;\n\
\n\
      function delayed() {\n\
        instance.resize();\n\
        instance._resizeTimeout = null;\n\
      }\n\
\n\
      if ( this._resizeTimeout ) {\n\
        clearTimeout( this._resizeTimeout );\n\
      }\n\
\n\
      this._resizeTimeout = setTimeout( delayed, 100 );\n\
    },\n\
\n\
    // debounced\n\
    resize: function() {\n\
      var prevColCount = this.cols;\n\
      // get updated colCount\n\
      this._getColumns();\n\
      if ( this.isFluid || this.cols !== prevColCount ) {\n\
        // if column count has changed, trigger new layout\n\
        this._reLayout();\n\
      }\n\
    },\n\
\n\
    // ====================== methods ======================\n\
\n\
    // for prepending\n\
    reload: function( callback ) {\n\
      this.reloadItems();\n\
      this.build( callback );\n\
    },\n\
\n\
    // convienence method for working with Infinite Scroll\n\
    appended: function( items, isAnimatedFromBottom, callback ) {\n\
      var instance = this,\n\
          layoutAppendedItems = function() {\n\
            instance._appended( items, callback );\n\
          };\n\
\n\
      if ( isAnimatedFromBottom ) {\n\
        // set new stuff to the bottom\n\
        var y = getWH( this.element, 'height' ) + 'px';\n\
        for (var i=0, len = items.length; i < len; i++) {\n\
          items[i].style.top = y;\n\
        }\n\
        // layout items async after initial height has been set\n\
        setTimeout( layoutAppendedItems, 1 );\n\
      } else {\n\
        layoutAppendedItems();\n\
      }\n\
    },\n\
\n\
    _appended: function( items, callback ) {\n\
      // add new bricks to brick pool\n\
      this._getBricks( items );\n\
      this.layout( items, callback );\n\
    },\n\
\n\
    destroy: function() {\n\
      var brick;\n\
      for (var i=0, len = this.bricks.length; i < len; i++) {\n\
        brick = this.bricks[i];\n\
        brick.style.position = '';\n\
        brick.style.top = '';\n\
        brick.style.left = '';\n\
        removeClass( brick, 'masonry-brick' );\n\
      }\n\
\n\
      // re-apply saved container styles\n\
      var elemStyle = this.element.style;\n\
      len = masonryContainerStyles.length;\n\
      for ( i=0; i < len; i++ ) {\n\
        var prop = masonryContainerStyles[i];\n\
        elemStyle[ prop ] = this._originalStyle[ prop ];\n\
      }\n\
\n\
      removeClass( this.element, 'masonry' );\n\
\n\
      if ( this.resizeHandler ) {\n\
        removeEvent( window, 'resize', this.resizeHandler );\n\
      }\n\
\n\
    }\n\
\n\
  };\n\
\n\
  // add utility function\n\
  Masonry.getWH = getWH;\n\
  // add Masonry to global namespace\n\
  window.Masonry = Masonry;\n\
  // export masonry for component.js\n\
  module.exports = Masonry;\n\
})( window );\n\
//@ sourceURL=danzajdband-vanilla-masonry/masonry.js"
));
require.register("infinity/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies\n\
 */\n\
\n\
var event = require('event');\n\
var query = require('query');\n\
var throttle = require('throttle');\n\
var debounce = require('debounce');\n\
\n\
/**\n\
 * Export `infinity`\n\
 */\n\
\n\
module.exports = infinity;\n\
\n\
/**\n\
 * Initialize `infinity`\n\
 *\n\
 * @param {Element|Window} container el\n\
 * @return {infinity}\n\
 * @api public\n\
 */\n\
\n\
function infinity(el) {\n\
  if (!(this instanceof infinity)) return new infinity(el);\n\
  this.el = el;\n\
  this.isWindow = (el.self == el);\n\
  this.views = [];\n\
  this._box = this.box();\n\
  this.throttle = throttle(this.refresh.bind(this), 200);\n\
  this.debounce = debounce(this.refresh.bind(this), 100, false);\n\
  event.bind(el, 'scroll', this.throttle);\n\
  event.bind(el, 'scroll', this.debounce);\n\
  event.bind(el, 'resize', this.debounce);\n\
  this._load = function(){};\n\
  this._unload = function(){};\n\
}\n\
\n\
/**\n\
 * Add an element. You may pass any number of arguments\n\
 * to be called on the load and unload functions\n\
 *\n\
 * ex. infinity.add(view.el, view)\n\
 *\n\
 * @param {Element} el\n\
 * @param {Mixed, ...} args\n\
 * @return {infinity}\n\
 * @api public\n\
 */\n\
\n\
infinity.prototype.add = function(el) {\n\
  var view = {};\n\
  view.el = el;\n\
  view.args = [].slice.call(arguments) || [];\n\
  view.loaded = false;\n\
  this.views.push(view);\n\
  this.refresh();\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove an element.\n\
 *\n\
 * ex. infinity.remove(el)\n\
 *\n\
 * @param {Element} el\n\
 * @return {infinity}\n\
 * @api public\n\
 */\n\
\n\
infinity.prototype.remove = function(el) {\n\
  for (var i = 0, view; view = this.views[i]; i++) {\n\
    if (el == view.el) {\n\
      this.views.splice(i, 1);\n\
      break;\n\
    }\n\
  }\n\
\n\
  this.refresh();\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Get the coordinated of the box\n\
 *\n\
 * @return {Object} coords\n\
 * @api private\n\
 */\n\
\n\
infinity.prototype.box = function() {\n\
  var el = this.el;\n\
  if (!this.isWindow) {\n\
    return el.getBoundingClientRect();\n\
  }\n\
\n\
  // handle window\n\
  return {\n\
    top: el.pageYOffset,\n\
    left: el.pageXOffset,\n\
    height: el.innerHeight || document.documentElement.clientHeight,\n\
    width: el.innerWidth || document.documentElement.clientWidth\n\
  };\n\
};\n\
\n\
/**\n\
 * Is the element in view?\n\
 *\n\
 * @param {Object} view\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
infinity.prototype.visible = function(view) {\n\
  var box = this._box;\n\
  var pos = view.el.getBoundingClientRect();\n\
\n\
  return (this.isWindow) ? this.inViewport(pos, box)\n\
                         : this.inView(pos, box);\n\
};\n\
\n\
/**\n\
 * Is the element in view?\n\
 *\n\
 * @param {Object} pos\n\
 * @param {Object} box\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
infinity.prototype.inView = function(pos, box) {\n\
  return (\n\
    pos.top < (box.top + box.height) &&\n\
    pos.left < (box.left + box.width) &&\n\
    (pos.top + pos.height) > box.top &&\n\
    (pos.left + pos.width) > box.left\n\
  );\n\
};\n\
\n\
/**\n\
 * Is the element in the viewport?\n\
 *\n\
 * TODO: inViewport and inView could probably be consolidated\n\
 * with some better math\n\
 *\n\
 * @param {Object} pos\n\
 * @param {Object} box\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
infinity.prototype.inViewport = function(pos, box) {\n\
  return (\n\
    pos.bottom >= 0 &&\n\
    pos.right >= 0 &&\n\
    pos.top <= box.height &&\n\
    pos.left <= box.width\n\
  );\n\
};\n\
\n\
/**\n\
 * Add a load function\n\
 *\n\
 * @param {Function} fn\n\
 * @return {infinity}\n\
 * @api public\n\
 */\n\
\n\
infinity.prototype.load = function(fn) {\n\
  this._load = fn;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Add an unload function\n\
 *\n\
 * @param {Function} fn\n\
 * @return {infinity}\n\
 * @api public\n\
 */\n\
\n\
infinity.prototype.unload = function(fn) {\n\
  this._unload = fn;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Refresh, loading and unloading elements.\n\
 *\n\
 * Used internally but may need to be called\n\
 * manually if you are programmatically adjusting\n\
 * elements.\n\
 *\n\
 * @return {infinity}\n\
 * @api public\n\
 */\n\
\n\
infinity.prototype.refresh = function() {\n\
  this._box = this.box();\n\
\n\
  // load / unload panes\n\
  //\n\
  // TODO: figure out a smarter way to not loop\n\
  // through all the elements time but maintain\n\
  // flexibility\n\
  for (var i = 0, view; view = this.views[i]; i++) {\n\
    var visible = this.visible(view);\n\
    if (visible && !view.loaded) {\n\
      this._load.apply(this, view.args);\n\
      view.loaded = true;\n\
    } else if (!visible && view.loaded) {\n\
      this._unload.apply(this, view.args);\n\
      view.loaded = false;\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unbind events\n\
 *\n\
 * @return {infinity}\n\
 * @api public\n\
 */\n\
\n\
infinity.prototype.unbind = function() {\n\
  event.unbind(this.el, 'scroll', this.throttle);\n\
  event.unbind(this.el, 'scroll', this.debounce);\n\
  event.unbind(this.el, 'resize', this.debounce);\n\
  return this;\n\
};\n\
//@ sourceURL=infinity/index.js"
));





require.alias("component-query/index.js", "infinity/deps/query/index.js");
require.alias("component-query/index.js", "query/index.js");

require.alias("component-event/index.js", "infinity/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("component-throttle/index.js", "infinity/deps/throttle/index.js");
require.alias("component-throttle/index.js", "throttle/index.js");

require.alias("matthewmueller-debounce/index.js", "infinity/deps/debounce/index.js");
require.alias("matthewmueller-debounce/index.js", "debounce/index.js");

require.alias("danzajdband-vanilla-masonry/index.js", "infinity/deps/vanilla-masonry/index.js");
require.alias("danzajdband-vanilla-masonry/masonry.js", "infinity/deps/vanilla-masonry/masonry.js");
require.alias("danzajdband-vanilla-masonry/index.js", "vanilla-masonry/index.js");

require.alias("infinity/index.js", "infinity/index.js");