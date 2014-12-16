--nowGroup, currentTime, currentGroup, nextGroup, sharedParticleCount
edges = scan(public:adhoc:treeEdges);

--the first progenitor
progenitors = [from edges where currentTime = 1 emit nowGroup, int(currentTime) as currentTime, currentGroup];

maxShared = [from edges emit nowGroup,currentTime,currentGroup, max(sharedParticleCount) as maxSharedParticleCount];

I = [2 as i];

--loop
do
--edges linked to previous prog
prevProg = distinct([from progenitors, I where currentTime+1 = I.i emit nowGroup, currentTime, currentGroup]);

--get the groups and emit the maxShared
nextGroups = [from prevProg p, edges e where e.nowGroup = p.nowGroup and int(e.currentTime) = p.currentTime and e.currentGroup = p.currentGroup emit max(e.sharedParticleCount) as maxShared];

--get the group
maxGroup = distinct([from nextGroups g, edges e, I where e.currentTime+1 = I.i and e.sharedParticleCount = g.maxShared emit e.nowGroup, (e.currentTime+1) as currentTime, e.nextGroup as currentGroup]);

--union
progenitors = distinct(progenitors + maxGroup);

I = [from I emit i+1 as i];

while [from I emit min(i) < 7];

progenitors = [from progenitors emit nowGroup, int(currentTime) as currentTime, currentGroup, nextGroup, sharedParticleCount];

--tested up to here

store(progenitors, public:vulcan:progen);

findProg = [from haloTable h, progenitors p where h.nowGroup = p.nowGroup and h.grpID = p.currentGroup and h.timeStep = int(p.currentTime) emit h.*];

labelProg = [from findProg as f emit f.*, 1 as prog];

findNonProg = diff(haloTable,findProg);
labelNonProg = [from findNonProg as f emit f.*, 0 as prog];

haloTableNew = distinct(labelProg + labelNonProg);

final = [from haloTableNew emit *, -1 as massRatio];

store(final, public:vulcan:haloTableProg);


