import { expect, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  mockCompletedWorkflow,
  mockRunningWorkflow,
  WORKFLOW_API,
} from '~/test-utilities/mocks/workflow';

const {
  workflowExecutionInfo: {
    execution: { workflowId, runId },
  },
} = mockRunningWorkflow;

const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;

test('blasts confetti when a workflow reaches completion', async ({ page }) => {
  let workflowRequestCount = 0;

  await mockWorkflowApis(page, mockRunningWorkflow);
  await page.unroute(WORKFLOW_API);
  await page.route(WORKFLOW_API, (route) => {
    workflowRequestCount += 1;
    return route.fulfill({
      json:
        workflowRequestCount === 1
          ? mockRunningWorkflow
          : {
              ...mockCompletedWorkflow,
              workflowExecutionInfo: {
                ...mockCompletedWorkflow.workflowExecutionInfo,
                execution: { workflowId, runId },
              },
            },
    });
  });

  await page.goto(workflowUrl);

  await expect(page.getByTestId('workflow-status')).toHaveText('Running');
  await expect(page.getByTestId('workflow-completion-confetti')).toBeHidden();

  await expect(page.getByTestId('workflow-status')).toHaveText('Completed');
  await expect(page.getByTestId('workflow-completion-confetti')).toBeVisible();
  await expect(
    page.getByTestId('workflow-completion-confetti-piece'),
  ).toHaveCount(140);
});
