host="deneb regulus capella algol mizar sirrah procyon alcor betelgeuse rigel spica castor pollux polaris sol altair aldebaran sirius"

CMD="psql -U uwdb -w -d myria1 -p 5401 -h localhost -f indexIOrd.sql"
parallel -k --jobs +28 "/bin/echo -n '{} -- ' && ssh jortiz16@{}.cs.washington.edu -o ConnectTimeout=6 '$CMD' 2>&1" ::: $host

CMD="psql -U uwdb -w -d myria2 -p 5401 -h localhost -f indexIOrd.sql"
parallel -k --jobs +28 "/bin/echo -n '{} -- ' && ssh jortiz16@{}.cs.washington.edu -o ConnectTimeout=6 '$CMD' 2>&1" ::: $host

CMD="psql -U uwdb -w -d myria3 -p 5401 -h localhost -f indexIOrd.sql"
parallel -k --jobs +28 "/bin/echo -n '{} -- ' && ssh jortiz16@{}.cs.washington.edu -o ConnectTimeout=6 '$CMD' 2>&1" ::: $host

CMD="psql -U uwdb -w -d myria4 -p 5401 -h localhost -f indexIOrd.sql"
parallel -k --jobs +28 "/bin/echo -n '{} -- ' && ssh jortiz16@{}.cs.washington.edu -o ConnectTimeout=6 '$CMD' 2>&1" ::: $host