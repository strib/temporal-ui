import { expect, test } from '@playwright/test';

import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
  mockNamespaceApis,
  mockTaskQueuesApi,
  mockWorkflowApis,
  WORKFLOW_API,
} from '~/test-utilities/mock-apis';
import { mockEventHistory } from '~/test-utilities/mocks/event-history';
import {
  mockCompletedWorkflow,
  mockRunningWorkflow,
} from '~/test-utilities/mocks/workflow';

const workflowUrl = `/namespaces/default/workflows/${mockRunningWorkflow.workflowExecutionInfo.execution.workflowId}/${mockRunningWorkflow.workflowExecutionInfo.execution.runId}/history`;

const completedWorkflowForRunningRun = {
  ...mockCompletedWorkflow,
  executionConfig: {
    ...mockRunningWorkflow.executionConfig,
  },
  workflowExecutionInfo: {
    ...mockCompletedWorkflow.workflowExecutionInfo,
    execution: {
      ...mockRunningWorkflow.workflowExecutionInfo.execution,
    },
    type: {
      ...mockRunningWorkflow.workflowExecutionInfo.type,
    },
    taskQueue: mockRunningWorkflow.workflowExecutionInfo.taskQueue,
  },
  pendingActivities: [],
  pendingChildren: [],
  pendingNexusOperations: [],
  workflowExtendedInfo: {},
};

test.describe('Workflow completion confetti', () => {
  test('celebrates when the current run transitions to completed', async ({
    page,
  }) => {
    let requestCount = 0;
    let releaseHistory: () => void;
    const historyReleased = new Promise<void>((resolve) => {
      releaseHistory = resolve;
    });

    await mockNamespaceApis(page);
    await mockTaskQueuesApi(page);

    await page.route(WORKFLOW_API, async (route) => {
      const response =
        requestCount === 0 ? mockRunningWorkflow : completedWorkflowForRunningRun;
      requestCount += 1;

      await route.fulfill({ json: response });
    });

    await page.route(EVENT_HISTORY_API, async (route, request) => {
      if (request.url().includes('waitNewEvent=true')) {
        await historyReleased;
      }

      await route.fulfill({ json: mockEventHistory });
    });

    await page.route(EVENT_HISTORY_API_REVERSE, async (route) => {
      await route.fulfill({
        json: {
          ...mockEventHistory,
          history: {
            events: [...mockEventHistory.history.events].reverse(),
          },
        },
      });
    });

    await page.goto(workflowUrl);

    await expect(page.getByTestId('workflow-status')).toContainText('Running');
    await expect(page.getByTestId('workflow-completion-confetti')).toHaveCount(
      0,
    );

    releaseHistory!();

    await expect(page.getByTestId('workflow-status')).toContainText('Completed');
    await expect(page.getByTestId('workflow-completion-confetti')).toBeVisible();
    await expect(
      page.getByTestId('workflow-completion-confetti'),
    ).toHaveAttribute('data-burst', '1');
    await expect(
      page.getByTestId('workflow-completion-confetti-piece'),
    ).toHaveCount(42);
  });

  test('does not celebrate when opening an already completed run', async ({
    page,
  }) => {
    const completedWorkflow = {
      ...completedWorkflowForRunningRun,
    };

    await mockWorkflowApis(page, completedWorkflow);
    await page.goto(workflowUrl);

    await expect(page.getByTestId('workflow-status')).toContainText('Completed');
    await expect(page.getByTestId('workflow-completion-confetti')).toHaveCount(
      0,
    );
  });
});
