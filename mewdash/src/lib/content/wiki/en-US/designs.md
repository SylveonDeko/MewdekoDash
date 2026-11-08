---
title: Designs
slug: designs
summary: Card designs that members can wear on their rank and achievement cards
icon: fa-palette
category: Community
dashboard: /dashboard/currency?tab=designs
module: Xp
tags: [designs, card designs, rank card, achievement card, backgrounds, equip, unequip, shop, unlock, themes]
related: [xp, achievements, currency]
---

## What it does

A design changes how a member's card looks. There are two kinds. A **Rank card** design is a background for the `rank` card. An **Achievement card** design is a full card layout for unlock and profile images, made in the same designer as the achievement cards.

You decide how members get each design:

| Availability | Who can wear it |
| --- | --- |
| Free for all | Every member |
| Sold in the shop | Members who bought the linked shop item |
| Unlocked by progress | Members who reach a level, earn an achievement or hold a role |

Members wear one design per card. One design can be the **Community default**, which applies to members who have not equipped anything.

## Managing designs

Open **Currency** and go to the **Designs** tab. The **XP** page and the **Cards** tab of Achievements link there too. Each design shows a preview, its card, how members get it, who owns it, and a **Default** marker.

**New design** opens the editor:

| Field | What it does |
| --- | --- |
| Name | Up to 40 characters, unique in the community |
| Card | **Rank card** or **Achievement card**. Fixed once the design is saved |
| Availability | **Free for all**, **Sold in the shop** or **Unlocked by progress** |
| Unlocks when | Unlock designs only: **Reach a level** (1 to 1000), **Earn an achievement** or **Have a role** |
| Community default | Make it the default for its card |

Rank designs have a background picker with presets and your own images. A live preview shows the result. Achievement designs have **Edit card layout**, which opens the card designer. Card images you upload count towards the 30 images per community shared with the achievement cards. Members cannot upload anything.

Changing an unlock condition grants the design straight away to members who already meet it. Deleting a design removes it from everyone who owns it and turns off a shop item selling it.

## Selling designs

Create the design with **Sold in the shop**, then on the **Shop** tab add an item of type **Design** and pick it. Buying the item gives the member the design. See [Currency](/wiki/currency).

## Wearing designs

Members open **My profile** and use the **Designs** section. It lists each community where they have designs, with a preview for each and an **Equip** or **Unequip** button per card. They can also use commands. Run these with your server's prefix (`.` unless you changed it).

| Command | Slash | Needs | Purpose |
| --- | --- | --- | --- |
| `designs` | `/xp designs` | Nobody | List the designs you can wear |
| `equip <design>` | `/xp equip` | Nobody | Wear a design you own or that is free |
| `unequipdesign <rank\|achievement>` | `/xp unequip` | Nobody | Stop wearing your design for that card |

## Member designs

Communities can let members make their own rank and achievement card design. Each member gets one design per card, and it appears in their **Designs** section as **My design** next to the designs they own. They equip and unequip it like any other.

Set the rules under **Currency**, **Designs**, **Member designs**:

| Setting | What it does |
| --- | --- |
| Enabled | Turns member designs on. Off by default |
| Who can make one | **Everyone**, **Members with a role** (pick the roles) or **Members at or above a level** |
| Backgrounds | **Presets only** or **Presets and uploads** |
| Review uploads | Uploaded backgrounds wait for a moderator. On by default, only used when uploads are allowed |
| Cost per save | Currency charged every time a member saves their design. 0 is free |

Members choose from the same background presets as everyone else. A rank design is a preset background. An achievement design is a full card layout, and its colours and layout are free, but any image has to be a preset. With uploads on, a member can also upload one background of their own. Members cannot link outside images.

### Limits

- One design per member per card, and one upload per design.
- Member uploads share a separate pool of 200 images per community, shown under the settings. They do not use the 30 images for your own cards.

### Review and moderation

With **Review uploads** on, a new upload is **Pending** and the card keeps showing the member's preset until you approve it. The **Member designs** list below the settings lists every member design with a preview and its status. It also shows who made each one. Filter it by **All**, **Pending**, **Approved** or **Rejected**.

| Action | What happens |
| --- | --- |
| Approve | The upload goes live. Only for pending designs |
| Reject | The upload is turned down and the member keeps their preset. Only for pending designs |
| Remove | Deletes the design and frees its upload |

Reject and Remove take an optional reason of up to 300 characters, and the bot sends it to the member in a DM. If their DMs are closed the action still goes through and the dashboard tells you.

### Turning it off

When member designs are turned off, or a member stops qualifying because they lost the role or fell below the level, their design stops showing and the card falls back to their other design or the community default. The design is kept, and it comes back when member designs are on again and the member qualifies.

### Commands

| Command | Slash | Needs | Purpose |
| --- | --- | --- | --- |
| `mydesign` | `/xp mydesign` | Nobody | Show the status of the designs you made |
| `memberdesigns` | `/xp memberdesigns` | Manage Server | List member designs waiting for review |
| `approvedesign <user> <rank\|achievement>` | `/xp approvedesign` | Manage Server | Approve a member's pending upload |
| `rejectdesign <user> <rank\|achievement> [reason]` | `/xp rejectdesign` | Manage Server | Reject a member's pending upload and tell them |

## Tips and gotchas

- Saving costs the same every time, including small edits.
- A pending upload does not count as approved: only the member sees it until you approve it.

- A member's equipped design wins over the community default.
- Only designs set to **Sold in the shop** appear in the shop item's design picker.
- A design the member does not own cannot be equipped, and the bot says so.
- Deleting a design takes it away from every owner, so edit it instead when you only want to change how it looks.
