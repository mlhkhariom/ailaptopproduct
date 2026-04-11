

# WhatsApp Module — Light Theme + Full Features Rewrite

## Problem
Current WhatsApp module uses dark theme (dark green/black) which clashes with the site's light Ayurvedic theme (cream, sage green). Also many features are incomplete or missing.

## What Changes

### 1. Light Theme Conversion
- Replace all dark colors (`#111b21`, `#202c33`, `#0b141a`, `#005c4b`) with light equivalents matching the site's cream/green palette
- Contact sidebar: white/cream background, green accents
- Chat area: WhatsApp light wallpaper (light beige with subtle pattern)
- Sent messages: light green (`#d9fdd3`), received: white
- Input bar, headers: light backgrounds with subtle borders
- Context menu, contact info panel: all light theme

### 2. Full WhatsApp Web Features (every option working)

**Contact List:**
- New chat button (opens dialog to add new contact with name/phone)
- Contact right-click menu: Pin, Mute, Archive, Delete, Mark as read/unread
- Contact labels editable (VIP/Customer/New/Supplier)
- Group filter tabs: All, Unread, Pinned, Groups

**Chat Window:**
- Right-click context menu: Reply, Forward (opens contact picker dialog), Copy, Star, Info (shows sent/delivered/read times), Delete for me, Delete for everyone
- Message reactions (double-click to react with emoji)
- Image/document attachment button (shows placeholder attachment UI)
- Voice message button (shows recording indicator UI)
- Message search within chat (search icon in header opens search bar)
- Scroll-to-bottom button when scrolled up
- "New messages" divider line

**Contact Info Panel:**
- Media/Links/Docs tabs (placeholder counts)
- Shared groups section
- Block contact option
- Report contact option
- Disappearing messages toggle

**Forward Dialog:**
- When forwarding, shows contact list to pick recipient
- Message appears in target chat with "Forwarded" label

**New Contact Dialog:**
- Add name, phone, label
- Appears in contact list immediately

### 3. WhatsApp Documentation File
Create `WHATSAPP_MODULE.md` with:
- Every function name, parameters, return type, and what it does
- State structure (contacts, messages, rules)
- Event flow diagrams (send message → delivery tick → read tick)
- Auto-reply rule matching logic
- Template variable replacement logic
- Data structures for contacts, messages, rules
- How to connect to real WhatsApp Business API (webhook endpoints needed, message format)

## Files Modified
- `src/pages/admin/AdminWhatsApp.tsx` — Complete rewrite with light theme + all features
- `WHATSAPP_MODULE.md` — New detailed documentation file

## Technical Approach
- All inline dark styles replaced with light theme CSS variables or light hex values
- New state: `forwardingMsg`, `newContactDialog`, `searchInChat`, `messageReactions`
- Forward flow: select msg → pick contact → message copies to that chat
- All interactions work with local state (no backend needed)
- ~900-1000 lines total for the component

