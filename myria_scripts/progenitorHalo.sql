--nowGroup, currentTime, currentGroup, nextGroup, sharedParticleCount
edges = scan(public:vulcan:edgesTree);
haloTable = scan(public:vulcan:haloTable);

progentors = [from edges where currentTime = 1 emit nowGroup, currentTime, currentGroup];

I = [2 as i];
do 
maxShared = [from edges emit nowGroup,currentTime,currentGroup, max(SharedParticleCount) as maxSharedParticleCount];
getMaxInfo = [from edges as e, maxShared as m where e.currentTime+1 = I.i and e.nowGroup = m.nowGroup and e.currentTime = m.currentTime and e.currentGroup = m.currentGroup and e.SharedParticleCount = m.maxSharedParticleCount emit e.currentTime, e.currentGroup, e.nextGroup, e.sharedParticleCount];
delta = DISTINCT([from getMaxInfo as g emit g.NowGroup, g.currentGroup, g.currentTime+1 as currentTime, g.nextGroup, g.sharedParticleCount]);
I = [from I emit i+1];
progenitors = progenitors + delta;
while [from I where i < 10 emit i]

store(progenitors, public:vulcan:prog);

--join with haloTable
--haloTable: nowGroup, grpID, timestep...

findProg = [from haloTable h, progenitors p where h.nowGroup = p.nowGroup and h.grpID = p.currentGroup and h.currentTime = p.timestep emit h.*];
labelProg = [from findProg as f emit f.*, 1 as prog];

findNonProg = haloTable - findProg;
labelNonProg = [from findNonProg as f emit f.*, 0 as prog];

haloTableNew = labelProg + labelNonProg;

final = [from haloTableNew emit *, -1 as massRatio];

store(final, public:vulcan:haloTableProg);






