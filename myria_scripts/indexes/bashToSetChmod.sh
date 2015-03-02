host="deneb regulus capella algol mizar sirrah procyon alcor betelgeuse rigel spica castor pollux polaris sol altair aldebaran sirius"

CMD="chmod 600 .pgpass"
parallel -k --jobs +28 "/bin/echo -n '{} -- ' && ssh jortiz16@{}.cs.washington.edu -o ConnectTimeout=6 '$CMD' 2>&1" ::: $host