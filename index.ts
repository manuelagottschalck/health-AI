// index.ts
const { NeuralNetwork } = require('brain.js');
const csv = require('csv-parser');
const fs = require('fs');

const net = new NeuralNetwork({
    hiddenLayers: [4, 3], // VERIFICAR O PQ
});
interface PatientRow {
  Name: string;
  Age: Number;
  Gender: string;
  'Medical Condition': string;
  'Admission Type': string;
  'Medication': string;
  'Test Results': string;
}

const data: PatientRow[] = [];

function normalizeNumber(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

function normalizeData(dataset: PatientRow[]) {
  return dataset.map(row => {
    const age = normalizeNumber(Number(row.Age), 0, 120); 
    const gender = row.Gender === "Male" ? 1 : 0;

    const admissionType = (() => {
      switch (row["Admission Type"]) {
        case "Emergency": return 1;
        case "Urgent": return 0.5;
        case "Routine": return 0;
        default: return 0.2;
      }
    })();

    const medicalCondition = (() => {
      switch (row["Medical Condition"]) {
      case "Arthritis": return 0;
      case "Diabetes": return 0.2;
      case "Hypertension": return 0.4;
      case "Obesity": return 0.6;
      case "Cancer": return 0.8;
      case "Asthma": return 0.9;
      default: return 1;
      }
    })();

    const medication = (() => {
      switch (row["Medication"]) {
      case "Paracetamol": return 0;
      case "Ibuprofen": return 0.2;
      case "Aspirin": return 0.4;
      case "Penicillin": return 0.6;
      case "Lipitor": return 0.8;
      default: return 1;
      }
    })();

    const testResults = (() => {
      switch (row["Test Results"]) {
      case "Normal": return 0;
      case "Inconclusive": return 0.3;
      case "Abnormal": return 0.6;
      default: return 1;
      }
    })();

    return {
      input: {
        age,
        gender,
        medicalCondition,
        admissionType,
        medication,
        testResults
              },
      output: {
        admissionType,
      }
    };
  });
}

function toText(admissionTypeRaw: number){
  if(admissionTypeRaw < 0.25) return "Routine";
  if(admissionTypeRaw >= 0.25 || admissionTypeRaw < 0.75) return "Urgent";
  if(admissionTypeRaw >= 0.75) return "Emergency";
}


fs.createReadStream('C:/Users/Usuario/Downloads/archive/healthcare_dataset.csv')
  .pipe(csv())
  .on('data', (row: PatientRow) => {
    data.push(row);
  })
  .on('end', () => {
    console.log('CSV carregado:', data.length, 'linhas');
    const trainingData = normalizeData(data);
    net.train(trainingData, {
          iterations: 2000,
          log: true,
          logPeriod: 100,
          learningRate: 0.3
        });

    const teste = net.run({
      age: 0.25,
      gender: 1,
      medicalCondition: 0.8,
      medication: 0,
      testResults: 0
    })

    console.log(teste);
    console.log(toText(teste.admissionType));
  });




