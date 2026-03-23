# Product Context

**CityPulse** (Arabic descriptor: **نبض المدينة**) is a civic infrastructure intelligence platform that aggregates citizen-generated signals to help city authorities monitor, prioritize, and resolve urban infrastructure issues in near real-time.

> **Note**: This is an MVP focused on operational clarity and government usability. No marketing pages.

---

## Core Navigation

Create a top navigation with the following items:

1. **Dashboard**
2. **Live Map**
3. **Issues**
4. **Analytics**
5. **Settings**

---

## 1. Dashboard (Overview)

**Purpose**: At-a-glance city health.

### Include
- **KPI Cards**:
  - Active Issues
  - High Severity Issues
  - Resolved (Last 7 Days)
  - Average Resolution Time
- **Mini heatmap preview** of issue density.
- **Recent activity feed** (e.g., "New road issue detected in Al Quoz").

### Behavior
- KPI cards link to a filtered **Issues** view.
- Data refreshes automatically.

---

## 2. Live Map (Core Page)

**Purpose**: Clean city-style interactive map.

- **Visuals**: Issue markers clustered when zoomed out.
- **Marker Logic**:
  - 🔴 **Red** = High Severity
  - 🟠 **Orange** = Medium Severity
  - 🟡 **Yellow** = Low Severity
  - Marker size reflects **confidence score**.

### Filters
- Issue type
- Severity
- Status
- Date range

### Interaction
Clicking a marker opens a **side drawer** with:
- Issue type
- Area name
- Confidence score
- Supporting reports count
- Status dropdown (**Open** / **In Progress** / **Resolved**)
- Timeline of updates

---

## 3. Issues Page

**Purpose**: List view for management.

### Table Columns
- Issue Type
- Location
- Severity
- Confidence %
- Reports
- Status
- Last Updated

### Features
- Sorting and filtering.
- Inline status update.
- Bulk select → mark as **In Progress**.

---

## 4. Analytics

**Purpose**: Data insights.

### Charts
- Issues by Type
- Issues by Area
- Resolution Time Trend

### Extras
- Heat zones table.
- CSV export.

---

## 5. Settings

**Purpose**: User and system configuration.

- User profile.
- Notification preferences (email for high severity).
- **Roles**:
  - **Viewer** (read-only)
  - **Operator** (can update issue status)

---

## Data Model

### Infrastructure Issue
```typescript
{
  id: string;
  type: "road" | "drainage" | "lighting" | "noise" | "heat";
  latitude: number;
  longitude: number;
  confidence_score: number; // 0–100
  severity: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  supporting_reports_count: number;
  created_at: Date;
  last_updated: Date;
}
```

---

## Constraints

- ❌ **No AI prediction engine**
- ❌ **No citizen management**
- ❌ **No gamification**
- ✅ **Clean, professional government UI**
- ✅ **Desktop-first, responsive**

---

## Bilingual UI Labels (EN / AR)

Use **Modern Standard Arabic**, neutral and official.

### Navigation
| English | Arabic |
| :--- | :--- |
| Dashboard | لوحة التحكم |
| Live Map | الخريطة الحية |
| Issues | البلاغات |
| Analytics | التحليلات |
| Settings | الإعدادات |

### Core Terms
| English | Arabic |
| :--- | :--- |
| Active Issues | البلاغات النشطة |
| High Severity | عالية الخطورة |
| Resolved | تم الحل |
| In Progress | قيد المعالجة |
| Confidence Score | نسبة الموثوقية |
| Reports | عدد البلاغات |
| Issue Type | نوع المشكلة |
| Location | الموقع |
| Last Updated | آخر تحديث |

### Issue Types
| English | Arabic |
| :--- | :--- |
| Road Issue | مشاكل الطرق |
| Drainage | تصريف المياه |
| Lighting | الإنارة |
| Noise | الضوضاء |
| Heat Stress | الإجهاد الحراري |

### System
- **Language Toggle**: English | العربية

> That’s enough for MVP. Anything more is waste.

---

## Official One-Line Product Description

### English
**CityPulse** is a real-time civic infrastructure intelligence platform that helps cities detect, prioritize, and resolve urban issues using trusted community signals.

### Arabic
**CityPulse** هي منصة ذكية لمراقبة البنية التحتية الحضرية في الوقت الحقيقي، تساعد الجهات الحكومية على رصد المشكلات وتحديد أولوياتها ومعالجتها بالاعتماد على إشارات المجتمع.

> Short, serious, government-safe.