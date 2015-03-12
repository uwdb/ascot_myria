halos = scan(patrick:test:haloTableComplete);
nodes = scan(patrick:test:totalParticleCount);

nodeMass = [from halos h1, nodes n1 where h1.grpID = n1.grpID and h1.timeStep = n1.timeStep emit n1.nowGroup, n1.grpID, n1.timeStep, n1.totalParticles, h1.mass as grpMass];

store(nodeMass, patrick:test:totalParticleCountWithMass);
