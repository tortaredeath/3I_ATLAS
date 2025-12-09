const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const path = require('path');

// Initialize i18next
i18next
  .use(Backend)
  .init({
    lng: 'zh', // default language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    backend: {
      loadPath: path.join(__dirname, '../../locales/{{lng}}/{{ns}}.json'),
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    resources: {
      en: {
        translation: {
          "errors.validation": "Validation Error",
          "errors.notFound": "Resource not found",
          "errors.unauthorized": "Unauthorized access",
          "errors.forbidden": "Access forbidden",
          "errors.serverError": "Internal server error",
          "success.created": "Resource created successfully",
          "success.updated": "Resource updated successfully",
          "success.deleted": "Resource deleted successfully",
          "auth.loginSuccess": "Login successful",
          "auth.logoutSuccess": "Logout successful",
          "auth.invalidCredentials": "Invalid credentials",
          "auth.tokenExpired": "Token has expired",
          "events.created": "Event created successfully",
          "events.updated": "Event updated successfully",
          "events.deleted": "Event deleted successfully",
          "events.notFound": "Event not found",
          "articles.created": "Article created successfully",
          "articles.updated": "Article updated successfully",
          "articles.deleted": "Article deleted successfully",
          "articles.notFound": "Article not found",
          "banners.created": "Banner created successfully",
          "banners.updated": "Banner updated successfully",
          "banners.deleted": "Banner deleted successfully",
          "banners.notFound": "Banner not found",
          "partners.created": "Partner created successfully",
          "partners.updated": "Partner updated successfully",
          "partners.deleted": "Partner deleted successfully",
          "partners.notFound": "Partner not found",
          "association.updated": "Association information updated successfully"
        }
      },
      zh: {
        translation: {
          "errors.validation": "驗證錯誤",
          "errors.notFound": "找不到資源",
          "errors.unauthorized": "未經授權的存取",
          "errors.forbidden": "存取被拒絕",
          "errors.serverError": "伺服器內部錯誤",
          "success.created": "資源建立成功",
          "success.updated": "資源更新成功",
          "success.deleted": "資源刪除成功",
          "auth.loginSuccess": "登入成功",
          "auth.logoutSuccess": "登出成功",
          "auth.invalidCredentials": "無效的登入資訊",
          "auth.tokenExpired": "令牌已過期",
          "events.created": "活動建立成功",
          "events.updated": "活動更新成功",
          "events.deleted": "活動刪除成功",
          "events.notFound": "找不到活動",
          "articles.created": "文章建立成功",
          "articles.updated": "文章更新成功",
          "articles.deleted": "文章刪除成功",
          "articles.notFound": "找不到文章",
          "banners.created": "橫幅建立成功",
          "banners.updated": "橫幅更新成功",
          "banners.deleted": "橫幅刪除成功",
          "banners.notFound": "找不到橫幅",
          "partners.created": "合作夥伴建立成功",
          "partners.updated": "合作夥伴更新成功",
          "partners.deleted": "合作夥伴刪除成功",
          "partners.notFound": "找不到合作夥伴",
          "association.updated": "協會資訊更新成功"
        }
      }
    }
  });

// Middleware to set language based on request
const i18nMiddleware = (req, res, next) => {
  // Get language from header, query param, or user preference
  const lang = req.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
               req.query.lang ||
               (req.user && req.user.preferences && req.user.preferences.language) ||
               'zh';
  
  // Validate and set language
  const supportedLanguages = ['zh', 'en'];
  const selectedLang = supportedLanguages.includes(lang) ? lang : 'zh';
  
  i18next.changeLanguage(selectedLang);
  req.language = selectedLang;
  
  // Add translation function to request
  req.t = (key, options) => i18next.t(key, options);
  
  // Add translation function to response locals for templates
  res.locals.t = req.t;
  res.locals.language = selectedLang;
  
  next();
};

module.exports = i18nMiddleware;