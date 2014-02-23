plumber-coffee
==============

[CoffeeScript](http://coffeescript.org/) to JavaScript operation for [Plumber](https://github.com/plumberjs/plumber) pipelines.

## Example

    var coffee = require('plumber-coffee');

    module.exports = function(pipelines) {

        pipelines['js'] = [
            glob('src/**/*.coffee'),
            coffee(),
            // ... more pipeline operations to resulting JS files
        ];

    };


## API

### `coffee()`

Transpile each input CoffeeScript resource JavaScript.
