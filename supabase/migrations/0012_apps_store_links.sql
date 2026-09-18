-- Replace the generic url/platform fields on app_recommendations with
-- dedicated Apple App Store / Google Play links.
alter table app_recommendations add column if not exists apple_url text;
alter table app_recommendations add column if not exists android_url text;
alter table app_recommendations drop column if exists url;
alter table app_recommendations drop column if exists platform;
