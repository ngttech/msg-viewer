# MSG Viewer - Visual State Guide

## Application States

### 1. Empty State (Initial Load)
**Layout**: 3-panel grid
- **Sidebar**: Visible with upload button and theme toggle
- **Preview Panel**: Shows "Upload a .msg file to see message previews"
- **Reading Pane**: Large centered dropzone with:
  - Orange mail icon in rounded square
  - "Drop your .msg file here"
  - "Or click to browse"
  - Privacy note

**Interaction**: 
- Click upload button OR click dropzone OR drag file to page

---

### 2. Dragover State
**Visual Change**:
- Dropzone gains orange border
- 4px orange glow (focus ring)
- Background slightly lightens

**Trigger**: User drags .msg file over the page

---

### 3. Loading State
**Visual Change**:
- Dropzone content changes to:
  - Checkmark icon
  - "Loading message..." text
- Brief transition (< 1 second typically)

**Trigger**: File is dropped/selected and parsing begins

---

### 4. Message Loaded State
**Layout Changes**:
- **Sidebar**: Unchanged (still visible)
- **Preview Panel**: Unchanged (placeholder text remains)
- **Reading Pane**: Shows full message with:
  
  **Header Section** (gray background):
  - Subject line (large, bold)
  - Orange download button + Red close button (top right)
  - Horizontal divider
  - From: name <email>
  - Date: formatted timestamp
  - To: recipient chips (gray pills)
  - Cc: recipient chips (if present)
  - Attachments: card grid (if present)
  - Embedded .msg files: card list (if present)
  
  **Body Section** (main panel background):
  - Email content (formatted text)
  - Full height scrollable

**Interaction**:
- Download EML: triggers file download
- Close: returns to empty state
- Attachments: click to download
- Embedded messages: click to open (layers on top)

---

### 5. Embedded Message State
**Visual Change**:
- Previous message gets `.hidden` class
- New message appends to reading pane
- New message shows on top with its own close button
- Clicking close removes top message, reveals previous

**Navigation**: Stack-based (can go multiple levels deep)

---

### 6. Error State
**Layout**:
- **Reading Pane**: Shows error card with:
  - Warning icon (⚠)
  - Red border
  - Error message text
  - Background tint

**Trigger**: Parsing fails or file is corrupted

---

## Theme States

### Dark Mode (Default)
**Colors**:
- Background: `#1a1d23` (very dark gray)
- Panels: `#242830` (dark gray-blue)
- Surfaces: `#2d3139`, `#363b45` (layered grays)
- Text: `#e8eaed` (off-white), `#9aa0a6` (gray)
- Accent: `#e87d3e` (orange)

**Shadows**: Darker, more pronounced for depth

---

### Light Mode
**Colors**:
- Background: `#f0f2f5` (light gray)
- Panels: `#ffffff` (white)
- Surfaces: `#f8f9fa`, `#e9ecef` (light grays)
- Text: `#202124` (near-black), `#5f6368` (gray)
- Accent: `#e87d3e` (same orange)

**Shadows**: Lighter, softer for subtle depth

**Toggle**: Bottom of sidebar, persists via localStorage

---

## Component States

### Buttons
**Primary (Orange)**:
- Normal: Orange gradient with shadow
- Hover: Lighter gradient + lift (translateY -1px)
- Active: Returns to normal position
- Focus: Orange ring around button

**Secondary (Gray)**:
- Normal: Surface gray with border
- Hover: Lighter background + lift
- Active: Returns to normal position

**Destructive (Red)**:
- Normal: Red gradient with shadow
- Hover: Lighter red + lift
- Active: Returns to normal position

**Icon Buttons**:
- Same behavior as above
- Circular/square with padding
- SVG icons with drop shadow

---

### Attachment Cards
**Normal**:
- Gray surface background
- Subtle border
- File icon + name + size
- Small shadow

**Hover**:
- Lighter background
- Orange border
- Lift effect
- Increased shadow

---

### Recipient Chips
**Appearance**:
- Small gray pills
- Subtle border and shadow
- Name and email
- Wrap to multiple lines if needed

**No hover state** (not interactive)

---

### Preview Panel Tabs
**Normal Tab**:
- Gray text
- Transparent background
- Rounded corners

**Hover**:
- Light background
- Darker text

**Active Tab**:
- Orange text
- Surface gray background
- Inset shadow

---

### Dropzone
**Normal**:
- Dashed border
- Gray background
- Icon + text centered
- Cursor: pointer on hover

**Hover**:
- Slightly darker background

**Dragover** (file being dragged):
- Orange border (solid)
- 4px orange glow
- Darker background

---

## Responsive Breakpoints

### Desktop (> 1200px)
- Full 3-panel layout
- 220px sidebar | flexible preview | 2x flexible reading pane

### Large Tablet (900px - 1200px)
- Narrower 3-panel layout
- 200px sidebar | 1x preview | 1.5x reading pane

### Tablet (700px - 900px)
- 2-panel layout
- Preview panel hidden
- 180px sidebar | full reading pane

### Mobile (< 700px)
- Single column vertical
- Sidebar at top (collapsed features)
- Full-width reading pane below
- Smaller spacing throughout

---

## Scrollbar Styling

**WebKit Browsers** (Chrome, Safari, Edge):
- Track: Surface1 gray
- Thumb: Surface2 gray with rounded corners
- Thumb hover: Orange accent

**Firefox**:
- Thin style
- Surface2 gray thumb

---

## Typography Hierarchy

1. **App Title**: 1.25rem, weight 600
2. **Message Subject**: 1.5rem, weight 600
3. **From Name**: 1.05rem, weight 600
4. **Body Text**: 1rem (16px base)
5. **Metadata**: 0.875rem
6. **Small Text**: 0.8rem

**Font Stack**: 
`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

---

## Animation Timings

- **Standard transitions**: 0.2s ease
- **Hover lift**: translateY(-1px)
- **Theme toggle**: Instant (CSS variable switch)
- **Dropzone glow**: Smooth fade-in

---

## Key Visual Details

### Shadows (Skeuomorphic)
- **Level 1**: Subtle card elevation
- **Level 2**: Button/panel elevation
- **Level 3**: Hover/active emphasis
- **Inset**: Selected/pressed states

### Gradients
- **Orange Button**: 135deg from #e87d3e to #d66d34
- **Red Button**: 135deg from #cf4b4b to #b83838
- Hover states use lighter start color

### Borders
- **Subtle**: rgba(255,255,255,0.1) dark / rgba(0,0,0,0.1) light
- **Accent**: Orange on hover/focus
- **Dividers**: 1px solid borderSubtle

### Spacing
- Components: 8-16px internal padding
- Sections: 16-24px gaps
- Panels: 16px external padding
- Cards: 12px padding

---

This guide covers all visual states that exist in the current implementation. The preview panel functionality (message list) is structurally ready but not yet populated with actual messages.
