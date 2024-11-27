from django.urls import include, re_path
from app.home.homeApp import views

urlpatterns = [
    re_path(r'^$', views.home_index, name="home_index"),
    re_path(r'^search/', views.search_index, name="search_index"),
    re_path(r'^add_item/', views.item_index, name="item_index"),
    re_path(r'^modify_item/', views.modify_item_index, name="modify_item_index"),
    re_path(r'^saved_item_list/', views.saved_item_list_index, name="saved_item_list_index"),
    re_path(r'^favourites/', views.favourites_item_list_index, name="favourites_item_list_index"),
    re_path(r'^bulk_item_create/', views.bulk_item_create_index, name="bulk_item_create_index"),
    re_path(r'^item_request_status/', views.request_status_index, name="request_status_index"),
    re_path(r'^request_approval/', views.request_approval_index, name="request_approval_index"),
    re_path(r'^taxonomy/', views.taxonomy_index, name="taxonomy_index"),
    re_path(r'^role/', views.role_index, name="role_index"),
    re_path(r'^user/', views.user_index, name="user_index"),
    re_path(r'^group/', views.group_index, name="group_index"),
    re_path(r'^dictionary/', views.dictionary_index, name="dictionary_index"),
    re_path(r'^dictionary_setup/', views.dictionary_setup_index, name="dictionary_setup_index"),
    re_path(r'^report/', views.report_index, name="report_index"),
    re_path(r'^email_group/', views.email_group_index, name="email_group_index"),
    re_path(r'^form_builder/', views.form_builder_index, name="form_builder_index"),
    re_path(r'api/lookup/list/', views.api_lookup_list, name="api_lookup_list"),
    re_path(r'api/create/item/request/', views.CreateItemRequest.as_view(), name="CreateItemRequest"),
    re_path(r'api/get/item/request/list/', views.GetItemRequestList.as_view(), name="GetItemRequestList"),
    re_path(r'api/items/list/', views.ItemMasterListView.as_view(), name='item-master-list'),
    re_path(r'api/items/facets/', views.ItemMasterFacetsView.as_view(), name='item-master-facets'),
    re_path(r'api/items/get/detail/', views.ItemGetDetail.as_view(), name='ItemGetDetail'),
    re_path(r'api/dictionary/definition//list/', views.DictionaryDefinitionList.as_view(), name='DictionaryDefinitionList'),
    re_path(r'api/dict/get/detail/', views.DictionaryDetails.as_view(), name='DictionaryDetails'),
    re_path(r'api/create/modify/item/request/', views.CreateModifyItemReq.as_view(), name='CreateModifyItemReq'),
    re_path(r'api/search/save/', views.SaveSearchView.as_view(), name='save-search'),
    re_path(r'api/search/list/', views.SavedSearchListView.as_view(), name='saved-search-list'),
    re_path(r'api/search/get/(?P<search_id>[0-9]+)/', views.GetSavedSearchView.as_view(), name='get-saved-search'),

    re_path(r'api/items/toggle-favorite/', views.ToggleFavoriteView.as_view(), name='toggle-favorite'),
    re_path(r'api/items/favorites/', views.FavoriteItemsListView.as_view(), name='favorite-items-list'),

    re_path(r'api/get/item/', views.GetItemDetailsView.as_view(), name='get-item'),

]


