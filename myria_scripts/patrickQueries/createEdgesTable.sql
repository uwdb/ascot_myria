--Particle Table (nowGroup, iOrder, mass, HI, type, timestep, grp)
haloTable = [from scan(patrick:test:haloTable) h where h.totalParticles > 256 emit h.*];
particleTable = [from scan(patrick:test:particlesOfInterest) pt, haloTable ht where ht.nowGroup = pt.nowGroup and ht.grpID = pt.grp and ht.timeStep = pt.timestep emit pt.*];
edgesInit = [from particleTable pt1, particleTable pt2
        where pt1.nowGroup = pt2.nowGroup and pt1.iOrder = pt2.iOrder and pt1.timestep+1 = pt2.timestep
        emit pt1.nowGroup, pt1.timestep as currentTime, pt1.grp as currentGroup, pt2.grp as nextGroup, count(*) as sharedParticleCount];
-- filter edges on number of particles shared
edges = [from edgesInit where sharedParticleCount > 256 emit *];
store(edges, patrick:test:edgesInitial);

edgesInit = scan(patrick:test:edgesInitial);
edges = [from edgesInit where currentTime = 1 emit *];
I = [1 as i];

do
    delta = [from edges as e1, edgesInit as e2, I
        where e1.nextGroup = e2.currentGroup and e1.currentTime+1 = e2.currentTime and e1.currentTime = I.i and e1.nowGroup = e2.nowGroup
        emit e2.nowGroup, e2.currentTime, e2.currentGroup, e2.nextGroup, e2.sharedParticleCount];
    edges = distinct(delta + edges);
    I = [from I emit i+1 as i];
while [from I emit min(i) < 7];
--append to previous table
--edges = edges + scan(patrick:test:edgesConnected);
store(edges, patrick:test:edgesConnected);
--Test
