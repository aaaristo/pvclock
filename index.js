var _= require('underscore');

module.exports= function (opts)
{
    opts= _.defaults(opts || {},{ small: 10, big: 50, young: 20, old: 86400 });

    var now= function ()
        {
            return Math.round(Date.now()/1000);
        },
        actors= function (a,b)
        {
            return _.union(_.keys(a),_.keys(b));
        },
        val= function (clock,actor)
        {
            var a= clock[actor];

            return a ? a.v : 0;
        },
        time= function (clock,actor)
        {
            var a= clock[actor];

            return a ? a.t : 0;
        },
        compare= function (a,b)
        {
            var hasMore= false,
                hasLess= false;

            var conflicting= actors(a, b).some(function(actor)
            {
                var diff = val(a,actor) - val(b,actor);

                if (diff > 0) hasMore = true;
                else
                if (diff < 0) hasLess = true;

                return (hasMore && hasLess);
            });

            return conflicting ? 0.1 : (hasMore ? 1 : (hasLess ? -1 : 0));
        },
        concurrent= function (a,b)
        {
            return Math.floor(compare(a,b)) == 0;
        },
        equal= function (a,b)
        {
            return compare(a,b) == 0; 
        },
        conflicting= function (a,b)
        {
            return compare(a,b) == 0.1;
        },
        asc= function (a,b)
        {
            var cmp= Math.floor(compare(a,b));

            if (cmp==0)
            {
               var al= _.keys(a).length,
                   bl= _.keys(b).length;

               if (al<bl) return -1;
               if (al>bl) return 1;
               return 0;
            }
            else
              return cmp;
        },
        desc= function (a,b)
        {
            return -asc(a,b);
        },
        prune= function (clock)
        {
            var actors= _.keys(clock),  
                size= actors.length;

            if (size<=opts.small) return clock;

            if (size>opts.small&&size<opts.big)
              actors.forEach(function (actor)
              {
                 var age= now()-clock[actor].t;

                 if (age>=opts.old) 
                   delete clock[actor];
              });
            else // big
              actors.forEach(function (actor)
              {
                 var age= now()-clock[actor].t;

                 if (age>opts.young)
                   delete clock[actor];
              });

            return clock;
        },
        increment= function (clock,actor)
        {
            var a= clock[actor];

            if (a)
            {
               a.v++;
               a.t= now();
            }
            else
               clock[actor]= { v: 1, t: now() };

            return prune(clock);
        },
        merge= function (a,b)
        {
            var merged= {};

            if (Array.isArray(a))
                a.forEach(function (vclock)
                {
                   merged= merge(merged,vclock);
                });
            else
                actors(a, b).forEach(function(actor)
                {
                   merged[actor]= { v: Math.max(val(a,actor),val(b,actor)),
                                    t: Math.max(time(a,actor),time(b,actor)) };
                });

            return prune(merged);
        },
        converge= function (arr,pick,repair)
        {
           pick= (typeof pick=='function' ?
                 pick : function (elem) { return elem[pick]; });

           arr.sort(function (a,b)
           {
               return desc(pick(a),pick(b));
           });

           var first= arr.shift(),
               converged= first ? [first] : [];

           arr.forEach(function (elem, index)
           {
              var cmp= compare(pick(first), pick(elem));

              if (Math.floor(cmp) == 0)
                converged.push(elem);
              else
              if (repair&&cmp>-1)
                repair(elem);
           });

           return converged;
        };

        return {
                  opts: opts,

                  now: now,
                  increment: increment,
                  prune: prune,
                  compare: compare,
                  merge: merge,
                  concurrent: concurrent,
                  conflicting: conflicting,
                  equal: equal,
                  asc: asc,
                  desc: desc,
                  converge: converge,
                  
                  LT: -1,
                  GT: 1,
                  CONFLICTING: 0.1,
                  EQUAL: 0 
               };
};

