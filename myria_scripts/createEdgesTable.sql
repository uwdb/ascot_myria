haloTable = scan(public:vulcan:haloTable);
particleTable = scan(public:vulcan:particleOfInterest);
nowGroups = [from haloTable ht, particleTable pt emit ht.nowGroup, ht.grpID, ht.timeStep, ht.mass, pt.iOrder where ht.nowGroup = pt.nowGroup and ht.grpID = pt.grpID and ht.timeStep = pt.timeStep and ht.timeStep = 1];
edgesInit = [from particleTable pt1, particleTable pt2, haloTable ht1, haloTable ht2, nowGroups ng
        emit ng.nowGroup, ht1.timeStep as currentTime, ht1.grpID as currentGroup, ht2.grpID as nextGroup, count(*) as sharedParticleCount
        where pt1.grpID = ht1.grpID and pt1.timeStep = ht1.timeStep and pt1.iOrder = pt2.iOrder and pt1.iOrder = ng.iOrder and pt2.nowGroup = ht2.nowGroup and pt2.grpID = ht2.grpID and pt2.timeStep = ht2.timeStep and ht1.timeStep+1 = ht2.timeStep and ht1.mass > ??? and ht2.mass > ??? and ht2.mass / ng.mass > 0.0001 and ht1.mass / ng.mass > 0.0001];
edges = [from edgesInit emit * where sharedParticleCount > 256];
store(edges, public:vulcan:edgesInitial);

edgesInit = scan(public:vulcan:edgesInitial);
edges = [from edgesInit emit * where currentTime = 1];
I = [1 as i];

do
    delta = [from edges as e1, edgesInit as e2, I
        where e1.nextGroup = e2.curentGroup and e1.currentTime+1 = e2.currentTime and e1.currentTime = I.i and e1.nowGroup = e2.nowGroup
        emit e2.nowGroup, e2.timeStep, e2.currentGroup, e2.nextGroup, e2.sharedParticleCount];
    edges = unionall(delta, edges);
    I = [from I emit i+1 as i];
while [from I emit min(i) < 7];
store(edges, public:vulcan:edgesConnected);

edgesConnected = scan(public:vulcan:edgesConnected);
edges = [from edgesConnected ec emit ec.nowGroup, ec.currentTime, ec.currentGroup, ec.nextGroup, ec.sharedParticleCount
    where ]

-- use sortConnectedEdges.json to do an in memory sort on nowGroup, currentTime, nextGroup

apply RunningRank(haloGrp)
{
    [0 as _rank, -1 as _grp];
    [case when haloGrp = _grp then _rank + 1 else 1 end as _rank, haloGrp as _grp];
    _rank;
};

rankedEdges = [from scan(public:vulcan:edgesConnectedSplitSort) as e emit e.nowGroup, e.currentTime, RunningRank(e.currentGroup) as splitOrder, e.currentGroup, e.nextGroup, e.sharedParticleCount];
edges = [from rankedEdges emit * where splitOrder = 1];
store(edges, public:vulcan:edgesTree);

