# פתרון שגיאות Gemini API

## סוגי שגיאות נפוצות

### שגיאה 1: "SERVICE_DISABLED"
```
Generative Language API has not been used in project before or it is disabled
```
**פתרון**: הפעל את ה-Generative Language API (ראה שלב 1 למטה)

### שגיאה 2: "API_KEY_SERVICE_BLOCKED"
```
Requests to this API method are blocked
```
**פתרון**: יש הגבלות על ה-API Key שלך. צריך להסיר הגבלות או ליצור API key חדש (ראה שלב 2 למטה)

## הפתרון - 3 שלבים פשוטים

### שלב 1: הפעל את ה-Generative Language API

1. ✅ לחץ על הקישור הזה: [הפעל Generative Language API](https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=573529931500)

2. ✅ התחבר עם חשבון Google שלך (אותו חשבון שיצרת איתו את ה-API key)

3. ✅ תראה עמוד עם כפתור **"Enable"** (הפעל) - לחץ עליו

4. ✅ המתן 2-3 דקות עד שה-API יופעל במערכת

### שלב 2: הסר הגבלות מה-API Key (אם מקבל "API_KEY_SERVICE_BLOCKED")

**אופציה 1: הסר הגבלות מה-API Key הקיים**

1. ✅ גש ל-[Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=573529931500)

2. ✅ מצא את ה-API Key שלך ברשימה ולחץ על עיפרון (Edit)

3. ✅ תחת **API restrictions**, בחר:
   - **Don't restrict key** (מומלץ לפיתוח)
   - או בחר **Restrict key** ווודא ש-"Generative Language API" מסומן

4. ✅ תחת **Application restrictions**, בחר:
   - **None** (מומלץ לפיתוח)
   - או הוסף את הדומיין של Netlify אם אתה רוצה הגבלה

5. ✅ לחץ **Save**

6. ✅ המתן 2-3 דקות עד שההגבלות יתעדכנו

**אופציה 2: צור API Key חדש ללא הגבלות**

1. ✅ גש ל-[Google AI Studio](https://makersuite.google.com/app/apikey)

2. ✅ לחץ **Create API Key**

3. ✅ בחר את הפרויקט 573529931500 (או צור פרויקט חדש)

4. ✅ אחרי יצירת ה-Key, גש ל-[Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)

5. ✅ ערוך את ה-Key החדש ווודא ש-**API restrictions** מוגדר ל-**Don't restrict key**

6. ✅ העתק את ה-API Key החדש

### שלב 3: עדכן את ה-API Key ב-Supabase

1. ✅ גש ל-[Supabase Dashboard](https://supabase.com/dashboard/project/ykdlyaxpqxsmajclmput)

2. ✅ לך ל-**Settings** → **Edge Functions** → **Secrets**

3. ✅ אם `GEMINI_API_KEY` כבר קיים:
   - לחץ על שלוש הנקודות ליד ה-Secret
   - בחר **Edit** או **Delete** ואז **Add new secret**

4. ✅ הוסף או עדכן:
   - Name: `GEMINI_API_KEY`
   - Value: ה-API key החדש (ללא הגבלות)

5. ✅ לחץ **Save**

### שלב 4: נסה שוב ליצור Storyboard

1. ✅ המתן 2-3 דקות אחרי הפעלת ה-API והסרת ההגבלות
2. ✅ רענן את האפליקציה שלך
3. ✅ נסה ליצור storyboard חדש
4. ✅ זה אמור לעבוד עכשיו!

## איפה מוצאים את ה-API Key?

אם אין לך API key עדיין:

1. גש ל-[Google AI Studio](https://makersuite.google.com/app/apikey)
2. לחץ **Create API Key**
3. בחר פרויקט (או צור חדש)
4. העתק את ה-API key
5. **חשוב**: הפעל את ה-Generative Language API (השלב 1 למעלה)
6. הוסף את ה-API key ל-Supabase Secrets

## בדיקה שה-API הופעל

אחרי שהפעלת את ה-API:

1. גש ל-[Google Cloud Console APIs](https://console.cloud.google.com/apis/dashboard?project=573529931500)
2. תראה "Generative Language API" ברשימת APIs מופעלים
3. אם אתה רואה אותו ברשימה - מעולה! זה אומר שהוא מופעל

## שאלות נפוצות

### ש: כמה זמן לוקח להפעיל את ה-API?
**ת**: בדרך כלל 1-3 דקות. במקרים נדירים עד 10 דקות.

### ש: האם יש עלות על הפעלת ה-API?
**ת**: Google AI Studio נותן מכסה חינמית נדיבה. בדוק את [המחירים](https://ai.google.dev/pricing).

### ש: יש לי יותר מפרויקט אחד - איזה אחד לבחור?
**ת**: בחר את הפרויקט שמופיע בשגיאה (573529931500), או צור API key חדש ובחר פרויקט אחר.

### ש: עדיין מקבל שגיאה "API_KEY_SERVICE_BLOCKED"
**ת**:
1. וודא שהסרת את ההגבלות מה-API Key (שלב 2)
2. המתן 2-3 דקות אחרי השינוי
3. בדוק ב-[Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=573529931500) ש-API restrictions מוגדר ל-"None"
4. אם עדיין לא עובד - צור API key חדש לגמרי ללא הגבלות

### ש: איך אני יודע אם ה-API Key שלי חסום?
**ת**: תראה שגיאה עם הטקסט "API_KEY_SERVICE_BLOCKED". זה אומר שיש הגבלות על ה-Key.

## קישורים שימושיים

- [Google AI Studio - יצירת API Keys](https://makersuite.google.com/app/apikey)
- [הפעלת Generative Language API](https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=573529931500)
- [Supabase Dashboard](https://supabase.com/dashboard/project/ykdlyaxpqxsmajclmput)
- [Google Cloud Console](https://console.cloud.google.com/)

## תמיכה נוספת

אם אחרי כל השלבים האלה עדיין לא עובד, בדוק:
1. Supabase Edge Function Logs
2. Browser Console לשגיאות
3. Google Cloud Console Logs
