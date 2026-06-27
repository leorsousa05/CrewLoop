# Design — Shipper Version Bump Validation

## Changes to `skills/shipper/SKILL.md`

We will insert a new step into the shipper workflow:

### **Step 1.5: Verify & Bump Package Version (New Step)**

1. **Check version status:**
   - Locate any `package.json` files in the repository.
   - Compare the current versions in `package.json` (root) and subpackages (e.g. `packages/cli/package.json`) against the `main` branch:
     ```bash
     git diff origin/main -- package.json packages/cli/package.json
     ```
   - Check if version changes are staged or modified.

2. **Infer the required bump based on the Conventional Commit type:**
   - If commit type is `feat` or includes breaking changes: suggest a **minor** (or **major** if `!`) bump.
   - If commit type is `fix`: suggest a **patch** bump.
   - If commit type is `docs`, `chore`, `style`, `test`, `refactor`: version bump is optional (usually not required).

3. **Check CLI dependency alignment:**
   - If `packages/cli/package.json` depends on `@archznn/crewloop-skills` (the root package), check that the dependency version matches the new bumped version.

4. **Suggest command execution:**
   - If a version bump is required/recommended but hasn't been performed, show the recommended command:
     ```bash
     npm version <patch | minor | major> --workspaces --no-git-tag-version
     ```
   - Remind the user/agent that if dependency versions are changed in `package.json`, they must also update `packages/cli/package.json` dependencies block for `@archznn/crewloop-skills` to match.
   - Ask for confirmation before running the bump command.

5. **Modify "What Shipper Never Does":**
   - Retain: "Never writes implementation code".
   - Modify: "Never writes code" -> "Never writes implementation code or fixes bugs. (Exception: Allowed to run `npm version` and update package version strings in package metadata JSON files)."

---

## Changes to `docs/docs/core/shipper.md`

- Update the **Responsibilities** section:
  - Add: "Verify and coordinate version bumps (Major, Minor, Patch) based on change type before packaging."
- Update the **Concrete Example** section:
  - Include version check output and version bump command execution in the scenario.
- Update **Output Artifact**:
  - Add "Bumped Version" description.
