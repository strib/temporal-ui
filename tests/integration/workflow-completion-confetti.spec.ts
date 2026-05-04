import { expect, test } from '@playwright/test';

import {
  mockEventHistoryApi,
  mockNamespaceApi,
  mockNamespaceApis,
  mockTaskQueuesApi,
  WORKFLOW_API,
} from '~/test-utilities/mock-apis';
import {
  mockCompletedWorkflow,
  mockRunningVersionOfCompletedWorkflow,
} from '~/test-utilities/mocks/workflow';

test.describe('Workflow completion confetti', () => {
  const {
    workflowExecutionInfo: {
      execution: { workflowId, runId },
    },
  } = mockCompletedWorkflow;

  const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}/history`;

  test('fires confetti when status transitions to Completed', async ({
    page,
  }) => {
    let workflowPayload:
      | typeof mockRunningVersionOfCompletedWorkflow
      | typeof mockCompletedWorkflow = mockRunningVersionOfCompletedWorkflow;

    await mockNamespaceApis(page);
    await mockNamespaceApi(page);
    await page.route(WORKFLOW_API, (route) => {
      return route.fulfill({ json: workflowPayload });
    });
    await mockEventHistoryApi(page);
    await mockTaskQueuesApi(page);

    await page.goto(workflowUrl);

    await expect(page.getByTestId('workflow-status')).toContainText('Running');

    workflowPayload = mockCompletedWorkflow;

    const completedWorkflowResponse = page.waitForResponse(async (response) => {
      if (!WORKFLOW_API.test(response.url())) return false;
      try {
        const body = (await response.json()) as {
          workflowExecutionInfo?: { status?: string };
        };
        return (
          body.workflowExecutionInfo?.status ===
          'WORKFLOW_EXECUTION_STATUS_COMPLETED'
        );
      } catch {
        return false;
      }
    });

    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('temporal-test-trigger-workflow-refresh'),
      );
    });

    await completedWorkflowResponse;

    await expect(page.getByTestId('workflow-status')).toContainText(
      'Completed',
    );

    await expect(page.locator('canvas').first()).toBeVisible({
      timeout: 8000,
    });
  });
});
