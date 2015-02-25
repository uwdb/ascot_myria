--Particle Table (nowGroup, iOrder, mass, HI, type, timestep, grp)
haloTable = [from scan(public:vulcan:haloTable) h where h.totalParticles > 256 emit h.*];
particleTable = [from scan(public:vulcan:particlesOfInterest) pt, haloTable ht where ht.nowGroup = pt.nowGroup and ht.grpID = pt.grp and ht.timeStep = pt.timestep emit pt.*];
edgesInit = [from particleTable pt1, particleTable pt2
        where pt1.nowGroup = pt2.nowGroup and pt1.iOrder = pt2.iOrder and pt1.timestep+1 = pt2.timestep
        emit pt1.nowGroup, pt1.timestep as currentTime, pt1.grp as currentGroup, pt2.grp as nextGroup, count(*) as sharedParticleCount];
-- filter edges on number of particles shared
edges = [from edgesInit where sharedParticleCount > 256 emit *];
store(edges, public:vulcan:edgesInitial);

edgesInit = scan(public:vulcan:edgesInitial);
edges = [from edgesInit where currentTime = 1 emit *];
I = [1 as i];
maxTime = [from haloTable emit max(timeStep) as maxT];

do
    delta = [from edges as e1, edgesInit as e2, I
        where e1.nextGroup = e2.currentGroup and e1.currentTime+1 = e2.currentTime and e1.currentTime = I.i and e1.nowGroup = e2.nowGroup
        emit e2.nowGroup, e2.currentTime, e2.currentGroup, e2.nextGroup, e2.sharedParticleCount];
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
edges = [from rankedEdges where splitOrder = 1 emit *];
store(edges, public:vulcan:edgesTree);

