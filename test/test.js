var chai = require('chai');
chai.should();

var SourceMapConsumer = require('source-map').SourceMapConsumer;


var runOperation = require('plumber-util-test').runOperation;
var completeWithResources = require('plumber-util-test').completeWithResources;

var Resource = require('plumber').Resource;
var SourceMap = require('mercator').SourceMap;

var fs = require('fs');

var coffee = require('..');

function createResource(params) {
    return new Resource(params);
}

function resourcesError() {
  chai.assert(false, "error in resources observable");
}


describe('coffee', function(){
    var firstSource = fs.readFileSync('test/fixtures/source.coffee').toString();
    var firstSourceTranspiled = fs.readFileSync('test/fixtures/source.js').toString();


    it('should be a function', function(){
        coffee.should.be.a('function');
    });

    it('should return a function', function(){
        coffee().should.be.a('function');
    });


    describe('when passed a coffeescript resource with no source map', function() {
        var uglifiedResources;

        beforeEach(function() {
            uglifiedResources = runOperation(coffee(), [
                createResource({path: 'path/to/file.coffee', type: 'coffeescript', data: firstSource})
            ]).resources;
        });

        it('should return a transpiled javascript resource', function(done){
            completeWithResources(uglifiedResources, function(resources) {
                resources.length.should.equal(1);
                resources[0].filename().should.equal('file.js');
                resources[0].type().should.equal('javascript');
                resources[0].data().should.equal(firstSourceTranspiled);
            }, resourcesError, done);
        });

        it('should return a resource with a source map for the transpilation', function(done){
            completeWithResources(uglifiedResources, function(resources) {
                var sourceMap = resources[0].sourceMap();
                sourceMap.sources.should.deep.equal(['path/to/file.coffee']);
                sourceMap.sourcesContent.should.deep.equal([firstSource]);
                sourceMap.names.should.deep.equal([]); // yeah..

                // check mappings
                var map = new SourceMapConsumer(sourceMap);
                /*
                 123456789012345678901234567890
               1 (function() {
               2   var number, opposite, square;
               3
               4   opposite = true;
               5
               6   if (opposite) {
               7     number = -42;
               8   }
               9
              10   square = function(x) {
              11     return x * x;
              12   };
              13
              14 }).call(this);

               1 opposite = true
               2 number = -42 if opposite
               3
               4 # Functions:
               5 square = (x) -> x * x
                 */
                map.originalPositionFor({line: 2, column: 2}).should.deep.equal({
                    source: 'path/to/file.coffee',
                    line: 1,
                    column: 0,
                    name: null
                });
                map.originalPositionFor({line: 4, column: 2}).should.deep.equal({
                    source: 'path/to/file.coffee',
                    line: 1,
                    column: 0,
                    name: null
                });
                map.originalPositionFor({line: 6, column: 2}).should.deep.equal({
                    source: 'path/to/file.coffee',
                    line: 2,
                    column: 0,
                    name: null
                });
                map.originalPositionFor({line: 10, column: 2}).should.deep.equal({
                    source: 'path/to/file.coffee',
                    line: 5,
                    column: 0,
                    name: null
                });
            }, resourcesError, done);
        });
    });


    // TODO

    // describe('when passed a single resource with a source map', function() {

    //     it('should return a resource with a source map for the minimisation combined with the input source map', function(done){
    //     });

    // });


    // describe('when passed two coffeescript resources', function() {

    //     it('should return two transpiled resources', function(done){
    //     });

    // });
});
