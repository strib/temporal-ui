import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';
import type { GetWorkflowExecutionHistoryResponse } from '$src/lib/types/events';

import { mockTaskQueuesApi } from '~/test-utilities/mocks/task-queues';
import { mockEventHistoryApi } from '~/test-utilities/mocks/event-history';
import { mockNamespaceApis } from '~/test-utilities/mock-apis';
import {
  mockCompletedWorkflow,
  mockWorkflow,
  mockWorkflowApi,
} from '~/test-utilities/mocks/workflow';
import { mockWorkflowApis } from '~/test-utilities/mock-apis';

const completedEvents = JSON.parse(
  readFileSync(new URL('../fixtures/completed-event-history.json', import.meta.url), 'utf8'),
) as GetWorkflowExecutionHistoryResponse['history']['events'];

test.describe('Workflow timeline activity replay', () => {
  test('shows replay controls for a completed workflow and starts replay', async ({
    page,
  }) => {
    const {
      workflowExecutionInfo: {
        execution: { workflowId, runId },
      },
    } = mockCompletedWorkflow;

    await mockNamespaceApis(page);
    await mockWorkflowApi(page, mockCompletedWorkflow);
    await mockEventHistoryApi(page, {
      history: { events: completedEvents },
      rawHistory: [],
      nextPageToken: null,
      archived: false,
    });
    await mockTaskQueuesApi(page);
    await page.goto(`/namespaces/default/workflows/${workflowId}/${runId}/timeline`);

    const replayButton = page.getByTestId('activity-replay-button');

    await expect(replayButton).toBeVisible();
    await expect(replayButton).toHaveText('Replay Activities');

    await replayButton.click();

    await expect(replayButton).toHaveAttribute('data-active', 'true');
    await expect(page.getByTestId('activity-replay-indicator')).toBeVisible();
  });

  test('hides replay controls for a running workflow', async ({ page }) => {
    const {
      workflowExecutionInfo: {
        execution: { workflowId, runId },
      },
    } = mockWorkflow;

    await mockWorkflowApis(page, mockWorkflow);
    await page.goto(`/namespaces/default/workflows/${workflowId}/${runId}/timeline`);

    await expect(page.getByTestId('activity-replay-button')).toBeHidden();
  });
});
