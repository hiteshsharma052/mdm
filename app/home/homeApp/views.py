from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import ItemFormField, LookupScreenDictionary, ItemMaster, SckRequestStatus, DictionaryDefinition, ItemModifyRequest, SavedSearch, ItemFavorite, ItemMaster
from .serializers import LookupScreenDictionarySerializer, DictionaryDefinitionSerializer, FormFieldSerializer
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView

from .item_handler import create_comment, create_item_request, get_vertical, merge_similar_objects, set_fields_value, save_modify_request

import uuid
import json

from rest_framework import status
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q, F, Exists, OuterRef, Max, Subquery
from django.db.models.functions import JSONObject
from django.contrib.postgres.aggregates import ArrayAgg




def home_index(request):
    return render(request, 'app/home/web/html/home.html')

def search_index(request):
    return render(request, 'app/home/web/html/master/search.html')

@csrf_exempt
def api_lookup_list(request):

    bool_lis = ['Inventory Item','Invoice Enabled','Drug Schedule','Lot Divisible']
    other_lis = ['Brand','Molecule','Variant','Form','Special_Material_Flag','Primary_UOM','Secondary_UOM']
    dict_name = request.POST.get("type")

    if dict_name in bool_lis:
        bool_data = [{'dict_code_primary':'Y','dict_desc_primary':'Yes'},{'dict_code_primary':'N','dict_desc_primary':'No'}]
        return JsonResponse({"data":bool_data,"msg":"Success"})

    code = request.POST.get("code")
    desc = request.POST.get("desc")

    dict_obj = LookupScreenDictionary.objects.filter(is_active="Y")
    if code and desc:
        dict_obj = dict_obj.filter(dict_code_primary=code,dict_desc_primary=desc).distinct("dict_desc_secondary1")
    elif dict_name:
        dict_obj = dict_obj.filter(dict_name=dict_name).distinct("dict_desc_primary")
    search = request.POST.get('search')
    if search:
        dict_obj = dict_obj.filter(dict_desc_primary__icontains=search)

    srz = LookupScreenDictionarySerializer(dict_obj,many=True)

    data = srz.data

    if dict_name in other_lis:
        data.insert(0, {
            "dict_code_primary" : "other",
            "dict_desc_primary" : "Other",
        })

    return JsonResponse({"data":data,"msg":"Success"})

