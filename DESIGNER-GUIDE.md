# Designer Quick Start Guide

## Overview
The MSG Viewer has been redesigned with a modern skeuomorphic style, 3-panel Outlook-inspired layout, and dark/light theme support.

## Design Files Location

### CSS Variables (Design Tokens)
**File**: `lib/styles/root.css` (lines 7-64)

All design tokens are defined as CSS custom properties:
```css
:root {
  /* Colors */
  --bg: #1a1d23;
  --accentOrange: #e87d3e;
  
  /* Shadows */
  --shadow1: 0 1px 3px rgba(0, 0, 0, 0.3), ...
  
  /* Spacing */
  --space1: 4px;
  --space2: 8px;
  ...
}
```

### Component Styles
All components have isolated stylesheets:
- **Message**: `lib/components/message/styles.css`
- **Attachments**: `lib/components/attachment/styles.css`
- **Recipients**: `lib/components/recipient/styles.css`
- **Embedded Messages**: `lib/components/embedded-msg/styles.css`
- **Errors**: `lib/components/error/styles.css`

## Making Design Changes

### Changing Colors

#### Primary Accent (Orange)
Edit in `lib/styles/root.css`:
```css
--accentOrange: #e87d3e;        /* Change base color */
--accentOrangeHover: #ff9456;   /* Change hover color */
```

#### Background Colors
```css
/* Dark mode */
--bg: #1a1d23;           /* Page background */
--panel: #242830;        /* Panel background */
--surface1: #2d3139;     /* Elevated surface */
--surface2: #363b45;     /* More elevated surface */

/* Light mode */
body[data-theme="light"] {
  --bg: #f0f2f5;         /* Page background */
  --panel: #ffffff;      /* Panel background */
  ...
}
```

### Changing Shadows (Depth)

Adjust shadow intensity in `lib/styles/root.css`:
```css
/* More dramatic shadows */
--shadow1: 0 2px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow2: 0 6px 12px rgba(0, 0, 0, 0.5), 0 6px 12px rgba(0, 0, 0, 0.4);
--shadow3: 0 15px 30px rgba(0, 0, 0, 0.6), 0 10px 10px rgba(0, 0, 0, 0.5);

/* Softer shadows */
--shadow1: 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 1px rgba(0, 0, 0, 0.15);
...
```

### Changing Border Radius

Edit radius variables:
```css
/* More rounded */
--radiusLg: 20px;   /* Panels */
--radiusMd: 16px;   /* Buttons, cards */
--radiusSm: 12px;   /* Tabs, chips */
--radiusXs: 8px;    /* Small elements */

/* Less rounded */
--radiusLg: 12px;
--radiusMd: 8px;
--radiusSm: 6px;
--radiusXs: 4px;
```

### Changing Spacing

Adjust the spacing scale:
```css
/* More spacious */
--space1: 6px;
--space2: 12px;
--space3: 18px;
--space4: 24px;
--space5: 36px;
--space6: 48px;

/* More compact */
--space1: 2px;
--space2: 4px;
--space3: 8px;
--space4: 12px;
--space5: 16px;
--space6: 24px;
```

### Changing Typography

Edit in `lib/styles/root.css`:
```css
:root {
  font-size: 16px;  /* Change base size (affects all rem units) */
}

body {
  font-family: /* Add custom font here */;
  line-height: 1.5;  /* Adjust line spacing */
}

/* Component-specific sizes */
.app-title {
  font-size: 1.25rem;  /* 20px at 16px base */
}

.msg-header h2 {
  font-size: 1.5rem;   /* 24px at 16px base */
}
```

### Changing Button Styles

Edit button gradients in `lib/styles/root.css`:
```css
.btn-primary {
  /* Single color instead of gradient */
  background: var(--accentOrange);
  
  /* Or adjust gradient */
  background: linear-gradient(135deg, #ff6b35 0%, #e87d3e 100%);
}

/* Remove hover lift effect */
.btn-primary:hover {
  transform: none;  /* Remove this line to disable lift */
}
```

### Changing Layout Proportions

