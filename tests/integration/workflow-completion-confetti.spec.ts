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

const workflowId =
  mockRunningWorkflow.workflowExecutionInfo.execution.workflowId;
const runId = mockRunningWorkflow.workflowExecutionInfo.execution.runId;
const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;
const completedWorkflow = {
  ...mockCompletedWorkflow,
  workflowExecutionInfo: {
    ...mockCompletedWorkflow.workflowExecutionInfo,
    execution: {
      workflowId,
      runId,
    },
    taskQueue: mockRunningWorkflow.workflowExecutionInfo.taskQueue,
  },
};

test.describe('Workflow completion confetti', () => {
  test('blasts confetti when a running workflow completes', async ({
    page,
  }) => {
    await Promise.all([
      mockNamespaceApis(page),
      mockEventHistoryApi(page),
      mockTaskQueuesApi(page),
    ]);

    let workflowRequestCount = 0;
    await page.route(WORKFLOW_API, (route) => {
      workflowRequestCount += 1;
      return route.fulfill({
        json:
          workflowRequestCount === 1 ? mockRunningWorkflow : completedWorkflow,
      });
    });

    await page.goto(workflowUrl);
    await expect(page.getByTestId('workflow-status')).toContainText('Running');
    await expect(page.getByTestId('workflow-status')).toContainText(
      'Completed',
    );

    const confettiPixelCount = await page
      .getByTestId('workflow-completion-confetti')
      .evaluate((canvas: HTMLCanvasElement) => {
        const context = canvas.getContext('2d');
        if (!context) return 0;

        const image = context.getImageData(0, 0, canvas.width, canvas.height);
        let pixels = 0;
        for (let index = 3; index < image.data.length; index += 4) {
          if (image.data[index] > 0) pixels += 1;
        }
        return pixels;
      });

    expect(confettiPixelCount).toBeGreaterThan(0);
  });
});
