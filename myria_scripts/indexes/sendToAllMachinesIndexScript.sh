Hosts=("aldebaran" "altair" "betelgeuse" "rigel" "spica" "castor" "pollux" "polaris" "deneb" "regulus" "capella" "algol" "mizar" "sirrah" "procyon" "alcor" "sol" "sirius")

for i in ${Hosts[@]}; do
	rsync indexIOrd.sql jortiz16@$i.cs.washington.edu:~
done