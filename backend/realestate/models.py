from django.conf import settings
from django.db import models


class Property(models.Model):
    """A real-estate listing: for rent (ijara), for sale (sotuv) or a buyer's request (olish)."""

    class ListingType(models.TextChoices):
        RENT = 'rent', 'Ijara'
        SALE = 'sale', 'Sotuv'
        # A buyer's request ("uy olaman"): `price` is the buyer's budget.
        BUY = 'buy', 'Olish'

    class PropertyType(models.TextChoices):
        APARTMENT = 'apartment', 'Kvartira'
        HOUSE = 'house', 'Hovli / uy'
        ROOM = 'room', 'Xona'
        COMMERCIAL = 'commercial', 'Tijorat binosi'
        LAND = 'land', 'Yer uchastkasi'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PENDING = 'pending', 'Pending'
        ACTIVE = 'active', 'Active'
        CLOSED = 'closed', 'Closed'

    class RentPeriod(models.TextChoices):
        MONTHLY = 'monthly', 'Oyiga'
        DAILY = 'daily', 'Kuniga'

    class Condition(models.TextChoices):
        NEW = 'new', 'Yangi qurilgan'
        RENOVATED = 'renovated', 'Taʼmirlangan'
        NORMAL = 'normal', 'Oʻrtacha'
        NEEDS_REPAIR = 'needs-repair', 'Taʼmir talab'

    class OwnerType(models.TextChoices):
        OWNER = 'owner', 'Egasidan'
        AGENT = 'agent', 'Vositachi'

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties'
    )
    owner_type = models.CharField(
        max_length=8, choices=OwnerType.choices, default=OwnerType.OWNER
    )
    listing_type = models.CharField(max_length=8, choices=ListingType.choices)
    property_type = models.CharField(
        max_length=16, choices=PropertyType.choices, default=PropertyType.APARTMENT
    )
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)

    # Rent: price per `rent_period`. Sale: total price.
    price = models.PositiveBigIntegerField()
    currency = models.CharField(max_length=8, default='USD')
    rent_period = models.CharField(
        max_length=8, choices=RentPeriod.choices, default=RentPeriod.MONTHLY, blank=True
    )

    rooms = models.PositiveSmallIntegerField(null=True, blank=True)
    area_m2 = models.FloatField(null=True, blank=True)
    floor = models.SmallIntegerField(null=True, blank=True)
    total_floors = models.PositiveSmallIntegerField(null=True, blank=True)
    condition = models.CharField(
        max_length=16, choices=Condition.choices, default=Condition.NORMAL
    )
    furnished = models.BooleanField(default=False)
    amenities = models.JSONField(default=list, blank=True)
    images = models.JSONField(default=list, blank=True)

    # Same field names as jobs.Job so jobs.geo.filter_nearby works unchanged.
    location_label = models.CharField(max_length=160)
    location_city = models.CharField(max_length=120, blank=True)
    district = models.CharField(max_length=120, blank=True)
    address = models.CharField(max_length=255, blank=True)
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)

    contact_phone = models.CharField(max_length=32, blank=True)
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)
        verbose_name_plural = 'properties'
        indexes = [
            models.Index(fields=['status', 'listing_type']),
            models.Index(fields=['property_type']),
            models.Index(fields=['price']),
            models.Index(fields=['location_lat', 'location_lng']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self) -> str:
        return self.title


class PropertyFavorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='property_favorites'
    )
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'property')
        ordering = ('-created_at',)