class CreateItemRequest(APIView):

    def post(self, request):
        try:
            country_code = request.POST.get("country_code", "")
            country_name = request.POST.get("country_name", "")
            item_category_code = request.POST.get("item_category_code", "")
            item_category_desc = request.POST.get("item_category_desc", "")
            sub_category_code = request.POST.get("sub_category_code", "")
            sub_category_desc = request.POST.get("sub_category_desc", "")
            org_code = json.loads(request.POST.get("organization_code", "[]"))
            org_desc = json.loads(request.POST.get("organization_desc", "[]"))
            item_name = request.POST.get("item_name", "")
            item_desc = request.POST.get("item_desc", "")
            brand_code = request.POST.get("brand_code", "")
            brand_desc = request.POST.get("brand_desc", "")
            molecule_code = request.POST.get("molecule_code", "")
            molecule_desc = request.POST.get("molecule_desc", "")
            variant_code = request.POST.get("variant_code", "")
            variant_desc = request.POST.get("variant_desc", "")
            form_code = request.POST.get("form_code", "")
            form_desc = request.POST.get("form_desc", "")
            special_material_flag = request.POST.get("special_material_flag", "")
            special_material_desc = request.POST.get("special_material_desc", "")
            primary_uom_code = request.POST.get("primary_uom_code", "")
            primary_uom_desc = request.POST.get("primary_uom_desc", "")
            secondary_uom_code = request.POST.get("secondary_uom_code", "")
            secondary_uom_desc = request.POST.get("secondary_uom_desc", "")
            list_price = request.POST.get("list_price", "")
            market_price = request.POST.get("market_price", "")
            inventory_item = request.POST.get("inventory_item", "")
            invoice_flag = request.POST.get("invoice_flag", "")
            drug_schedule = request.POST.get("drug_schedule", "")
            lot_div = request.POST.get("lot_div", "")
            vat_percentage = request.POST.get("vat_percentage", "")
            ddc_code = request.POST.get("ddc_code", "")
            supplier_code = request.POST.get("supplier_code", "")
            supplier_desc = request.POST.get("supplier_desc", "")
            barcode_pack = request.POST.get("barcode_pack", "")
            barcode_mrp = request.POST.get("barcode_mrp", "")
            item_comment = request.POST.get("item_comment", "")
            item_status = request.POST.get("item_status", "")


            request_id = str(uuid.uuid4())
            req_type = request.POST.get("req_type", "")
            user_id = request.POST.get("user_id", "")

            for i in range(len(org_code)):
                vertical_name = get_vertical(org_code[i],org_desc[i])
                ItemMaster.objects.create(
                                request_id=request_id,
                                country_code=country_code,
                                country_name=country_name,
                                item_category_code=item_category_code,
                                item_category_desc=item_category_desc,
                                sub_category_code=sub_category_code,
                                sub_category_desc=sub_category_desc,
                                organization_code=org_code[i],
                                organization_desc=org_desc[i],
                                vertical_name = vertical_name,
                                item_name=item_name,
                                item_desc=item_desc,
                                brand_code=brand_code,
                                brand_desc=brand_desc,
                                molecule_code=molecule_code,
                                molecule_desc=molecule_desc,
                                variant_code=variant_code,
                                variant_desc=variant_desc,
                                form_code=form_code,
                                form_desc=form_desc,
                                special_material_flag=special_material_flag,
                                special_material_desc=special_material_desc,
                                primary_uom_code=primary_uom_code,
                                primary_uom_desc=primary_uom_desc,
                                secondary_uom_code=secondary_uom_code,
                                secondary_uom_desc=secondary_uom_desc,
                                list_price=list_price,
                                market_price=market_price,
                                inventory_item=inventory_item,
                                invoice_flag=invoice_flag,
                                drug_schedule=drug_schedule,
                                lot_div=lot_div,
                                vat_percentage=vat_percentage,
                                ddc_code=ddc_code,
                                supplier_code=supplier_code,
                                supplier_desc=supplier_desc,
                                barcode_pack=barcode_pack,
                                barcode_mrp=barcode_mrp,
                                created_by=user_id,
                                modified_by=user_id,
                                item_req_type=req_type,
                                item_status=item_status
                )


            if item_comment:
                create_comment(request_id,req_type,user_id,item_comment)

            if item_status != 'Draft':
                create_item_request(request_id,"Add","Creator","Pending",user_id,req_type,"Submitted")
            else:
                create_item_request(request_id,"Add","Requestor","Draft",user_id,req_type,"Draft")


            return JsonResponse({"data":'',"msg":"Success"})
        except Exception as e:
            print(e)
            return JsonResponse({"data":'',"msg":"Error","error":"1"})



def item_index(request):

    form_fields = ItemFormField.objects.filter(active=True).order_by('order')
    
    context = {
        'form_fields': form_fields,
    }

    return render(request, 'app/home/web/html/master/add_item.html',context)

def modify_item_index(request):
    form_fields = ItemFormField.objects.filter(active=True).order_by('order')
    szl_form_fields = FormFieldSerializer(form_fields, many=True)
    item_code = request.GET.get('item_code')
    item_objs = ItemMaster.objects.filter(item_code=item_code).values()
    final_data =  merge_similar_objects(item_objs)
    final_data['orgs'] = [ org['organization_desc'] for org in final_data['organizations']]
    form_fields_with_val = set_fields_value(szl_form_fields.data,final_data)

    
    context = {
        'form_fields': form_fields_with_val,
    }

    return render(request, 'app/home/web/html/master/modify_item.html',context)

