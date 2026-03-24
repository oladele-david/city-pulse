# UPDATED CITYPULSE CITIZEN — MOBILE PRD (MAP-FIRST)

## Core Experience Summary
- **Home**: Lightweight map + status
- **Map**: Full interactive civic map
- **Report**: Focused reporting flow
- **Activity**: Trust & feedback
- **Profile**: Privacy & settings

---

## 1. HOME (MAP-FIRST, LIGHTWEIGHT)
**Purpose**: Immediate context. “What’s happening around me?”

### Home Screen Layout
**A. Mini Map (Top 60%)**
- Shows: User’s live location (blue dot), Nearby reported issues (heatmap)
- Limited zoom & pan
- Tapping expands to full Map tab

**B. Status Strip**
- “CityPulse is active in your area”
- Last sync time

**C. Nearby Issues Summary**
- Cards like: “Road issue reported 120m away”, “Lighting issue resolved nearby”
- Tap → opens Map focused on that issue.

**D. Primary CTA**
- Report an Issue

### Home Capabilities
- Location-based issue preview
- Passive trust building
- No pin interaction here (that’s Map tab)

---

## 2. MAP (FULL INTERACTIVE CORE)
This is where the magic happens.

### Map Features
**Base Map**
- Mapbox
- Clean city style
- User location always visible

**Issue Pins**
- Pin color: Red (High), Orange (Medium), Yellow (Low)
- Pin icon changes by issue type.

### Tapping an Issue Pin Opens Bottom Sheet
**Issue Sheet Shows**:
- Issue type, Distance from user, Confidence level, Number of confirmations, Current status

### User Actions on Existing Issues
- ✅ **Confirm Issue**: Adds credibility-weighted confirmation
- ❌ **Disagree**: Counts as soft contradiction, not “fake” (avoids abuse/legal risk)

**Heat Overlay (Optional Toggle)**
- Subtle heatmap showing issue density via Mapbox heat layer

**Map Filters (Top Sheet)**
- Issue type, Distance range, Status

---

## 3. REPORT (PIN DRAGGING INCLUDED)
**Entry**: Home CTA or Map FAB (+)

### Report Flow (4 Steps)
1. **Select Issue Type**: Same as desktop.
2. **Location Selection (NEW)**: Map centered on user with draggable pin + “Move pin if needed” helper.
3. **Evidence (Optional)**: Photo + Short note (120 chars).
4. **Submit**: Confirmation message: “Thanks. This helps keep the city running.”

**Duplicate Detection (Silent)**: Suggestions to confirm existing nearby issues instead of creating new ones.

---

## 4. ACTIVITY (POINTS, DONE RIGHT)
**Purpose**: Trust, not competition.

### Activity Overview
**A. Credibility Score Labels**: New, Reliable, Trusted
- Based on: Confirmed reports, Accuracy, Consistency

**B. My Contributions List**: Reports, Confirmations, Resolution feedback

**C. Resolution Notifications**: Alert when a confirmed issue is resolved.

**Points Logic (Internal)**: +1 confirmation, +3 verified report, -1 repeated disagreement.

---

## 5. PROFILE (UNCHANGED, WITH CLARITY)
- Permissions
- Language toggle
- Privacy explanations
- Account info
