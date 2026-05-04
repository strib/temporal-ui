import { expect, test } from '@playwright/test';

import {
  mockEventHistoryApi,
  mockGlobalApis,
  mockNamespaceApi,
  mockTaskQueuesApi,
  mockWorkflowApi,
} from '~/test-utilities/mock-apis';
import {
  mockCompletedWorkflow,
  mockWorkflow,
  WORKFLOW_API,
} from '~/test-utilities/mocks/workflow';

const workflowUrl = `/namespaces/default/workflows/${mockWorkflow.workflowExecutionInfo.execution.workflowId}/${mockWorkflow.workflowExecutionInfo.execution.runId}/history`;

const openWorkflowHistoryPage = async (page) => {
  await mockGlobalApis(page);
  await mockNamespaceApi(page);
  await mockWorkflowApi(page);
  await mockTaskQueuesApi(page);
  await mockEventHistoryApi(page);
  await page.goto(workflowUrl);
};

test.describe('Workflow History', () => {
  test('Workflow Execution shows WorkflowId and all sections and event history', async ({
    page,
  }) => {
    await openWorkflowHistoryPage(page);
    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      '09db15_Running Click to copy content',
    );
    await expect(page.getByTestId('timeline-tab')).toBeVisible();
    await expect(page.getByTestId('history-tab')).toBeVisible();
    await expect(page.getByTestId('workers-tab')).toBeVisible();
    await expect(page.getByTestId('relationships-tab')).toBeVisible();
    await expect(page.getByTestId('pending-activities-tab')).toBeVisible();
    await expect(page.getByTestId('call-stack-tab')).toBeVisible();
    await expect(page.getByTestId('queries-tab')).toBeVisible();
    await expect(page.getByTestId('input-and-result')).toBeVisible();
    await expect(page.getByTestId('feed')).toBeVisible();
    await expect(page.getByTestId('compact')).toBeVisible();
    await expect(page.getByTestId('json')).toBeVisible();
    await expect(page.getByTestId('event-summary-table')).toBeVisible();

    const firstRow = page.getByTestId('event-summary-row').first();
    await firstRow.click();

    const firstRowId = firstRow.getByTestId('link');
    await firstRowId.click();

    await openWorkflowHistoryPage(page);

    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      '09db15_Running Click to copy content',
    );
  });

  test('Workflow Execution links to specific event', async ({ page }) => {
    await openWorkflowHistoryPage(page);
    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      '09db15_Running Click to copy content',
    );

    const firstRow = page.getByTestId('event-summary-row').first();
    await firstRow.click();

    const firstRowId = firstRow.getByTestId('link');
    await firstRowId.click();

    await openWorkflowHistoryPage(page);

    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      '09db15_Running Click to copy content',
    );

    await expect(page.getByTestId('timeline-tab')).toBeVisible();
    await expect(page.getByTestId('history-tab')).toBeVisible();
    await expect(page.getByTestId('workers-tab')).toBeVisible();
    await expect(page.getByTestId('relationships-tab')).toBeVisible();
    await expect(page.getByTestId('pending-activities-tab')).toBeVisible();
    await expect(page.getByTestId('call-stack-tab')).toBeVisible();
    await expect(page.getByTestId('queries-tab')).toBeVisible();
    await expect(page.getByTestId('event-summary-log')).toBeVisible();

    await page.getByTestId('history-tab').click();

    await expect(page.getByTestId('timeline-tab')).toBeVisible();
    await expect(page.getByTestId('history-tab')).toBeVisible();
    await expect(page.getByTestId('workers-tab')).toBeVisible();
    await expect(page.getByTestId('relationships-tab')).toBeVisible();
    await expect(page.getByTestId('pending-activities-tab')).toBeVisible();
    await expect(page.getByTestId('call-stack-tab')).toBeVisible();
    await expect(page.getByTestId('queries-tab')).toBeVisible();
    await expect(page.getByTestId('input-and-result')).toBeVisible();
    await expect(page.getByTestId('feed')).toBeVisible();
    await expect(page.getByTestId('compact')).toBeVisible();
    await expect(page.getByTestId('json')).toBeVisible();
    await expect(page.getByTestId('event-summary-table')).toBeVisible();
  });

  test('celebrates when a running workflow completes', async ({ page }) => {
    let workflowRequestCount = 0;

    await page.route(WORKFLOW_API, (route) => {
      workflowRequestCount += 1;

      return route.fulfill({
        json:
          workflowRequestCount === 1
            ? mockWorkflow
            : {
                ...mockCompletedWorkflow,
                workflowExecutionInfo: {
                  ...mockCompletedWorkflow.workflowExecutionInfo,
                  execution: {
                    workflowId:
                      mockWorkflow.workflowExecutionInfo.execution.workflowId,
                    runId: mockWorkflow.workflowExecutionInfo.execution.runId,
                  },
                },
              },
      });
    });

    await mockGlobalApis(page);
    await mockNamespaceApi(page);
    await mockTaskQueuesApi(page);
    await mockEventHistoryApi(page);
    await page.goto(workflowUrl);

    await expect(page.getByTestId('workflow-status')).toContainText(
      'Completed',
    );

    const confetti = page.getByTestId('workflow-completion-confetti');
    await expect(confetti).toBeVisible();
    await expect(confetti.getByTestId('workflow-confetti-piece')).toHaveCount(
      28,
    );
  });
});
