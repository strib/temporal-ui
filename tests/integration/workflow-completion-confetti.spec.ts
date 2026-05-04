import { expect, test } from '@playwright/test';

import {
  mockEventHistoryApi,
  mockNamespaceApis,
  mockTaskQueuesApi,
  WORKFLOW_API,
} from '~/test-utilities/mock-apis';
import {
  mockCompletedWorkflow,
  mockRunningWorkflow,
} from '~/test-utilities/mocks/workflow';

test.describe('Workflow completion confetti', () => {
  const {
    workflowExecutionInfo: {
      execution: { workflowId, runId },
    },
  } = mockRunningWorkflow;

  const completedResponse = {
    ...mockCompletedWorkflow,
    workflowExecutionInfo: {
      ...mockCompletedWorkflow.workflowExecutionInfo,
      execution: { workflowId, runId },
    },
  };

  test('fires confetti when a running workflow becomes completed', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.clock.install();
    let workflowPollCount = 0;

    await mockNamespaceApis(page);
    await mockEventHistoryApi(page);
    await mockTaskQueuesApi(page);
    await page.route(WORKFLOW_API, async (route) => {
      workflowPollCount += 1;
      const json =
        workflowPollCount === 1 ? mockRunningWorkflow : completedResponse;
      await route.fulfill({ json });
    });

    await page.goto(
      `/namespaces/default/workflows/${workflowId}/${runId}/history`,
    );
    await page.clock.fastForward(11_000);

    await expect
      .poll(() => page.locator('body canvas').count(), { timeout: 20_000 })
      .toBeGreaterThan(0);
  });
});
