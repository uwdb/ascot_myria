--nowGroup, grpID, timeStep, mass, totalParticles, HI, prog, massRatio

--add the creation of edgeswithMass in json
--use sortByChildMass.json to join haloTableProg with edgesTree to sort the edges for each nowGroup, currentTime, currentGroup by nextHalo mass descending

haloTable = scan(public:vulcan:haloTableProg);
edges = scan(public:vulcan:edgesWithMassSort);

apply RunningRank(haloGrp)
{
    [0 as _rank, 0 as _grp];
    [case when haloGrp = _grp then _rank + 1 else 1 end, case when haloGrp = _grp then _grp else haloGrp end];
    _rank;
};

rankedEdges = [from scan(public:vulcan:edgesConnectedSplitSort) as e emit e.nowGroup, e.currentTime,  RunningRank(e.currentGroup) as splitOrder, e.currentGroup, e.nextGroup, e.nextGroupMass];
edges1 = [from rankedEdges where splitOrder = 1 emit *];
edges2 = [from rankedEdges where splitOrder = 2 emit *];
bothMaxGroups = [from edges1 e1, edges2 e2
    where e1.nowGroup = e2.nowGroup and e1.currentTime = e2.currentTime and e1.currentGroup = e2.currentGroup
    emit e1.nowGroup, e1.currentTime, e1.currentGroup, e1.nextGroup as e1NextGroup, e2.nextGroup as e2NextGroup, e1.nextGroupMass/e2.nextGroupMass as massRatio];

maxMasses1 = [from bothMaxGroups g, haloTable h
    where h.nowGroup = g.nowGroup and h.grpID = g.e1NextGroup and h.timeStep = g.currentTime+1
    emit h.nowGroup, h.grpID, h.timeStep, h.mass, h.totalParticles, h.HI, h.prog, g.massRatio as massRatio];

maxMasses2 = [from bothMaxGroups g, haloTable h
    where h.nowGroup = g.nowGroup and h.grpID = g.e2NextGroup and h.timeStep = g.currentTime+1
    emit h.nowGroup, h.grpID, h.timeStep, h.mass, h.totalParticles, h.HI, h.prog, g.massRatio as massRatio];

newHaloTable = haloTable + maxMasses1 + maxMasses2;

newHaloTable = [from newHaloTable h
    emit h.nowGroup, h.grpID, h.timeStep, h.mass, h.totalParticles, h.HI, h.prog, max(h.massRatio)];
store(edges, public:vulcan:edgesTree);



--WAY TWO

haloTable = scan(public:vulcan:haloTableProg);
edges = scan(public:vulcan:edgesTree);

edgesWithMass = [from haloTable h, edges e
    where h.nowGroup = e.nowGroup and h.grpID = e.nextGroup and h.timeStep = e.currentTime+1
    emit e.nowGroup, e.currentTime, e.currentGroup, e.nextGroup, h.mass as nextGroupMass];

firstMaxMass = [from edgesWithMass
    emit nowGroup, currentTime, currentGroup, max(nextGroupMass) as maxNextMass];

firstMaxGroup = [from edgesWithMass e, firstMaxMass f
    where e.nowGroup = f.nowGroup and e.currentTime = f.currentTime and e.currentGroup = f.currentGroup and e.nextGroupMass = f.maxNextMass
    emit e.nowGroup, e.currentTime, e.currentGroup, min(e.nextGroup) as maxNextGroup, f.maxNextMass as maxNextMass];

store(firstMaxMass, ljorr1:vulcan:firstMaxMassDec16);

secondMaxMass = [from edgesWithMass e, firstMaxGroup f
    where e.nowGroup = f.nowGroup and e.currentGroup = f.currentGroup and e.currentTime = f.currentTime and e.nextGroup != f.maxNextGroup
    emit e.nowGroup, e.currentTime, e.currentGroup, f.maxNextGroup as maxNextGroup, f.maxNextMass as maxNextMass, max(e.nextGroupMass) as maxNextMass2];



bothMaxGroups = [from edgesWithMass e, secondMaxMass s
    where e.nowGroup = s.nowGroup and e.currentTime = s.currentTime and e.currentGroup = s.currentGroup and e.nextGroupMass = s.maxNextMass and e.nextGroup != maxNextGroup
    emit e.nowGroup, e.currentTime, e.currentGroup, s.maxNextGroup, s.maxNextMass, min(e.nextGroup) as maxNextGroup2, s.maxNextMass2, s.maxNextMass/s.maxNextMass2 as massRatio];

maxMasses1 = [from bothMaxGroups g, haloTable h
    where h.nowGroup = g.nowGroup and h.grpID = g.maxNextGroup and h.timeStep = g.currentTime+1
    emit h.nowGroup, h.grpID, h.timeStep, h.mass, h.totalParticles, h.HI, h.prog, g.massRatio as massRatio];

maxMasses2 = [from bothMaxGroups g, haloTable h
    where h.nowGroup = g.nowGroup and h.grpID = g.maxNextGroup2 and h.timeStep = g.currentTime+1
    emit h.nowGroup, h.grpID, h.timeStep, h.mass, h.totalParticles, h.HI, h.prog, g.massRatio as massRatio];

newHaloTable = haloTable + maxMasses1 + maxMasses2;

newHaloTable = [from newHaloTable h
    emit h.nowGroup, h.grpID, h.timeStep, h.mass, h.totalParticles, h.HI, h.prog, max(h.massRatio)];

store(newHaloTable, ljorr1:vulcan:haloTableProgDec16);
