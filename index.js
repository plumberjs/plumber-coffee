var mapEachResource = require('plumber').mapEachResource;
var Report = require('plumber').Report;
var SourceMap = require('mercator').SourceMap;

var coffee = require('coffee-script');


module.exports = function(/* no options */) {
    return mapEachResource(function(resource, supervisor) {
        var transpiledJs = resource.withType('javascript');
        var resourcePath = resource.path() && resource.path().absolute();
        var options = {
            // TODO: support bare and literate explicitly
            // bare:          options.bare,
            // literate:      options.literate,
            sourceMap:     true,
            filename:      resourcePath,
            sourceFiles:   [resource.filename()],
            generatedFile: transpiledJs.filename()
        };

        try {

            var output = coffee.compile(resource.data(), options);
            var jsData = output.js;
            var sourceMapData = output.v3SourceMap;

            var sourceMap = SourceMap.fromMapData(sourceMapData);

            // If the source had a sourcemap, rebase the CoffeeScript
            // sourcemap based on that original map
            var originalMapData = resource.sourceMap();
            if (originalMapData) {
                sourceMap = originalMapData.apply(sourceMap);
            }

            return transpiledJs.withData(jsData, sourceMap);
        } catch(error) {
            // Catch and map error
            return new Report({
                resource: resource,
                type: 'error', // FIXME: ?
                success: false,
                errors: [{
                    line:    error.location.first_line,
                    column:  error.location.first_column,
                    message: error.message
                }]
            });
        };
    });
};
