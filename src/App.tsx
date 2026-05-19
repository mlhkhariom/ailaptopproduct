import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { MaintenanceGate } from "@/components/common/MaintenanceGate";
import { WhatsAppButton, BackToTopButton, CookieConsent } from "@/components/common/SiteFeatures";
import { NewsletterPopup, SaleCountdown } from "@/components/common/SiteWidgets";
import { AnalyticsScripts } from "@/components/common/AnalyticsScripts";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import BrandStore from "./pages/BrandStore";
import EMICalculator from "./pages/EMICalculator";
import Offers from "./pages/Offers";
import BulkOrder from "./pages/BulkOrder";
import Deals from "./pages/Deals";
import NewArrivals from "./pages/NewArrivals";
import BestSellers from "./pages/BestSellers";
import Categories from "./pages/Categories";
import StoreLocator from "./pages/StoreLocator";
import SitemapPage from "./pages/SitemapPage";
import HelpCenter from "./pages/HelpCenter";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import Shipping from "./pages/Shipping";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import TrackOrder from "./pages/TrackOrder";
import OrderSuccess from "./pages/OrderSuccess";
import Services from "./pages/Services";
import Wishlist from "./pages/Wishlist";
import Compare from "./pages/Compare";
import Repair from "./pages/Repair";
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminSocial = lazy(() => import("./pages/admin/AdminSocial"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminWhatsApp = lazy(() => import("./pages/admin/AdminWhatsApp"));
import ErrorBoundary from "@/components/common/ErrorBoundary";
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminReels = lazy(() => import("./pages/admin/AdminReels"));
const AdminERP = lazy(() => import("./pages/admin/AdminERP"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminReturns = lazy(() => import("./pages/admin/AdminReturns"));
const AdminAbandonedCarts = lazy(() => import("./pages/admin/AdminAbandonedCarts"));
const AdminHomepageSections = lazy(() => import("./pages/admin/AdminHomepageSections"));
const AdminAutomations = lazy(() => import("./pages/admin/AdminAutomations"));
const AdminEmailCampaigns = lazy(() => import("./pages/admin/AdminEmailCampaigns"));
const AdminShippingRules = lazy(() => import("./pages/admin/AdminShippingRules"));
const AdminBroadcast = lazy(() => import("./pages/admin/AdminBroadcast"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
import Notifications from "./pages/Notifications";
const AdminJobCards = lazy(() => import("./pages/admin/AdminJobCards"));
const AdminStaffExpenses = lazy(() => import("./pages/admin/AdminStaffExpenses"));
const AdminStaff = lazy(() => import("./pages/admin/AdminStaff"));
const AdminBilling = lazy(() => import("./pages/admin/AdminBilling"));
const AdminERPReports = lazy(() => import("./pages/admin/AdminERPReports"));
const AdminCRM = lazy(() => import("./pages/admin/AdminCRM"));
const AdminBranches = lazy(() => import("./pages/admin/AdminBranches"));
const AdminEvolution = lazy(() => import("./pages/admin/AdminEvolution"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const SuperAdminPanel = lazy(() => import("./pages/admin/SuperAdmin"));
const SiteSettingsPage = lazy(() => import("./pages/admin/settings/SiteSettings"));
const EcommerceSettingsPage = lazy(() => import("./pages/admin/settings/EcommerceSettings"));
const ERPSettingsPage = lazy(() => import("./pages/admin/settings/ERPSettings"));
const CRMSettingsPage = lazy(() => import("./pages/admin/settings/CRMSettings"));
const NotificationSettingsPage = lazy(() => import("./pages/admin/settings/NotificationSettings"));
const SecuritySettingsPage = lazy(() => import("./pages/admin/settings/SecuritySettings"));
const APIKeysSettingsPage = lazy(() => import("./pages/admin/settings/APIKeysSettings"));
const AboutPageSettingsPage = lazy(() => import("./pages/admin/settings/AboutPageSettings"));
const CMSSettingsPage = lazy(() => import("./pages/admin/settings/CMSSettings"));
const HomepageEditorPage = lazy(() => import("./pages/admin/settings/HomepageEditor"));
const AppearanceSettingsPage = lazy(() => import("./pages/admin/settings/AppearanceSettings"));
const MenuEditorPage = lazy(() => import("./pages/admin/settings/MenuEditor"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminCMS = lazy(() => import("./pages/admin/AdminCMS"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAttendance = lazy(() => import("./pages/admin/AdminAttendance"));
const AdminLeaves = lazy(() => import("./pages/admin/AdminLeaves"));
const AdminRecurring = lazy(() => import("./pages/admin/AdminRecurring"));
const AdminPayroll = lazy(() => import("./pages/admin/AdminPayroll"));
const AdminReportBuilder = lazy(() => import("./pages/admin/AdminReportBuilder"));
const AdminLiveDashboard = lazy(() => import("./pages/admin/AdminLiveDashboard"));
const AdminCustomer360 = lazy(() => import("./pages/admin/AdminCustomer360"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminShifts = lazy(() => import("./pages/admin/AdminShifts"));
const AdminLoyalty = lazy(() => import("./pages/admin/AdminLoyalty"));
const AdminKPIAlerts = lazy(() => import("./pages/admin/AdminKPIAlerts"));
const AdminWATemplates = lazy(() => import("./pages/admin/AdminWATemplates"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
import RepairTrack from "./pages/RepairTrack";
import CustomerPortal from "./pages/CustomerPortal";
import NotFound from "./pages/NotFound";
import CMSPage from "./pages/CMSPage";
import LinksPage from "./pages/Links";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <SiteSettingsProvider>
        <AnalyticsScripts />
        <MaintenanceGate>
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/brands/:brand" element={<BrandStore />} />
            <Route path="/emi-calculator" element={<EMICalculator />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/bulk-order" element={<BulkOrder />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/best-sellers" element={<BestSellers />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/store-locator" element={<StoreLocator />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/services" element={<Services />} />
            <Route path="/repair" element={<Repair />} />
            <Route path="/track" element={<RepairTrack />} />
            <Route path="/my-account" element={<CustomerPortal />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/compare" element={<Compare />} />

            {/* Protected Customer */}
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
            <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
            <Route path="/admin/social" element={<AdminRoute><AdminSocial /></AdminRoute>} />
            <Route path="/admin/media" element={<AdminRoute><AdminMedia /></AdminRoute>} />
            <Route path="/admin/whatsapp" element={<AdminRoute><AdminWhatsApp /></AdminRoute>} />
            <Route path="/admin/services" element={<AdminRoute><AdminServices /></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
            <Route path="/admin/reels" element={<AdminRoute><AdminReels /></AdminRoute>} />
            <Route path="/admin/erp" element={<AdminRoute><AdminERP /></AdminRoute>} />
            <Route path="/admin/erp/job-cards" element={<AdminRoute><AdminJobCards /></AdminRoute>} />
            <Route path="/admin/erp/expenses" element={<AdminRoute><AdminStaffExpenses /></AdminRoute>} />
            <Route path="/admin/erp/staff" element={<AdminRoute><AdminStaff /></AdminRoute>} />
            <Route path="/admin/erp/billing" element={<AdminRoute><AdminBilling /></AdminRoute>} />
            <Route path="/admin/erp/reports" element={<AdminRoute><AdminERPReports /></AdminRoute>} />
            <Route path="/admin/erp/crm" element={<AdminRoute><AdminCRM /></AdminRoute>} />
            <Route path="/admin/erp/branches" element={<AdminRoute><AdminBranches /></AdminRoute>} />
            <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />
            <Route path="/admin/returns" element={<AdminRoute><AdminReturns /></AdminRoute>} />
            <Route path="/admin/abandoned-carts" element={<AdminRoute><AdminAbandonedCarts /></AdminRoute>} />
            <Route path="/admin/homepage-sections" element={<AdminRoute><AdminHomepageSections /></AdminRoute>} />
            <Route path="/admin/automations" element={<AdminRoute><AdminAutomations /></AdminRoute>} />
            <Route path="/admin/email-campaigns" element={<AdminRoute><AdminEmailCampaigns /></AdminRoute>} />
            <Route path="/admin/shipping-rules" element={<AdminRoute><AdminShippingRules /></AdminRoute>} />
            <Route path="/admin/broadcast" element={<AdminRoute><AdminBroadcast /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
            <Route path="/admin/evolution" element={<AdminRoute><AdminEvolution /></AdminRoute>} />
            <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/admin/super-admin" element={<AdminRoute><SuperAdminPanel /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="/admin/settings/site" element={<AdminRoute><SiteSettingsPage /></AdminRoute>} />
            <Route path="/admin/settings/ecommerce" element={<AdminRoute><EcommerceSettingsPage /></AdminRoute>} />
            <Route path="/admin/settings/erp" element={<AdminRoute><ERPSettingsPage /></AdminRoute>} />
            <Route path="/admin/settings/crm" element={<AdminRoute><CRMSettingsPage /></AdminRoute>} />
            <Route path="/admin/settings/notifications" element={<AdminRoute><NotificationSettingsPage /></AdminRoute>} />
            <Route path="/admin/settings/security" element={<AdminRoute><SecuritySettingsPage /></AdminRoute>} />
            <Route path="/admin/settings/api-keys" element={<AdminRoute><APIKeysSettingsPage /></AdminRoute>} />
            <Route path="/admin/settings/about-page" element={<AdminRoute><AboutPageSettingsPage /></AdminRoute>} />
            <Route path="/admin/settings/cms" element={<AdminRoute><CMSSettingsPage /></AdminRoute>} />
            <Route path="/admin/settings/homepage" element={<AdminRoute><HomepageEditorPage /></AdminRoute>} />
            <Route path="/admin/settings/appearance" element={<AdminRoute><AppearanceSettingsPage /></AdminRoute>} />
            <Route path="/admin/settings/menus" element={<AdminRoute><MenuEditorPage /></AdminRoute>} />
            <Route path="/admin/cms" element={<AdminRoute><AdminCMS /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
            <Route path="/admin/contacts" element={<AdminRoute><AdminContacts /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
            <Route path="/admin/erp/shifts" element={<AdminRoute><AdminShifts /></AdminRoute>} />
            <Route path="/admin/erp/audit-log" element={<AdminRoute><AdminAuditLog /></AdminRoute>} />
            <Route path="/admin/erp/customer360" element={<AdminRoute><AdminCustomer360 /></AdminRoute>} />
            <Route path="/admin/erp/loyalty" element={<AdminRoute><AdminLoyalty /></AdminRoute>} />
            <Route path="/admin/erp/kpi-alerts" element={<AdminRoute><AdminKPIAlerts /></AdminRoute>} />
            <Route path="/admin/erp/live" element={<AdminRoute><AdminLiveDashboard /></AdminRoute>} />
            <Route path="/admin/erp/report-builder" element={<AdminRoute><AdminReportBuilder /></AdminRoute>} />
            <Route path="/admin/erp/payroll" element={<AdminRoute><AdminPayroll /></AdminRoute>} />
            <Route path="/admin/erp/recurring" element={<AdminRoute><AdminRecurring /></AdminRoute>} />
            <Route path="/admin/erp/leaves" element={<AdminRoute><AdminLeaves /></AdminRoute>} />
            <Route path="/admin/erp/attendance" element={<AdminRoute><AdminAttendance /></AdminRoute>} />
            <Route path="/admin/erp/wa-templates" element={<AdminRoute><AdminWATemplates /></AdminRoute>} />
            <Route path="/page/:slug" element={<CMSPage />} />
            <Route path="/links" element={<LinksPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          {/* Global site-wide features (admin-controlled) */}
          <WhatsAppButton />
          <BackToTopButton />
          <CookieConsent />
          <NewsletterPopup />
        </BrowserRouter>
        </MaintenanceGate>
        </SiteSettingsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
