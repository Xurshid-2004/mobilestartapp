from django.db.models import Q
from django_filters import rest_framework as filters

from .models import Property


class PropertyFilter(filters.FilterSet):
    """Filters for the real-estate list — drives the Ijara / Sotuv pages and the map."""

    listing_type = filters.CharFilter(field_name='listing_type', lookup_expr='iexact')
    property_type = filters.CharFilter(field_name='property_type', lookup_expr='iexact')
    status = filters.CharFilter(field_name='status', lookup_expr='iexact')
    condition = filters.CharFilter(field_name='condition', lookup_expr='iexact')
    owner_type = filters.CharFilter(field_name='owner_type', lookup_expr='iexact')
    furnished = filters.BooleanFilter(field_name='furnished')
    is_featured = filters.BooleanFilter(field_name='is_featured')
    price_min = filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = filters.NumberFilter(field_name='price', lookup_expr='lte')
    area_min = filters.NumberFilter(field_name='area_m2', lookup_expr='gte')
    area_max = filters.NumberFilter(field_name='area_m2', lookup_expr='lte')
    rooms = filters.NumberFilter(field_name='rooms')
    rooms_min = filters.NumberFilter(field_name='rooms', lookup_expr='gte')
    city = filters.CharFilter(field_name='location_city', lookup_expr='iexact')
    location = filters.CharFilter(method='filter_location')
    owner = filters.NumberFilter(field_name='owner_id')

    class Meta:
        model = Property
        fields = (
            'listing_type',
            'property_type',
            'status',
            'condition',
            'owner_type',
            'furnished',
            'is_featured',
            'price_min',
            'price_max',
            'area_min',
            'area_max',
            'rooms',
            'rooms_min',
            'city',
            'location',
            'owner',
        )

    def filter_location(self, queryset, name, value):
        return queryset.filter(
            Q(location_label__icontains=value)
            | Q(location_city__icontains=value)
            | Q(district__icontains=value)
        )
