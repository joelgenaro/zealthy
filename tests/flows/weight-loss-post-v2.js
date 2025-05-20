const { test, expect } = require('@playwright/test');

/**
 * MOVES A PAYMENT_SUBMITTED USER FROM POST-CHECKOUT TO GLP-1 REQUESTS AND FINISHES IN THE PATIENT PORTAL
 *
 * Creates intake form 'weight-loss-post-v2'
 */
export class WeightLossPostV2 {
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
   * Complete the post checkout flow.
   *
   * - Skips choosing a pharmacy
   * - Continues without uploading insurance
   * - Doesn't have recent blood work
   * - Selects random answers for the surveys
   * - Enters "Automation" into textboxes
   */
  async postCheckout() {
    // Now that you've successfully submitted payment...
    await this.clickContinue();

    // Choose Pharmacy.
    await expect(
      this.page.getByRole('heading', { name: 'Choose Pharmacy.' })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Skip this step' }).click();
    await this.page.waitForLoadState('domcontentloaded');

    // Do you have lab or blood tests
    await expect(
      this.page.getByRole('heading', {
        name: 'Do you have lab or blood tests from the past 12 months?',
      })
    ).toBeVisible();
    await this.page
      .getByRole('button', { name: "No, I don't have recent labs." })
      .click();
    await this.page.waitForLoadState('domcontentloaded');

    // You're almost there!  Please confirm that you've read the below...
    await expect(
      this.page.getByRole('heading', {
        name: "You're almost there! Please confirm that you've read the below in order to continue to lasting weight loss.",
      })
    ).toBeVisible();
    await this.page.getByRole('checkbox').click();
    await this.clickContinue();

    // Do you have any of the following?
    await expect(
      this.page.getByRole('heading', {
        name: 'Do you have any of the following?',
      })
    ).toBeVisible();
    await this.page
      .getByRole('button', { name: 'History of severe GI disease' })
      .click();
    await this.clickContinue();

    // Do your siblings, or your parents have a history...
    await expect(
      this.page.getByRole('heading', {
        name: 'Do your siblings, or your parents have a history of the following conditions?',
      })
    ).toBeVisible();
    await this.page
      .getByRole('button', { name: 'Medullary thyroid cancer' })
      .click();
    await this.clickContinue();

    // Have you previously had any of the following weight loss surgeries?
    await expect(
      this.page.getByRole('heading', {
        name: 'Have you previously had any of the following weight loss surgeries?',
      })
    ).toBeVisible();
    await this.page
      .getByRole('button', {
        name: "No, I haven't had any of the above surgeries",
      })
      .click();
    await this.clickContinue();

    // Have you ever been diagnosed with any of the following?
    await expect(
      this.page.getByRole('heading', {
        name: 'Have you ever been diagnosed with any of the following?',
      })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'None of the above' }).click();
    await this.clickContinue();

    // Have you ever been diagnosed with any of the following?
    await expect(this.page).toHaveURL(
      '/post-checkout/questionnaires-v2/weight-loss-post-v2/WEIGHT_L_POST_Q5'
    );
    await expect(
      this.page.getByRole('heading', {
        name: 'Have you ever been diagnosed with any of the following?',
      })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'None of the above' }).click();
    await this.clickContinue();

