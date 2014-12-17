--nowGroup, currentTime, currentGroup, nextGroup, sharedParticleCount
edges = scan(public:adhoc:treeEdges);

--the first progenitor
progenitors = [from edges where currentTime = 1 emit nowGroup, int(currentTime) as currentTime, currentGroup];

maxShared = [from edges emit nowGroup,currentTime,currentGroup, max(sharedParticleCount) as maxSharedParticleCount];

I = [2 as i];

--loop
do

nextGroups = [from progenitors p, edges e, I where e.nowGroup = p.nowGroup and e.currentGroup = p.currentGroup and int(e.currentTime) = p.currentTime and p.currentTime + 1 = I.i emit nowGroup, currentTime, currentGroup, max(sharedParticleCount) as maxShared];


maxGroup = [from nextGroups g, edges e where int(e.currentTime) = g.currentTime and e.nowGroup = g.nowGroup and e.currentGroup = g.currentGroup and e.sharedParticleCount = g.maxShared emit e.nowGroup, e.currentTime+1 as currentTime, min(e.nextGroup) as currentGroup];

progenitors = distinct(progenitors + maxGroup);

I = [from I emit i+1 as i];

while [from I emit min(i) < 7];

--tested up to here

progenitors = [from progenitors emit nowGroup, int(currentTime) as currentTime, currentGroup, nextGroup, sharedParticleCount];

store(progenitors, public:vulcan:progen);

--LAUREL: I think you can combine findProg and labelProg as
--labelProg = [from haloTable h, progenitors p where h.nowGroup = p.nowGroup and h.grpID = p.currentgGroup and h.timeStep = int(p.currentTime) emit h.*, 1 as prog]

--JEN: but if I combine them, how can I do the diff? I just built findProg so I can easily do the diff against haloTables later

findProg = [from haloTable h, progenitors p where h.nowGroup = p.nowGroup and h.grpID = p.currentGroup and h.timeStep = int(p.currentTime) emit h.*];

labelProg = [from findProg as f emit f.*, 1 as prog];

findNonProg = diff(haloTable,findProg);
labelNonProg = [from findNonProg as f emit f.*, 0 as prog];

--LAUREL: do you need the distinct?

--JEN: I don't think so either, I got rid of it now
haloTableNew = labelProg + labelNonProg;

final = [from haloTableNew emit *, -1 as massRatio];

store(final, public:vulcan:haloTableProg);


