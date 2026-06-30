from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Resource
from .serializers import ResourceSerializer


class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
