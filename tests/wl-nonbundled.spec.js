const { test, expect } = require('@playwright/test');
import { WeightLossV2 } from './flows/weight-loss-v2.js';
import { WeightLossPostV2 } from './flows/weight-loss-post-v2.js';

// TEST SETUP *****************************************************

test.describe.configure(
  { mode: 'serial' },
  { retries: 3 },
  { timeout: 120000 }
);

test.beforeEach(async ({ page }) => {
  // Navigate to the weight loss flow and check the page title before starting
  await page.goto('/weight-loss');
  await expect(page).toHaveTitle('Zealthy | Get Started');
});

// TESTS **********************************************************

test('WL Nonbundled No Compound', async ({ page }) => {
  test.slow(); // gives extra timeout allowance (runs slower but more reliably)
  const signUp = new WeightLossV2(page);
  const weightLoss = new WeightLossPostV2(page);

  // account creation flow
  await signUp.clickContinue();
  await signUp.continueWithOffer();
  await signUp.enterEmailPassword();
  await signUp.selectState('Florida'); // sending default params for visibility
  await signUp.enterBirthday('11/11/1999'); // sending default params for visibility
  await signUp.completeProfile('zTEST', 'zzzTEST', '2125555555'); // sending default params for visibility

  // weight loss questionnaire
  await signUp.intakeQuestionnaire();
  await signUp.enterHomeAddress(
    '888 Biscayne Blvd',
    'Miami',
    'Florida',
    '33132'
  ); // sending default params
  await signUp.membershipCheckout(true); // sending default params

  // go to post checkout weight loss flow
  await weightLoss.postCheckout();

  // add titration :)
  await weightLoss.titrationFlow();

  // select a compound
  await weightLoss.selectCompound();

  // upload ID
  await weightLoss.uploadId();
});

test('WL Nonbundled Semaglutide One Month', async ({ page }) => {
  test.slow();
  const signUp = new WeightLossV2(page);
  const weightLoss = new WeightLossPostV2(page);

  // account creation flow
  await signUp.clickContinue();
  await signUp.continueWithOffer();
  await signUp.enterEmailPassword();
  await signUp.selectState();
  await signUp.enterBirthday();
  await signUp.completeProfile();

  // weight loss questionnaire
  await signUp.intakeQuestionnaire();
  await signUp.enterHomeAddress();
  await signUp.membershipCheckout();

  // go to post checkout weight loss flow
  await weightLoss.postCheckout();

  // add titration :)
  await weightLoss.titrationFlow();

  // select a compound
  await weightLoss.selectCompound(true, 'semaglutide', 1);

  // upload ID
  await weightLoss.uploadId();
});

test('WL Nonbundled Semaglutide Three Month', async ({ page }) => {
  test.slow();
  const signUp = new WeightLossV2(page);
  const weightLoss = new WeightLossPostV2(page);

  // account creation flow
  await signUp.clickContinue();
  await signUp.continueWithOffer();
  await signUp.enterEmailPassword();
  await signUp.selectState();
  await signUp.enterBirthday();
  await signUp.completeProfile();

  // weight loss questionnaire
  await signUp.intakeQuestionnaire();
  await signUp.enterHomeAddress();
  await signUp.membershipCheckout();

  // go to post checkout weight loss flow
  await weightLoss.postCheckout();

  // add titration :)
  await weightLoss.titrationFlow();

  // select a compound
  await weightLoss.selectCompound(true, 'semaglutide', 3);

  // upload ID
  await weightLoss.uploadId();
});

test('WL Nonbundled Tirzepatide One Month', async ({ page }) => {
  test.slow();
  const signUp = new WeightLossV2(page);
  const weightLoss = new WeightLossPostV2(page);

  // account creation flow
  await signUp.clickContinue();
  await signUp.continueWithOffer();
  await signUp.enterEmailPassword();
  await signUp.selectState();
  await signUp.enterBirthday();
  await signUp.completeProfile();

  // weight loss questionnaire
  await signUp.intakeQuestionnaire();
  await signUp.enterHomeAddress();
  await signUp.membershipCheckout();

  // go to post checkout weight loss flow
  await weightLoss.postCheckout();

  // add titration :)
  await weightLoss.titrationFlow();

  // select a compound
  await weightLoss.selectCompound(true, 'tirzepatide', 1);

  // upload ID
  await weightLoss.uploadId();
});

test('WL Nonbundled Tirzepatide Three Month', async ({ page }) => {
  test.slow();
  const signUp = new WeightLossV2(page);
  const weightLoss = new WeightLossPostV2(page);

  // account creation flow
  await signUp.clickContinue();
  await signUp.continueWithOffer();
  await signUp.enterEmailPassword();
  await signUp.selectState();
  await signUp.enterBirthday();
  await signUp.completeProfile();

  // weight loss questionnaire
  await signUp.intakeQuestionnaire();
  await signUp.enterHomeAddress();
  await signUp.membershipCheckout();

  // go to post checkout weight loss flow
  await weightLoss.postCheckout();

  // add titration :)
  await weightLoss.titrationFlow();

  // select a compound
  await weightLoss.selectCompound(true, 'tirzepatide', 3);

  // upload ID
  await weightLoss.uploadId();
});