def saved_item_list_index(request):
    return render(request, 'app/home/web/html/master/saved_item_list.html')

def favourites_item_list_index(request):
    return render(request, 'app/home/web/html/master/favourites_item_list.html')

def favourites_index(request):
    return render(request, 'app/home/web/html/master/favourites.html')

def bulk_item_create_index(request):
    return render(request, 'app/home/web/html/master/bulk_item_create.html')

def request_status_index(request):
    return render(request, 'app/home/web/html/approval_workflow/request_status.html')

def request_approval_index(request):
    return render(request, 'app/home/web/html/approval_workflow/request_approval.html')

def taxonomy_index(request):
    return render(request, 'app/home/web/html/approval_workflow/taxonomy.html')

def role_index(request):
    return render(request, 'app/home/web/html/user_management/role.html')

def user_index(request):
    return render(request, 'app/home/web/html/user_management/user.html')

def group_index(request):
    return render(request, 'app/home/web/html/user_management/group.html')

def dictionary_index(request):
    return render(request, 'app/home/web/html/dictionary/dictionary.html')

def dictionary_setup_index(request):
    return render(request, 'app/home/web/html/dictionary/dictionary_setup.html')

def report_index(request):
    return render(request, 'app/home/web/html/report/report.html')

def email_group_index(request):
    return render(request, 'app/home/web/html/access_management/email_group.html')

def form_builder_index(request):
    return render(request, 'app/home/web/html/access_management/form_builder.html')

class GetItemRequestList(APIView):

    def post(self, request):

        try:
            user_id = request.POST.get("user_id", "")
            status_type = request.POST.get("status_type", "")
            start_date = request.POST.get("start_date", "")
            end_date = request.POST.get("end_date", "")
            req_objs = SckRequestStatus.objects.filter(created_by=user_id).values_list('request_id', flat=True)
            request_ids_list = list(req_objs)

            item_lis = ItemModifyRequest.objects.filter(request_id__in=request_ids_list).values_list('item_code',flat=True)
            item_code_lis = list(item_lis)

            item_objs = ItemMaster.objects.filter(
                Q(request_id__in=request_ids_list) | Q(item_code__in=item_code_lis)
            ).values(
                'request_id',
                'item_name',
                'item_category_desc',
                'sub_category_desc',
                'item_status',
                'item_req_type',
                'item_code'
            ).distinct()

            if status_type:
                item_objs= item_objs.filter(item_status = status_type)

            

            distinct_items_list = list(item_objs)

            for i in distinct_items_list:
                if i['item_req_type'] != "Historical":
                    req_obj = SckRequestStatus.objects.filter(request_id=i['request_id']).values().last()
                else:
                    mod_req = ItemModifyRequest.objects.filter(item_code = i["item_code"]).values().last()
                    req_obj = SckRequestStatus.objects.filter(request_id=mod_req['request_id']).values().last()

                i['req_pending_at'] = req_obj['request_stage']
                i['created_at'] = req_obj['created_date']
                i['request_type'] = req_obj['request_type']
                i['request_progress'] = req_obj['request_progress']

            if start_date and end_date:
                from datetime import datetime, time

                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

                # Now combine with time
                start_datetime = datetime.combine(start_date, time.min)
                end_datetime = datetime.combine(end_date, time.max)

                distinct_items_list = [
                    item for item in distinct_items_list
                    if start_datetime <= item['created_at'] <= end_datetime
                ]

            return JsonResponse({"data":distinct_items_list,"msg":"Success","error":0})

        except Exception as e:
            print(e)
            return JsonResponse({"data":'',"msg":"Error","error":1})

from django.contrib.postgres.search import SearchVector, SearchQuery

