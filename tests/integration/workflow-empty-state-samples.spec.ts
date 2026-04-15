import { expect, test } from '@playwright/test';

import {
  mockClusterApi,
  mockWorkflowsApis,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';

test.describe('Workflow list empty state sample repos', () => {
  test.beforeEach(async ({ page }) => {
    await mockClusterApi(page, {
      visibilityStore: 'elasticsearch',
      persistenceStore: 'postgres,elasticsearch',
    });
    await mockWorkflowsApis(page, { empty: true });
    await page.goto('/namespaces/default/workflows');
    await waitForWorkflowsApis(page);
  });

  test('lists TypeScript sample repo first', async ({ page }) => {
    const sampleLinks = page.locator(
      'a[href="https://github.com/temporalio/samples-typescript"]',
    );
    await expect(sampleLinks.first()).toBeVisible();

    const firstSampleHref = await page
      .locator('a[href^="https://github.com/temporalio/samples-"]')
      .first()
      .getAttribute('href');

    expect(firstSampleHref).toBe(
      'https://github.com/temporalio/samples-typescript',
    );
  });
});
