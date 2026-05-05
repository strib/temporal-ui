import { expect, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockCompletedWorkflow } from '~/test-utilities/mocks/workflow';

const workflowUrl = `/namespaces/default/workflows/${mockCompletedWorkflow.workflowExecutionInfo.execution.workflowId}/${mockCompletedWorkflow.workflowExecutionInfo.execution.runId}/history`;

test.describe('Workflow completion confetti', () => {
  test('shows celebratory confetti for completed workflows', async ({
    page,
  }) => {
    await page.goto(workflowUrl);
    await mockWorkflowApis(page, mockCompletedWorkflow);

    const confetti = page.getByTestId('workflow-completion-confetti');

    await expect(confetti).toBeVisible();
    await expect(page.getByTestId('workflow-status')).toContainText(
      'Completed',
    );

    await expect(confetti).toBeHidden({ timeout: 5000 });

    await expect(confetti).toHaveCount(0);
  });
});
