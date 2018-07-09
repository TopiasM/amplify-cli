const inquirer = require('inquirer');

async function serviceWalkthrough(
  context,
  defaultValuesFilename,
  stringMapsFilename,
  serviceMetadata,
) {
  const { inputs } = serviceMetadata;
  const { amplify } = context;
  const { parseInputs } = require(`${__dirname}/../question-factories/core-questions.js`);

  let coreAnswers = {};
  let appClientAnswers = {};


  const coreQuestionInputs = inputs.filter(i => i.set === 'core');

  const appClientInputs = inputs.filter(i => i.set === 'app-client');


  const coreQuestions = parseInputs(
    coreQuestionInputs,
    amplify,
    defaultValuesFilename,
    stringMapsFilename,
  );

  coreAnswers = await inquirer.prompt(coreQuestions);

  if (coreAnswers.authSelections === 'identityPoolAndUserPool') {
    const appClientQuestions = parseInputs(
      appClientInputs,
      amplify,
      defaultValuesFilename,
      stringMapsFilename,
      coreAnswers,
    );
    appClientAnswers = await inquirer.prompt(appClientQuestions);
  }

  const roles = await context.amplify.executeProviderUtils(context, 'amplify-provider-awscloudformation', 'staticRoles');

  return {
    ...coreAnswers,
    ...appClientAnswers,
    ...roles,
  };
}

module.exports = { serviceWalkthrough };
