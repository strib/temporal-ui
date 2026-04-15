import { expect, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockCompletedWorkflow, mockWorkflow } from '~/test-utilities/mocks/workflow';

test.describe('Workflow timeline activity replay', () => {
  test('shows replay controls for a completed workflow and starts replay', async ({
    page,
  }) => {
    const {
      workflowExecutionInfo: {
        execution: { workflowId, runId },
      },
    } = mockCompletedWorkflow;

    await mockWorkflowApis(page, mockCompletedWorkflow);
    await page.goto(`/namespaces/default/workflows/${workflowId}/${runId}/timeline`);

    const replayButton = page.getByTestId('activity-replay-button');

    await expect(replayButton).toBeVisible();
    await expect(replayButton).toHaveText('Replay Activities');

    await replayButton.click();

    await expect(replayButton).toHaveText('Stop Replay');
    await expect(page.getByTestId('activity-replay-indicator')).toBeVisible();
  });

  test('hides replay controls for a running workflow', async ({ page }) => {
    const {
      workflowExecutionInfo: {
        execution: { workflowId, runId },
      },
    } = mockWorkflow;

    await mockWorkflowApis(page, mockWorkflow);
    await page.goto(`/namespaces/default/workflows/${workflowId}/${runId}/timeline`);

    await expect(page.getByTestId('activity-replay-button')).toBeHidden();
  });
});
