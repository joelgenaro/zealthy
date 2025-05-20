import { test, expect } from '@playwright/test';
import { CompoundRefill } from './flows/compound-refill';

// TEST SETUP *****************************************************

test.describe.configure({
  mode: 'serial',
  retries: 3,
  timeout: 360000,
});

test('One Month Increase Dosage Refill', async ({ page }) => {
  const Refill = new CompoundRefill(page);

  await page.goto('/login');
  await Refill.login('automation+797012788@getzealthy.com');
  await Refill.goToRefill();
  await Refill.goThroughFlow();
  await Refill.increaseDosage();
  await Refill.oneMonthIncrease();
});

test('One Month Same Dosage Refill', async ({ page }) => {
  const Refill = new CompoundRefill(page);

  await page.goto('/login');
  await Refill.login('automation+342817099@getzealthy.com');
  await Refill.goToRefill();
  await Refill.goThroughFlow();
  await Refill.sameDosage();
  await Refill.oneMonthSame();
});

test('Three Month Increase Dosage Refill', async ({ page }) => {
  const Refill = new CompoundRefill(page);

  await page.goto('/login');
  await Refill.login('automation+686646348@getzealthy.com');
  await Refill.goToRefill();
  await Refill.goThroughFlow();
  await Refill.increaseDosage();
  await Refill.threeMonthIncrease();
});

test('Three Month Same Dosage Refill', async ({ page }) => {
  const Refill = new CompoundRefill(page);

  await page.goto('/login');
  await Refill.login('automation+352819907@getzealthy.com');
  await Refill.goToRefill();
  await Refill.goThroughFlow();
  await Refill.sameDosage();
  await Refill.threeMonthSame();
});
