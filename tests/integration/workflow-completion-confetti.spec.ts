import { expect, test } from '@playwright/test';

import {
  mockEventHistoryApi,
  mockNamespaceApis,
  mockTaskQueuesApi,
} from '~/test-utilities/mock-apis';
import {
  mockCompletedWorkflow,
  mockWorkflow,
  WORKFLOW_API,
} from '~/test-utilities/mocks/workflow';

const completedWorkflowForRun = {
  ...mockCompletedWorkflow,
  workflowExecutionInfo: {
    ...mockCompletedWorkflow.workflowExecutionInfo,
    execution: mockWorkflow.workflowExecutionInfo.execution,
  },
};

test('bursts confetti when a running workflow transitions to completed', async ({
  page,
}) => {
  const {
    workflowExecutionInfo: {
      execution: { workflowId, runId },
    },
  } = mockWorkflow;
  const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}`;
  let requestCount = 0;

  await page.clock.install();
  await Promise.all([
    mockNamespaceApis(page),
    mockEventHistoryApi(page),
    mockTaskQueuesApi(page),
  ]);
  await page.route(WORKFLOW_API, (route) => {
    requestCount += 1;
    return route.fulfill({
      json: requestCount < 3 ? mockWorkflow : completedWorkflowForRun,
    });
  });

  await page.goto(workflowUrl);
  await expect(page.getByTestId('workflow-status')).toContainText('Running');
  await expect(page.getByTestId('workflow-completion-confetti')).toBeHidden();

  await page.clock.fastForward(16000);

  await expect(page.getByTestId('workflow-status')).toContainText('Completed');
  await expect(page.getByTestId('workflow-completion-confetti')).toBeVisible();
});
