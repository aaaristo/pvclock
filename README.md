pvclock
=======

Pruning vector clocks inspired by [vectorclock](https://github.com/mixu/vectorclock)
and [riak vector clocks](http://docs.basho.com/riak/latest/theory/concepts/Vector-Clocks/).


```javascript
var pvclock= require('pvclock')({ small: 10, big: 50, young: 20, old: 86400 });

var vclock1= {}, vclock2= {};
pvclock.increment(vclock1,'Alice');
pvclock.increment(vclock2,'Alice');

pvclock.increment(vclock1,'Ben');
pvclock.increment(vclock1,'Dave');

pvclock.increment(vclock2,'Cathy');

console.log(pvclock.concurrent(vclock1,vclock2),
            pvclock.merge(vclock1,vclock2))
```
