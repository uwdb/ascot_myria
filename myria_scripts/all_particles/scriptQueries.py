

def printSQLParticleJoin(snapshotFileName):
    output = []
    f_in = open(snapshotFileName, "r")
    for line in f_in:
        values = line.split(",")
        output.append(int(values[0]), values[1])
    f_in.close() 
    sorted(output, key=lambda x: x[0])
    sqlLine = 'SELECT p1.\\\"nowGroup\\\", p1.\\\"iOrder\\\" as iOrder, p1.mass, p1.\\\"HI\\\", p1.redShift, p1.type, {timestep:s} as timestep, p1.grp FROM \\\"public:vulcan:snapshot{snapshot:s}Hash WHERE p1.grp>-1\\\" p1'
    for pair in output:
        print sqlLine.format(timestep = pair[0], snapshot = pair[1])

if __name__=='__main__':
    try:
        printSQLParticleJoin(args[1])
    catch:
        print "The format of the snapshot file needs to be <timestep, snapshot> per line (order doesn't matter)"