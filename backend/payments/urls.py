from django.urls import path
from .views import create_checkout, verify_payment, MyTransactionsList

urlpatterns = [
    path("create-checkout/", create_checkout, name="payment-create-checkout"),
    path("verify/", verify_payment, name="payment-verify"),
    path("my-transactions/", MyTransactionsList.as_view(), name="payment-my-transactions"),
]
