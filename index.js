const app = require("express")();
const fs = require("fs");
// const split = require("split");
// const jq = require("node-jq");
const mongoose = require("mongoose");
const JSONStream = require("JSONStream");
const es = require("event-stream");
const excel = require("exceljs");

const { demoModel } = require("./models/demo");

const MONGO_URI = "mongodb://localhost:27017/uploadDB";
const port = 8000;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log("Error ", err);
  });

// app.get("/api/upload", (req, res) => {
//   fs.readFile("./demodata.json", (err, data) => {
//     if (!err) {
//       let jsonObj = JSON.parse(data);
//       demoModel.collection.insert(jsonObj, (err, doc) => {
//         if (err) {
//           return res.status(400).send();
//         }
//         return res.status(200).json({ message: "Data entered" });
//       });
//     } else {
//       return res.status(400).json({ message1: err });
//     }
//   });
// });

// app.get("/api/upload", (req, res) => {
//   const readable = fs.createReadStream("./demodata.json", {
//     encoding: "utf-8",
//     flags: "r",
//   });
//   let lineStream = readable.pipe(split("},{"));

//   lineStream.on("data", (chunk) => {
//     console.log(`received ${chunk.length} bytes of data`);
//     console.log(chunk);
//     const jsonString = chunk.toString();
//     let jsonObj = JSON.parse(jsonString);
//     console.log(jsonObj);
//     // demoModel.insertMany(jsonObj);
//   });
//   res.json({ msg: "stream" });
// });

app.get("/api/upload", (req, res) => {
  var getStream = function () {
    var jsonData = "./demodata.json",
      stream = fs.createReadStream(jsonData, { encoding: "utf8" }),
      parser = JSONStream.parse("*");
    return stream.pipe(parser);
  };

  getStream().pipe(
    es.mapSync(function (data) {
      try {
        demoModel.collection.insertOne(data);
      } catch (e) {
        console.log(e);
      }
    })
  );
  res.json({ msg: "stream" });
});

app.get("/api/download", (req, res) => {
  let workbook = new excel.Workbook();
  let worksheet = workbook.addWorksheet("Data");

  worksheet.columns = [
    { header: "id", key: "_id", width: 10 },
    { header: "ts", key: "ts", width: 30 },
    { header: "val", key: "val", width: 10 },
  ];

  demoModel.find({}, (err, docs) => {
    if (!err) {
      worksheet.addRows(docs);

      workbook.xlsx
        .writeFile("Demo.xlsx")
        .then((response) => {
          console.log("file saved");
          return res.status(200).json({ msg: "Data Saved" });
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ msg: "Bad Request" });
        });
    } else {
      return res.status(400).json({ msg: "Bad Request" });
    }
  });
});

app.listen(port, () => {
  console.log(`Listening to ${port}`);
});
