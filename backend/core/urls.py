from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.core_urls if hasattr(admin.site, 'core_urls') else admin.site.urls), # standard is admin.site.urls
    path('api/accounts/', include('accounts.urls')),
    path('api/', include('elections.urls')),
]
