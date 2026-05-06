import { expect, test } from '@playwright/test';

import type { WorkflowExecutionAPIResponse } from '$src/lib/types/workflows';
import {
  mockEventHistoryApi,
  mockNamespaceApis,
  mockTaskQueuesApi,
  WORKFLOW_API,
} from '~/test-utilities/mock-apis';
import { mockRunningWorkflow } from '~/test-utilities/mocks/workflow';

const {
  workflowExecutionInfo: {
    execution: { workflowId, runId },
  },
} = mockRunningWorkflow;

const completedWorkflow = {
  ...mockRunningWorkflow,
  workflowExecutionInfo: {
    ...mockRunningWorkflow.workflowExecutionInfo,
    closeTime: '2022-04-28T05:50:51.264756929Z',
    status: 'WORKFLOW_EXECUTION_STATUS_COMPLETED',
  },
  pendingActivities: [],
} satisfies WorkflowExecutionAPIResponse;

const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;

test('blasts confetti when a workflow reaches completion', async ({ page }) => {
  let workflowRequestCount = 0;

  await page.clock.install();
  await Promise.all([
    mockNamespaceApis(page),
    mockEventHistoryApi(page),
    mockTaskQueuesApi(page),
    page.route(WORKFLOW_API, (route) => {
      workflowRequestCount += 1;

      return route.fulfill({
        json:
          workflowRequestCount === 1 ? mockRunningWorkflow : completedWorkflow,
      });
    }),
  ]);

  await page.goto(workflowUrl);

  await expect(page.getByTestId('workflow-status')).toContainText('Running');
  await expect(page.getByTestId('workflow-completion-confetti')).toHaveCount(0);

  await page.clock.fastForward(10_000);

  await expect(page.getByTestId('workflow-status')).toContainText('Completed');
  await expect(page.getByTestId('workflow-completion-confetti')).toBeVisible();
  await expect(
    page.getByTestId('workflow-completion-confetti').locator('span'),
  ).toHaveCount(120);
});
