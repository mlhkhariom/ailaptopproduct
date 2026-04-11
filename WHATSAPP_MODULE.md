# WhatsApp Business Module — Technical Documentation

> **File**: `src/pages/admin/AdminWhatsApp.tsx`  
> **Store**: `src/store/whatsappStore.ts`  
> **Version**: 2.0 (Light Theme)

---

## Table of Contents

1. [Overview](#overview)
2. [Data Structures](#data-structures)
3. [State Variables](#state-variables)
4. [Functions & Handlers](#functions--handlers)
5. [UI Components (Internal)](#ui-components-internal)
6. [Auto-Reply Engine](#auto-reply-engine)
7. [Message Flow Diagram](#message-flow-diagram)
8. [Feature Matrix](#feature-matrix)
9. [Backend Migration Guide](#backend-migration-guide)
10. [WhatsApp Business API Integration](#whatsapp-business-api-integration)

---

## 1. Overview

The WhatsApp module is a complete WhatsApp Web replica built for the Apsoncure PHC admin panel. It provides:

- **Chat Interface**: Full WhatsApp Web UI with light theme (cream/green matching the site)
- **Automation**: Keyword-based auto-reply rules with template variables
- **Analytics**: Chat statistics and rule performance tracking
- **Contact Management**: Add, label, pin, mute, archive, delete contacts

Currently uses **local state** (React `useState`) for chat data and **Zustand with localStorage** for automation rules.

---

## 2. Data Structures

### ChatContact

```typescript
interface ChatContact {
  id: number;           // Unique ID
  name: string;         // Display name
  phone: string;        // Phone number with country code
  avatar: string;       // 2-letter initials (e.g., "PS")
  lastMsg: string;      // Last message text (preview)
  lastMsgTime: string;  // Time string (e.g., "2:34 PM", "Yesterday")
  unread: number;       // Unread message count
  online: boolean;      // Is currently online
  typing: boolean;      // Is currently typing
  pinned: boolean;      // Chat is pinned to top
  muted: boolean;       // Notifications muted
  archived: boolean;    // Chat is archived (hidden from main list)
  lastSeen?: string;    // Last seen time string
  label?: "customer" | "new" | "vip" | "supplier";  // Contact category
  about?: string;       // WhatsApp "About" status text
}
```

### ChatMessage

```typescript
interface ChatMessage {
  id: number;           // Unique ID (uses Date.now())
  text: string;         // Message content
  time: string;         // Sent time (e.g., "2:34 PM")
  fromMe: boolean;      // true = sent by admin, false = received
  status: "sent" | "delivered" | "read";  // Delivery status (outgoing only)
  replyTo?: number;     // ID of message being replied to
  replyText?: string;   // Text of quoted message (denormalized for display)
  starred?: boolean;    // Message is starred/bookmarked
  forwarded?: boolean;  // Message was forwarded from another chat
  reactions?: string[]; // Array of emoji reactions (e.g., ["👍", "❤️"])
  deleted?: boolean;    // Message was "deleted for everyone"
  type?: "text" | "image" | "document" | "voice";  // Message type
  fileName?: string;    // For document messages
}
```

### AutoReplyRule (from whatsappStore.ts)

```typescript
interface AutoReplyRule {
  id: string;               // Unique ID
  name: string;             // Rule display name
  keywords: string[];       // Trigger keywords (case-insensitive match)
  responseTemplate: string; // Reply template with {{variables}}
  isActive: boolean;        // Whether rule is enabled
  type: "greeting" | "product" | "order" | "custom";  // Category
  matchCount: number;       // How many times this rule has matched
}
```

### SimulatedMessage (from whatsappStore.ts)

```typescript
interface SimulatedMessage {
  id: string;       // Unique ID
  text: string;     // Message text
  time: string;     // Timestamp
  fromMe: boolean;  // Direction
  isBot?: boolean;  // Whether this is a bot auto-reply
}
```

---

## 3. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `activeChat` | `number \| null` | `null` (mobile) / `1` (desktop) | Currently selected chat ID |
| `searchQuery` | `string` | `""` | Contact list search filter |
| `message` | `string` | `""` | Current message input text |
| `mainTab` | `"chats" \| "automation" \| "analytics"` | `"chats"` | Active top-level tab |
| `chatFilter` | `string` | `"all"` | Contact filter: all/unread/pinned/groups |
| `isConnected` | `boolean` | `true` | WhatsApp connection status |
| `showQR` | `boolean` | `false` | QR code dialog visibility |
| `showMobileChat` | `boolean` | `false` | Mobile: show chat window vs contact list |
| `showContactInfo` | `boolean` | `false` | Contact info side panel visibility |
| `replyingTo` | `ChatMessage \| null` | `null` | Message being replied to |
| `contextMenu` | `{x, y, msg} \| null` | `null` | Right-click menu state for messages |
| `contactContextMenu` | `{x, y, contact} \| null` | `null` | Right-click menu state for contacts |
| `starredFilter` | `boolean` | `false` | Show only starred messages |
| `localMessages` | `Record<number, ChatMessage[]>` | `initialChatMessages` | All chat messages indexed by contact ID |
| `localContacts` | `ChatContact[]` | `initialContacts` | All contacts |
| `showEmojiPicker` | `boolean` | `false` | Emoji picker popup |
| `forwardDialog` | `ChatMessage \| null` | `null` | Forward message dialog |
| `newContactDialog` | `boolean` | `false` | New contact dialog |
| `newContactForm` | `{name, phone, label}` | `{...defaults}` | New contact form data |
| `searchInChat` | `boolean` | `false` | In-chat search bar visibility |
| `chatSearchQuery` | `string` | `""` | In-chat search query |
| `isRecording` | `boolean` | `false` | Voice recording mode |
| `showAttachMenu` | `boolean` | `false` | Attachment type picker |
| `msgInfoDialog` | `ChatMessage \| null` | `null` | Message info dialog |
| `infoTab` | `"media" \| "links" \| "docs"` | `"media"` | Contact info panel tab |
| `disappearingMsgs` | `boolean` | `false` | Disappearing messages toggle |
| `showScrollBtn` | `boolean` | `false` | Scroll-to-bottom button visibility |
| `ruleDialog` | `boolean` | `false` | Add/Edit rule dialog |
| `editingRule` | `AutoReplyRule \| null` | `null` | Rule being edited |
| `ruleForm` | `{name, keywords, responseTemplate, type, isActive}` | `{...defaults}` | Rule form data |
| `simInput` | `string` | `""` | Simulator input text |

---

## 4. Functions & Handlers

### Message Handlers

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `handleSendMessage` | — | `void` | Sends message from input field. Creates ChatMessage with status "sent", updates contact lastMsg. Simulates delivery after 1s and read after 2.5s via `setTimeout`. Clears reply state. |
| `handleReply` | `msg: ChatMessage` | `void` | Sets `replyingTo` state. Shows reply preview bar above input. |
| `handleCopyMsg` | `msg: ChatMessage` | `void` | Copies message text to clipboard via `navigator.clipboard.writeText()`. Shows toast. |
| `handleStarMsg` | `msg: ChatMessage` | `void` | Toggles `starred` boolean on the message in `localMessages`. |
| `handleDeleteMsg` | `msg: ChatMessage, forEveryone?: boolean` | `void` | If `forEveryone`: sets `deleted=true` and replaces text with "🚫 This message was deleted". Otherwise: removes message from array. |
| `handleForwardMsg` | `msg: ChatMessage` | `void` | Opens forward dialog by setting `forwardDialog` to the message. |
| `handleForwardTo` | `contactId: number` | `void` | Copies message to target contact's chat with `forwarded: true`. Closes dialog. |
| `handleReactToMsg` | `msg: ChatMessage, emoji: string` | `void` | Toggles emoji in message's `reactions` array. If already present, removes it. |
| `handleContextMenu` | `e: React.MouseEvent, msg: ChatMessage` | `void` | Opens context menu at cursor position. Clamps position to viewport. |

### Contact Handlers

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `handleSelectChat` | `id: number` | `void` | Sets active chat, clears unread count, resets reply/search states. On mobile, shows chat window. |
| `handleBackToList` | — | `void` | Mobile: hides chat window, shows contact list. |
| `handleContactContextMenu` | `e: React.MouseEvent, contact: ChatContact` | `void` | Opens contact-level right-click menu. |
| `handlePinContact` | `id: number` | `void` | Toggles `pinned` on contact. Pinned chats sort to top. |
| `handleMuteContact` | `id: number` | `void` | Toggles `muted` on contact. Shows mute icon in list. |
| `handleArchiveContact` | `id: number` | `void` | Sets `archived: true`. Hides from main list. |
| `handleDeleteChat` | `id: number` | `void` | Removes all messages for contact. Deselects if active. |
| `handleMarkUnread` | `id: number` | `void` | Toggles unread count (0 ↔ 1). |
| `handleAddContact` | — | `void` | Creates new contact from `newContactForm`. Auto-generates avatar initials. |
| `handleLabelChange` | `contactId: number, label: string` | `void` | Updates contact label (VIP/Customer/New/Supplier). |

### Automation Handlers

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `openAddRule` | — | `void` | Resets form and opens rule dialog for new rule. |
| `openEditRule` | `rule: AutoReplyRule` | `void` | Populates form with existing rule data and opens dialog. |
| `saveRule` | — | `void` | Validates form. Calls `addRule` or `updateRule` from store. |
| `handleSimulate` | — | `void` | Sends simulated customer message. Runs through `matchMessage()` from store. If match found, replaces template variables with product data. Adds bot response after 600ms delay. |

---

## 5. UI Components (Internal)

### ContactList
- **Location**: Rendered as left sidebar (320-360px desktop, full-width mobile)
- **Features**: Search bar, filter tabs (All/Unread/Pinned/Groups), contact list with avatars, online indicators, unread badges, pin/mute icons, right-click context menu
- **Sorting**: Pinned contacts first, then by original order

### ChatWindow
- **Location**: Main area (flex-1)
- **Features**: 
  - Header with avatar, name, online status, video/call/search/menu buttons
  - Search-in-chat bar (toggled by search icon)
  - Message area with WhatsApp light wallpaper pattern
  - Encryption notice banner
  - Messages with reply previews, forwarded labels, reactions, status ticks
  - Hover arrow button for context menu
  - Double-click to react with ❤️
  - Reply bar (when replying)
  - Voice recording indicator (when recording)
  - Input bar with emoji picker, attachment menu, text input, send/mic button
  - Scroll-to-bottom floating button

### ContactInfoPanel
- **Location**: Right panel (300-340px, desktop only)
- **Features**:
  - Large avatar, name, phone
  - Editable label selector
  - "About" section
  - Media/Links/Docs tabs
  - Mute notifications toggle
  - Starred messages count
  - Disappearing messages toggle
  - Block, Report, Delete actions

### EmptyChat
- **Location**: Main area when no chat selected
- **Features**: Placeholder with app logo, welcome text, encryption notice

---

## 6. Auto-Reply Engine

### How It Works

```
1. Customer message comes in (simulated or real)
2. matchMessage(text) runs through all active rules
3. For each rule, check if any keyword exists in message (case-insensitive)
4. First matching rule wins (priority = array order)
5. Replace template variables with product data from productStore
6. Return formatted response
```

### Template Variables

| Variable | Source | Example |
|----------|--------|---------|
| `{{product_name}}` | `product.name` | "Ashwagandha Powder" |
| `{{price}}` | `product.price` | "₹450" |
| `{{original_price_info}}` | `product.originalPrice` | "(MRP: ₹599)" |
| `{{slug}}` | `product.slug` | "ashwagandha-powder" |
| `{{stock_status}}` | `product.inStock` | "उपलब्ध ✅" or "Out of Stock ❌" |
| `{{stock_info}}` | `product.stock` | "Stock: 50 units" |
| `{{order_id}}` | Order lookup (future) | "APC-001" |
| `{{tracking_id}}` | Order lookup (future) | "BLUEDART123" |
| `{{status}}` | Order lookup (future) | "Shipped" |

### Product Matching Logic

```typescript
// 1. Search by English name (case-insensitive)
products.find(p => simInput.toLowerCase().includes(p.name.toLowerCase()))
// 2. OR by Hindi name
|| (p.nameHi && simInput.includes(p.nameHi))
```

Unresolved variables are replaced with `[N/A]`.

---

## 7. Message Flow Diagram

### Send Message Flow
```
User types message → handleSendMessage()
  ├── Create ChatMessage { status: "sent" }
  ├── Add to localMessages[activeChat]
  ├── Update contact.lastMsg & lastMsgTime
  ├── Clear message input & replyingTo
  ├── setTimeout(1000ms) → status = "delivered"  (single tick → double tick grey)
  └── setTimeout(2500ms) → status = "read"       (double tick grey → double tick blue)
```

### Reply Flow
```
Right-click → Reply
  ├── setReplyingTo(msg)
  ├── Reply bar appears above input
  ├── User types & sends
  ├── New message includes replyTo: msg.id, replyText: msg.text
  └── Message bubble shows quoted text with green left border
```

### Forward Flow
```
Right-click → Forward
  ├── setForwardDialog(msg) → Dialog opens
  ├── Shows all contacts except current
  ├── User clicks target contact
  ├── handleForwardTo(contactId)
  │   ├── Create new message with forwarded: true
  │   ├── Add to target contact's messages
  │   └── Toast "Forwarded to {name}"
  └── Close dialog
```

### React Flow
```
Double-click message → handleReactToMsg(msg, "❤️")
  OR
Right-click → Reaction emoji row → click emoji
  ├── If emoji already in reactions[] → remove it
  └── If not → add it
  └── Reactions render below bubble as small emoji badges
```

### Delete Flow
```
Right-click → "Delete for me"
  └── Remove message from localMessages array

Right-click → "Delete for everyone" (own messages only)
  ├── Set deleted: true
  ├── Replace text with "🚫 This message was deleted"
  └── Bubble renders with grey italic style
```

---

## 8. Feature Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| Send/receive text messages | ✅ Working | Local state |
| Message delivery ticks (sent/delivered/read) | ✅ Working | Animated via setTimeout |
| Reply to message (quoted) | ✅ Working | Shows preview bar |
| Forward message | ✅ Working | Opens contact picker dialog |
| Copy message text | ✅ Working | Uses clipboard API |
| Star/Unstar message | ✅ Working | Persists in local state |
| React to message (emoji) | ✅ Working | Double-click or context menu |
| Delete for me | ✅ Working | Removes from array |
| Delete for everyone | ✅ Working | Marks as deleted, changes text |
| Message info (sent/delivered/read times) | ✅ Working | Dialog with tick icons |
| Right-click context menu (messages) | ✅ Working | 8 options + reactions |
| Right-click context menu (contacts) | ✅ Working | Pin/Mute/Archive/Delete/Mark unread |
| Contact search | ✅ Working | Name + phone filter |
| Chat filter tabs (All/Unread/Pinned/Groups) | ✅ Working | Groups tab shows empty |
| In-chat message search | ✅ Working | Filters visible messages |
| Pin/Unpin chat | ✅ Working | Sorts to top |
| Mute/Unmute notifications | ✅ Working | Shows mute icon |
| Archive chat | ✅ Working | Hides from list |
| Add new contact | ✅ Working | Dialog with name/phone/label |
| Contact labels (VIP/Customer/New/Supplier) | ✅ Working | Editable in info panel |
| Contact info panel | ✅ Working | Media/Links/Docs tabs |
| Block/Report contact | ✅ UI Only | Shows buttons, no backend |
| Disappearing messages toggle | ✅ UI Only | Toggle state, no actual deletion |
| Emoji picker | ✅ Working | 16 common emojis |
| Attachment menu | ✅ UI Only | Photos/Camera/Document/Contact |
| Voice recording | ✅ UI Only | Recording indicator + cancel/send |
| Scroll-to-bottom button | ✅ Working | Appears when scrolled up |
| QR code device linking | ✅ UI Only | Simulates connect/disconnect |
| Auto-reply rule builder | ✅ Working | CRUD with Zustand persistence |
| Message simulator | ✅ Working | Tests rules with live product data |
| Product lookup (quick reply) | ✅ Working | Loads product info into message input |
| Analytics dashboard | ✅ Working | 4 KPIs + rule performance bars |
| Mobile responsive | ✅ Working | Full-screen toggle between list/chat |
| Light theme | ✅ Working | Cream/green matching site palette |

---

## 9. Backend Migration Guide

### Required Database Tables

```sql
-- 1. WhatsApp Contacts
CREATE TABLE whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),  -- admin who manages this
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  avatar TEXT,          -- initials or image URL
  label TEXT CHECK (label IN ('customer', 'new', 'vip', 'supplier')),
  about TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. WhatsApp Messages
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  from_me BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('sent', 'delivered', 'read')) DEFAULT 'sent',
  reply_to UUID REFERENCES whatsapp_messages(id),
  is_starred BOOLEAN DEFAULT false,
  is_forwarded BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  reactions JSONB DEFAULT '[]',
  message_type TEXT CHECK (message_type IN ('text', 'image', 'document', 'voice')) DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Auto-Reply Rules
CREATE TABLE whatsapp_auto_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL,          -- PostgreSQL array
  response_template TEXT NOT NULL,
  rule_type TEXT CHECK (rule_type IN ('greeting', 'product', 'order', 'custom')),
  is_active BOOLEAN DEFAULT true,
  match_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_contacts;

-- 5. RLS Policies
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_auto_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage contacts"
  ON whatsapp_contacts FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can manage messages"
  ON whatsapp_messages FOR ALL TO authenticated
  USING (contact_id IN (SELECT id FROM whatsapp_contacts WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can manage rules"
  ON whatsapp_auto_rules FOR ALL TO authenticated
  USING (auth.uid() = user_id);
```

### Migration Steps

1. Create tables above via Lovable Cloud migration tool
2. Replace `useState` for contacts/messages with `useQuery`/`useMutation` from `@tanstack/react-query`
3. Replace `useWhatsAppStore` for rules with Supabase queries
4. Add realtime subscription for `whatsapp_messages` to get live updates
5. Implement file upload for image/document messages via Supabase Storage

---

## 10. WhatsApp Business API Integration

### Prerequisites

- Meta Business Account
- WhatsApp Business API access (via Meta Cloud API)
- Phone number registered with WhatsApp Business

### Webhook Endpoint (Edge Function)

```
POST /functions/v1/whatsapp-webhook
```

**Receives**: Incoming messages from Meta Graph API  
**Sends**: Auto-reply responses via Graph API

### Message Format (Meta Cloud API)

```json
// Sending a text message
POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
{
  "messaging_product": "whatsapp",
  "to": "919876543210",
  "type": "text",
  "text": { "body": "Hello from Apsoncure!" }
}

// Sending a template message
{
  "messaging_product": "whatsapp",
  "to": "919876543210",
  "type": "template",
  "template": {
    "name": "order_update",
    "language": { "code": "hi" },
    "components": [{
      "type": "body",
      "parameters": [
        { "type": "text", "text": "APC-001" },
        { "type": "text", "text": "Shipped" }
      ]
    }]
  }
}
```

### Required Secrets

| Secret Name | Description |
|-------------|-------------|
| `WHATSAPP_TOKEN` | Meta Graph API permanent access token |
| `WHATSAPP_PHONE_ID` | Phone number ID from Meta Business Manager |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification token (you define) |
| `WHATSAPP_BUSINESS_ID` | WhatsApp Business Account ID |

### Webhook Verification (GET request)

```typescript
// Edge function handles verification challenge
if (req.method === "GET") {
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
}
```

### Incoming Message Handler (POST)

```typescript
// Extract message from webhook payload
const { entry } = await req.json();
const message = entry[0].changes[0].value.messages[0];
const from = message.from;      // sender phone
const text = message.text.body;  // message text

// 1. Save to database
// 2. Run auto-reply matching
// 3. Send response via Graph API
```

---

## Developer

**MLHK Infotech** (Hariom Vishwkarma) — [mlhk.in](https://mlhk.in)