    // Are you currently taking any of the medications below?
    await expect(
      this.page.getByRole('heading', {
        name: 'Are you currently taking any of the medications below?',
      })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'None of the above' }).click();
    await this.clickContinue();

    // Do you currently take any other medications or supplements...
    //await this.page.getByRole('textbox', { name: "Describe what you've tried"}).fill("automation")
    await expect(
      this.page.getByRole('heading', {
        name: 'Do you currently take any other medications or supplements besides those listed in the preceding questions?',
      })
    ).toBeVisible();
    await this.page
      .getByPlaceholder('List the other medications or supplements you take.')
      .fill('automation');
    await this.clickContinue();

    // Have you ever had an allergic reaction to any medications?
    await expect(
      this.page.getByRole('heading', {
        name: 'Have you ever had an allergic reaction to any medications?',
      })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'No' }).click();
    await this.clickContinue();

    // Do you have a history of chronic renal disease?
    await expect(
      this.page.getByRole('heading', {
        name: 'Do you have a history of chronic renal disease? History of kidney failure? Or have you ever seen a kidney doctor?',
      })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'No' }).click();
    await this.clickContinue();

    // Are yo uwilling to redue your calorie intake...
    await expect(
      this.page.getByRole('heading', {
        name: 'Are you willing to reduce your caloric intake alongside medication?',
      })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'No' }).click();
    await this.clickContinue();

    // Are you willing to increase your physical activity...
    await expect(
      this.page.getByRole('heading', {
        name: 'Are you willing to increase your physical activity alongside medication?',
      })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'No' }).click();
    await this.clickContinue();
  }

  async titrationFlow() {
    // Which GLP-1 medications have you taken?
    await expect(
      this.page.getByRole('heading', {
        name: 'Which GLP-1 medications have you taken?',
      })
    ).toBeVisible();
    await this.page
      .getByRole('button', { name: 'Wegovy (Semaglutide)' })
      .click();
    await this.page
      .getByRole('button', { name: 'Ozempic (Semaglutide)' })
      .click();
    await this.clickContinue();

    // Of the GLP-1 medications you have taken...
    await expect(
      this.page.getByRole('heading', {
        name: 'Of the GLP-1 medications you have taken, which did you take most recently?',
      })
    ).toBeVisible();
    await this.page
      .getByRole('button', { name: 'Wegovy (Semaglutide)' })
      .click();

    // What was the most recent dose of Wegovy you previously took?
    await expect(
      this.page.getByRole('heading', {
        name: 'What was the most recent dose of Wegovy (Semaglutide) you previously took?',
      })
    ).toBeVisible();
    await this.page
      .getByRole('button', { name: '0.25 mg per week (1 mg per month)' })
      .click();

    // When did you inject your last dose of Wegovy (Semaglutide)?
    await expect(
      this.page.getByRole('heading', {
        name: 'What was the most recent dose of Wegovy (Semaglutide) you previously took?',
      })
    ).toBeVisible();
    await this.page
      .getByRole('button', { name: '3 or more months ago' })
      .click();

    // When was the last time you had an in-person medical evaluation?
    await expect(
      this.page.getByRole('heading', {
        name: 'When did you inject your last dose of Wegovy (Semaglutide)?',
      })
    ).toBeVisible();
    await this.page
      .getByRole('button', { name: 'More than 3 months ago' })
      .click();
    await this.page.waitForLoadState('domcontentloaded');

    // Do you currently have any other medical conditions besides those...
    await expect(
      this.page.getByRole('heading', {
        name: 'Do you currently have any other medical conditions besides those that you have already shared with us?',
      })
    ).toBeVisible();
    await this.page.getByPlaceholder('Type here...').fill('automation');
    await this.clickContinue();

    // Please describe your weight loss journey
    await expect(
      this.page.getByRole('heading', {
        name: 'Please describe your weight loss journey.',
      })
    ).toBeVisible();
    await this.page.getByPlaceholder('Share your story').fill('automation');
    await this.clickContinue();

    // We make GLP-1 medication affordable for you
    await expect(
      this.page.getByRole('heading', {
        name: 'We make GLP-1 medication affordable for you & ship to your door.',
      })
    ).toBeVisible();
    await this.page
      .getByRole('button', {
        name: 'Continue to specify requested medication',
      })
      .click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Selects a namebrand medication from the list.  Pass in the name of the medication and it will choose it.
   *
   * @param String nameBrand def: blank String
   */
  async selectNameBrand(nameBrand = '') {
    await expect(
      this.page.getByRole('heading', {
        name: 'Select a preferred treatment option.',
      })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'View more' }).click();
    await this.page.waitForLoadState('domcontentloaded');

    const medicationCardButtons = await this.page
      .getByRole('button', { name: 'Review treatment' })
      .all();

    switch (nameBrand) {
      case 'Wegovy':
        await medicationCardButtons[0].click();
        expect(
          this.page.getByRole('heading', {
            name: 'Wegovy (semaglutide)',
          })
        ).toBeVisible();
        await this.page
          .getByRole('button', {
            name: 'Select medication and continue',
          })
          .click();
        await this.page.waitForLoadState('domcontentloaded');
        break;

      case 'Zepbound':
        await medicationCardButtons[1].click();
        expect(
          this.page.getByRole('heading', {
            name: 'Zepbound (tirzepatide)',
          })
        ).toBeVisible();
        await this.page
          .getByRole('button', {
            name: 'Select medication and continue',
          })
          .click();
        await this.page.waitForLoadState('domcontentloaded');
        break;

      case 'Semaglutide':
        await medicationCardButtons[2].click();
        expect(
          this.page.getByRole('heading', { name: 'Semaglutide' })
        ).toBeVisible();
        await this.page
          .getByRole('button', {
            name: 'Select medication and continue',
          })
          .click();
        await this.page.waitForLoadState('domcontentloaded');
        break;

      case 'Tirzepatide':
        await medicationCardButtons[3].click();
        expect(
          this.page.getByRole('heading', { name: 'Tirzepatide' })
        ).toBeVisible();
        await this.page
          .getByRole('button', {
            name: 'Select medication and continue',
          })
          .click();
        await this.page.waitForLoadState('domcontentloaded');
        break;

      case 'Ozempic':
        await medicationCardButtons[4].click();
        expect(
          this.page.getByRole('heading', {
            name: 'Ozempic (Semaglutide)',
          })
        ).toBeVisible();
        await this.page
          .getByRole('button', {
            name: 'Select medication and continue',
          })
          .click();
        await this.page.waitForLoadState('domcontentloaded');
        break;

      case 'Mounjaro':
        await medicationCardButtons[5].click();
        expect(
          this.page.getByRole('heading', {
            name: 'Mounjaro (tirzepatide)',
          })
        ).toBeVisible();
        await this.page
          .getByRole('button', {
            name: 'Select medication and continue',
          })
          .click();
        await this.page.waitForLoadState('domcontentloaded');
        break;

      case 'Saxenda':
        await medicationCardButtons[6].click();
        expect(
          this.page.getByRole('heading', {
            name: 'Saxenda (liraglutide)',
          })
        ).toBeVisible();
        await this.page
          .getByRole('button', {
            name: 'Select medication and continue',
          })
          .click();
        await this.page.waitForLoadState('domcontentloaded');
        break;

      case 'Victoza':
        await medicationCardButtons[7].click();
        expect(
          this.page.getByRole('heading', {
            name: 'Victoza (liraglutide)',
          })
        ).toBeVisible();
        await this.page
          .getByRole('button', {
            name: 'Select medication and continue',
          })
          .click();
        await this.page.waitForLoadState('domcontentloaded');
        break;

      case 'Bupropion and Naltrexone':
        await medicationCardButtons[8].click();
        expect(
          this.page.getByRole('heading', {
            name: 'Bupropion and Naltrexone',
          })
        ).toBeVisible();
        await this.page
          .getByRole('button', {
            name: 'Select medication and continue',
          })
          .click();
        await this.page.waitForLoadState('domcontentloaded');
        break;

      case 'Metformin':
        await medicationCardButtons[9].click();
        expect(
          this.page.getByRole('heading', { name: 'Metformin' })
        ).toBeVisible();
        await this.page
          .getByRole('button', {
            name: 'Select medication and continue',
          })
          .click();
        await this.page.waitForLoadState('domcontentloaded');
        break;

      case '':
        await this.page
          .getByRole('button', { name: 'Continue without selecting' })
          .click();
        await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Selects a compound and orders a 1 or 3 month supply. Defaults to continuing the flow without
   *  selecting a compound.  Use "false" or pass nothing when ordering a namebrand and not compounds.
   *  Use "true" if ordering a compound, and then pass in semaglutide or tirzepatide and the number
   *  of months to purchase.  Skip this method if choosing not to use insurance.
   *
   * @param boolean order def: false
   * @param String compound def: blank String - Either 'semaglutide' or 'tirzepatide'
   * @param int month def: 0 - Either 1 or 3
   */
  async selectCompound(order = false, compound = '', month = 0) {
    if (!order) {
      await this.page
        .getByRole('button', { name: 'Continue without selecting' })
        .click();
      await this.page.waitForLoadState('domcontentloaded');
    } else {
      if (compound === '') {
        await this.page
          .getByRole('button', { name: 'Review treatment' })
          .click();
        await this.page.waitForLoadState('domcontentloaded');
      } else {
        switch (compound) {
          case 'semaglutide':
            await this.page
              .getByRole('button', { name: 'Review treatment' })
              .first()
              .click();
            await this.page.waitForLoadState('domcontentloaded');
            break;

          case 'tirzepatide':
            await this.page
              .getByRole('button', { name: 'Review treatment' })
              .nth(1)
              .click();
            await this.page.waitForLoadState('domcontentloaded');
            break;
        }
      }

      await this.page
        .getByRole('button', { name: 'Select medication and continue' })
        .click();

      // Page populates with 2 checkboxes named Controlled.  First is for 3 months, second is for 1
      switch (month) {
        case 3:
          await this.page
            .getByRole('radio', { name: 'controlled' })
            .first()
            .click();
          await this.page.getByRole('button', { name: 'Continue' }).click();
          await this.page.waitForLoadState('domcontentloaded');
          await this.page
            .getByLabel(
              "By proceeding, you confirm you're aware that Compound GLP-1 is not included in the price of the membership."
            )
            .check();
          await this.page.getByRole('button', { name: 'Pay $0 today' }).click();
          await this.page.waitForLoadState('domcontentloaded');
          break;

        case 1:
          await this.page
            .getByRole('radio', { name: 'controlled' })
            .nth(1)
            .click();
          await this.page.getByRole('button', { name: 'Continue' }).click();
          await this.page.waitForLoadState('domcontentloaded');
          await this.page
            .getByLabel(
              "By proceeding, you confirm you're aware that Compound GLP-1 is not included in the price of the membership."
            )
            .check();
          await this.page
            .getByRole('button', {
              name: 'Confirm order - $0 due today',
            })
            .click();
          await this.page.waitForLoadState('domcontentloaded');
          break;
      }
    }
  }

  /**
   * Skips the ID verification page.
   */
  async verifyIdentity() {
    await this.page
      .getByRole('button', { name: 'Continue and verify later' })
      .click();
    await this.page
      .getByRole('button', { name: 'Continue and verify later' })
      .click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Skips the full body photo page. If the page does not load or the ILV page shows, this method currently
   *  will redirect the user to the patient portal.
   */
  async responsesReviewed() {
    await expect(this.page).toHaveURL(
      '/post-checkout/questionnaires-v2/responses-reviewed/RESPONSES-REVIEWED-A-Q1'
    );

    try {
      await this.clickContinue();
      await this.clickContinue();
      await expect(this.page).toHaveURL('/patient-portal');
    } catch (exception) {
      await this.page.goto('/patient-portal');
      await this.page.waitForLoadState();
    }
  }

  /**
   * Uploads ID then directs patient to patient portal
   */
  async uploadId() {
    // setup file chooser
    const fileChooserPromise = this.page.waitForEvent('filechooser');

    // click upload photo of your ID for vouched
    await this.page.getByText('Upload a photo of your ID').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('../frontend-next/public/images/sailboat.jpg');

    // Continue on to patient portal
    await this.page.getByRole('button', { name: 'Use this ID' }).click();
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await this.page.getByRole('button', { name: 'Continue' }).click();

    // Assert that we reach patient portal
    await expect(this.page).toHaveURL('/patient-portal');
  }
}
