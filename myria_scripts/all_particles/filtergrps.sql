T1 = scan(public:vulcan:haloTableComplete);

grps = [ 998891  as grp] +
[ 1412594 as grp] +
[ 1428045 as grp] +
[ 1440792 as grp] +
[ 1483693 as grp] +
[ 1539528 as grp] +
[ 1626264 as grp] +
[ 1628969 as grp] +
[ 1794789 as grp] +
[ 1801807 as grp] +
[ 1804045 as grp] +
[ 3463834 as grp] +
[ 1817162 as grp] +
[ 1875343 as grp] +
[  313594 as grp] +
[ 314321 as grp] +
[  314375 as grp] +
[ 1880030 as grp] +
[ 1892658 as grp] +
[ 1987971 as grp] +
[ 1989173 as grp] +
[ 2034359 as grp] +
[ 2074315 as grp] +
[ 2087917 as grp] +
[ 2090496 as grp] +
[ 2134291 as grp] +
[ 2143317 as grp] +
[ 2143470 as grp] +
[ 2143905 as grp] +
[ 2179354 as grp] +
[ 2180144 as grp] +
[ 2181043 as grp] +
[ 2182226 as grp] +
[ 2304521 as grp] +
[ 2315258 as grp] +
[ 2321612 as grp] +
[ 2324694 as grp] +
[ 2442048 as grp] +
[ 2596275 as grp] +
[ 2598335 as grp] +
[ 2655997 as grp] +
[ 2686624 as grp] +
[ 2697851 as grp] +
[ 2744776 as grp] +
[ 2745263 as grp] +
[ 2913979 as grp] +
[ 2916061 as grp] +
[ 3005918 as grp] +
[ 3020715 as grp] +
[  428254 as grp] +
[ 428618 as grp] +
[ 429824 as grp] +
[  430298 as grp] +
[ 3192636 as grp] +
[ 3207788 as grp] +
[ 3300278 as grp] +
[ 3300620 as grp] +
[ 3302687 as grp] +
[ 3309810 as grp] +
[ 3314797 as grp] +
[ 3314869 as grp] +
[ 3325669 as grp] +
[ 3395357 as grp] +
[ 3432963 as grp] +
[ 460750 as grp] +
[  643106 as grp] +
[  669761 as grp] +
[  723499 as grp] +
[  767006 as grp] +
[  830871 as grp] +
[  939114 as grp] +
[ 945563 as grp] +
[  946184 as grp] +
[  949933 as grp] +
[  962033 as grp] +
[  962873 as grp] +
[ 1014070 as grp] +
[ 1150244 as grp] +
[ 1247235 as grp] +
[ 1331851 as grp] +
[ 1332022 as grp];

Joined = [from T1, grps
          where T1.nowGroup = grps.grp
          emit T1.*];

store(Joined, public:vulcan:haloTableComplete);


T1 = scan(public:vulcan:edgesTree);

grps = [ 998891  as grp] +
[ 1412594 as grp] +
[ 1428045 as grp] +
[ 1440792 as grp] +
[ 1483693 as grp] +
[ 1539528 as grp] +
[ 1626264 as grp] +
[ 1628969 as grp] +
[ 1794789 as grp] +
[ 1801807 as grp] +
[ 1804045 as grp] +
[ 3463834 as grp] +
[ 1817162 as grp] +
[ 1875343 as grp] +
[  313594 as grp] +
[ 314321 as grp] +
[  314375 as grp] +
[ 1880030 as grp] +
[ 1892658 as grp] +
[ 1987971 as grp] +
[ 1989173 as grp] +
[ 2034359 as grp] +
[ 2074315 as grp] +
[ 2087917 as grp] +
[ 2090496 as grp] +
[ 2134291 as grp] +
[ 2143317 as grp] +
[ 2143470 as grp] +
[ 2143905 as grp] +
[ 2179354 as grp] +
[ 2180144 as grp] +
[ 2181043 as grp] +
[ 2182226 as grp] +
[ 2304521 as grp] +
[ 2315258 as grp] +
[ 2321612 as grp] +
[ 2324694 as grp] +
[ 2442048 as grp] +
[ 2596275 as grp] +
[ 2598335 as grp] +
[ 2655997 as grp] +
[ 2686624 as grp] +
[ 2697851 as grp] +
[ 2744776 as grp] +
[ 2745263 as grp] +
[ 2913979 as grp] +
[ 2916061 as grp] +
[ 3005918 as grp] +
[ 3020715 as grp] +
[  428254 as grp] +
[ 428618 as grp] +
[ 429824 as grp] +
[  430298 as grp] +
[ 3192636 as grp] +
[ 3207788 as grp] +
[ 3300278 as grp] +
[ 3300620 as grp] +
[ 3302687 as grp] +
[ 3309810 as grp] +
[ 3314797 as grp] +
[ 3314869 as grp] +
[ 3325669 as grp] +
[ 3395357 as grp] +
[ 3432963 as grp] +
[ 460750 as grp] +
[  643106 as grp] +
[  669761 as grp] +
[  723499 as grp] +
[  767006 as grp] +
[  830871 as grp] +
[  939114 as grp] +
[ 945563 as grp] +
[  946184 as grp] +
[  949933 as grp] +
[  962033 as grp] +
[  962873 as grp] +
[ 1014070 as grp] +
[ 1150244 as grp] +
[ 1247235 as grp] +
[ 1331851 as grp] +
[ 1332022 as grp];

Joined = [from T1, grps
          where T1.nowGroup = grps.grp
          emit T1.*];

store(Joined, public:vulcan:edgesTree);