import { expect, test } from '@playwright/test';

import {
  mockEventHistoryApi,
  mockNamespaceApis,
  mockTaskQueuesApi,
  WORKFLOW_API,
} from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const {
  workflowExecutionInfo: {
    execution: { workflowId, runId },
  },
} = mockWorkflow;

const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;
const completedWorkflow = {
  ...mockWorkflow,
  workflowExecutionInfo: {
    ...mockWorkflow.workflowExecutionInfo,
    closeTime: '2026-05-05T22:04:00Z',
    status: 'Completed',
  },
  pendingActivities: [],
};

test.describe('Workflow completion confetti', () => {
  test('fires when a running workflow completes while viewing the workflow page', async ({
    page,
  }) => {
    test.setTimeout(25_000);

    await Promise.all([
      mockNamespaceApis(page),
      mockTaskQueuesApi(page),
      mockEventHistoryApi(page),
    ]);

    let workflowRequests = 0;
    await page.route(WORKFLOW_API, (route) => {
      workflowRequests += 1;
      return route.fulfill({
        json: workflowRequests === 1 ? mockWorkflow : completedWorkflow,
      });
    });

    await page.goto(workflowUrl);

    const confetti = page.getByTestId('workflow-completion-confetti');
    await expect(confetti).toHaveAttribute('data-active', 'false');
    await expect(page.getByTestId('workflow-status')).toContainText('Running');

    await expect(page.getByTestId('workflow-status')).toContainText(
      'Completed',
      { timeout: 15_000 },
    );
    await expect(confetti).toHaveAttribute('data-active', 'true');
  });
});
