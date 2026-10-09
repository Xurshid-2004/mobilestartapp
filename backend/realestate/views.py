from django.db.models import Count, Exists, F, OuterRef, Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from jobs.geo import filter_nearby
from jobs.views import TRUE_VALUES, parse_near

from .filters import PropertyFilter
from .models import Property, PropertyFavorite
from .serializers import PropertySerializer


class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user.is_authenticated:
            return False
        if getattr(request.user, 'role', None) == 'admin':
            return True
        return obj.owner_id == request.user.id


class PropertyViewSet(viewsets.ModelViewSet):
    """Real-estate listings: `?listing_type=rent|sale|buy`, price/rooms/area filters, `?near=`."""

    serializer_class = PropertySerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdminOrReadOnly)
    filterset_class = PropertyFilter
    search_fields = ('title', 'description', 'location_label', 'district', 'address')
    ordering_fields = ('created_at', 'price', 'area_m2', 'rooms', 'views_count')
    ordering = ('-created_at',)

    def get_queryset(self):
        qs = Property.objects.select_related('owner')
        user = self.request.user
        params = self.request.query_params
        is_admin = user.is_authenticated and getattr(user, 'role', None) == 'admin'
        mine = params.get('mine', '').lower() in TRUE_VALUES

        if self.action in ('update', 'partial_update', 'destroy', 'favorite'):
            pass
        elif mine and user.is_authenticated:
            qs = qs.filter(owner=user)
        elif not is_admin:
            qs = qs.filter(status=Property.Status.ACTIVE)

        if user.is_authenticated:
            qs = qs.annotate(
                is_favorited=Exists(
                    PropertyFavorite.objects.filter(user=user, property=OuterRef('pk'))
                )
            )

        near = parse_near(params)
        self._near_active = bool(near)
        if near:
            qs = filter_nearby(qs, *near)
        return qs

    def filter_queryset(self, queryset):
        # Keep nearest-first ordering from a geo search unless `ordering` is explicit.
        if getattr(self, '_near_active', False) and 'ordering' not in self.request.query_params:
            self.ordering = None
        return super().filter_queryset(queryset)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not (request.user.is_authenticated and request.user.id == instance.owner_id):
            Property.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
            instance.views_count += 1
        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=['post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def favorite(self, request, pk=None):
        """POST saves the listing, DELETE removes it. Returns the new saved state."""
        prop = self.get_object()
        if request.method == 'DELETE':
            PropertyFavorite.objects.filter(user=request.user, property=prop).delete()
            return Response({'saved': False})
        PropertyFavorite.objects.get_or_create(user=request.user, property=prop)
        return Response({'saved': True})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def saved(self, request):
        qs = self.get_queryset().filter(favorited_by__user=request.user)
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page if page is not None else qs, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def stats(self, request):
        """Active listing counts per listing type — powers the section tabs."""
        counts = Property.objects.filter(status=Property.Status.ACTIVE).aggregate(
            rent=Count('id', filter=Q(listing_type=Property.ListingType.RENT)),
            sale=Count('id', filter=Q(listing_type=Property.ListingType.SALE)),
            buy=Count('id', filter=Q(listing_type=Property.ListingType.BUY)),
        )
        return Response(counts)