Edit grid columns in `lib/styles/root.css`:
```css
#root {
  /* Current: 220px | flexible | 2x flexible */
  grid-template-columns: 220px minmax(300px, 1fr) minmax(500px, 2fr);
  
  /* Wider sidebar */
  grid-template-columns: 280px minmax(300px, 1fr) minmax(500px, 2fr);
  
  /* Equal panels */
  grid-template-columns: 1fr 1fr 1fr;
  
  /* Hide preview panel */
  grid-template-columns: 220px 0 1fr;
}
```

## Component Customization

### Attachment Cards

File: `lib/components/attachment/styles.css`
```css
.msg-attach-btn {
  background: var(--surface2);    /* Card background */
  border: 1px solid var(--borderSubtle);
  border-radius: var(--radiusMd);
  padding: var(--space3);         /* Internal spacing */
  min-width: 200px;               /* Minimum width */
}
```

### Recipient Chips

File: `lib/components/recipient/styles.css`
```css
.recipient-chip {
  padding: var(--space1) var(--space2);  /* Adjust size */
  border-radius: var(--radiusXs);        /* Adjust roundness */
  font-size: 0.875rem;                   /* Adjust text size */
}
```

### Dropzone

File: `lib/styles/root.css` (search for `.dropzone`)
```css
.dropzone {
  padding: var(--space6);          /* Size of dropzone */
  border: 2px dashed var(--borderSubtle);  /* Border style */
}

.dropzone-icon {
  width: 80px;   /* Icon size */
  height: 80px;
}
```

## Testing Design Changes

### View Both Themes
1. Open the app
2. Click theme toggle in sidebar
3. Verify both dark and light modes look good

### Test Responsive
Open browser dev tools and test these widths:
- **1400px**: Full desktop
- **1000px**: Narrow desktop
- **800px**: Tablet (preview hidden)
- **600px**: Mobile (single column)

### Test All States
1. **Empty**: Initial load
2. **Dragover**: Drag a file (don't drop)
3. **Loading**: Drop file and watch transition
4. **Loaded**: View full message
5. **Error**: Try uploading invalid file

## Common Design Patterns

### Adding a New Color
1. Define variable in `:root`:
   ```css
   --accentBlue: #4285f4;
   ```

2. Add light mode variant:
   ```css
   body[data-theme="light"] {
     --accentBlue: #1967d2;
   }
   ```

3. Use in components:
   ```css
   .some-element {
     color: var(--accentBlue);
   }
   ```

### Creating a New Shadow Level
```css
:root {
  --shadow4: 0 20px 40px rgba(0, 0, 0, 0.6), 0 12px 12px rgba(0, 0, 0, 0.5);
}

body[data-theme="light"] {
  --shadow4: 0 20px 40px rgba(0, 0, 0, 0.25), 0 12px 12px rgba(0, 0, 0, 0.2);
}
```

### Adding Animations
```css
.my-element {
  transition: all 0.3s ease;  /* Smooth transition */
}

.my-element:hover {
  transform: scale(1.05);     /* Grow on hover */
}
```

## Design System Summary

### Color Roles
- **Background**: Page/app background
- **Panel**: Main container surfaces
- **Surface1/2**: Layered content (cards, sections)
- **Text1**: Primary readable text
- **Text2**: Secondary/metadata text
- **accentOrange**: Primary actions
- **accentRed**: Destructive actions
- **borderSubtle**: Dividers and outlines

### Shadow Roles
- **shadow1**: Resting state (cards at rest)
- **shadow2**: Slightly elevated (buttons, important cards)
- **shadow3**: Highly elevated (hover states, modals)
- **shadowInset**: Pressed/selected inward depth

### Spacing Roles
- **space1/2**: Tight spacing (within elements)
- **space3/4**: Standard spacing (between elements)
- **space5/6**: Loose spacing (between sections)

## Build & Preview

To see changes:
1. Run build: `bun run build.ts` (from `msg-viewer-repo` folder)
2. Output in `build/` folder
3. Open `build/index.html` in browser

Or use live server/dev tools for instant preview.

## Need Help?

- All tokens: `lib/styles/root.css` (lines 1-110)
- Layout: `lib/styles/root.css` (lines 140-220)
- Components: `lib/components/*/styles.css`
- Documentation: `DESIGN-IMPLEMENTATION.md` and `VISUAL-STATE-GUIDE.md`
