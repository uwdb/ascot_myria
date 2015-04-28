--EdgesInit (currentGroup, currentTime, nextGroup, sharedParticles)
--HaloTable (grpID, timeStep, mass, totalParticles, HI)
edgesInit = [from scan(public:vulcan:edgesInit) e where e.sharedParticleCount > 1000 emit e.currentTime, e.currentGroup, e.nextGroup, e.sharedParticleCount];
--haloTable = [from scan(public:vulcan:haloTable) h where h.totalParticles > 256 emit h.*];

edges = [from edgesInit where currentTime = 1 emit currentGroup as nowGroup, currentTime, currentGroup, nextGroup, sharedParticleCount];
I = [1 as i];
maxTime = [from edgesInit emit max(currentTime) as maxT];

do
    delta = [from edges as e1, edgesInit as e2, I
        where e1.nextGroup = e2.currentGroup and e1.currentTime+1 = e2.currentTime and e1.currentTime = I.i
        emit e1.nowGroup, e2.currentTime, e2.currentGroup, e2.nextGroup, e2.sharedParticleCount];
    edges = distinct(delta + edges);
    I = [from I emit i+1 as i];
while [from I, maxTime where I.i < maxTime.maxT emit count(*) > 0];
--append to previous table
--edges = edges + scan(public:vulcan:edgesConnected);
store(edges, public:vulcan:edgesConnected);

-- use sortConnectedEdges.json to do an in memory sort on nowGroup, currentTime, nextGroup
-- would like to use this query
-- apply RunningRank(haloGrp)
-- {
--     [0 as _rank, -1 as _grp];
--     [case when haloGrp = _grp then _rank + 1 else 1 end as _rank, haloGrp as _grp];
--     _rank;
-- };

-- rankedEdges = [from scan(public:vulcan:edgesConnectedSplitSort) as e emit e.nowGroup, e.currentTime, RunningRank(e.currentGroup) as splitOrder, e.currentGroup, e.nextGroup, e.sharedParticleCount];
-- edges = [from rankedEdges where splitOrder = 1 emit *];
-- store(edges, public:vulcan:edgesTree);

---real query

apply RunningRank(haloGrp)
{
    [0 as _rank, -1 as _grp];
    [case when haloGrp = _grp then _rank + 1 else 1 end, case when haloGrp = _grp then _grp else haloGrp end];
    _rank;
};

rankedEdges = [from scan(public:vulcan:edgesConnectedSplitSort) as e emit e.nowGroup, e.currentTime,  RunningRank(e.nextGroup) as splitOrder, e.currentGroup, e.nextGroup, e.sharedParticleCount];
edges = [from rankedEdges where splitOrder = 1 emit nowGroup, currentTime, currentGroup, nextGroup, sharedParticleCount];
store(edges, public:vulcan:edgesTree);

