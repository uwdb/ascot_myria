host="dbserver01 dbserver02 dbserver03 dbserver04 dbserver05 dbserver06 dbserver07 dbserver08 dbserver09
dbserver10 dbserver11 dbserver12 dbserver13 dbserver14 dbserver15 dbserver16 dbserver17 dbserver18 dbserver19 dbserver20"

# CMD="sudo df -h /disk?"
# parallel --no-notice -k --jobs +28 "/bin/echo -n '{} -- ' && ssh {}.cs.washington.edu -o ConnectTimeout=6 '$CMD' 2>&1" ::: $host


# CMD="ps aux | grep postgres | grep -v grep | grep -v autovacuum | grep -v '\''process\s*$'\'' | grep -v '\'') idle\s*$'\'' | grep -v /usr/lib/postgresql | grep -v edu.washington"
# parallel --no-notice -k --jobs +28 "/bin/echo '{} -- ' && ssh ljorr1@{}.cs.washington.edu -o ConnectTimeout=6 '$CMD' 2>&1" ::: $host

# CMD="exit"
# parallel --no-notice --jobs +28 "/bin/echo '{} -- ' && /usr/bin/time ssh {}.cs.washington.edu -o ConnectTimeout=6 '$CMD' 2>&1" ::: $host


# CMD="ps aux | grep myria"
# parallel --no-notice --jobs +28 "/bin/echo '{} -- ' && /usr/bin/time ssh {}.cs.washington.edu -o ConnectTimeout=6 '$CMD' 2>&1" ::: $host

CMD="free -ht | grep Total"
parallel --no-notice --jobs +28 "/bin/echo '{} -- ' && /usr/bin/time ssh {}.cs.washington.edu -o ConnectTimeout=6 '$CMD' 2>&1" ::: $host