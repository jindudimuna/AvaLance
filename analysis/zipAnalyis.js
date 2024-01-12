const StreamZip = require("node-stream-zip");

async function navigateZip(zipFilePath, pagefunction) {
  const zip = new StreamZip.async({ file: zipFilePath });

  let version;
  let entries = await zip.entries();
  entries = Object.values(entries);

  // console.log(zipFilePath);

  const hasInitialReport = entries.some((entry) => entry.isDirectory === false && entry.name.endsWith("initialReport.json"));

  console.log(hasInitialReport); //should be true if it is found

  const hasReport = entries.some((entry) => entry.isDirectory === false && entry.name.endsWith("report.json"));

  console.log(hasReport); //should be true if it is found

  if (hasInitialReport) {
    version = false; // Set version to false if only "initialReport.json" is found

    // entries = entries.filter((entry) => entry.isDirectory === false && entry.name.endsWith("initialReport.json"));
    //
    if (!version) {
      const oldEntries = entries.filter((entry) => entry.isDirectory === false && entry.name.endsWith("initialReport.json"));
      for (const entry of oldEntries) {
        let report;

        report = await zip.entryData(entry);
        try {
          report = JSON.parse(report.toString("utf8"));
          // console.log(report);
          await pagefunction(report, version);

          // console.log("Processed report from:", entry);
        } catch (error) {
          // console.error("Error processing entry:", entry, error.message);
        }
      }
    }
  }
  console.log("version: ", version);

  if (hasReport) {
    version = true; // Set version to true if only "report.json" is found
    // entries = entries.filter((entry) => entry.isDirectory === false && entry.name.endsWith("report.json"));
    if (version) {
      const newEntries = entries.filter((entry) => entry.isDirectory === false && entry.name.endsWith("report.json"));

      for (const entry of newEntries) {
        let report;

        report = await zip.entryData(entry);
        // console.log(report);
        try {
          // let report = await zip.entryData(entry);
          report = JSON.parse(report.toString("utf8"));

          await pagefunction(report, version);

          console.log("Processed report from:", entry.name);
          // return;
        } catch (error) {
          console.error("Error processing entry:", entry.name, error.message);
        }
      }
    }
  }

  console.log("version: ", version);

  // for (const entry of entries) {
  //   let report;

  //   if (!version) {
  //     report = await zip.entryData(entry);
  //     try {
  //       report = JSON.parse(report.toString("utf8"));
  //       // console.log(report);
  //       await pagefunction(report, version);

  //       // console.log("Processed report from:", entry);
  //     } catch (error) {
  //       // console.error("Error processing entry:", entry, error.message);
  //     }
  //   } else if (version) {
  //     report = await zip.entryData(entry);
  //     // console.log(report);
  //     try {
  //       // let report = await zip.entryData(entry);
  //       report = JSON.parse(report.toString("utf8"));
  //       // console.log(report);
  //       await pagefunction(report, version);

  //       // console.log("Processed report from:", entry.name);
  //       // return;
  //     } catch (error) {
  //       // console.error("Error processing entry:", entry.name, error.message);
  //     }
  //   }
  // }
  await zip.close();
}

module.exports = {
  navigateZip,
};
