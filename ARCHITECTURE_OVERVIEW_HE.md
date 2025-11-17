# תיעוד ארכיטקטורת BrandFrame Studio v2

## תוכן עניינים
1. [סקירה כללית](#סקירה-כללית)
2. [מבנה הפרוייקט](#מבנה-הפרוייקט)
3. [טכנולוגיות ומחסנית](#טכנולוגיות-ומחסנית)
4. [רכיבים עיקריים](#רכיבים-עיקריים)
5. [תכונות מרכזיות](#תכונות-מרכזיות)
6. [מודלי נתונים](#מודלי-נתונים)
7. [שירותים וממשקי API](#שירותים-וממשקי-api)
8. [ארכיטקטורת UI/UX](#ארכיטקטורת-uiux)
9. [קבצי קונפיגורציה](#קבצי-קונפיגורציה)
10. [בנייה ופריסה](#בנייה-ופריסה)
11. [דפוסים ארכיטקטוניים ייחודיים](#דפוסים-ארכיטקטוניים-ייחודיים)

---

## סקירה כללית

**BrandFrame Studio v2** היא אפליקציית יצירת תסריט מונפשת (storyboard) מבוססת בינה מלאכותית, המיועדת ליצירת תוכן מקצועי ברמת שידור. האפליקציה משלבת מודלים מתקדמים של Google Gemini ליצירת סיפורים עם ויזואליה עקבית, תסריטאות מקצועית, ומערכת ניהול פרויקטים מתוחכמת.

### מטרות המערכת:
- יצירת סיפורים חזותיים מקצועיים באמצעות AI
- תמיכה במגוון נכסים ויזואליים (לוגו, דמויות, רקעים, סגנונות)
- אחידות ויזואלית משופרת עם אימות אוטומטי
- ממשק מותאם למובייל ולדסקטופ
- ייצוא מקצועי למספר פורמטים

---

## מבנה הפרוייקט

```
C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\
│
├── components/              # רכיבי React (22 קבצים)
│   ├── Dashboard.tsx        # פאנל ראשי
│   ├── StoryboardWizard.tsx # אשף יצירה רב-שלבי (מובייל)
│   ├── StoryboardView.tsx   # תצוגת סיפור ויזואלי
│   ├── ProfessionalScriptView.tsx # תצוגת תסריט מקצועי
│   ├── ScriptView.tsx       # תצוגת תסריט פשוטה
│   ├── StoryWorldPanel.tsx  # תצוגת פרמטרים של עולם הסיפור
│   ├── InputPanel.tsx       # פאנל העלאת נכסים (דסקטופ)
│   ├── ImageUpload.tsx      # רכיב העלאת תמונות
│   ├── MyProjects.tsx       # ניהול פרויקטים שמורים
│   ├── ViralShortsView.tsx  # דפדפן YouTube Shorts
│   ├── VideoCard.tsx        # כרטיסי תצוגת וידאו
│   ├── VideoDetailsModal.tsx # מודל מטא-דאטה של וידאו
│   ├── MobileGenerationScreen.tsx # מסך יצירה למובייל
│   ├── GenerationProgress.tsx # אינדיקטור התקדמות
│   ├── ErrorBoundary.tsx    # גבול טיפול בשגיאות
│   ├── Sidebar.tsx          # ניווט דסקטופ
│   ├── BottomNav.tsx        # ניווט מובייל
│   ├── WizardStep.tsx       # עטיפת שלב אשף
│   ├── WizardProgress.tsx   # אינדיקטור התקדמות אשף
│   ├── WizardNavigation.tsx # בקרות ניווט אשף
│   └── icons.tsx            # רכיבי SVG אייקונים
│
├── hooks/                   # React Hooks מותאמים (4 קבצים)
│   ├── useStoryboard.ts     # לוגיקת יצירת סיפור
│   ├── useProjects.ts       # פעולות CRUD על פרויקטים
│   ├── useDrafts.ts         # שמירה/טעינה של טיוטות (Supabase)
│   └── useLocalStorage.ts   # אבסטרקציה של LocalStorage
│
├── services/                # אינטגרציות API חיצוניות (2 קבצים)
│   ├── geminiService.ts     # עטיפת Gemini API
│   └── youtubeService.ts    # עטיפת YouTube API
│
├── utils/                   # פונקציות עזר (9 קבצים)
│   ├── logger.ts            # מערכת לוגים מובנית
│   ├── errorHandler.ts      # עיצוב שגיאות
│   ├── errorReporter.ts     # טיפול גלובלי בשגיאות
│   ├── apiClient.ts         # עטיפת HTTP client
│   ├── apiLogger.ts         # לוגים של קריאות API
│   ├── fileUtils.ts         # כלי המרת קבצים
│   ├── fileSystem.ts        # File System Access API
│   ├── imageValidation.ts   # אימות איכות תמונות
│   └── imageMetadata.ts     # חילוץ מטא-דאטה של תמונות
│
├── config/                  # קבצי קונפיגורציה
│   └── supabase.ts          # קונפיגורציה של Supabase
│
├── constants/               # קבועים של האפליקציה
│   └── index.ts             # קונפיגורציות API, מגבלות, הודעות
│
├── supabase/                # Backend של Supabase
│   ├── functions/           # Edge Functions (serverless)
│   │   ├── gemini-storyboard/
│   │   │   ├── index.ts     # פונקציית יצירת סיפור ראשית
│   │   │   └── enhanced-consistency.ts # מנוע אחידות ויזואלית
│   │   └── youtube-api/
│   │       └── index.ts     # פרוקסי YouTube API
│   └── migrations/          # מיגרציות בסיס נתונים (3 קבצים)
│       ├── 20251116090348_create_projects_table.sql
│       ├── 20251116195520_create_storyboard_drafts_table.sql
│       └── 20251116215422_create_ai_agent_intelligence_tables.sql
│
├── scripts/                 # סקריפטים עזר
│   └── viewLogs.ts          # כלי צפייה בלוגים
│
├── App.tsx                  # רכיב אפליקציה ראשי (900 שורות)
├── index.tsx                # נקודת כניסה של React
├── index.html               # תבנית HTML
├── types.ts                 # הגדרות טיפוסים TypeScript
├── vite.config.ts           # קונפיגורציית Vite
├── tsconfig.json            # קונפיגורציית TypeScript
├── netlify.toml             # קונפיגורציית Netlify
└── package.json             # תלויות וסקריפטים
```

---

## טכנולוגיות ומחסנית

### Frontend
- **React 19.2.0** - ספריית UI מודרנית
- **TypeScript 5.8.2** - הקלדה סטטית חזקה
- **Vite 6.2.0** - כלי בנייה מהיר
- **Tailwind CSS** - עיצוב מבוסס utility classes (דרך CDN)
- **ES2022** - JavaScript מודרני

### Backend (Serverless)
- **Supabase Edge Functions** - פונקציות serverless (Deno runtime)
- **Supabase PostgreSQL** - בסיס נתונים מנוהל
- **Supabase Authentication** - מערכת אימות (מוכנה לשימוש)

### שירותי AI ו-API
- **Google Gemini API** (@google/genai 1.29.0)
  - `gemini-2.5-pro` - יצירת סיפורים ותסריטים
  - `gemini-2.5-pro-vision` - ניתוח ויזואלי ואימות עקביות
  - `gemini-2.5-flash-image` - יצירת תמונות
- **YouTube Data API v3** - חיפוש וידאו ומטא-דאטה

### כלי פיתוח
- **ESLint** - בדיקת איכות קוד
- **Prettier** - עיצוב קוד
- **TypeScript Strict Mode** - הקלדה קפדנית

### פריסה
- **Netlify** - אירוח frontend
- **Supabase** - backend וממשקי API

---

## רכיבים עיקריים

### 1. App.tsx (900 שורות)
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\App.tsx`

**תפקידים:**
- ניהול state מרכזי של כל האפליקציה
- 4 תצוגות ראשיות: dashboard, my-projects, viral-shorts, mobile-generation
- ניהול העלאת נכסים:
  - לוגו (אחד)
  - דמות ראשית (אחת)
  - דמויות נוספות (עד 8)
  - רקע (אחד)
  - סגנון אמנותי (אחד)
- מערכת שחזור טיוטות
- לוגיקת responsive למובייל/דסקטופ
- פונקציונליות ייצוא:
  - `storyboard.json`
  - `prompts_veo.txt`
  - `production_notes.txt`
  - `captions.srt`
  - `story_world.txt`

### 2. Dashboard.tsx
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\components\Dashboard.tsx`

**תפקידים:**
- פריסת dashboard פרויקט
- ניווט טאבים: storyboard, script, professional
- בקרות שמירה/ייצוא
- אינטגרציה עם אינדיקטור התקדמות
- אינטגרציה עם פאנל Story-World

### 3. StoryboardWizard.tsx
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\components\StoryboardWizard.tsx`

**תפקידים:**
- אשף 5 שלבים:
  1. **Assets** - העלאת נכסים (לוגו, דמויות, רקע, סגנון)
  2. **Visuals** - העלאת דמויות נוספות
  3. **Settings** - בחירת מספר פריימים (2-8) ויחס גובה-רוחב (16:9 / 9:16)
  4. **Story** - הזנת רעיון לסיפור
  5. **Review** - סקירה סופית לפני יצירה
- שמירה אוטומטית ל-Supabase drafts
- ממשק מותאם למובייל
- תמיכה ב-8 פריימים מקסימום (4 סצנות)
- מודל שחזור טיוטות

### 4. StoryboardView.tsx
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\components\StoryboardView.tsx`

**תפקידים:**
- תצוגת פריימים frame-by-frame
- השוואת גרסאות A/B לכל סצנה
- הורדת פריימים בודדים
- אימות איכות תמונות
- תכונת "המשך נרטיב"

### 5. ProfessionalScriptView.tsx
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\components\ProfessionalScriptView.tsx`

**תפקידים:**
- פירוק תסריט מקצועי ל-8 רבדים
- פרטי סצנה ניתנים להרחבה/כיווץ
- היררכיית רבדים:
  - **TIER 1:** Cinematography & Format
  - **TIER 2:** Subject Identity
  - **TIER 3:** Scene & Context
  - **TIER 4:** Action + Camera Composition
  - **TIER 5:** Style & Ambiance
  - **TIER 6:** Audio & Dialogue
  - **TIER 7:** Technical & Negative
- הצגת פרומפט Veo 3.1 (מקסימום 500 תווים)

### 6. StoryWorldPanel.tsx
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\components\StoryWorldPanel.tsx`

**תפקידים:**
- הצגת פרמטרים של עולם הסיפור (Story-World)
- הצגה של:
  - **Premise** - הנחת יסוד / שורה לוגית
  - **Theme** - נושא מרכזי
  - **Structure** - מבנה 3 מערכות
  - **Character Blueprint** - תכנית דמות (15+ תכונות)
  - **Core Conflict** - קונפליקט מרכזי (פנימי/חיצוני)
  - **Boundaries** - גבולות (מרחבי, זמני, היסטורי, ויזואלי)

### 7. ViralShortsView.tsx
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\components\ViralShortsView.tsx`

**תפקידים:**
- ממשק חיפוש YouTube Shorts
- שמירת היסטוריית חיפושים (caching)
- בחירת וידאו להשראת סיפור
- אינטגרציה עם שירות YouTube API

---

## תכונות מרכזיות

### יצירת Storyboard
- תמיכה במספר נכסים: לוגו, דמות ראשית, רקע, סגנון אמנותי, דמויות נוספות
- בחירת מספר פריימים: 2, 4, 6, או 8 (1-4 סצנות)
- יחס גובה-רוחב: 16:9 או 9:16
- מעקב התקדמות בזמן אמת עם הערכת זמן נותר
- יצירת גרסאות A/B לכל סצנה
- אימות אחידות ויזואלית משופר (סף 85%)

### ארכיטקטורת Story-World (מבנה עמוק)
- **Premise/Logline** - עם גורם "אני חייב לדעת"
- **Theme** - חקירת נושא
- **Three-Act Structure** - הקמה, עימות, פתרון
- **Structural Attractors** - 6-8 נקודות עלילה
- **Character Blueprint** - 15+ תכונות
- **Core Conflict** - קונפליקט פנימי/חיצוני
- **Boundaries** - גבולות מרחביים, זמניים, היסטוריים, ויזואליים

### תכונות תסריט מקצועי
- מפרט ברמת שידור Level 9
- מערכת Master Screenplay Architect
- היררכיית 8 רבדים (tiers)
- פרומפטים מותאמים ל-Veo 3.1 (מקסימום 500 תווים)
- תיאורי סצנה פורנזיים
- מפרט מצלמה/צילום (ARRI Alexa Mini LF, Sony Venice, RED Komodo)

### מנוע אחידות ויזואלית
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\supabase\functions\gemini-storyboard\enhanced-consistency.ts`

- ניתוח ויזואלי מפורט של תמונות ייחוס
- מעקב אחר זהות דמויות (ביגוד, אקססוריז, תסרוקת, תווי פנים)
- עקביות סביבה (רקע, ארכיטקטורה, תאורה, פלטת צבעים)
- יצירה אוטומטית מחדש בכישלון עקביות (<85% ציון)
- עד 3 ניסיונות חזרה לכל פריים

### ניהול פרויקטים
- שמירת פרויקטים ל-localStorage (מגבלה: 50 פרויקטים)
- שמירה אוטומטית של טיוטות ל-Supabase
- מערכת שחזור טיוטות
- חבילת ייצוא: 5 קבצים + תמונות
- הורדת תמונות לתיקיית Downloads
- אינטגרציה עם File System Access API

### אופטימיזציה למובייל
- עיצוב responsive (נקודת שבירה: 1024px)
- ממשק אשף ייעודי למובייל
- מסך יצירה ייעודי למובייל
- ניווט תחתון למובייל
- בקרות מותאמות למגע (גובה מינימלי 44px)

### אינטגרציית YouTube
- גילוי Shorts פופולריים
- חיפוש מותאם עם caching
- שליפת מטא-דאטה של וידאו
- חילוץ תגובות (10 עליונות)
- השראת סיפור מתוכן וידאו

---

## מודלי נתונים

### טיפוסים עיקריים (types.ts)
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\types.ts`

```typescript
// פריים בודד (תמונה)
interface Frame {
  id: string;
  variant: 'A' | 'B';  // גרסה A או B
  imageUrl: string;    // URL של התמונה
  metadata: {
    composition: string;   // הרכב התמונה
    palette: string[];     // פלטת צבעים
    lighting: string;      // תאורה
    camera: string;        // מפרט מצלמה
  };
}

// סצנה (2 פריימים - A ו-B)
interface Scene {
  id: number;
  title: string;
  scriptLine: string;
  emotion: string;
  intent: string;
  frames: [Frame, Frame];  // תמיד 2 פריימים

  // היררכיית 8 רבדים
  cinematographyFormat: string;
  subjectIdentity: string;
  sceneContext: string;
  action: string;
  cameraComposition: string;
  styleAmbiance: string;
  audioDialogue: string;
  technicalNegative: string;
  veoPrompt: string;  // פרומפט מותאם Veo

  // מעקב מבנה עמוק (אופציונלי)
  deepStructure?: string;
  intermediateStructure?: string;
  surfaceStructure?: string;
}

// עולם הסיפור
interface StoryWorld {
  premise: string;
  theme: string;
  structure: {
    act1: string;
    act2: string;
    act3: string;
    attractors: string[];  // נקודות עלילה
  };
  characterBlueprint: string;
  coreConflict: {
    internal: string;
    external: string;
  };
  boundaries: {
    spatial: string;
    temporal: string;
    historical: string;
    visual: string;
  };
}

// נכס (תמונה מקודדת base64)
interface Base64Asset {
  base64: string;
  filename: string;
  mimeType: string;
}

// Storyboard שלם
interface Storyboard {
  scenes: Scene[];
  storyWorld?: StoryWorld;
  aspectRatio?: '16:9' | '9:16';
  assets?: {
    logo?: Base64Asset | null;
    mainCharacter?: Base64Asset | null;
    additionalCharacters?: Base64Asset[];
    background?: Base64Asset | null;
    artStyle?: Base64Asset | null;
  };
}
```

### סכמת בסיס הנתונים (Supabase PostgreSQL)

**טבלאות:**

1. **projects** - פרויקטים שמורים של משתמשים
   ```sql
   - id: uuid (PK)
   - created_at: timestamp
   - updated_at: timestamp
   - data: jsonb  -- כל נתוני ה-storyboard
   ```

2. **storyboard_drafts** - טיוטות מהאשף
   ```sql
   - id: uuid (PK)
   - created_at: timestamp
   - updated_at: timestamp
   - step: int  -- שלב נוכחי באשף
   - data: jsonb  -- נתוני הטיוטה
   - thumbnail: text  -- תמונה ממוזערת
   ```

3. **generation_sessions** - מעקב אחר יצירות AI
   ```sql
   - id: uuid (PK)
   - created_at: timestamp
   - status: text  -- pending/processing/completed/failed
   - input_data: jsonb
   - output_data: jsonb
   - error: text
   ```

4. **agent_decisions** - לוגים של החלטות AI
   ```sql
   - id: uuid (PK)
   - session_id: uuid (FK)
   - agent_type: text
   - decision_type: text
   - input: jsonb
   - output: jsonb
   - reasoning: text
   - confidence_score: float
   - execution_time_ms: int
   - created_at: timestamp
   ```

5. **consistency_validations** - אימותי עקביות ויזואלית
   ```sql
   - id: uuid (PK)
   - session_id: uuid (FK)
   - frame_id: text
   - score: float  -- 0-100
   - passed: boolean  -- >= 85
   - feedback: jsonb
   - created_at: timestamp
   ```

---

## שירותים וממשקי API

### 1. geminiService.ts
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\services\geminiService.ts`

**פונקציות:**
- `generateStoryboard()` - יצירת storyboard חדש
- `continueStoryboard()` - המשך נרטיב קיים
- המרת קבצים ל-base64
- callbacks להתקדמות
- אימות גודל קובץ (50MB מקסימום)
- טיפול בשגיאות עם תרגומים לעברית

**שימוש במודלים:**
- `gemini-2.5-pro`: יצירת Story-World ותסריטים (JSON output)
- `gemini-2.5-pro-vision`: ניתוח ויזואלי ואימות עקביות
- `gemini-2.5-flash-image`: יצירת תמונות (base64 output)

### 2. youtubeService.ts
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\services\youtubeService.ts`

**פונקציות:**
- `fetchTrendingShorts()` - קבלת סרטונים פופולריים
- `fetchVideoMetadata()` - קבלת פרטי וידאו
- `fetchVideoComments()` - קבלת תגובות עליונות
- פרוקסי דרך Supabase Edge Functions

**קונפיגורציה:**
- מקסימום תוצאות: 20
- סינון: `videoDuration=short` (עד 60 שניות)
- מטמון חיפושים: LocalStorage

### 3. Supabase Edge Functions

#### gemini-storyboard
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\supabase\functions\gemini-storyboard\index.ts`

**תפקידים:**
- קבלת בקשה ליצירת storyboard
- יצירת Story-World
- יצירת תסריטים לסצנות
- יצירת תמונות עם אימות עקביות
- החזרת תוצאות ב-JSON

**תהליך יצירה:**
1. פרסור קלט (idea, assets, settings)
2. יצירת Story-World (gemini-2.5-pro)
3. לולאה על סצנות:
   - יצירת תסריט סצנה (gemini-2.5-pro)
   - יצירת גרסה A (gemini-2.5-flash-image)
   - אימות עקביות (enhanced-consistency.ts)
   - אם נכשל - יצירה מחדש (עד 3 פעמים)
   - יצירת גרסה B
4. החזרת storyboard שלם

#### youtube-api
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\supabase\functions\youtube-api\index.ts`

**תפקידים:**
- פרוקסי ל-YouTube Data API v3
- הסתרת API key מה-frontend
- תמיכה ב-3 endpoints:
  - `/search` - חיפוש וידאו
  - `/videos` - מטא-דאטה
  - `/commentThreads` - תגובות

---

## ארכיטקטורת UI/UX

### מערכת ניווט
- **דסקטופ:** Sidebar שמאלי (רוחב 256px)
- **מובייל:** Bottom navigation קבוע (גובה 80px)

### תצוגות ראשיות
1. **Dashboard** - יצירת storyboard
2. **My Projects** - רשת פרויקטים שמורים
3. **Viral Shorts** - השראה מ-YouTube
4. **Mobile Generation** - מסך יצירה למובייל

### טאבים (Dashboard)
1. **Storyboard View** - פריימים ויזואליים עם גרסאות A/B
2. **Script View** - תסריט טקסט פשוט
3. **Professional View** - פירוק תסריט 8 רבדים

### עיצוב וצבעים
- **צבע ראשי:** Indigo (#4F46E5)
- **הצלחה:** ירוק
- **שגיאה:** אדום
- **רקע:** Gray-50
- **כרטיסים:** לבן עם shadow-lg

### נקודות שבירה (Responsive)
- **מובייל:** < 1024px
- **דסקטופ:** >= 1024px
- **יעדי מגע:** גובה מינימלי 44px

### מערכת פונטים
- **פונט ראשי:** Inter (Google Fonts)
- **משקלים:** 400, 500, 600, 700, 800

---

## קבצי קונפיגורציה

### vite.config.ts
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\vite.config.ts`

```typescript
{
  server: {
    port: 3000,
    host: '0.0.0.0'  // גישה מכל מכשיר ברשת
  },
  plugins: [react()],
  envPrefix: 'VITE_',  // משתני סביבה מתחילים ב-VITE_
  resolve: {
    alias: { '@': '.' }  // @ מצביע לשורש הפרויקט
  }
}
```

### tsconfig.json
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,  // מצב strict מלא
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./*"]  // מיפוי נתיבים
    }
  }
}
```

### netlify.toml
**מיקום:** `C:\Users\abaga\OneDrive\Desktop\brand story v3\brandframe-studio-v2\netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200  # SPA routing

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### משתני סביבה

**Frontend (Netlify):**
- `VITE_SUPABASE_URL` - כתובת פרויקט Supabase
- `VITE_SUPABASE_ANON_KEY` - מפתח אנונימי של Supabase

**Backend (Supabase Secrets):**
- `GEMINI_API_KEY` - מפתח Google Gemini
- `YOUTUBE_API_KEY` - מפתח YouTube Data API

---

## בנייה ופריסה

### פיפליין בנייה

**פיתוח:**
```bash
npm run dev  # שרת פיתוח Vite על פורט 3000
```

**בנייה לפרודקשן:**
```bash
npm run build  # TypeScript → Vite → dist/
```

**תוצאה:**
- קבצים סטטיים ב-`dist/`
- אופטימיזציה של assets
- code splitting
- tree shaking

### ארכיטקטורת פריסה

```
Frontend (Netlify)
├── אפליקציית React סטטית
├── deploy אוטומטי מ-Git
├── משתני סביבה ב-Netlify Dashboard
└── הפצה דרך CDN

Backend (Supabase)
├── Edge Functions (Deno runtime)
├── PostgreSQL database
├── סודות API מאוחסנים ב-Supabase
└── Row Level Security (RLS)
```

### תהליך פריסה
1. Push ל-GitHub
2. Netlify עושה deploy אוטומטי של frontend
3. Supabase Edge Functions פרוסים מראש
4. משתני סביבה:
   - Netlify: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - Supabase Secrets: `GEMINI_API_KEY`, `YOUTUBE_API_KEY`

### מסמכי תיעוד נוספים
- `DEPLOYMENT.md` - מדריך פריסה מלא
- `API_KEYS_SETUP.md` - הגדרת מפתחות API
- `NETLIFY_TROUBLESHOOTING.md` - פתרון בעיות נפוצות
- `SUPABASE_SETUP.md` - קונפיגורציה של Supabase

---

## דפוסים ארכיטקטוניים ייחודיים

### 1. ארכיטקטורת Story-World Parameterization

**גישה תלת-שכבתית:**
- **Deep Structure (מבנה עמוק):** צרכים אוניברסליים, מוטיבציות, קונפליקטים (מבוסס Maslow)
- **Intermediate Structure (מבנה ביניים):** גבולות Story-World, תכניות דמויות
- **Surface Structure (מבנה שטחי):** סצנות, פעולות, דיאלוג

**השראה:** מתודולוגיות תסריטאות מקצועיות (Christopher Nolan, Pixar, Robert McKee)

### 2. מנוע אחידות ויזואלית משופר
**מיקום:** `enhanced-consistency.ts:1`

**תכונות:**
- ניתוח ויזואלי פורנזי עם AI vision
- 5 ממדי ציון:
  1. Character Identity (זהות דמות)
  2. Art Style (סגנון אמנותי)
  3. Color Palette (פלטת צבעים)
  4. Lighting (תאורה)
  5. Composition (הרכב)
- יצירה אוטומטית מחדש בכישלון (<85%)
- פידבק מפורט לכל ממד
- עד 3 ניסיונות לכל פריים

### 3. לוגים של החלטות AI Agent
**מיקום:** טבלת `agent_decisions`

**מה נרשם:**
- סוג agent
- סוג החלטה
- קלט/פלט
- הנמקה
- ציון ביטחון
- זמן ביצוע

**יתרונות:**
- ניתוח פוסט-יצירה
- דיבאג ושיפור
- מעקב אחר ביצועי AI

### 4. Progressive Enhancement - File System
**מיקום:** `fileSystem.ts:1`

**אסטרטגיה:**
- **ראשוני:** File System Access API (בוחר תיקייה)
- **גיבוי:** Download API (הורדות מסורתיות)
- התדרדרות עדינה לתאימות דפדפן
- שמירת URLs לתאימות לאחור

### 5. ארכיטקטורת אשף Mobile-First
**מיקום:** `StoryboardWizard.tsx:1`

**תכונות:**
- 5 שלבים עם progressive disclosure
- שמירה אוטומטית ל-Supabase אחרי כל שלב
- שחזור טיוטה בהפעלה מחדש
- מסך יצירה נפרד למובייל
- בקרות מותאמות למגע (44px מינימום)

### 6. אסטרטגיית Multi-Model AI

**מודלים לפי משימה:**
- `gemini-2.5-pro`: יצירת טקסט (Story-World, תסריטים)
- `gemini-2.5-pro-vision`: ניתוח ויזואלי (אימות עקביות)
- `gemini-2.5-flash-image`: יצירת תמונות

**יתרונות:**
- אופטימיזציה של עלויות
- ביצועים מקסימליים לכל משימה
- איכות גבוהה בכל תחום

### 7. מערכת ייצוא מקיפה

**5 פורמטים:**
1. `storyboard.json` - מבנה נתונים מלא
2. `prompts_veo.txt` - פרומפטים מותאמים Veo
3. `production_notes.txt` - פירוק תסריט 8 רבדים
4. `captions.srt` - קובץ כתוביות
5. `story_world.txt` - פרמטרי Story-World

**תמונות:**
- כל הפריימים נשמרים לתיקיית Downloads
- ארגון לפי סצנה וגרסה (A/B)

### 8. מערכת לוגים מובנית
**מיקום:** `logger.ts:1`

**תכונות:**
- 4 רמות: error, warn, info, debug
- לוגים מבוססי הקשר עם קטגוריות
- כלי timing לביצועים
- צביעה במצב פיתוח
- סינון אוטומטי לפי רמה

### 9. ארכיטקטורת טיפול בשגיאות

**שכבות:**
- Global error handlers (window, unhandledrejection)
- Error boundary components
- הודעות שגיאה מקומיות (תמיכה בעברית)
- עיצוב שגיאות ידידותי למשתמש
- דיווח שגיאות למערכת הלוגים

### 10. שכבת תאימות לאחור

**תכונות:**
- שמות שדות ישנים נשמרים כשדות אופציונליים
- תמיכה במיגרציה ממבנה v1 ל-v2
- דוגמאות:
  - `subject` → `subjectIdentity`
  - `sceneDescription` → `sceneContext`
- וידוא שפרויקטים ישנים נטענים

### 11. מעקב התקדמות בזמן אמת

**תכונות:**
- מעקב פאזות: story-world → script → images → complete
- אחוז התקדמות (0-100)
- אינדיקטורים של סצנה/פריים נוכחיים
- הערכת זמן נותר (חישוב אדפטיבי)
- מונה זמן שעבר (מרווחי שנייה)

### 12. מערכת ניהול טיוטות

**תכונות:**
- שמירה אוטומטית בכל שלב באשף
- יצירת thumbnail מהתמונה הראשונה שהועלתה
- מודל שחזור טיוטה בהפעלה מחדש
- התמדה מבוססת Supabase
- caching מקומי לביצועים

---

## סיכום

**BrandFrame Studio v2** היא אפליקציה מתוחכמת ומוכנה לפרודקשן ליצירת storyboards מונפשים בעזרת AI עם ההיבטים הבאים:

### נקודות חוזק עיקריות:
✅ **מחסנית מודרנית:** React 19 + TypeScript + Vite + Supabase Edge Functions
✅ **רמה מקצועית:** מפרטי איכות שידור Level 9 עם Master Screenplay Architect
✅ **מונפש AI:** אינטגרציה רב-מודלית של Gemini (טקסט, ויזיה, יצירת תמונות)
✅ **אחידות ויזואלית:** מנוע עקביות משופר עם סף 85% ויצירה אוטומטית מחדש
✅ **מותאם למובייל:** עיצוב responsive עם ממשקים ייעודיים למובייל
✅ **ייצוא מקיף:** 5 פורמטים + הורדת תמונות מאורגנת
✅ **ארכיטקטורה חזקה:** מערכת טיוטות, טיפול בשגיאות, לוגים, תאימות לאחור
✅ **Backend Serverless:** Supabase Edge Functions עם PostgreSQL
✅ **מוכן לפרודקשן:** פרוס על Netlify עם פיפליין CI/CD מלא

### טכנולוגיות ליבה:
- Frontend: React 19.2.0, TypeScript 5.8.2, Vite 6.2.0
- Backend: Supabase (PostgreSQL + Edge Functions)
- AI: Google Gemini API (3 מודלים)
- APIs: YouTube Data API v3
- Styling: Tailwind CSS

### מבנה הקוד:
הקוד מאורגן היטב, עם type-safety מלא, ועוקב אחר best practices מודרניות של React עם הפרדה ברורה בין רכיבים, hooks, שירותים, וכלי עזר.

---

**תאריך יצירה:** 2025-11-17
**גרסה:** 2.0
**מצב:** Production Ready
