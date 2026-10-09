from django.contrib import admin

from .models import Property, PropertyFavorite


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'listing_type', 'property_type', 'price', 'currency', 'rooms',
        'location_city', 'status', 'is_featured', 'owner', 'created_at',
    )
    list_filter = ('listing_type', 'property_type', 'status', 'condition', 'is_featured')
    search_fields = ('title', 'description', 'location_label', 'district')
    list_editable = ('status', 'is_featured')
    raw_id_fields = ('owner',)


@admin.register(PropertyFavorite)
class PropertyFavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'property', 'created_at')
    raw_id_fields = ('user', 'property')
