from .models import SckRequestComment, SckRequestStatus, LookupScreenDictionary, SckRequestStatus, ItemModifyRequest
def create_comment(request_id,req_type,user_id,item_comment):
    SckRequestComment.objects.create(
                    request_id = request_id,
                    request_type = req_type,
                    commented_by = user_id,
                    comment = item_comment
                )
    
    return True

def create_item_request(request_id,request_type,request_stage,request_status,created_by,request_type_category,request_progress):
    SckRequestStatus.objects.create(
        request_id = request_id,
        request_type = request_type,
        request_stage= request_stage,
        request_status= request_status,
        created_by = created_by,
        request_type_category = request_type_category,
        request_progress = request_progress
    )

    return True

def get_vertical(org_code, org_desc):
    lkp_obj = LookupScreenDictionary.objects.get(dict_name='Organization',dict_code_primary=org_code,dict_desc_primary=org_desc)
    return lkp_obj.dict_desc_secondary1

def merge_similar_objects(queryset):
    if not queryset:
        return None
    
    # Take the first object as base
    base_obj = queryset[0]
    result = dict(base_obj)
    
    # Initialize organizations list
    organizations = [
        {
            'organization_code': base_obj['organization_code'],
            'organization_desc': base_obj['organization_desc']
        }
    ]
    
    # Add organizations from other objects
    for obj in queryset[1:]:
        organizations.append({
            'organization_code': obj['organization_code'],
            'organization_desc': obj['organization_desc']
        })
    
    # Remove individual organization fields from result
    del result['organization_code']
    del result['organization_desc']
    
    # Add organizations list to result
    result['organizations'] = organizations
    
    return result


form_mapping = {
    "country" : "country_name",
    "item_cat" : "item_category_desc",
    "sub_cat" : "sub_category_desc",
    "item_name" : "item_name",
    "item_desc"  : "item_desc",
    "brand" : "brand_desc",
    "molecule" : "molecule_desc",
    "variant" : "variant_desc",
    "form" : "form_desc",
    "spl_material_flag" : "special_material_desc",
    "primary_uom" : "primary_uom_desc",
    "secondary_uom" : "secondary_uom_desc",
    "list_price" : "list_price",
    "mrp" : "market_price",
    "inventory_item" : "inventory_item",
    "invoice_enabled" : "invoice_flag",
    "drug_schedule" : "drug_schedule",
    "lot_divisible" : "lot_div",
    "vat" : "vat_percentage",
    "ddc_code" : "ddc_code",
    "supplier" : "supplier_desc",
    "barcode_pack_size" : "barcode_pack",
    "barcode_mrp" : "barcode_mrp",
    "org_code" : "orgs"
}

def set_fields_value(field_objs,item_ob):
    for i in field_objs:
        i['field_value'] = item_ob[form_mapping[i['name']]]

    return field_objs

def save_modify_request(request_id,item_code,field):
    ItemModifyRequest.objects.create(
        request_id = request_id,
        item_code = item_code,
        field= field,
    )

    return True