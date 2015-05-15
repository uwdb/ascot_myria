RUN ORDER

localEdges.json
localNodes.json

globalEdges.json
globalNodes.json —CHANGE CONSTANT and ATTRIBUTES


filteredEdgesTable —CHANGE LIMIT ON SHARED
sortConnectedEdges (in between) - 
rest of FilteredEdgesTable


pregenitorHalo.sql
sortByChildMass.json — CHANGED FOR HI
massRatio.sql


CALL
curl -i -XPOST https://rest.myria.cs.washington.edu:1776/query -H "Content-type: application/json"  -d @./sortConnectedEdges.json