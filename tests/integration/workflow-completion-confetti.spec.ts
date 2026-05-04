import { expect, test } from '@playwright/test';

import {
  mockEventHistoryApi,
  mockNamespaceApis,
  mockTaskQueuesApi,
  mockWorkflowApiSequence,
} from '~/test-utilities/mock-apis';
import {
  mockCompletedWorkflow,
  mockRunningWorkflow,
} from '~/test-utilities/mocks/workflow';

const workflowUrl = `/namespaces/default/workflows/${mockRunningWorkflow.workflowExecutionInfo.execution.workflowId}/${mockRunningWorkflow.workflowExecutionInfo.execution.runId}/history`;

test('blasts confetti when a workflow reaches completion', async ({ page }) => {
  await Promise.all([
    mockNamespaceApis(page),
    mockTaskQueuesApi(page),
    mockEventHistoryApi(page),
    mockWorkflowApiSequence(page, [mockRunningWorkflow, mockCompletedWorkflow]),
  ]);

  await page.goto(workflowUrl);

  await expect(page.getByTestId('workflow-status')).toContainText('Running');
  await expect(page.getByTestId('workflow-completion-confetti')).toBeHidden();

  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'));
  });

  await expect(page.getByTestId('workflow-status')).toContainText('Completed');
  await expect(page.getByTestId('workflow-completion-confetti')).toBeVisible();
  await expect(page.locator('.confetti-piece')).toHaveCount(96);
});
