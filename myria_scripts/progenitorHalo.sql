--nowGroup, currentTime, currentGroup, nextGroup, sharedParticleCount
edges = scan(public:vulcan:edgesTree);
haloTable = scan(public:vulcan:haloTable);

progenitors = [from edges where currentTime = 1 emit nowGroup, int(currentTime) as currentTime, currentGroup, nextGroup, sharedParticleCount];

I = [2 as i];

do
maxShared = [from edges emit nowGroup,currentTime,currentGroup, max(sharedParticleCount) as maxSharedParticleCount];

getMaxInfo = [from edges as e, maxShared as m, I where int(e.currentTime+1) = int(I.i) and e.nowGroup = m.nowGroup and e.currentTime = m.currentTime and e.currentGroup = m.currentGroup and e.sharedParticleCount = m.maxSharedParticleCount emit e.nowGroup, e.currentTime, e.currentGroup, e.nextGroup, e.sharedParticleCount];

delta = DISTINCT([from getMaxInfo as g emit g.nowGroup, int(g.currentTime+1) as currentTime,  g.currentGroup, g.nextGroup, g.sharedParticleCount]);

I = [from I emit i+1 as i];

progenitors = distinct(progenitors + delta);

while [from I emit min(i) < 7];

progenitors = [from progenitors emit nowGroup, int(currentTime) as currentTime, currentGroup, nextGroup, sharedParticleCount];

store(progenitors, public:vulcan:progen);

findProg = [from haloTable h, progenitors p where h.nowGroup = p.nowGroup and h.grpID = p.currentGroup and h.timeStep = int(p.currentTime) emit h.*];

labelProg = [from findProg as f emit f.*, 1 as prog];

findNonProg = diff(haloTable,findProg);
labelNonProg = [from findNonProg as f emit f.*, 0 as prog];

haloTableNew = distinct(labelProg + labelNonProg);

final = [from haloTableNew emit *, -1 as massRatio];

store(final, public:vulcan:haloTableProg);


