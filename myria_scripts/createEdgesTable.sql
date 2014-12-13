haloTable = scan(public:vulcan:haloTable);
particleTable = scan(public:vulcan:particlesOfInterest);
nowGroups = [from haloTable ht, particleTable pt where ht.nowGroup = pt.nowGroup and ht.grpID = pt.grp and ht.timeStep = pt.timestep and ht.timeStep = 1 emit ht.nowGroup, ht.grpID, ht.timeStep, ht.mass, pt.iOrder];
edgesInit = [from particleTable pt1, particleTable pt2, haloTable ht1, haloTable ht2, nowGroups ng
        where pt1.grp = ht1.grpID and pt1.timestep = ht1.timeStep and pt1.iOrder = pt2.iOrder and pt1.iOrder = ng.iOrder and pt2.nowGroup = ht2.nowGroup and pt2.grp = ht2.grpID and pt2.timestep = ht2.timeStep and ht1.timeStep+1 = ht2.timeStep
        emit ng.nowGroup, ht1.timeStep as currentTime, ht1.grpID as currentGroup, ht2.grpID as nextGroup, count(*) as sharedParticleCount];
edges = [from edgesInit where sharedParticleCount > 256 emit *];
store(edges, public:vulcan:edgesInitial);

edgesInit = scan(public:vulcan:edgesInitial);
edges = [from edgesInit where currentTime = 1 emit *];
I = [1 as i];

do
    delta = [from edges as e1, edgesInit as e2, I
        emit e2.nowGroup, e2.timeStep, e2.currentGroup, e2.nextGroup, e2.sharedParticleCount
        where e1.nextGroup = e2.curentGroup and e1.currentTime+1 = e2.currentTime and e1.currentTime = I.i and e1.nowGroup = e2.nowGroup];
    edges = unionall(delta, edges);
    I = [from I emit i+1 as i];
while [from I emit min(i) < 7];
store(edges, public:vulcan:edgesConnected);

-- use sortConnectedEdges.json to do an in memory sort on nowGroup, currentTime, nextGroup

apply RunningRank(haloGrp)
{
    [0 as _rank, -1 as _grp];
    [case when haloGrp = _grp then _rank + 1 else 1 end as _rank, haloGrp as _grp];
    _rank;
};

rankedEdges = [from scan(public:vulcan:edgesConnectedSplitSort) as e emit e.nowGroup, e.currentTime, RunningRank(e.currentGroup) as splitOrder, e.currentGroup, e.nextGroup, e.sharedParticleCount];
edges = [from rankedEdges where splitOrder = 1 emit *];
store(edges, public:vulcan:edgesTree);

