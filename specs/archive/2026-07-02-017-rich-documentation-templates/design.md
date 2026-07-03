# Design: Rich Documentation Templates

## UI/UX & Layout Structure

We define visual block designs to be documented in `section-templates.md`:

### Centered Branding Header
```markdown
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png">
    <img src="assets/logo.png" width="220" alt="Logo Alternative Text">
  </picture>
</p>

<h1 align="center">Project Name</h1>

<p align="center">
  <em>An elegant, bold slogan that captures the project value in one line.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/package?style=flat-square&color=111111&label=npm" alt="npm version">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT license">
</p>
```

### Before / After Tables
```markdown
## Before / After

<table>
<tr>
<td width="50%">

### 🗣️ Old / Verbose Pattern
[Description of the old pattern]
```ts
// code here
```
</td>
<td width="50%">

### ⚡ Optimized / Modern Pattern
[Description of the new pattern]
```ts
// code here
```
</td>
</tr>
</table>
```

### Collapsible details blocks
```markdown
<details>
<summary><strong>Advanced Configuration</strong></summary>

Detailed options, long logs, or edge-case configuration steps go here.

</details>
```
