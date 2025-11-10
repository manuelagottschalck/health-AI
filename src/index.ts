const { NeuralNetwork } = require('brain.js');
const csv = require('csv-parser');
const fs = require('fs');

interface PatientRow {
  Name: string,
  Age: Number,
  Gender: string,
  'Medical Condition': string;
  'Date of Admission': string;
  'Doctor': string;
  'Hospital': string;
  'Billing Amount': string;
  'Room Number': string
  'Admission Type': string;
  'Discharge Date': string;
  'Medication': string;
  'Test Results': string;
}


function loadCSV(filePath: string): Promise<PatientRow[]> {
  return new Promise((resolve, reject) => {
    const rows: PatientRow[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: PatientRow) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}


function normalizeNumber(value: number, min: number, max: number) {
  return (value - min) / (max - min);
}

function normalizeData(dataset: PatientRow[]) {
  return dataset.map(row => {
    const rawAge = String(row.Age ?? '').trim();
    const parsedAge = parseFloat(rawAge.replace(/[^\d.]/g, ''));
    const age = isNaN(parsedAge) ? 0.5 : normalizeNumber(parsedAge, 0, 120);

    const gender = row.Gender === 'Male' ? 1 : 0;

    const admissionType = (() => {
      switch (row['Admission Type']) {
        case 'Emergency': return 1;
        case 'Urgent': return 0.7;
        case 'Routine': return 0.5;
        case 'Elective': return 0.2;
        default: return 0;
      }
    })();

    const medicalCondition = (() => {
      switch (row['Medical Condition']) {
        case 'Arthritis': return 0;
        case 'Diabetes': return 0.2;
        case 'Hypertension': return 0.4;
        case 'Obesity': return 0.6;
        case 'Cancer': return 0.8;
        case 'Asthma': return 0.9;
        default: return 1;
      }
    })();

    const medication = (() => {
      switch (row['Medication']) {
        case 'Paracetamol': return 0;
        case 'Ibuprofen': return 0.2;
        case 'Aspirin': return 0.4;
        case 'Penicillin': return 0.6;
        case 'Lipitor': return 0.8;
        default: return 1;
      }
    })();

    const testResults = (() => {
      switch (row['Test Results']) {
        case 'Normal': return 0;
        case 'Inconclusive': return 0.3;
        case 'Abnormal': return 0.6;
        default: return 1;
      }
    })();

    return {
      input: {
        age,
        gender,
        medicalCondition,
        medication,
        testResults,
      },
      output: {
        admissionType,
      },
    };
  });
}

function toText(admissionTypeRaw: number) {
  if (admissionTypeRaw >= 0.35 && admissionTypeRaw < 0.60) return 'Routine';
  if(admissionTypeRaw >= 0.1 && admissionTypeRaw < 0.35 ) return 'Elective'
  if (admissionTypeRaw >= 0.60 && admissionTypeRaw < 0.85) return 'Urgent';
  if (admissionTypeRaw >= 0.85) return 'Emergency';
  //return 'Unknown';
}

async function loadAndTrain(trainPath: string) {
  const data = await loadCSV(trainPath);
  const trainingData = normalizeData(data);

  const net = new NeuralNetwork({
    hiddenLayers: [8, 6],
  });

  net.train(trainingData, {
    iterations: 300,
    log: true,
    logPeriod: 200,
    learningRate: 0.3,
  });

  return { net };
}

module.exports = {
  loadAndTrain,
  loadCSV,
  normalizeData,
  toText,
};
