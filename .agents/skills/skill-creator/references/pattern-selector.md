# Pattern Selector

Use this decision tree to determine the correct skill pattern.

## Decision Tree

```
Does the skill wrap an existing tool, library, or framework?
├── YES → Is it mostly rules & conventions?
│   ├── YES → **Tool Wrapper**
│   │   Examples: firebase-setup, rtk-query, react-query, payload-cms,
│   │            react-native, graphql-backend, graphql-frontend,
│   │            backend-engineer, frontend-design, api-integration
│   └── NO  → Does it generate files from templates?
│       ├── YES → **Generator**
│       │   Examples: react-component-scaffolder, app-architect (synthesis phase)
│       └── NO  → **Tool Wrapper** (default)
│
└── NO  → Does it involve multiple sequential steps with gates?
    ├── YES → **Pipeline**
    │   Examples: git-workflow, test-writing, playwright,
    │            debug-investigator, doc-coauthoring
    └── NO  → Does it evaluate existing code/content?
        ├── YES → **Reviewer**
        │   Examples: code-reviewer
        └── NO  → Does it drive a multi-turn interview?
            ├── YES → **Inversion**
            │   Examples: app-architect, skill-creator
            └── NO  → **Tool Wrapper** (safe default)
```

## Pattern Characteristics

| Pattern       | Key Trait                        | Has Gate Conditions? | Has Templates? | Multi-turn? |
|---------------|----------------------------------|----------------------|----------------|-------------|
| Tool Wrapper  | Rules for a specific tool/lib    | No                   | No             | No          |
| Pipeline      | Sequential steps with gates      | Yes (required)       | Optional       | No          |
| Generator     | Produces files from templates    | Optional             | Yes (required) | No          |
| Reviewer      | Evaluates against a checklist    | No                   | No             | No          |
| Inversion     | Interview-driven — user answers  | Yes (between phases) | Optional       | Yes         |

## Metadata Fields

```yaml
metadata:
  pattern: tool-wrapper | pipeline | generator | reviewer | inversion
  domain: short-slug (e.g., react-native-expo, payload-cms-nextjs)
  interaction: multi-turn  # Only for inversion pattern
```
