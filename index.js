/**
 * Module dependencies
 */

var event = require('event');
var query = require('query');
var throttle = require('throttle');
var debounce = require('debounce');
var Emitter = require('emitter');

/**
 * Export `infinity`
 */

module.exports = infinity;

/**
 * Initialize `infinity`
 *
 * @param {Element|Window} container el
 * @return {infinity}
 * @api public
 */

function infinity(el) {
  if (!(this instanceof infinity)) return new infinity(el);
  this.el = el;
  this.isWindow = (el.self == el);
  this.views = [];
  this._margin = 0;
  this.throttle = throttle(this.refresh.bind(this), 200);
  this.debounce = debounce(this.refresh.bind(this), 100);
  event.bind(el, 'scroll', this.throttle);
  event.bind(el, 'scroll', this.debounce);
  event.bind(el, 'resize', this.debounce);
}

/**
 * Mixin `Emitter`
 */

Emitter(infinity.prototype);

/**
 * Add an element. You may pass any number of arguments
 * to be called on the load and unload functions
 *
 * ex. infinity.add(view.el, view)
 *
 * @param {Element} el
 * @param {Mixed, ...} args
 * @return {infinity}
 * @api public
 */

infinity.prototype.add = function(el) {
  var view = {};
  view.el = el;
  view.args = [].slice.call(arguments) || [];
  view.loaded = false;
  this.views.push(view);
  return this;
};

/**
 * Remove an element.
 *
 * ex. infinity.remove(el)
 *
 * @param {Element} el
 * @return {infinity}
 * @api public
 */

infinity.prototype.remove = function(el) {
  for (var i = 0, view; view = this.views[i]; i++) {
    if (el == view.el) {
      this.views.splice(i, 1);
      break;
    }
  }

  return this;
};


/**
 * Get the coordinated of the box
 *
 * @return {Object} coords
 * @api private
 */

infinity.prototype.box = function() {
  var el = this.el;
  var margin = this._margin;
  var box = {};

  if (!this.isWindow) {
    var rect = el.getBoundingClientRect();
    box.top = rect.top;
    box.left = rect.left;
    box.width = rect.width;
    box.height = rect.height;
  } else {
    box.top = 0;
    box.left = 0;
    box.height = el.innerHeight || document.documentElement.clientHeight;
    box.width = el.innerWidth || document.documentElement.clientWidth;
  }

  box.top -= margin;
  box.left -= margin;
  box.width += (margin * 2);
  box.height += (margin * 2);

  return box;
};

/**
 * Add margin to the box
 *
 * @param {Number} margin
 * @return {infinity}
 * @api public
 */

infinity.prototype.margin = function(margin) {
  this._margin = margin;
  return this;
};

/**
 * Is the element in view?
 *
 * @param {Object} view
 * @return {Boolean}
 * @api private
 */

infinity.prototype.visible = function(view) {
  var box = this._box;
  var pos = view.el.getBoundingClientRect();

  // only load if our view has dimensions
  if (0 === pos.width || 0 === pos.height) return false;

  // check viewport if window otherwise view
  return (this.isWindow) ? this.inViewport(pos, box)
                         : this.inView(pos, box);
};

/**
 * Is the element in view?
 *
 * @param {Object} pos
 * @param {Object} box
 * @return {Boolean}
 * @api private
 */

infinity.prototype.inView = function(pos, box) {
  return (
    pos.top < (box.top + box.height) &&
    pos.left < (box.left + box.width) &&
    (pos.top + pos.height) > box.top &&
    (pos.left + pos.width) > box.left
  );
};

/**
 * Is the element in the viewport?
 *
 * TODO: inViewport and inView could probably be consolidated
 * with some better math
 *
 * @param {Object} pos
 * @param {Object} box
 * @return {Boolean}
 * @api private
 */

infinity.prototype.inViewport = function(pos, box) {
  return (
    pos.bottom >= box.top &&
    pos.right >= box.left &&
    pos.top <= box.height &&
    pos.left <= box.width
  );
};

/**
 * Add a load function
 *
 * @param {Function} fn
 * @return {infinity}
 * @api public
 */

infinity.prototype.load = function(fn) {
  this.on('load', fn);
  return this;
};

/**
 * Add an unload function
 *
 * @param {Function} fn
 * @return {infinity}
 * @api public
 */

infinity.prototype.unload = function(fn) {
  this.on('unload', fn);
  return this;
};

/**
 * Refresh, loading and unloading elements.
 *
 * Used internally but may need to be called
 * manually if you are programmatically adjusting
 * elements.
 *
 * @return {infinity}
 * @api public
 */

infinity.prototype.refresh = function() {
  var visibles = [];
  var invisibles = [];

  this._box = this.box();

  // load / unload panes
  //
  // TODO: figure out a smarter way to not loop
  // through all the elements time but maintain
  // flexibility
  for (var i = 0, view; view = this.views[i]; i++) {
    var visible = this.visible(view);
    if (visible && !view.loaded) {
      visibles.push(view);
    } else if (!visible && view.loaded) {
      invisibles.push(view);
    }
  }

  if (visibles.length) {
    this.emit('loading');
    for (var i = 0, view; view = visibles[i]; i++) {
      this.emit.apply(this, ['load'].concat(view.args));
      view.loaded = true;
    }
  }

  if (invisibles.length) {
    this.emit('unloading');
    for (var i = 0, view; view = invisibles[i]; i++) {
      this.emit.apply(this, ['unload'].concat(view.args));
      view.loaded = false;
    }
  }

  return this;
};

/**
 * Unbind events
 *
 * @return {infinity}
 * @api public
 */

infinity.prototype.unbind = function() {
  event.unbind(this.el, 'scroll', this.throttle);
  event.unbind(this.el, 'scroll', this.debounce);
  event.unbind(this.el, 'resize', this.debounce);
  return this;
};
