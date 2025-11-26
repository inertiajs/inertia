<script module lang="ts">
  declare global {
    interface Window {
      resetForm: (...fields: string[]) => void
    }
  }
</script>

<script lang="ts">
  import type { FormComponentMethods } from '@inertiajs/core'
  import { Form } from '@inertiajs/svelte'

  let formRef: FormComponentMethods = $state(null!)

  // Expose reset function to window for testing
  window.resetForm = (...fields: string[]) => {
    formRef?.reset(...fields)
  }

  // Action to set defaultValue for disabled fields
  function setDefaultValue(node: HTMLInputElement) {
    node.defaultValue = node.value
  }
</script>

<Form action="/dump/post" method="post" bind:this={formRef}>
  <h1>Form Reset</h1>

  <!-- Basic Text Inputs -->
  <h2>Basic Text Inputs</h2>
  <input type="text" name="name" id="name" value="John Doe" />
  <input type="email" name="email" id="email" value="john@example.com" />

  <!-- Select Elements -->
  <h2>Select Elements</h2>
  <select name="country" id="country">
    <option value="us">United States</option>
    <option value="ca">Canada</option>
    <option value="uk" selected>United Kingdom</option>
  </select>
  <select name="role" id="role">
    <option value="">Select a role</option>
    <option value="user">User</option>
    <option value="admin">Admin</option>
    <option value="super">Super</option>
  </select>

  <!-- Radio Buttons -->
  <h2>Radio Buttons</h2>

  <!-- Radio buttons with default checked -->
  <div>
    <label><input type="radio" name="plan" id="plan_free" value="free" /> Free</label>
    <label><input type="radio" name="plan" id="plan_pro" value="pro" checked /> Pro</label>
    <label><input type="radio" name="plan" id="plan_enterprise" value="enterprise" /> Enterprise</label>
  </div>

  <!-- Radio buttons without default -->
  <div>
    <label><input type="radio" name="payment" id="payment_card" value="card" /> Card</label>
    <label><input type="radio" name="payment" id="payment_bank" value="bank" /> Bank</label>
    <label><input type="radio" name="payment" id="payment_paypal" value="paypal" /> PayPal</label>
  </div>

  <!-- Radio buttons designed to test multiple defaults edge case -->
  <div>
    <label><input type="radio" name="priority" id="priority_low" value="low" checked /> Low</label>
    <label><input type="radio" name="priority" id="priority_medium" value="medium" /> Medium</label>
    <label><input type="radio" name="priority" id="priority_high" value="high" /> High</label>
  </div>

  <!-- Checkboxes -->
  <h2>Checkboxes</h2>

  <!-- Checkbox (single) with default checked -->
  <div>
    <input type="checkbox" name="subscribe" id="subscribe" value="yes" checked />
    <label for="subscribe">Subscribe to newsletter</label>
  </div>

  <!-- Checkbox (single) without default -->
  <div>
    <input type="checkbox" name="terms" id="terms" value="accepted" />
    <label for="terms">Accept terms</label>
  </div>

  <!-- Checkbox (multiple) with some checked -->
  <div>
    <label><input type="checkbox" name="interests[]" id="interests_sports" value="sports" checked /> Sports</label>
    <label><input type="checkbox" name="interests[]" id="interests_music" value="music" /> Music</label>
    <label><input type="checkbox" name="interests[]" id="interests_tech" value="tech" checked /> Tech</label>
    <label><input type="checkbox" name="interests[]" id="interests_art" value="art" /> Art</label>
  </div>

  <!-- Multiple Select Elements -->
  <h2>Multiple Select Elements</h2>
  <select name="skills[]" id="skills" multiple>
    <option value="vue" selected>Vue</option>
    <option value="react">React</option>
    <option value="angular" selected>Angular</option>
    <option value="svelte">Svelte</option>
  </select>
  <select name="languages[]" id="languages" multiple>
    <option value="javascript">JavaScript</option>
    <option value="typescript">TypeScript</option>
    <option value="python">Python</option>
    <option value="php">PHP</option>
  </select>
  <select name="tools[]" id="tools" multiple>
    <option value="vscode" selected>VSCode</option>
    <option value="webstorm" selected>WebStorm</option>
    <option value="sublime" selected>Sublime</option>
  </select>
  <select name="editor" id="editor">
    <option value="">Select Editor</option>
    <option value="vim" selected>Vim</option>
    <option value="emacs">Emacs</option>
    <option value="nano">Nano</option>
  </select>

  <!-- File Inputs & Textareas -->
  <h2>File Inputs & Textareas</h2>
  <input type="file" name="avatar" id="avatar" />
  <input type="file" name="documents[]" id="documents" multiple />
  <textarea name="bio" id="bio" rows="3">Default bio text here.</textarea>
  <textarea name="notes" id="notes" rows="2"></textarea>

  <!-- HTML5 Input Types -->
  <h2>HTML5 Input Types</h2>
  <input type="hidden" name="token" id="token" value="abc123" />
  <input type="number" name="age" id="age" value="25" />
  <input type="number" name="quantity" id="quantity" />
  <input type="range" name="volume" id="volume" min="0" max="100" value="50" />
  <input type="date" name="birthdate" id="birthdate" value="1990-01-01" />
  <input type="time" name="appointment" id="appointment" value="14:30" />
  <input type="color" name="favorite_color" id="favorite_color" value="#ff0000" />
  <input type="url" name="website" id="website" value="https://example.com" />
  <input type="tel" name="phone" id="phone" value="+1234567890" />
  <input type="password" name="password" id="password" value="secret123" />

  <!-- Complex Nested Fields -->
  <h2>Complex Nested Fields</h2>
  <input type="text" name="user[address][street]" id="nested_street" value="123 Main St" />
  <input type="text" name="user[address][city]" id="nested_city" value="New York" />
  <input type="text" name="items[0][name]" id="item_0_name" value="Item A" />
  <input type="number" name="items[0][quantity]" id="item_0_quantity" value="5" />
  <input type="text" name="items[1][name]" id="item_1_name" value="Item B" />
  <input type="number" name="items[1][quantity]" id="item_1_quantity" value="10" />

  <!-- Special Cases -->
  <h2>Special Cases</h2>
  <input type="text" name="disabled_field" id="disabled_field" value="Ignore me" disabled use:setDefaultValue />
  <input type="button" name="button_input" value="Click me" />
  <input type="submit" name="submit_input" value="Submit Form" />
  <input type="reset" name="reset_input" value="Reset Form" />
  <button type="reset" name="reset_button">Reset Form</button>

  <!-- Dotted & Array Notation -->
  <h2>Dotted & Array Notation</h2>
  <input type="text" name="user.name" id="user_name" value="Default User" />
  <input type="text" name="user.email" id="user_email" value="user@default.com" />
  <input type="text" name="company.name" id="company_name" value="Default Corp" />
  <input type="text" name="tags[]" id="tag_0" value="javascript" />
  <input type="text" name="tags[]" id="tag_1" value="vue" />
  <input type="text" name="tags[]" id="tag_2" value="inertia" />

  <!-- Numeric Values -->
  <h2>Numeric Values</h2>
  <div>
    <label><input type="radio" name="rating" id="rating_1" value="1" checked /> 1 Star</label>
    <label><input type="radio" name="rating" id="rating_2" value="2" /> 2 Stars</label>
    <label><input type="radio" name="rating" id="rating_3" value="3" /> 3 Stars</label>
  </div>
  <div>
    <label><input type="checkbox" name="years[]" id="years_2020" value="2020" checked /> 2020</label>
    <label><input type="checkbox" name="years[]" id="years_2021" value="2021" /> 2021</label>
    <label><input type="checkbox" name="years[]" id="years_2022" value="2022" checked /> 2022</label>
  </div>
  <select name="version" id="version">
    <option value="1" selected>Version 1</option>
    <option value="2">Version 2</option>
    <option value="3">Version 3</option>
  </select>
  <select name="ports[]" id="ports" multiple>
    <option value="80" selected>Port 80</option>
    <option value="443" selected>Port 443</option>
    <option value="8080">Port 8080</option>
  </select>

  <!-- Submit button -->
  <h2>Submit</h2>
  <button type="submit">Submit</button>
</Form>
