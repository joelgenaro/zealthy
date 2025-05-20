const { test, expect } = require('@playwright/test');

export class CompoundRefill {
  page: any;

  constructor(page: any) {
    this.page = page;
  }

  async login(email: String) {
    await this.page.getByLabel('Email address *').fill(email);
    await this.page.getByLabel('Password *').fill(process.env.PASSWORD);
    await this.page.getByRole('button', { name: 'Log in' }).click();
  }

  async goToRefill() {
    try {
      await this.page.getByRole('button', { name: 'Close modal' }).click();
    } catch (exception) {}

    await this.page
      .getByRole('listitem')
      .filter({ hasText: 'Request weight loss Rx refill' })
      .getByRole('button')
      .click();
  }

  async goThroughFlow() {
    await expect(
      this.page.getByRole('heading', {
        name: 'Let’s help you with your refill. Just answer a few questions and your Zealthy care team will help with your refill in 1-3 business days.',
      })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Continue' }).click();

    await expect(
      this.page.getByRole('heading', {
        name: 'What’s your current weight?',
      })
    ).toBeVisible();
    await this.page.getByPlaceholder('lbs').fill('188');
    await this.page.getByRole('button', { name: 'Continue' }).click();

    //await expect(this.page.getByRole('heading', { name: 'Are you happy with your current medication?' })).toBeVisible();
    await this.page.getByRole('button', { name: 'Yes' }).click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Are you currently experiencing any side effects from your weight loss medication?',
      })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'No' }).click();
    await this.page.getByRole('button', { name: 'Continue' }).click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Tell us anything else you’d like your provider to know when refilling your medication.',
      })
    ).toBeVisible();
    await this.page.getByPlaceholder('Type here...').fill('automation test');
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async increaseDosage() {
    await this.page
      .getByRole('button', { name: 'Increase your dosage' })
      .click();
  }

  async sameDosage() {
    await this.page
      .getByRole('button', { name: 'Keep the same dosage' })
      .click();
  }

  async oneMonthIncrease() {
    await this.page.getByRole('radio').nth(1).click();
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await expect(
      this.page.getByRole('heading', { name: '$265', exact: true })
    ).toBeVisible();
  }

  async threeMonthIncrease() {
    await this.page.getByRole('radio').nth(0).click();
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await expect(
      this.page.getByText('$849(Only due if prescribed*)')
    ).toBeVisible();
  }

  async oneMonthSame() {
    await expect(
      this.page.getByRole('heading', { name: '$299', exact: true })
    ).toBeVisible();
  }

  async threeMonthSame() {
    await expect(
      this.page.getByText('$650(Only due if prescribed*)')
    ).toBeVisible();
  }
}
