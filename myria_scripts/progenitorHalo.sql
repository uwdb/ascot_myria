--nowGroup, currentTime, currentGroup, nextGroup, sharedParticleCount
edges = scan(public:vulcan:edgesTree);

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


--LAUREL: I think you can combine those first two queries, and I don't think you need the distinct because we should only have one progenitor per timeStep anyways, so the selection should only return one result without the distinct. I'm thinking the combined query would look like...

--nextGroups = [from progenitors p, edges e, I where e.nowGroup = p.nowGroup and e.currentGroup and p.currentGroup and int(e.currentTime) = int(p.currentTime) and int(p.currentTime + 1) = I.i emit nowGroup, currentTime, currentGroup, max(sharedParticleCount) as maxShared];

--LAUREL: the maxGroup can also be written as this to avoid using distinct because that won't fix the problem if there are two nextHalos that have the same sharedParticleCount and that sharedParticleCount is the max. To fix this, I just took the min of e.nextGroup (the minimum group number may mean the halo is larger, but i don't know)
--maxGroup = [from nextGroups g, edges e where int(e.currentTime) = int(g.currentTime) and e.nowGroup = g.nowGroup and e.currentGroup = g.currentGroup and e.sharedParticleCount = g.maxShared emit e.nowGroup, int(e.currentTime+1) as currentTime, min(e.nextGroup) as currentGroup];
--get the group
maxGroup = distinct([from nextGroups g, edges e, I where e.currentTime+1 = I.i and e.sharedParticleCount = g.maxShared emit e.nowGroup, (e.currentTime+1) as currentTime, e.nextGroup as currentGroup]);

--union
progenitors = distinct(progenitors + maxGroup);

I = [from I emit i+1 as i];

while [from I emit min(i) < 7];

progenitors = [from progenitors emit nowGroup, int(currentTime) as currentTime, currentGroup, nextGroup, sharedParticleCount];

--tested up to here

store(progenitors, public:vulcan:progen);

--LAUREL: I think you can combine findProg and labelProg as
--labelProg = [from haloTable h, progenitors p where h.nowGroup = p.nowGroup and h.grpID = p.currentgGroup and h.timeStep = int(p.currentTime) emit h.*, 1 as prog]

findProg = [from haloTable h, progenitors p where h.nowGroup = p.nowGroup and h.grpID = p.currentGroup and h.timeStep = int(p.currentTime) emit h.*];

labelProg = [from findProg as f emit f.*, 1 as prog];

findNonProg = diff(haloTable,findProg);
labelNonProg = [from findNonProg as f emit f.*, 0 as prog];

--LAUREL: do you need the distinct?
haloTableNew = distinct(labelProg + labelNonProg);

final = [from haloTableNew emit *, -1 as massRatio];

store(final, public:vulcan:haloTableProg);


