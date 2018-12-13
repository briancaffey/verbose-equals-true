from rest_framework import permissions


class UserAccountViewPermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):

        # check if user is requesting their own information
        return request.user == obj
