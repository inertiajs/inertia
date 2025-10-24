import { FormComponentRef } from '@inertiajs/core'
import { Form } from '@inertiajs/react'
import { useRef } from 'react'

declare global {
  interface Window {
    resetForm: (...fields: string[]) => void
  }
}

export default function Reset() {
  const formRef = useRef<FormComponentRef>(null)

  // Expose reset function to window for testing
  window.resetForm = (...fields: string[]) => {
    formRef.current?.reset(...fields)
  }

  return (
    <Form action="/dump/post" method="post" ref={formRef}>
      <h1>Form Reset</h1>

      {/* Basic Text Inputs */}
      <h2>Basic Text Inputs</h2>
      <input type="text" name="name" id="name" defaultValue="John Doe" />
      <input type="email" name="email" id="email" defaultValue="john@example.com" />

      {/* Select Elements */}
      <h2>Select Elements</h2>
      <select name="country" id="country" defaultValue="uk">
        <option value="us">United States</option>
        <option value="ca">Canada</option>
        <option value="uk">United Kingdom</option>
      </select>
      <select name="role" id="role" defaultValue="">
        <option value="">Select a role</option>
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="super">Super</option>
      </select>

      {/* Radio Buttons */}
      <h2>Radio Buttons</h2>

      {/* Radio buttons with default checked */}
      <div>
        <label>
          <input type="radio" name="plan" id="plan_free" value="free" /> Free
        </label>
        <label>
          <input type="radio" name="plan" id="plan_pro" value="pro" defaultChecked /> Pro
        </label>
        <label>
          <input type="radio" name="plan" id="plan_enterprise" value="enterprise" /> Enterprise
        </label>
      </div>

      {/* Radio buttons without default */}
      <div>
        <label>
          <input type="radio" name="payment" id="payment_card" value="card" /> Card
        </label>
        <label>
          <input type="radio" name="payment" id="payment_bank" value="bank" /> Bank
        </label>
        <label>
          <input type="radio" name="payment" id="payment_paypal" value="paypal" /> PayPal
        </label>
      </div>

      {/* Radio buttons designed to test multiple defaults edge case */}
      <div>
        <label>
          <input type="radio" name="priority" id="priority_low" value="low" defaultChecked /> Low
        </label>
        <label>
          <input type="radio" name="priority" id="priority_medium" value="medium" /> Medium
        </label>
        <label>
          <input type="radio" name="priority" id="priority_high" value="high" /> High
        </label>
      </div>

      {/* Checkboxes */}
      <h2>Checkboxes</h2>

      {/* Checkbox (single) with default checked */}
      <div>
        <input type="checkbox" name="subscribe" id="subscribe" value="yes" defaultChecked />
        <label htmlFor="subscribe">Subscribe to newsletter</label>
      </div>

      {/* Checkbox (single) without default */}
      <div>
        <input type="checkbox" name="terms" id="terms" value="accepted" />
        <label htmlFor="terms">Accept terms</label>
      </div>

      {/* Checkbox (multiple) with some checked */}
      <div>
        <label>
          <input type="checkbox" name="interests[]" id="interests_sports" value="sports" defaultChecked /> Sports
        </label>
        <label>
          <input type="checkbox" name="interests[]" id="interests_music" value="music" /> Music
        </label>
        <label>
          <input type="checkbox" name="interests[]" id="interests_tech" value="tech" defaultChecked /> Tech
        </label>
        <label>
          <input type="checkbox" name="interests[]" id="interests_art" value="art" /> Art
        </label>
      </div>

      {/* Multiple Select Elements */}
      <h2>Multiple Select Elements</h2>
      <select name="skills[]" id="skills" multiple defaultValue={['vue', 'angular']}>
        <option value="vue">Vue</option>
        <option value="react">React</option>
        <option value="angular">Angular</option>
        <option value="svelte">Svelte</option>
      </select>
      <select name="languages[]" id="languages" multiple defaultValue={[]}>
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="php">PHP</option>
      </select>
      <select name="tools[]" id="tools" multiple defaultValue={['vscode', 'webstorm', 'sublime']}>
        <option value="vscode">VSCode</option>
        <option value="webstorm">WebStorm</option>
        <option value="sublime">Sublime</option>
      </select>
      <select name="editor" id="editor" defaultValue="vim">
        <option value="">Select Editor</option>
        <option value="vim">Vim</option>
        <option value="emacs">Emacs</option>
        <option value="nano">Nano</option>
      </select>

      {/* File Inputs & Textareas */}
      <h2>File Inputs & Textareas</h2>
      <input type="file" name="avatar" id="avatar" />
      <input type="file" name="documents[]" id="documents" multiple />
      <textarea name="bio" id="bio" rows={3} defaultValue="Default bio text here." />
      <textarea name="notes" id="notes" rows={2} defaultValue="" />

      {/* HTML5 Input Types */}
      <h2>HTML5 Input Types</h2>
      <input type="hidden" name="token" id="token" defaultValue="abc123" />
      <input type="number" name="age" id="age" defaultValue="25" />
      <input type="number" name="quantity" id="quantity" />
      <input type="range" name="volume" id="volume" min="0" max="100" defaultValue="50" />
      <input type="date" name="birthdate" id="birthdate" defaultValue="1990-01-01" />
      <input type="time" name="appointment" id="appointment" defaultValue="14:30" />
      <input type="color" name="favorite_color" id="favorite_color" defaultValue="#ff0000" />
      <input type="url" name="website" id="website" defaultValue="https://example.com" />
      <input type="tel" name="phone" id="phone" defaultValue="+1234567890" />
      <input type="password" name="password" id="password" defaultValue="secret123" />

      {/* Complex Nested Fields */}
      <h2>Complex Nested Fields</h2>
      <input type="text" name="user[address][street]" id="nested_street" defaultValue="123 Main St" />
      <input type="text" name="user[address][city]" id="nested_city" defaultValue="New York" />
      <input type="text" name="items[0][name]" id="item_0_name" defaultValue="Item A" />
      <input type="number" name="items[0][quantity]" id="item_0_quantity" defaultValue="5" />
      <input type="text" name="items[1][name]" id="item_1_name" defaultValue="Item B" />
      <input type="number" name="items[1][quantity]" id="item_1_quantity" defaultValue="10" />

      {/* Special Cases */}
      <h2>Special Cases</h2>
      <input type="text" name="disabled_field" id="disabled_field" defaultValue="Ignore me" disabled />
      <input type="button" name="button_input" value="Click me" />
      <input type="submit" name="submit_input" value="Submit Form" />
      <input type="reset" name="reset_input" value="Reset Form" />
      <button type="reset" name="reset_button">
        Reset Form
      </button>

      {/* Dotted & Array Notation */}
      <h2>Dotted & Array Notation</h2>
      <input type="text" name="user.name" id="user_name" defaultValue="Default User" />
      <input type="text" name="user.email" id="user_email" defaultValue="user@default.com" />
      <input type="text" name="company.name" id="company_name" defaultValue="Default Corp" />
      <input type="text" name="tags[]" id="tag_0" defaultValue="javascript" />
      <input type="text" name="tags[]" id="tag_1" defaultValue="vue" />
      <input type="text" name="tags[]" id="tag_2" defaultValue="inertia" />

      {/* Numeric Values */}
      <h2>Numeric Values</h2>
      <div>
        <label>
          <input type="radio" name="rating" id="rating_1" value="1" defaultChecked /> 1 Star
        </label>
        <label>
          <input type="radio" name="rating" id="rating_2" value="2" /> 2 Stars
        </label>
        <label>
          <input type="radio" name="rating" id="rating_3" value="3" /> 3 Stars
        </label>
      </div>
      <div>
        <label>
          <input type="checkbox" name="years[]" id="years_2020" value="2020" defaultChecked /> 2020
        </label>
        <label>
          <input type="checkbox" name="years[]" id="years_2021" value="2021" /> 2021
        </label>
        <label>
          <input type="checkbox" name="years[]" id="years_2022" value="2022" defaultChecked /> 2022
        </label>
      </div>
      <select name="version" id="version" defaultValue="1">
        <option value="1">Version 1</option>
        <option value="2">Version 2</option>
        <option value="3">Version 3</option>
      </select>
      <select name="ports[]" id="ports" multiple defaultValue={['80', '443']}>
        <option value="80">Port 80</option>
        <option value="443">Port 443</option>
        <option value="8080">Port 8080</option>
      </select>

      {/* Submit button */}
      <h2>Submit</h2>
      <button type="submit">Submit</button>
    </Form>
  )
}
