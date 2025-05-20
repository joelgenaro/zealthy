const { test, expect } = require('@playwright/test');
require('dotenv').config();

/**
 * MOVES PATIENT FROM WEIGHT-LOSS LANDING PAGE THROUGH FIRST CHECKOUT ($39 MEMBERSHIP FEE)
 *
 * Creates intake form 'weight-loss-v2'
 */
export class WeightLossV2 {
  constructor(page) {
    this.page = page;
  }

  /**
   * Reusable method to click "Continue" button.  TODO: Adapt this to click any button, def as Continue
   */
  async clickContinue() {
    await expect(
      this.page.getByRole('button', { name: 'Continue' }, { timeout: 120000 })
    ).toBeEnabled({ timeout: 240000 });
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click "Continue with my offer" button
   */
  async continueWithOffer() {
    await this.page.locator('button:text("Continue with my offer")').click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Go to the sign up page and enter an email and password:
   *
   * EMAIL - Randomly generated within the class: will follow the format "automation+xxxxxxxxx@getzealthy.com" where x is a randomly generated number
   *
   * PASSWORD - Always set to Sean's test password "Test1234$"
   */
  async enterEmailPassword() {
    await expect(
      this.page.getByRole('heading', {
        name: 'You’re on your way to lasting weight loss.',
      })
    ).toBeVisible();
    await this.page
      .getByRole('textbox', { name: 'Email address' })
      .fill(createEmail());
    await this.page
      .getByRole('textbox', { name: 'Password' })
      .fill(process.env.PASSWORD);
    await this.page.locator('button:text("Continue with email")').click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Enter the state of residence. Defaults to Florida
   *
   * @param String state def: "Florida"
   */
  async selectState(state = 'Florida') {
    await this.page.getByLabel('State of residence').click();
    await this.page.getByRole('option', { name: state }).click();
    await this.clickContinue();
  }

  /**
   * Passes in a birthday. Defaults to Sean's test birthday
   *
   * @param String date 'MM/DD/YYYY' def: '11/11/1999'
   */
  async enterBirthday(date = '11/11/1999') {
    await this.page
      .getByRole('textbox', { placeholder: 'MM/DD/YYYY' })
      .fill(String(date));
    await this.clickContinue();
  }

  /**
   * Completes the profile for the patient.  Defaults to a Female Control test patient.
   *
   * @param String firstName def: 'zTEST'
   * @param String lastName def: 'zzzTEST'
   * @param String phoneNumber def: '2125555555'
   */
  async completeProfile(
    firstName = 'zTEST',
    lastName = 'zzzTEST',
    phoneNumber = '2125555555'
  ) {
    await expect(
      this.page.getByRole('heading', {
        name: 'We’re available in your area!',
      })
    ).toBeVisible();
    await this.page
      .getByRole('textbox', { name: 'First Name' })
      .fill(String(firstName));
    await this.page
      .getByRole('textbox', { name: 'Last Name' })
      .fill(String(lastName));
    await this.page.getByRole('combobox', { expanded: false }).click();
    await this.page.getByRole('option', { name: 'Female' }).click();
    await this.page
      .getByRole('textbox', { name: 'Phone Number' })
      .fill(String(phoneNumber));
    await this.page.getByRole('checkbox', { name: 'Text me updates' }).click();
    await expect(
      this.page.getByRole('button', { name: 'Continue' })
    ).toBeEnabled();
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForURL('/questionnaires-v2/weight-loss-v2');
  }

  /**
   * Completes profile creation and intake questionnaire.
   *
   * Defaults height to 5'5" and weight to 255 lbs to ensure test patient is obese.  This cannot be changed.
   */
  async intakeQuestionnaire() {
    // Let’s find the safest, most effective weight loss treatment for you.
    await this.clickContinue();

    // What’s your current height and weight?
    await this.page.getByPlaceholder('ft').fill('5');
    await this.page.getByPlaceholder('in').fill('5');
    await this.page.getByPlaceholder('lbs').fill('255');
    await this.clickContinue();

    // Are you currently pregnant or breastfeeding?
    await this.page.getByRole('button', { name: 'No' }).click();
    await this.page.waitForLoadState('domcontentloaded');

    // Have you ever been diagnosed with any of the following?
    await this.page.getByRole('button', { name: 'None of the above' }).click();
    await this.clickContinue();

    // What is your weight loss goal?
    await expect(
      this.page.getByRole('button', {
        name: 'Maintain my weight and get fit',
      })
    ).toBeVisible();
    await this.page
      .getByRole('button', { name: 'Maintain my weight and get fit' })
      .click();
    await this.page.waitForLoadState('domcontentloaded');

    // What goals are you looking to accomplish?
    await expect(
      this.page.getByRole('button', { name: 'Lose weight' })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Lose weight' }).click();
    await this.clickContinue();

    // Which of the following do you have trouble with?
    await this.page.getByRole('button', { name: 'None of the above' }).click();
    await this.clickContinue();

    // Which of the following have you tried in the past?
    await this.page.getByRole('button', { name: 'Keto or low carb' }).click();
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await this.page.waitForLoadState('domcontentloaded');

    // Do you have government insurance?
    await expect(
      this.page.getByRole('heading', {
        name: 'Do you have government insurance?',
      })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'No' }).click();
    await this.page.waitForLoadState('domcontentloaded');

    // GLP-1 medication such as Wegovy, Zepbound, or Ozempic is essential to an effective weight loss program.
    await this.page.getByRole('button', { name: 'Tell me more' }).click();
    await this.page.waitForLoadState('domcontentloaded');

    /*
        // Zealthy’s weight loss program includes:
        await expect(this.page).toHaveURL('/questionnaires-v2/weight-loss-v2/WEIGHT-COACHING-Q3');
        await expect(this.page.getByRole('heading', { name: "Zealthy’s weight loss program includes:" })).toBeVisible();
        await this.page.waitForSelector('button:text("Continue")');
        await this.clickContinue();

        // Congratulations, zzTEST!
        try {
            await expect(this.page.getByRole('heading', { name: 'Congratulations, zTEST!' })).toBeVisible({ timeout: 70000 });
            await this.clickContinue();
        } catch (exception) {
            this.page.goto('/questionnaires-v2/weight-loss-v2/WEIGHT_L_Q9');
            await this.page.waitForLoadState('domcontentloaded');
        }

        // Your customized prescription plan
        await expect(this.page.getByRole('heading', { name: 'Your customized prescription plan' })).toBeVisible({ timeout: 50000 });
        await this.clickContinue();
        */

    await expect(this.page).toHaveURL(
      '/questionnaires-v2/weight-loss-v2/WEIGHT-COACHING-Q3'
    );
    await expect(
      this.page.getByRole('heading', {
        name: 'Zealthy’s weight loss program includes:',
      })
    ).toBeVisible();

    for (let retries = 0; retries < 3; retries++) {
      await this.clickContinue();
      try {
        // Your customized prescription plan
        await expect(
          this.page.getByRole('heading', {
            name: 'Congratulations, zTEST!',
          })
        ).toBeVisible();
        await this.clickContinue();

        // Your customized prescription plan
        await expect(
          this.page.getByRole('heading', {
            name: 'Your customized prescription plan',
          })
        ).toBeVisible();
        await this.clickContinue();
        break;
      } catch (exception) {
        //console.log("Failed to click continue on try " + retries.toString());
      }
    }
  }

  /**
   * Enter the street address for the test patient.  Use a CVS location in the state you are testing.  Defaults to
   * Miami CVS.  Must be a valid address.
   *
   * @param String streetAddress def: '888 BISCAYNE BLVD'
   * @param String city def: 'MIAMI'
   * @param String state def: 'Florida'
   * @param String zip def: '33132'
   */
  async enterHomeAddress(
    streetAddress = '888 BISCAYNE BLVD',
    city = 'MIAMI',
    state = 'Florida',
    zip = '33132'
  ) {
    await this.page.locator('#address-line-1').fill(streetAddress);
    await this.page.locator('#city').fill(city);
    await this.page.locator('#state').click();
    await this.page.getByRole('option', { name: state }).click();
    await this.page.locator('#zip-code').fill(zip);
    await expect(
      this.page.getByRole('button', { name: 'Continue' })
    ).toBeVisible();
    this.clickContinue();
    await this.page.waitForURL('/what-next');
    this.clickContinue();
    await this.page.waitForURL('/checkout', { timeout: 60000 });
  }

  /**
   * Enters credit card information into Stripe. Currently can only be used as a test card, will add functionality
   *  to pass in CC information if necessary later.
   *
   * @param boolean test def: true
   */
  async membershipCheckout(test = true) {
    // Later may add parameters to method, right now we should only be using the test card
    var cardNumber = '';
    var expirationDate = '11/35';
    var cvc = '333';
    var zipCode = '55555';

    if (test) {
      cardNumber = process.env.CREDIT_CARD_NUM;
    } else {
      cardNumber = ''; // placeholder
    }

    await this.page.waitForURL('/checkout', { timeout: 60000 });

    // Stripe CC info elements use iFrame
    const stripeFrame = this.page.frameLocator('iframe').first();
    await stripeFrame.locator('[placeholder="Card number"]').fill(cardNumber);
    await stripeFrame.locator('[placeholder="MM / YY"]').fill(expirationDate);
    await stripeFrame.locator('[placeholder="CVC"]').fill(cvc);
    await stripeFrame.locator('[placeholder="ZIP"]').fill(zipCode);
    await expect(
      this.page.getByRole('button', { name: 'Get started for $39' })
    ).toBeEnabled();
    await this.page
      .getByRole('button', { name: 'Get started for $39' })
      .click();
    await this.page.waitForLoadState('domcontentloaded');

    await this.page.waitForURL(
      '/post-checkout/questionnaires-v2/weight-loss-checkout-success/WEIGHT_LOSS_CHECKOUT_S_Q1',
      { timeout: 240000 }
    );
  }
}

// PRIVATE METHODS

/**
 * Creates email address randomly for enterEmailPassword.  Internal method, do not call from a test.
 *
 * @returns String email - Randomly generated email address
 */
function createEmail() {
  let email =
    'automation+' + String(Math.random()).substring(2, 11) + '@getzealthy.com';
  return email;
}
