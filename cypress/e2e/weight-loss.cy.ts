const milliseconds = () => {
  return new Date().getTime();
};

const firstName = 'Jack';

describe('template spec', () => {
  it('Visit weight loss', () => {
    cy.visit('/weight-loss', {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/13.6.3 Chrome/114.0.5735.289 Electron/25.8.4 Safari/537.36',
      },
    });
    cy.get('h2', { timeout: 30000 }).should(
      'include.text',
      'What do you hope to accomplish with Zealthy?'
    );
    cy.contains('Continue').click();
    cy.get('h2').should(
      'include.text',
      'Limited Time Offer: $96 off first month of Zealthy Weight Loss Program!'
    );
    cy.contains('Continue with my offer').click();
    cy.get('h2', { timeout: 60000 }).should(
      'include.text',
      'You’re on your way to lasting weight loss.'
    );
    cy.get('#filled-adornment-email').type(
      `user-${milliseconds()}@getzealthy.com`
    );
    // cy.contains('Log in').click();
    // cy.get('h2', { timeout: 16000 }).should('include.text', 'Log in');
    // cy.get('#filled-adornment-email').type('user-1717702309515@getzealthy.com');
    cy.get('#filled-adornment-password').type('Zealthy606!');
    cy.get('form').submit();

    //region screen
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Select your state.'
    );
    cy.get('#select-state').click();
    cy.get('li[role="option"]').contains('Florida').click();
    cy.contains('Continue').click();

    //age screen
    cy.get('h2').should('include.text', 'What’s your date of birth?');
    cy.get('input[type="tel"]').type('01/01/2001');
    cy.contains('Continue').click();

    //complete profile screen
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'We’re available in your area!'
    );
    cy.get('input[autoComplete="given-name"]').type(firstName);
    cy.get('input[autoComplete="family-name"]').type('ZZZZZDaniels');
    cy.get('#select-sex-label', { timeout: 3000 })
      .parent()
      .click()
      .get('ul > li[data-value="male"]')
      .click();
    cy.get('input[type="tel"]').type('5174129642');
    cy.contains('Continue').click();

    //questionnaire-v2/weight-loss
    cy.get('h2', { timeout: 30000 }).should(
      'include.text',
      'Let’s find the safest, most effective weight loss treatment for you.'
    );
    cy.wait(3000).contains('Continue').click();

    //questionnaire-v2/weight-loss/WEIGHT_L_Q1
    cy.get('h2', { timeout: 30000 }).should(
      'include.text',
      'What’s your current height and weight?'
    );
    cy.get('input[name="feet"]').type('5');
    cy.get('input[name="inch"]').type('11');
    cy.get('input[name="pound"]').type('300');
    cy.get('form').submit();

    //questionnaire-v2/weight-loss/WEIGHT_L_Q3
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Which of the following do you have trouble with?'
    );
    cy.get('div[role="button"]').contains('None of the above').click();
    cy.contains('Continue').click();

    //questionnaire-v2/weight-loss/WEIGHT_L_Q4
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Which have you tried in the past?'
    );
    cy.get('div[role="button"]').contains('None of the above').click();
    cy.contains('Continue').click();

    //questionnaire-v2/weight-loss/WEIGHT_L_Q6
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Have you ever been diagnosed with any of the following?'
    );
    cy.get('div[role="button"]')
      .first()
      .should('include.text', 'Type 1 diabetes');
    cy.get('div[role="button"]').contains('None of the above').click();
    cy.contains('Continue').click();

    //questionnaire-v2/weight-loss/WEIGHT_L_Q7
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Have you ever been diagnosed with any of the following?'
    );
    cy.get('div[role="button"]')
      .first()
      .should('include.text', 'Type 2 diabetes');
    cy.get('div[role="button"]').contains('None of the above').click();
    cy.contains('Continue').click();

    //questionnaire-v2/weight-loss/WEIGHT_L_Q8
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Do you, your siblings, or your parents have a history of the following conditions?'
    );
    cy.get('div[role="button"]').contains('None of the above').click();
    cy.contains('Continue').click();

    //questionnaire-v2/weight-loss/WEIGHT_L_Q9
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Are you allergic to any medications?'
    );
    cy.get('div[role="button"]').contains('No').click();

    //questionnaire-v2/weight-loss/WEIGHT_L_Q11
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Are you currently taking any of the medications below?'
    );
    cy.get('div[role="button"]').contains('None of the above').click();
    cy.contains('Continue').click();

    //questionnaire-v2/weight-loss/WEIGHT_L_Q12
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'What’s your resting heart rate?'
    );
    cy.get('input[type="text"]').type('123');
    cy.contains('Continue').click();

    //questionnaires-v2/weight-loss/ATTENTION_HEART_RATE
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Are you sure that you entered your heart rate correctly?'
    );
    cy.contains('Continue').click();

    //questionnaire-v2/weight-loss/WEIGHT-COACHING-Q1A
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Do you have government insurance?'
    );
    cy.get('button').contains('No').click();

    //questionnaire-v2/weight-loss/WEIGHT-COACHING-Q2
    cy.get('h2', { timeout: 30000 }).should(
      'include.text',
      'GLP-1 medication such as Wegovy, Zepbound, or Ozempic is essential to an effective weight loss program.'
    );
    cy.contains('Tell me more').click();

    //questionnaire-v2/weight-loss/WEIGHT-COACHING-Q3
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Zealthy’s weight loss program includes:'
    );
    cy.wait(3000).contains('Continue').click();

    //questionnaire-v2/weight-loss/RESULTS
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      `Congratulations, ${firstName}!`
    );
    cy.contains('Continue').click();

    //what-next
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Next, you’ll be able to enter your payment details for $96 off your first month of Zealthy Weight Loss!'
    );
    cy.wait(500).contains('Continue').click();

    //checkout
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'We predict you will lose 60 pounds.'
    );
    cy.fillElementsInput('cardNumber', '4242424242424242');
    cy.fillElementsInput('cardExpiry', '1025');
    cy.fillElementsInput('cardCvc', '123');
    cy.fillElementsInput('postalCode', '90210');

    cy.get('button[type="Submit"]').contains('Get started for $39').click();

    //post-checkout/questionnaires-v2/weight-loss-checkout-success/WEIGHT_LOSS_CHECKOUT_S_Q1
    cy.get('h2', { timeout: 32000 }).should(
      'include.text',
      'Now that you’ve successfully submitted payment, continue to complete your required ID verification and answer some additional required questions.'
    );

    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/pharmacy-preference/PHARMACY_P_Q1
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Choose a pharmacy'
    );
    cy.get('button').contains('Skip this step').click();

    //post-checkout/questionnaires-v2/delivery-address/DELIVERY-A-Q1
    cy.get('h2', { timeout: 16000 }).should('include.text', 'Home address');
    cy.get('#address-line-1').type('429 Lenox ave');
    cy.get('#city').type('Miami');
    cy.get('#state').click();
    cy.get('li[role="option"]').contains('Florida').click();
    cy.get('#zip-code').type('33139');
    cy.get('button').contains('Continue').click();

    cy.get('h3')
      .should('include.text', 'Verify your address')
      .should('be.visible');

    cy.get('button')
      .contains('Use selected address')
      .should('be.visible')
      .click();

    //post-checkout/questionnaires-v2/insurance-information/INSURANCE-INFORMATION-A-Q1
    cy.get('h2', { timeout: 30000 }).should(
      'include.text',
      'Confirm your insurance information, or let us know if you do not plan to use insurance.'
    );
    cy.get('button').contains('Continue without uploading').click();

    //post-checkout/questionnaires-v2/weight-loss-medical/WEIGHT-LOSS-MEDICAL-A-Q1
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Next, you’ll answer questions about your medical history.'
    );

    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_LOSS_MEDICAL_HISTORY_Q1
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Do you currently have any other medical conditions besides those that you have already shared with us?'
    );

    cy.get('textarea').first().type('N/A');
    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q1
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Have you previously had any of the following weight loss surgeries?'
    );

    cy.get('div[role="button"]')
      .contains('No, I haven’t had any of the above surgeries')
      .click();
    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q2
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Do you have a history of kidney disease or abnormal kidney function?'
    );

    cy.get('div[role="button"]').contains('No').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q3
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Which of the following medications have you used?'
    );

    cy.get('div[role="button"]').contains('None of the above').click();
    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q4
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Which GLP-1 medications have you taken?'
    );

    cy.get('div[role="button"]').contains('None of the above').click();
    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q5
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Do you currently take any medications or supplements?'
    );

    cy.get('textarea').first().type('N/A');
    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q6
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Have you felt depressed in the past month?'
    );

    cy.get('div[role="button"]').contains('No').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q7
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'In the past year, have you made yourself vomit to lose weight?'
    );

    cy.get('div[role="button"]').contains('No').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q8
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'In the past year, have you taken more than the recommended dose of a medication to lose weight?'
    );

    cy.get('div[role="button"]').contains('No').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q9
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'In the past six months, did you ever excessively fast or exercise with the significant fear of weight change if you did not perform the fast or exercise?'
    );

    cy.get('div[role="button"]').contains('No').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q10
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Have you tried a weight management program for at least 6 months within the past year? (e.g. Noom, Weight Watchers)'
    );

    cy.get('div[role="button"]').contains('No').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q11
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Please describe your weight loss journey.'
    );

    cy.get('textarea').first().type('N/A');
    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q12
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'What have you previously tried for weight loss? What has or hasn’t worked?'
    );

    cy.get('textarea').first().type('N/A');
    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/weight-loss-post/LAB-OR-BLOOD-TESTS-A-Q1
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Do you have lab or blood tests from the past 12 months?'
    );

    cy.get('div[role="button"]').contains('Skip and upload later').click();

    //post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q13
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'What race do you identify with?'
    );

    cy.get('div[role="button"]').contains('White').click();
    cy.get('div[role="button"]').contains('Black or African American').click();
    cy.get('div[role="button"]').contains('Asian').click();
    cy.get('div[role="button"]')
      .contains('American Indian or Alaska Native')
      .click();
    cy.get('div[role="button"]')
      .contains('Native Hawaiian or other Pacific Islander')
      .click();
    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/weight-loss-preference/WEIGHT-LOSS-PREFERENCE-A-Q1
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'You’re almost done! Now that you have completed your medical intake, we’d like to better understand your Rx preferences.'
    );

    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/weight-loss-pay/WEIGHT-LOSS-PAY-A-Q1
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'We make GLP-1 medication affordable for you & ship to your door.'
    );

    cy.get('button')
      .contains('Continue to specify requested medication')
      .click();

    //post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Select a preferred treatment option.'
    );

    cy.get('button').contains('Continue without selecting').click();

    //post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1?id=compound&type=skip
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Want to get started on lasting weight loss more quickly? You can order semaglutide or tirzepatide without insurance delays.'
    );

    cy.get('button').contains('Continue without selecting').click();

    //post-checkout/questionnaires-v2/weight-loss-bill-of-rights/WEIGHT_LOSS_BOR-Q1
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'You’re almost there! Please confirm that you’ve read the below in order to continue to lasting weight loss.'
    );

    cy.get('input[type="checkbox"]').click();

    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/identity-verification/IDENTITY-V-Q1
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Verify your identity to receive your treatment plan.'
    );

    cy.get('button').contains('Continue and verify later').click();

    cy.get('h5')
      .should(
        'include.text',
        'Before your provider reviews your responses and is able to write a GLP-1 medication prescription, you must verify your identity.'
      )
      .should('be.visible')
      .parent()
      .find('button')
      .contains('Continue and verify later')
      .click();

    //post-checkout/questionnaires-v2/responses-reviewed/RESPONSES-REVIEWED-A-Q1
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'How did you hear about us?'
    );

    cy.get('div[role="button"]').contains('Another website').click();

    cy.get('button').contains('Continue').click();

    //post-checkout/questionnaires-v2/responses-reviewed/RESPONSES-REVIEWED-A-Q1
    cy.get('h2', { timeout: 16000 }).should(
      'include.text',
      'Your responses are being reviewed!'
    );

    cy.get('button').contains('Continue').click();

    //patient-portal
    cy.location('pathname', { timeout: 16000 }).should('eq', '/patient-portal');

    cy.visit('/patient-portal/profile');

    cy.get('h2', { timeout: 30000 }).should('include.text', 'Zealthy Profile');
    cy.get('h3').should('include.text', 'Default delivery address');
    cy.get('h3')
      .contains('Default delivery address')
      .siblings()
      .first()
      .children()
      .should('have.length', 5);
    cy.get('h3')
      .contains('Default delivery address')
      .siblings()
      .first()
      .children()
      .first()
      .should('include.text', '429 LENOX AVE');

    cy.visit('/patient-portal/weight-loss-treatment/compound');

    cy.get('h2', { timeout: 30000 }).should(
      'include.text',
      'Confirm your preferred treatment option.'
    );
  });
});

export {};