class ItemMasterUtils:
    """Utility class containing common functionality for ItemMaster views"""
    
    @staticmethod
    def get_column_mappings():
        """Returns the standard column mappings used across views"""
        return {
            'country': ['country_name'],
            'item_category': ['item_category_code', 'item_category_desc'],
            'sub_category': ['sub_category_code', 'sub_category_desc'],
            'item_name': ['item_name'],
            'item_code': ['item_code'],
            'item_description': ['item_desc'],
            'organization': ['organization_code', 'organization_desc'],
            'brand': ['brand_code', 'brand_desc']
        }
    
    @staticmethod
    def apply_facet_filters(aggregated_queryset, facets):
        """Apply facet filters to the aggregated queryset"""
        if not facets:
            return aggregated_queryset
            
        for facet_type, values in facets.items():
            if not values:  # Skip if no values selected for this facet
                continue
                
            facet_mappings = ItemMasterUtils.get_facet_mappings()
            if facet_type not in facet_mappings:
                continue
                
            mapping = facet_mappings[facet_type]
            value_field = mapping['value_field']
            
            # Create OR condition for all values of this facet type
            facet_filter = Q()
            for value in values:
                # Special handling for organization filter since it's in the JSON array
                if facet_type == 'organization':
                    facet_filter |= Q(organizations__contains=[{'code': value}])
                else:
                    facet_filter |= Q(**{f"{value_field}__exact": value})
                
            aggregated_queryset = aggregated_queryset.filter(facet_filter)
        
        return aggregated_queryset


    
    @staticmethod
    def aggregate_organizations(queryset):
        """
        Aggregates organizations for items with same item_code into a single record
        Returns queryset with organizations as a JSON array of {code, desc} objects
        """
        return queryset.values(
            'request_id',
            'item_code',
            'country_code',
            'country_name',
            'item_category_code',
            'item_category_desc',
            'sub_category_code',
            'sub_category_desc',
            'vertical_name',
            'item_name',
            'item_desc',
            'brand_code',
            'brand_desc',
            'molecule_code',
            'molecule_desc',
            'variant_code',
            'variant_desc',
            'form_code',
            'form_desc',
            'special_material_flag',
            'special_material_desc',
            'primary_uom_code',
            'primary_uom_desc',
            'secondary_uom_code',
            'secondary_uom_desc',
            'list_price',
            'market_price',
            'inventory_item',
            'invoice_flag',
            'drug_schedule',
            'lot_div',
            'vat_percentage',
            'ddc_code',
            'supplier_code',
            'supplier_desc',
            'barcode_pack',
            'barcode_mrp',
            'is_active',
            'created_by',
            'created_date',
            'modified_by',
            'modified_date',
            'old_item_code',
            'item_req_type',
            'item_status'
        ).annotate(
            organizations=ArrayAgg(
                JSONObject(
                    code=F('organization_code'),
                    desc=F('organization_desc')
                ),
                distinct=True
            )
        ).order_by('item_code')
    
    @staticmethod
    def get_facet_mappings():
        """Returns the standard facet mappings used for filters"""
        return {
            'country': {
                'value_field': 'country_name',
                'display_field': 'country_name',
                'code_field': 'country_code'
            },
            'item_category': {
                'value_field': 'item_category_desc',
                'display_field': 'item_category_desc',
                'code_field': 'item_category_code'
            },
            'sub_category': {
                'value_field': 'sub_category_desc',
                'display_field': 'sub_category_desc',
                'code_field': 'sub_category_code'
            },
            'organization': {
                'value_field': 'organization_desc',
                'display_field': 'organization_desc',
                'code_field': 'organization_code'
            },
            'brand': {
                'value_field': 'brand_desc',
                'display_field': 'brand_desc',
                'code_field': 'brand_code'
            },
            'item_status': {
                'value_field': 'item_status',
                'display_field': 'item_status'
            },
            'invoice_flag': {
                'value_field': 'invoice_flag',
                'display_field': 'invoice_flag'
            },
            'item_name': {
                'value_field': 'item_name',
                'display_field': 'item_name'
            },
            'item_code': {
                'value_field': 'item_code',
                'display_field': 'item_code'
            },
            'item_description': {
                'value_field': 'item_desc',
                'display_field': 'item_desc'
            }
        }

    @staticmethod
    def get_filtered_queryset(queryset, search_query='', search_column='all'):
        """Common method to filter queryset based on search parameters"""
        if not search_query:
            return queryset

        column_mappings = ItemMasterUtils.get_column_mappings()

        if search_column == 'all':
            query = Q()
            for column_group in column_mappings.values():
                for column in column_group:
                    if '_code' in column:  # Exact match for `_code` columns
                        query |= Q(**{f"{column}__exact": search_query})
                    else:  # Partial match for descriptive columns
                        query |= Q(**{f"{column}__icontains": search_query})
            return queryset.filter(query)

        if search_column in column_mappings:
            query = Q()
            for column in column_mappings[search_column]:
                if '_code' in column:  # Exact match for `_code` columns
                    query |= Q(**{f"{column}__exact": search_query})
                else:  # Partial match for descriptive columns
                    query |= Q(**{f"{column}__icontains": search_query})
            return queryset.filter(query)

        print(f"Invalid search column: {search_column}")
        return queryset

    @staticmethod
    def paginate_queryset(queryset, page, page_size):
        """Optimized pagination while retaining queryset functionality"""
        start = (page - 1) * page_size
        end = start + page_size
        return queryset[start:end]  # Slicing retains the queryset
    
    @staticmethod
    def error_response(error_msg):
        """Standard error response"""
        print(f"Error: {error_msg}")
        return JsonResponse({
            "data": "",
            "msg": "Error",
            "error": "1"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ItemMasterListView(APIView):
    def post(self, request):
        try:
            # Get parameters
            page = request.data.get('page', 1)
            page_size = request.data.get('page_size', 10)
            search_query = request.data.get('search', '')
            search_column = request.data.get('search_column', 'all')
            facets = request.data.get('facets', {})
            
            # Get base queryset
            if search_query and search_column != 'all':
                # Apply specific column filter
                column_mappings = ItemMasterUtils.get_column_mappings()
                if search_column in column_mappings:
                    query = Q()
                    for column in column_mappings[search_column]:
                        if '_code' in column:
                            query |= Q(**{f"{column}__exact": search_query})
                        else:
                            query |= Q(**{f"{column}__icontains": search_query})
                    queryset = ItemMaster.objects.filter(query)
                else:
                    return ItemMasterUtils.error_response("Invalid search column.")
            elif search_query:
                # Apply search across all columns
                query = Q()
                for column_group in ItemMasterUtils.get_column_mappings().values():
                    for column in column_group:
                        if '_code' in column:
                            query |= Q(**{f"{column}__exact": search_query})
                        else:
                            query |= Q(**{f"{column}__icontains": search_query})
                queryset = ItemMaster.objects.filter(query)
            else:
                queryset = ItemMaster.objects.all()

            # Fields to group by
            group_by_fields = [
                'item_code',
                'item_name',
                'item_desc',
                'item_category_desc',
                'sub_category_desc',
                'brand_desc',
                'is_active',
            ]
            # First aggregate organizations - this will reduce to one row per item_code
            distinct_queryset = queryset.values(
                *group_by_fields
            ).annotate(
                created_date=Max('created_date'),
            ).distinct()

            if facets:
                filtered_aggregated_queryset = ItemMasterUtils.apply_facet_filters(
                    distinct_queryset, facets
                )
            else:
                filtered_aggregated_queryset = distinct_queryset

            total_items = (
                filtered_aggregated_queryset
                .values('item_code')  # Group by minimal fields
                .count()
            )

            # Apply optimized pagination
            paginated_queryset = ItemMasterUtils.paginate_queryset(
                filtered_aggregated_queryset, page, page_size
            )

            # Serialize and return data
            response_data = {
                "items": list(paginated_queryset),  # Serialize the paginated queryset
                "total_items": total_items,
                "total_pages": (total_items + page_size - 1) // page_size,
                "current_page": page,
            }
            
            return JsonResponse({
                "data": response_data,
                "msg": "Success"
            })
            
        except Exception as e:
            return ItemMasterUtils.error_response(f"Error in ItemMasterListView: {str(e)}")
        
class ItemMasterFacetsView(APIView):
    def post(self, request):
        try:
            # Get parameters
            filter_type = request.data.get('filter_type', '')
            facet_search = request.data.get('facet_search', '')
            page = int(request.data.get('page', 1))
            page_size = int(request.data.get('page_size', 10))

            search_query = request.data.get('search', '')
            search_column = request.data.get('search_column', 'all')

            # Validate filter_type
            facet_mappings = ItemMasterUtils.get_facet_mappings()
            if filter_type not in facet_mappings:
                return JsonResponse({
                    "data": "",
                    "msg": "Invalid filter type",
                    "error": "1"
                })

            # Get facet mapping
            mapping = facet_mappings[filter_type]
            value_field = mapping['value_field']
            display_field = mapping['display_field']
            code_field = mapping.get('code_field')  # Optional

            # First, apply search filters to get the base queryset
            if search_query and search_column != 'all':
                # Apply specific column filter
                column_mappings = ItemMasterUtils.get_column_mappings()
                if search_column in column_mappings:
                    query = Q()
                    for column in column_mappings[search_column]:
                        if '_code' in column:
                            query |= Q(**{f"{column}__exact": search_query})
                        else:
                            query |= Q(**{f"{column}__icontains": search_query})
                    base_queryset = ItemMaster.objects.filter(query)
                else:
                    return ItemMasterUtils.error_response("Invalid search column.")
            elif search_query:
                # Apply search across all columns
                query = Q()
                for column_group in ItemMasterUtils.get_column_mappings().values():
                    for column in column_group:
                        if '_code' in column:
                            query |= Q(**{f"{column}__exact": search_query})
                        else:
                            query |= Q(**{f"{column}__icontains": search_query})
                base_queryset = ItemMaster.objects.filter(query)
            else:
                base_queryset = ItemMaster.objects.all()

            # Build the queryset to fetch distinct values
            values_queryset = base_queryset.values(
                value=F(value_field),
                label=F(display_field)
            )
            if code_field:
                values_queryset = values_queryset.annotate(code=F(code_field))

            # Apply facet search filter if provided
            if facet_search:
                values_queryset = values_queryset.filter(
                    Q(label__icontains=facet_search) | Q(value__icontains=facet_search)
                )

            # Apply distinct and order by label
            values_queryset = values_queryset.distinct().order_by('label')

            # Pagination
            total_items = values_queryset.count()
            start = (page - 1) * page_size
            paginated_values = values_queryset[start:start + page_size]

            # Prepare response data
            response_data = {
                "items": list(paginated_values),  # Serialize the paginated queryset
                "total_items": total_items,
                "total_pages": (total_items + page_size - 1) // page_size,
                "current_page": page,
            }

            return JsonResponse({
                "data": response_data,
                "msg": "Success"
            })

        except Exception as e:
            print(e)
            return ItemMasterUtils.error_response(f"Error in ItemMasterFacetsView: {str(e)}")
class ItemGetDetail(APIView):

    def post(self,request):

        try:

            request_id = request.POST.get('request_id')
            item_name = request.POST.get('item_name')
            item_objs = ItemMaster.objects.filter(request_id=request_id,item_name=item_name).values()

            #Merging to get get list of organization for single item
            final_data =  merge_similar_objects(item_objs)
            return JsonResponse({"data":final_data,"msg":"Success","error":0})

        except Exception :
                return JsonResponse({"data":"","msg":"Unable to get details","error":1})



class DictionaryDefinitionList(APIView):

    def post(self,request):

        try:
            dict_def_objs = DictionaryDefinition.objects.all()
            szl = DictionaryDefinitionSerializer(dict_def_objs, many=True)
            return JsonResponse({"data":szl.data,"msg":"Success","error":0})
            
        except Exception:
            return JsonResponse({"data":"","msg":"Unable to get dictionary list","error":1})

class DictionaryDetails(APIView):

    def post(self,request):
        try:

            dict_name = request.POST.get('dict_name')
            dict_seq_no = request.POST.get('dict_seq_no')
            dict_objs  = LookupScreenDictionary.objects.filter(dict_name=dict_name, dict_seq_no = dict_seq_no)

            srz = LookupScreenDictionarySerializer(dict_objs,many=True)

            return JsonResponse({"data":srz.data,"msg":"Success","error":0})
        except Exception:
            return JsonResponse({"data":"","msg":"Unable to get records","error":1})


class CreateModifyItemReq(APIView):

    def post(self,request):
        try:

            user_id = request.POST.get('user_id')
            item_comment = request.POST.get('comment')
            selected_param = json.loads(request.POST.get('selected_param','[]'))
            item_code = request.POST.get('item_code')
            req_type = request.POST.get('req_type')

            request_id = str(uuid.uuid4())

            if item_comment:
                create_comment(request_id,req_type,user_id,item_comment)

            create_item_request(request_id,"Modify","Supervisor","Pending",user_id, req_type,"Submitted")

            for i in selected_param:
                save_modify_request(request_id,item_code,i)

            return JsonResponse({"data":"","msg":"Success","error":0})


        except Exception:
            return JsonResponse({"data":"","msg":"Unable to create modify request.","error":1})
class SaveSearchView(APIView):
    def post(self, request):
        try:
            data = request.data
            required_fields = ['user_id', 'search_name', 'search_state']
            
            if not all(field in data for field in required_fields):
                return JsonResponse({
                    "data": "",
                    "msg": "Missing required fields",
                    "error": "1"
                }, status=400)
            
            saved_search = SavedSearch.objects.create(
                user_id=data['user_id'],
                search_name=data['search_name'],
                search_description=data.get('search_description'),
                search_state=data['search_state']
            )
            
            return JsonResponse({
                "data": {
                    "sck_saved_search_id": saved_search.sck_saved_search_id,  # Changed from search_id
                    "message": "Search saved successfully"
                },
                "msg": "Success"
            })
            
        except Exception as e:
            return JsonResponse({
                "data": "",
                "msg": f"Error saving search: {str(e)}",
                "error": "1"
            }, status=500)

from .serializers import SavedSearchSerializer
class SavedSearchListView(APIView):
    def post(self, request):
        try:
            # Get all active saved searches for user
            saved_searches = SavedSearch.objects.filter(
                is_active=True
            ).order_by('-created_date')
            
            serializer = SavedSearchSerializer(saved_searches, many=True)
            
            return JsonResponse({
                "data": serializer.data,
                "msg": "Success"
            })
            
        except Exception as e:
            return JsonResponse({
                "data": "",
                "msg": f"Error fetching saved searches: {str(e)}",
                "error": "1"
            }, status=500)
        
class GetSavedSearchView(APIView):
    def get(self, request, search_id):
        try:
            saved_search = SavedSearch.objects.get(
                sck_saved_search_id=search_id,
                is_active=True
            )
            
            serializer = SavedSearchSerializer(saved_search)
            
            return JsonResponse({
                "data": serializer.data,
                "msg": "Success"
            })
            
        except SavedSearch.DoesNotExist:
            return JsonResponse({
                "data": "",
                "msg": "Saved search not found",
                "error": "1"
            }, status=404)
        except Exception as e:
            return JsonResponse({
                "data": "",
                "msg": f"Error fetching saved search: {str(e)}",
                "error": "1"
            }, status=500)

class ToggleFavoriteView(APIView):
    """API to toggle (add/remove) an item as favorite"""
    
    def post(self, request):
        try:
            # Get parameters
            item_code = request.data.get('item_id')
            user_id = request.data.get('user_id')
            
            if not all([item_code, user_id]):
                return JsonResponse({
                    "data": "",
                    "msg": "Missing required fields: item_code and user_id",
                    "error": "1"
                }, status=400)
                
            # Try to get existing favorite
            favorite, created = ItemFavorite.objects.get_or_create(
                user_id=user_id,
                item_code=item_code,
                defaults={'is_active': True}
            )
            
            if not created:
                # Toggle is_active status
                favorite.is_active = not favorite.is_active
                favorite.save()
            
            return JsonResponse({
                "data": {
                    "item_code": favorite.item_code,
                    "is_active": favorite.is_active,
                    "message": "Item {}favorited successfully".format(
                        "" if favorite.is_active else "un"
                    )
                },
                "msg": "Success"
            })
            
        except Exception as e:
            return JsonResponse({
                "data": "",
                "msg": f"Error toggling favorite: {str(e)}",
                "error": "1"
            }, status=500)


class FavoriteItemsListView(APIView):
    """API to list all favorite items"""

    def post(self, request):
        try:
            # Get parameters
            page = request.data.get('page', 1)
            page_size = request.data.get('page_size', 10)

            # Get all active favorite items grouped by item_code with the latest favorite_created_date
            favorite_items = (
                ItemMaster.objects
                .filter(
                    item_code__in=ItemFavorite.objects.filter(
                        is_active=True
                    ).values_list('item_code', flat=True)
                )
                .values(
                    'item_code',
                    'item_name',
                    'item_desc',
                )
                .annotate(
                    favorite_created_date=Max('created_date')  # Get the latest favorite_created_date
                )
                .order_by('-favorite_created_date')  # Order by the latest favorite_created_date
            )

            # Paginate results
            paginator = Paginator(favorite_items, page_size)

            try:
                items = paginator.page(page)
            except PageNotAnInteger:
                items = paginator.page(1)
            except EmptyPage:
                items = paginator.page(paginator.num_pages)

            response_data = {
                "items": list(items),  # Convert to list for serialization
                "total_items": paginator.count,
                "total_pages": paginator.num_pages,
                "current_page": items.number
            }

            return JsonResponse({
                "data": response_data,
                "msg": "Success",
                "error": "0"
            })

        except Exception as e:
            return JsonResponse({
                "data": "",
                "msg": f"Error fetching favorite items: {str(e)}",
                "error": "1"
            }, status=500)



class GetItemDetailsView(APIView):
    """API to get detailed item information by item_code with aggregation"""

    def post(self, request):
        try:
            # Extract item_code from request
            item_code = request.data.get('item_code')
            if not item_code:
                return JsonResponse({
                    "msg": "item_code is required",
                    "error": "1"
                }, status=400)

            # Define all fields except created_date and primary key (sck_item_id)
            fields_to_include = [
                field.name for field in ItemMaster._meta.fields
                if field.name not in [
                    'sck_item_id', 
                    'created_date',
                    'organization_code',
                    'organization_desc',
                    'barcode_mrp'  # Excluding as per requirement
                ]
            ]


            # Aggregate data for the given item_code
            aggregated_queryset = (
                ItemMaster.objects
                .filter(item_code=item_code)  # Filter by item_code
                .values(*fields_to_include)  # Include all required fields
                .annotate(
                    organizations=ArrayAgg(
                        JSONObject(
                            code=F('organization_code'),
                            desc=F('organization_desc')
                        ),
                        distinct=True  # Aggregate unique organizations
                    ),
                    created_date=Max('created_date')  # Include max created_date
                )
            )

            # Ensure exactly one aggregated result is returned
            if not aggregated_queryset:
                return JsonResponse({
                    "msg": "No item found for the provided item_code",
                    "error": "1"
                }, status=404)


            return JsonResponse({
                "data": aggregated_queryset[0],
                "msg": "Success",
                "error": "0"
            })

        except Exception as e:
            return JsonResponse({
                "data": "",
                "msg": f"Error fetching item details: {str(e)}",
                "error": "1"
            }, status=500)