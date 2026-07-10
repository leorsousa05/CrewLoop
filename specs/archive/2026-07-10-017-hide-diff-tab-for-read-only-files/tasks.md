# Tasks: Hide Diff Tab for Read-Only Files

## Implementation Tasks

- [x] Update `activeTab` state initialization/update `useEffect` in [FileDiff.tsx](file:///home/arch/codes/crewloop/servers/dashboard/ui/src/components/FileDiff.tsx):
  - Check if `file.ops` contains any operation where `op.type === 'edit'`.
  - If no `edit` operations are present, set `activeTab` to `'content'`.
  - Otherwise, set `activeTab` to `'diff'`.
  - Include `file?.path` and the presence of `edit` operations (as a boolean) in the `useEffect` dependency array.
- [x] Update the rendering of the tab headers in `FileDiff.tsx`:
  - Change the condition for rendering the "Diff da Operação" button from `file.ops.length > 0` to checking if `file.ops.some(op => op.type === 'edit')`.

## Verification Tasks

- [x] Run the dashboard in dev mode or compile it to verify there are no compilation errors.
- [x] Verify visually that selecting a file that has only been read does not display the "Diff da Operação" tab and defaults to displaying "Conteúdo Completo".
- [x] Verify that selecting a file that has edit operations displays both tabs and defaults to "Diff da Operação".
