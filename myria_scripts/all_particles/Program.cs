using System;
using System.Collections.Generic;
using System.IO;

namespace scriptAscotQueries
{
	class MainClass
	{
		static List<String> listOfSnapshots;
		static String masterPath = "/Users/jortiz16/Documents/gFileScripts/g1536/";
		static String datasetPrefix = "sarah:g1536:cosmo";
		public static void Main (string[] args)
		{
			MainClass m = new MainClass ();
			//read the snapshots
			listOfSnapshots = new List<String> ();
			StreamReader r = new StreamReader (masterPath + "snapshotList");
			String currentLine = String.Empty;

			while ((currentLine = r.ReadLine ()) != null) {
				listOfSnapshots.Add (currentLine);	
			}

			m.NodesBuild ();
			m.EdgesBuildVersion2 ();
		}
		public void EdgesBuild()
		{
			StreamWriter edgesWriter = new StreamWriter (masterPath + "edgesOutput");
			String edgesTemplate = "";
			int timeCounter = 1;
			for(int i = 0; i < listOfSnapshots.Count-1; i++) {
				String firstPart = "(select s1.grp as currentGroup, " + timeCounter++ + " as currentTime, s2.grp as nextGroup, count(*) as sharedParticles from ";
				String currentSnapshot = "\\\"" + datasetPrefix + listOfSnapshots[i] + "\\\"";
				String nextSnapshot = "\\\"" + datasetPrefix + listOfSnapshots[i+1] + "\\\"";
				String snapshotDuo = currentSnapshot + " s1, " + nextSnapshot + " s2 ";

				String lastPart = String.Empty;
			
				if(listOfSnapshots[i] != listOfSnapshots[listOfSnapshots.Count-2])
					lastPart= " where s1.\\\"iOrder\\\" = s2.\\\"iOrder\\\" and s1.grp > 0 and s2.grp > 0 group by s1.grp, s2.grp) UNION  ";
				else
					lastPart= " where s1.\\\"iOrder\\\" = s2.\\\"iOrder\\\" and s1.grp > 0 and s2.grp > 0 group by s1.grp, s2.grp) ";

				edgesTemplate += firstPart + snapshotDuo + lastPart;

			}
			edgesWriter.Write (edgesTemplate);
			edgesWriter.Flush ();
			edgesWriter.Close ();

		}
		public void EdgesBuildVersion2()
		{
			StreamWriter edgesWriter = new StreamWriter (masterPath + "edgesOutput");
			String edgesTemplate = "";
			int timeCounter = 1;
			for(int i = 0; i < listOfSnapshots.Count-1; i++) {
				String firstPart = "(select s1.grp as currentGroup, " + timeCounter++ + " as currentTime, s2.grp as nextGroup, count(*) as sharedParticles from ";
				String currentSnapshot = "\\\"" + datasetPrefix + listOfSnapshots[i] + "\\\"";
				String nextSnapshot = "\\\"" + datasetPrefix  + listOfSnapshots[i+1] + "\\\"";

				//assuming the list is in order!!!
				String presentDaySnapshot = "\\\"" + datasetPrefix + listOfSnapshots[listOfSnapshots.Count-1] + "\\\"";
				String snapshotDuo = currentSnapshot + " s1, " + nextSnapshot + " s2, " + presentDaySnapshot + " s3 ";
				String lastPart = String.Empty;


				if(listOfSnapshots[i] != listOfSnapshots[listOfSnapshots.Count-2])
					lastPart= " where s1.\\\"iOrder\\\" = s2.\\\"iOrder\\\" and s2.\\\"iOrder\\\" = s3.\\\"iOrder\\\" and s1.grp > 0 and s2.grp > 0 and s3.grp > 0 group by s1.grp, s2.grp) UNION  ";
				else
					lastPart= " where s1.\\\"iOrder\\\" = s2.\\\"iOrder\\\" and s2.\\\"iOrder\\\" = s3.\\\"iOrder\\\" and s1.grp > 0 and s2.grp > 0 and s3.grp > 0 group by s1.grp, s2.grp) ";

				edgesTemplate += firstPart + snapshotDuo + lastPart;

			}
			edgesWriter.Write (edgesTemplate);
			edgesWriter.Flush ();
			edgesWriter.Close ();

		}


		public void NodesBuild()
		{
			StreamWriter nodesWriter = new StreamWriter (masterPath + "nodesOutput");
			String nodesTemplate = "";
			int timeCounter = 1;
			foreach (var v in listOfSnapshots) {
				String firstPart = "(select s1.grp as grpID, " + timeCounter++ + " as currentTime, sum(s1.mass) as mass, count(*) as totalParticles from ";
				String currentSnapshot = "\\\"" + datasetPrefix + v + "\\\"";
				String lastPart = String.Empty;

				if(v != listOfSnapshots[listOfSnapshots.Count-1])
						lastPart= " s1 where s1.grp > 0 group by s1.grp)   UNION ";
				else
						lastPart= " s1 where s1.grp > 0 group by s1.grp) ";

				nodesTemplate += firstPart + currentSnapshot + lastPart;

			}
			nodesWriter.Write (nodesTemplate);
			nodesWriter.Flush ();
			nodesWriter.Close ();
		}
	}
}
