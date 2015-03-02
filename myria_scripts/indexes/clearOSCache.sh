host="deneb regulus capella algol mizar sirrah procyon alcor betelgeuse rigel spica castor pollux polaris sol altair aldebaran sirius"

CMD="free && sync && echo \"echo 1 > /proc/sys/vm/drop_caches\" | sudo sh"
parallel -k --jobs +28 "/bin/echo -n '{} -- ' && ssh jortiz16@{}.cs.washington.edu -o ConnectTimeout=6 '$CMD' 2>&1" ::: $host