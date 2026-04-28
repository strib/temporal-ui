import { expect, test } from '@playwright/test';

import {
  mockEventHistoryApi,
  mockNamespaceApi,
  mockNamespaceApis,
  mockTaskQueuesApi,
} from '~/test-utilities/mock-apis';
import type { WorkflowExecutionAPIResponse } from '$src/lib/types/workflows';

import {
  mockRunningWorkflow,
  WORKFLOW_API,
} from '~/test-utilities/mocks/workflow';

test.describe('Workflow completed confetti', () => {
  const completedSameRun: WorkflowExecutionAPIResponse = {
    ...mockRunningWorkflow,
    workflowExecutionInfo: {
      ...mockRunningWorkflow.workflowExecutionInfo,
      status: 'Completed',
      closeTime: '2022-04-28T06:00:00.000Z',
    },
  };

  const {
    workflowExecutionInfo: {
      execution: { workflowId, runId },
    },
  } = mockRunningWorkflow;

  const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}`;

  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    let workflowFetchCount = 0;
    await page.route(WORKFLOW_API, (route) => {
      workflowFetchCount += 1;
      const json =
        workflowFetchCount === 1 ? mockRunningWorkflow : completedSameRun;
      return route.fulfill({ json });
    });
    await Promise.all([
      mockNamespaceApis(page),
      mockNamespaceApi(page),
      mockEventHistoryApi(page),
      mockTaskQueuesApi(page),
    ]);
  });

  test('adds a confetti canvas after status becomes Completed', async ({
    page,
  }) => {
    await page.goto(workflowUrl, { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('workflow-status')).toContainText('Running');

    await page.clock.fastForward(11_000);

    await expect(page.getByTestId('workflow-status')).toContainText(
      'Completed',
      { timeout: 15_000 },
    );

    await expect(page.locator('canvas').first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
