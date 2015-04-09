--nowGroup, currentTime, currentGroup, nextGroup, sharedParticleCount
edges = scan(public:vulcan:edgesTree);

--the first progenitor
progenitors = [from edges where currentTime = 1 emit nowGroup, currentTime as currentTime, currentGroup];

maxShared = [from edges emit nowGroup, currentTime, currentGroup, max(sharedParticleCount) as maxSharedParticleCount];

I = [2 as i];

maxTime = [from edges emit max(currentTime) as maxT];

--loop
do

nextGroups = [from progenitors p, edges e, I where e.nowGroup = p.nowGroup and e.currentGroup = p.currentGroup and e.currentTime = p.currentTime and p.currentTime + 1 = I.i emit nowGroup, currentTime, currentGroup, max(sharedParticleCount) as maxShared];

maxGroup = [from nextGroups g, edges e where e.currentTime = g.currentTime and e.nowGroup = g.nowGroup and e.currentGroup = g.currentGroup and e.sharedParticleCount = g.maxShared emit e.nowGroup, e.currentTime+1 as currentTime, min(e.nextGroup) as currentGroup];

progenitors = distinct(progenitors + maxGroup);

I = [from I emit i+1 as i];

while [from I, maxTime where I.i <= maxTime.maxT emit count(*) > 0];

store(progenitors, public:vulcan:progen);