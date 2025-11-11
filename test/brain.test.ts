const { loadAndTrain, toText, loadCSV, normalizeData } = require('../src/index');

describe('Testando rede neural', () => {
  test('Deve atingir acurácia maior que 60%', async () => {
    // Treino
    const { net } = await loadAndTrain('db/healthcare_dataset.csv');

    // Teste
    const testRows = await loadCSV('db/healthcare_dataset_test.csv');
    const testData = normalizeData(testRows);
    console.log(testData);
    let acertos = 0;
    //console.log(testData);
    for (const { input, output } of testData) {
      const result = net.run(input);
      const predicted = toText(result.admissionType);
      const actual = toText(output.admissionType);
      //console.log(result);
      if (predicted === actual) acertos++;
    }

     const accuracy = (acertos / testRows.length) * 100;
    // console.log(`Acurácia no test.csv: ${accuracy.toFixed(2)}%`);

    expect(accuracy).toBeGreaterThan(60);
  }, 200000); // aumenta timeout se o treino demorar
});

