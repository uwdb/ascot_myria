--nowGroup, currentTime, currentGroup, nextGroup, sharedParticleCount
edges = scan(public:vulcan:edgesTree);

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

store(progenitors, public:vulcan:progen);

progenitors = scan(public:vulcan:progen);
--gets only halos in tree
haloTable1 = [from scan(public:vulcan:haloTable) h, edges e where h.nowGroup = e.nowGroup and h.grpID = e.currentGroup and int(h.timeStep) = e.currentTime emit h.*];
haloTable2 = [from scan(public:vulcan:haloTable) h, edges e where h.nowGroup = e.nowGroup and h.grpID = e.nextGroup and int(h.timeStep) = e.currentTime+1 emit h.*];
haloTable = distinct(haloTable1 + haloTable2);

--JEN: I made this one separately so I can do the diff later

findProg = [from haloTable h, progenitors p where h.nowGroup = p.nowGroup and h.grpID = p.currentGroup and int(h.timeStep) = p.currentTime emit h.*];

labelProg = [from findProg as f emit f.*, 1 as prog];

findNonProg = diff(haloTable,findProg);
labelNonProg = [from findNonProg as f emit f.*, 0 as prog];

haloTableNew = labelProg + labelNonProg;

final = [from haloTableNew emit *, -1 as massRatio];

store(final, public:vulcan:haloTableProg);

