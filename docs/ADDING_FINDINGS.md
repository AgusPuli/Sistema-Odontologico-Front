# How to add a new dental finding (ToothCondition)

Adding a finding touches **3 files on the backend** and **2 files on the
frontend**. Everything that renders the finding (palette, legend, chart cell,
edit dialog, drafted plan table) derives from those — no other file needs to
change.

## Naming convention

Use universal terminology (matches the Norma Técnica del Odontograma,
LatAm / Argentina). Backend enum is SCREAMING_SNAKE_CASE, frontend type is
the same literal.

Examples already in the system: `GINGIVITIS`, `GINGIVAL_RECESSION`,
`ROTATION` (giroversión), `IMPACTED` (retenido), `BRUXISM` (desgaste).

## Backend (3 files)

### 1. Add the enum value

`src/main/java/com/bs/odontograma/odontogram/enums/ToothCondition.java`

```java
public enum ToothCondition {
    // ...existing values...
    YOUR_NEW_FINDING
}
```

The DB column `tooth_records.condition` is `VARCHAR(30)` with no CHECK
constraint, so no Flyway migration is needed unless your literal is longer
than 30 characters (avoid that).

### 2. Add it to the catalog endpoint

`src/main/java/com/bs/odontograma/odontogram/controller/ToothConditionCatalogController.java`

```java
meta(ToothCondition.YOUR_NEW_FINDING, "Nombre en español", "category_key"),
```

Where `category_key` is one of: `restorative`, `periodontal`, `anomaly`,
`function`. Pick the closest one.

### 3. (Optional) Add a Spanish-readable history note default

If the finding should auto-generate a history entry message, search for
`ToothHistoryEntry` usages in `OdontogramService` — there's no default-message
table today, but if you add one, that's where it would go.

## Frontend (2 files)

### 1. Add the literal to the type

`src/features/odontogram/types/odontogram.types.ts`

```ts
export type ToothCondition =
  | ...existing
  | 'YOUR_NEW_FINDING'
```

### 2. Add metadata to the central config

`src/features/odontogram/config/conditions.ts`

```ts
YOUR_NEW_FINDING: {
  key: 'YOUR_NEW_FINDING',
  label: 'Nombre en español',
  color: 'gingivitis',  // reuse an existing tooth-* token or add a new one
  symbol: 'X',          // 1-3 character glyph rendered on the tooth SVG
  category: 'periodontal', // restorative | periodontal | anomaly | function
  order: 30,            // higher = shown earlier in palette
  // darkText: true,    // only if the background is light
},
```

That's it. The palette, the legend, the edit dialog, the chart cell and the
draft plan table all pick it up from `CONDITION_META`.

### Optional: dedicated color

If `color: '<existing>'` doesn't match clinically, add a new Tailwind token
in `tailwind.config.ts`:

```ts
tooth: {
  ...existing,
  yourname: 'hsl(<h> <s>% <l>%)',
},
```

Then use `color: 'yourname'` in the config entry. Tailwind picks it up after
the next dev-server restart.

## Symbol conventions

Picked from the Norma Técnica del Odontograma (Peru, adopted in Argentina /
LatAm) where it covers the finding; otherwise we use the universal Spanish
abbreviation.

| Finding | Symbol | Source |
|---|---|---|
| Endodoncia | `TC` | NTO ("tratamiento de conducto") |
| Implante | `IMP` | NTO |
| Corona | `◯` | NTO (circunferencia) |
| Diastema | `)(` | NTO (paréntesis invertido) |
| Giroversión | `↻` | NTO (flecha curva) |
| Movilidad | `M` | NTO (M + grado 1-4 en nota) |
| Retenido / Incluido | `I` | NTO |
| Bruxismo / Desgaste | `DES` | NTO |
| Gingivitis | `G` | Universal (no NTO) |
| Sarro | `S` | Universal |
| Recesión | `↓` | Universal |
| Absceso | `A` | Universal |

Auto-shrinking: 2-3 character glyphs (IMP, DES, TC) render at 11px; single
characters at 16px. See `tooth-cell.tsx`.

## Color convention (future)

The NTO uses a 2-color code:

- 🔵 **Azul** = ya realizado / existente
- 🔴 **Rojo** = a realizar / patología activa

Not implemented yet because it requires a `state: 'EXISTING' | 'PENDING'`
field on findings. Once added, the per-condition color in `CONDITION_META`
becomes the "kind" hue and a runtime modifier (blue/red overlay) renders the
state. Mark this as a TODO and the migration path stays clean.

## Test it

1. Restart the backend so the enum picks up.
2. Restart the frontend dev server (Tailwind rebuilds when colors change).
3. Visit `/treatments/new`, select a patient, the finding should appear in
   the palette with its color + label.
4. Click a tooth, apply your new finding → it should land in the "Plan de
   tratamiento" table.
5. Visit `/odontograms/<patientId>` → the legend at the top should list it.
