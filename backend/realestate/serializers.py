from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .models import Property


class PropertySerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    owner_name = serializers.CharField(source='owner.display_name', read_only=True)
    location = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()

    # Flat write-side location fields (read side is the nested `location`).
    location_label = serializers.CharField(write_only=True, max_length=160)
    location_city = serializers.CharField(write_only=True, required=False, allow_blank=True)
    location_lat = serializers.FloatField(write_only=True, required=False, allow_null=True)
    location_lng = serializers.FloatField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Property
        fields = (
            'id',
            'title',
            'description',
            'owner_id',
            'owner_name',
            'owner_type',
            'listing_type',
            'property_type',
            'status',
            'price',
            'currency',
            'rent_period',
            'rooms',
            'area_m2',
            'floor',
            'total_floors',
            'condition',
            'furnished',
            'amenities',
            'images',
            'location',
            'location_label',
            'location_city',
            'location_lat',
            'location_lng',
            'district',
            'address',
            'contact_phone',
            'is_featured',
            'views_count',
            'distance',
            'is_favorited',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'owner_id',
            'owner_name',
            'is_featured',
            'views_count',
            'distance',
            'is_favorited',
            'created_at',
            'updated_at',
        )

    def validate(self, attrs):
        listing_type = attrs.get('listing_type', getattr(self.instance, 'listing_type', None))
        if listing_type in (Property.ListingType.SALE, Property.ListingType.BUY):
            # Sale price / buyer budget is one total; the rent period is meaningless.
            attrs['rent_period'] = ''
        elif listing_type == Property.ListingType.RENT and not attrs.get(
            'rent_period', getattr(self.instance, 'rent_period', '')
        ):
            attrs['rent_period'] = Property.RentPeriod.MONTHLY

        floor = attrs.get('floor', getattr(self.instance, 'floor', None))
        total = attrs.get('total_floors', getattr(self.instance, 'total_floors', None))
        if floor is not None and total is not None and floor > total:
            raise serializers.ValidationError({'floor': 'Qavat umumiy qavatlar sonidan oshmasligi kerak.'})
        return attrs

    def validate_images(self, value):
        if not isinstance(value, list) or not all(isinstance(v, str) for v in value):
            raise serializers.ValidationError('images must be a list of URLs')
        return value[:12]

    def validate_amenities(self, value):
        if not isinstance(value, list) or not all(isinstance(v, str) for v in value):
            raise serializers.ValidationError('amenities must be a list of strings')
        return value[:30]

    def get_location(self, obj: Property) -> dict:
        return {
            'label': obj.location_label,
            'city': obj.location_city,
            'district': obj.district,
            'address': obj.address,
            'lat': obj.location_lat,
            'lng': obj.location_lng,
        }

    @extend_schema_field(OpenApiTypes.FLOAT)
    def get_distance(self, obj: Property):
        distance = getattr(obj, 'distance', None)
        return round(distance, 2) if distance is not None else None

    def get_is_favorited(self, obj: Property) -> bool:
        favorited = getattr(obj, 'is_favorited', None)
        if favorited is not None:
            return bool(favorited)
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.favorited_by.filter(user=request.user).exists()

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
