const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const { loadAndTrain } = require("./neural/neural");
import type { Request, Response } from "express";
const { toText } = require("./neural/neural");


let neuralModel: any = null;

const app = express();
app.use(bodyParser.json());

// Treinar rede neural ao iniciar
(async () => {
  console.log("Treinando rede neural...");

  const datasetPath = path.join(__dirname, "../db/healthcare_dataset.csv");
  const net = await loadAndTrain(datasetPath);

  neuralModel = net;
  console.log("Rede neural treinada!");

 // return { neuralModel };
})();

// Rotas normais
//app.use("/triage", triageRoutes(() => neuralModel));

app.post("/triage", (req: Request, res: Response) => {
    console.log("post recebido"); // <<< IMPORTANTE

    if (!neuralModel) {
      return res.status(503).json({
        error: "A rede neural está carregando",
      });

    }

    const entrada = req.body;
    console.log("ebtrada ok");
    const resultado = neuralModel.run(entrada);
    console.log("resultad ok");
    const status = toText(resultado.admissionType);
    console.log("status ok");

    res.json({ entrada, resultado, status });
    console.log("resposata ok");
});

// Rota ODATA
app.get("/odata/NeuralModel", (neuralModel: any) => {
  return (req: Request, res: Response) => {
    if (!neuralModel) {
      return res.status(503).json({
        error: "A rede neural ainda está carregando.",
      });
    }


    const entrada = {
      age: Number(req.query.age),
      gender: req.query.gender,
      "Medical Condition": req.query.medicalCondition,
      Medication: req.query.medication,
      "Test Results": req.query.testResults,
    };

    let resultado = neuralModel.run(entrada);

    res.json({
      "@odata.context": "/odata/$metadata#NeuralModel",
      entrada,
      resultado,
    });
  };
});

// Servidor
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
