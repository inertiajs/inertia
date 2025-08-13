import { test, expect } from '@playwright/test';
import { resetFormFields } from '../../packages/core/src/resetFormFields'

test.describe('resetFormFields', () => {
  test.beforeEach(async ({ page }) => {
    // Create a comprehensive test form
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <form id="testForm">
            <input type="text" name="textField" value="default text" />
            <input type="email" name="emailField" value="default@example.com" />
            <input type="number" name="numberField" value="42" />

            <input type="checkbox" name="checkbox1" checked />
            <input type="checkbox" name="checkbox2" />

            <input type="radio" name="radioGroup" value="option1" checked />
            <input type="radio" name="radioGroup" value="option2" />

            <select name="selectField">
              <option value="opt1">Option 1</option>
              <option value="opt2" selected>Option 2</option>
              <option value="opt3">Option 3</option>
            </select>

            <textarea name="textareaField">Default textarea content</textarea>

            <input type="file" name="fileField" />
          </form>
        </body>
      </html>
    `);

    // Inject the function into the page
    await page.addScriptTag({
      content: `${resetFormFields.toString()}`
    });
  });

  test('should reset entire form when no fieldNames provided', async ({ page }) => {
    // Modify form values
    await page.fill('input[name="textField"]', 'modified text');
    await page.fill('input[name="emailField"]', 'modified@example.com');
    await page.uncheck('input[name="checkbox1"]');
    await page.check('input[name="checkbox2"]');
    await page.selectOption('select[name="selectField"]', 'opt3');
    await page.fill('textarea[name="textareaField"]', 'Modified content');

    // Reset form
    await page.evaluate(() => {
      const form = document.getElementById('testForm') as HTMLFormElement;
      resetFormFields(form);
    });

    // Verify reset to defaults
    await expect(page.locator('input[name="textField"]')).toHaveValue('default text');
    await expect(page.locator('input[name="emailField"]')).toHaveValue('default@example.com');
    await expect(page.locator('input[name="checkbox1"]')).toBeChecked();
    await expect(page.locator('input[name="checkbox2"]')).not.toBeChecked();
    await expect(page.locator('select[name="selectField"]')).toHaveValue('opt2');
    await expect(page.locator('textarea[name="textareaField"]')).toHaveValue('Default textarea content');
  });

  test('should reset specific text fields', async ({ page }) => {
    await page.fill('input[name="textField"]', 'modified');
    await page.fill('input[name="emailField"]', 'modified@test.com');

    await page.evaluate(() => {
      const form = document.getElementById('testForm') as HTMLFormElement;
      resetFormFields(form, ['textField']);
    });

    await expect(page.locator('input[name="textField"]')).toHaveValue('default text');
    await expect(page.locator('input[name="emailField"]')).toHaveValue('modified@test.com');
  });

  test('should reset checkbox and radio fields', async ({ page }) => {
    await page.uncheck('input[name="checkbox1"]');
    await page.check('input[name="radioGroup"][value="option2"]');

    await page.evaluate(() => {
      const form = document.getElementById('testForm') as HTMLFormElement;
      resetFormFields(form, ['checkbox1', 'radioGroup']);
    });

    await expect(page.locator('input[name="checkbox1"]')).toBeChecked();
    await expect(page.locator('input[name="radioGroup"][value="option1"]')).toBeChecked();
    await expect(page.locator('input[name="radioGroup"][value="option2"]')).not.toBeChecked();
  });

  test('should reset select elements', async ({ page }) => {
    await page.selectOption('select[name="selectField"]', 'opt1');

    await page.evaluate(() => {
      const form = document.getElementById('testForm') as HTMLFormElement;
      resetFormFields(form, ['selectField']);
    });

    await expect(page.locator('select[name="selectField"]')).toHaveValue('opt2');
  });

  test('should reset file input', async ({ page }) => {
    // Set a file (simulate file selection)
    const fileInput = page.locator('input[name="fileField"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('test content')
    });

    await page.evaluate(() => {
      const form = document.getElementById('testForm') as HTMLFormElement;
      resetFormFields(form, ['fileField']);
    });

    const fileValue = await fileInput.inputValue();
    expect(fileValue).toBe('');
  });

  test('should dispatch change events', async ({ page }) => {
    let changeEventCount = 0;

    await page.evaluate(() => {
      window.changeEventCount = 0;
      document.addEventListener('change', () => {
        window.changeEventCount++;
      });
    });

    await page.fill('input[name="textField"]', 'modified');

    await page.evaluate(() => {
      const form = document.getElementById('testForm') as HTMLFormElement;
      resetFormFields(form, ['textField']);
    });

    changeEventCount = await page.evaluate(() => window.changeEventCount);
    expect(changeEventCount).toBeGreaterThan(0);
  });

  test('should throw error for invalid form element', async ({ page }) => {
    const error = await page.evaluate(() => {
      try {
        resetFormFields(document.body as any);
        return null;
      } catch (e) {
        return e.message;
      }
    });

    expect(error).toBe('First argument must be a valid HTMLFormElement');
  });

  test('should handle non-existent field names gracefully', async ({ page }) => {
    await page.fill('input[name="textField"]', 'modified');

    await page.evaluate(() => {
      const form = document.getElementById('testForm') as HTMLFormElement;
      resetFormFields(form, ['nonExistentField', 'textField']);
    });

    await expect(page.locator('input[name="textField"]')).toHaveValue('default text');
  });

  test('should handle empty fieldNames array', async ({ page }) => {
    await page.fill('input[name="textField"]', 'modified');

    await page.evaluate(() => {
      const form = document.getElementById('testForm') as HTMLFormElement;
      resetFormFields(form, []);
    });

    await expect(page.locator('input[name="textField"]')).toHaveValue('default text');
  });
});
