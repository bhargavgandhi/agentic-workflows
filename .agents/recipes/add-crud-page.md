---
name: add-crud-page
description: Create a full CRUD page for an entity (list, create, edit, delete)
parameters:
  - name: entity_name
    type: text
    description: What entity/resource is this CRUD for? (e.g. "Product", "User", "Blog Post")
    default: Item
  - name: entity_plural
    type: text
    description: Plural form (e.g. "Products", "Users", "Blog Posts")
    default: Items
  - name: route_path
    type: text
    description: URL path for this CRUD section (e.g. /products, /users)
    default: /items
  - name: data_source
    type: select
    options: [firebase, rest-api, graphql, mock]
    default: firebase
    description: Where does the data come from?
skills_required:
  - react-component-scaffolder
  - frontend-design
  - api-integration
workflow: build-feature
tags: [crud, list, form, entity, firebase, api]
---

## Task: Build CRUD Page for {{entity_name}}

**Route:** `{{route_path}}`
**Data source:** {{data_source}}

### What to build

1. **List page** at `{{route_path}}` — Shows all {{entity_plural}} in a table/card grid with:
   - Search/filter bar
   - Paginated results
   - "New {{entity_name}}" button
   - Edit and Delete actions per row

2. **Create form** — Modal or separate page at `{{route_path}}/new`:
   - Form with validation
   - Save and Cancel buttons
   - Success/error feedback

3. **Edit form** — Same form, pre-filled, at `{{route_path}}/:id/edit`

4. **Delete confirmation** — Dialog with "Are you sure?" before deleting

5. **Data layer** — Connect to {{data_source}}:
   - List all {{entity_plural}}
   - Create new {{entity_name}}
   - Update existing {{entity_name}}
   - Delete {{entity_name}}

### Standards to follow

- Follow the `react-component-scaffolder` skill for component structure
- Follow the `frontend-design` skill for all UI
- Follow the `api-integration` skill for data fetching patterns
- Handle loading, empty, and error states for every data operation
- All forms must have client-side validation before submission
