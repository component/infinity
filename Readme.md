
# infinity

  Unload and reload panes while scrolling. Inspired by [airbnb/infinity](http://github.com/airbnb/infinity).

## Installation

  Install with [component(1)](http://component.io):

    $ component install component/infinity

## Example

```js
var infinity = require('infinity')(window);
var panes = document.querySelectorAll('.pane');

for(var i = 0, len = panes.length; i < len; i++) {
  infinity.add(panes[i]);
}

infinity.refresh();
```

## API

### infinity(el)

  Initialize `infinity` with `el`. `el` can be either the `window` or an element with overflow.

### infinity.add(el, ...)

  Add `el` to `infinity`. You may pass any number of arguments
  to be called with the `load` and `unload` functions. The
  first argument must be the element node.

```js
infinity.add(view.el, view)
```

### infinity.remove(el)

  Remove an element from `infinity`.

```js
infinity.remove(el)
```

### infinity.load(fn)

  Add a load function. Defaults to a `noop`.
  The arguments passed to add will be passed
  through `load`.

```js
infinity.load(function(el, view) {
  // ...
});
```

### infinity.unload(fn)

  Add an unload function. Defaults to a `noop`.
  The arguments passed to add will be passed
  through `unload`.

```js
infinity.unload(function(el, view) {
  // ...
});
```

### infinity.refresh()

  Refresh, loading and unloading elements. Call this
  after adding elements, removing elements, or moving
  elements programmatically.

```js
infinity.refresh();
```

### infinity.unbind()

  Unbind all infinity events

## License

  MIT
