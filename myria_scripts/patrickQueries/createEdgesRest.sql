apply RunningRank(haloGrp)
{
    [0 as _rank, -1 as _grp];
    [case when haloGrp = _grp then _rank + 1 else 1 end, case when haloGrp = _grp then _grp else haloGrp end];
    _rank;
};

rankedEdges = [from scan(patrick:test:edgesConnectedSplitSort) as e emit e.nowGroup, e.currentTime,  RunningRank(e.nextGroup) as splitOrder, e.currentGroup, e.nextGroup, e.sharedParticleCount];
edges = [from rankedEdges where splitOrder = 1 emit *];
store(edges, patrick:test:edgesTree);