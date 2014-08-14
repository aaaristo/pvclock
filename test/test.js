var assert = require('assert'),
    _ = require('underscore'),
    vclock = require('../index.js')();

exports['given two clocks'] = {

  beforeEach: function() {
    this.a = {};
    this.b = {};
  },

  'from the same actor': {
    'an empty vector clock should be identical to another empty vector clock': function() {
      assert.equal( vclock.compare(this.a, this.b), vclock.EQUAL);
      assert.equal( vclock.compare(this.b, this.a), vclock.EQUAL);
      assert.equal( vclock.equal(this.a, this.b), true);
    },

    'a clock incremented once should be greater than 0': function(){
      vclock.increment(this.a, 'actor-1');
      assert.equal( vclock.compare(this.a, this.b), vclock.GT);
      assert.equal( vclock.compare(this.b, this.a), vclock.LT);
      assert.ok( !vclock.equal(this.a, this.b));
    },

    'a clock incremented twice should be greater than 1': function() {
      vclock.increment(this.a, 'actor-1');
      vclock.increment(this.a, 'actor-1');
      vclock.increment(this.b, 'actor-1');
      assert.equal( vclock.compare(this.a, this.b), vclock.GT);
      assert.equal( vclock.compare(this.b, this.a), vclock.LT);
      assert.ok( !vclock.equal(this.a, this.b));
    },

    'two clocks with the same history should be equal and concurrent': function() {
      vclock.increment(this.a, 'actor-1');
      vclock.increment(this.b, 'actor-1');
      assert.equal( vclock.compare(this.a, this.b), vclock.EQUAL);
      assert.equal( vclock.compare(this.b, this.a), vclock.EQUAL);
      assert.ok( vclock.concurrent(this.a, this.b));
    }
  },

  'from different actors': {

    beforeEach: function() {
      vclock.increment(this.a, 'actor-1');
      vclock.increment(this.b, 'actor-1');
      vclock.increment(this.a, 'actor-1');
      vclock.increment(this.b, 'actor-2');
    },

    'clocks incremented from different actors should be concurrent but not equal': function() {
      assert.ok( vclock.concurrent(this.a, this.b));
      assert.ok( !vclock.equal(this.a, this.b));
      vclock.increment(this.a, 'actor-1');
      assert.ok( vclock.concurrent(this.a, this.b));
      assert.ok( !vclock.equal(this.a, this.b));
      vclock.increment(this.b, 'actor-2');
      vclock.increment(this.b, 'actor-2');
      vclock.increment(this.b, 'actor-2');
      assert.ok( vclock.concurrent(this.a, this.b));
      assert.ok( !vclock.equal(this.a, this.b));
    },

    'a merged clock should be greater than either of the clocks': function() {
      var newClock = vclock.merge(this.a, this.b);
      assert.equal( vclock.compare(newClock, this.b), vclock.GT);
      assert.equal( vclock.compare(newClock, this.a), vclock.GT);

    }

  }
};


exports['pruning']=  {

    'should ignore small clocks': function()
    {
        var clock= {}; 

        _.times(vclock.opts.small,function (n)
        {
           vclock.increment(clock,'actor-'+n);
        });

        assert.equal(_.keys(clock).length,vclock.opts.small);
    },

    'should ignore young entries': function()
    {
        var clock= {}; 

        _.times(vclock.opts.big,function (n)
        {
           vclock.increment(clock,'actor-'+n);
        });

        assert.equal(_.keys(clock).length,vclock.opts.big);

        clock= {};

        _.times(vclock.opts.small,function (n)
        {
           vclock.increment(clock,'actor-'+n);
        });

        assert.equal(_.keys(clock).length,vclock.opts.small);
    },
 
    
    'should delete only old entries for size>small and size<big': function ()
    {
        var clock= {}, size= vclock.opts.big-2; 

        vclock.increment(clock,'actor-0');

        clock['actor-0'].t= vclock.now()-86400;

        _.times(size-1,function (n)
        {
           vclock.increment(clock,'actor-'+(n+1));
        });

        assert.equal(_.keys(clock).length,size-1);
    },
 

    'should delete only non-young entries for size>=big': function ()
    {
        var clock= {}, size= vclock.opts.big; 

        vclock.increment(clock,'actor-0');

        clock['actor-0'].t= vclock.now()-100;

        _.times(size-1,function (n)
        {
           vclock.increment(clock,'actor-'+(n+1));
        });

        assert.equal(_.keys(clock).length,size-1);
    },
};
