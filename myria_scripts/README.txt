Running count on Myria Production

curl -i -XPOST https://rest.myria.cs.washington.edu:1776/query -H "Content-type: application/json"  -d @./DBScan.json

T1 = scan(public:vulcan:localHaloTable);
T2 = select grpID, sum(mass)*1991100000000000 from T1;
store(T2, );

[
{
grpID: 31077,
_COLUMN1_: 86022047470.40787
}
]