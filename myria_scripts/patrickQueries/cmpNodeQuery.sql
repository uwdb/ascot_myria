nodes = scan(cosmo8:amiga:nodes112514);
groups = [from nodes emit HaloID, count(NowGroup)];
Store(groups, patrick:test:nodeCmp, [$1]);

nodes = scan(cosmo8Version2:amiga:nodes112614);
groups = [from nodes emit HaloID, count(NowGroup)];
Store(groups, patrick:test:nodeCmp, [$1]);
