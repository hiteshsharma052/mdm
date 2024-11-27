from django.db import models
from django.utils import timezone
from django.contrib.postgres.indexes import GinIndex

class ItemFormField(models.Model):
    """Model to store form field configurations"""

    name = models.CharField(max_length=100)  
    label = models.CharField(max_length=255) 
    dict_name = models.CharField(max_length=50, blank=True)
    field_type = models.CharField(max_length=20)
    required = models.BooleanField(default=False)
    placeholder = models.CharField(max_length=255, blank=True)
    tooltip = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    conditional_required = models.BooleanField(default=False)
    has_other = models.BooleanField(default=False)

    class Meta:
        db_table = 'item_form_field' 
        ordering = ['order']

    def __str__(self):
        return self.label
    
class LookupScreenDictionary(models.Model):

    dict_seq_no = models.IntegerField()
    dict_code = models.CharField(max_length=50)
    dict_name = models.CharField(max_length=50)
    sequence_val = models.IntegerField()
    dict_code_primary = models.CharField(max_length=50)
    dict_desc_primary = models.CharField(max_length=100)
    dict_code_secondary1 = models.CharField(max_length=50, null=True, blank=True)
    dict_desc_secondary1 = models.CharField(max_length=100, null=True, blank=True)
    dict_code_secondary2 = models.CharField(max_length=50, null=True, blank=True)
    dict_desc_secondary2 = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.CharField(max_length=1, null=True, blank=True)
    created_datetimestap = models.DateTimeField(null=True, blank=True)
    created_by_id = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        # Specifying the schema and table name
        db_table = 'lkp_scr_dict'

        indexes = [
            models.Index(fields=['dict_name']),  # Create an index on dict_name column
        ]
        
        # Defining a composite primary key
        unique_together = [
            ('dict_seq_no', 'dict_code', 'dict_name', 'sequence_val', 
                'dict_code_primary', 'dict_desc_primary')
        ]

    def __str__(self):
        return f"{self.dict_code} - {self.dict_name}"




class ItemMaster(models.Model):
    sck_item_id = models.AutoField(primary_key=True)
    request_id = models.CharField(max_length=100, null=True, blank=True)
    item_code = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    country_code = models.IntegerField(null=True, blank=True)
    country_name = models.CharField(max_length=100, null=True, blank=True)
    item_category_code = models.CharField(max_length=10, null=True, blank=True)
    item_category_desc = models.CharField(max_length=100, null=True, blank=True)
    sub_category_code = models.CharField(max_length=10, null=True, blank=True)
    sub_category_desc = models.CharField(max_length=100, null=True, blank=True)
    organization_code = models.CharField(max_length=100, null=True, blank=True)
    organization_desc = models.CharField(max_length=100, null=True, blank=True)
    vertical_name = models.CharField(max_length=100, null=True, blank=True)
    item_name = models.CharField(max_length=200, null=True, blank=True, db_index=True)
    item_desc = models.CharField(max_length=200, null=True, blank=True, db_index=True)
    brand_code = models.CharField(max_length=50, null=True, blank=True)
    brand_desc = models.CharField(max_length=100, null=True, blank=True)
    molecule_code = models.CharField(max_length=50, null=True, blank=True)
    molecule_desc = models.CharField(max_length=100, null=True, blank=True)
    variant_code = models.CharField(max_length=50, null=True, blank=True)
    variant_desc = models.CharField(max_length=100, null=True, blank=True)
    form_code = models.CharField(max_length=10, null=True, blank=True)
    form_desc = models.CharField(max_length=100, null=True, blank=True)
    special_material_flag = models.CharField(max_length=1, null=True, blank=True)
    special_material_desc = models.CharField(max_length=100, null=True, blank=True)
    primary_uom_code = models.CharField(max_length=10, null=True, blank=True)
    primary_uom_desc = models.CharField(max_length=50, null=True, blank=True)
    secondary_uom_code = models.CharField(max_length=10, null=True, blank=True)
    secondary_uom_desc = models.CharField(max_length=50, null=True, blank=True)
    list_price = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    market_price = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    inventory_item = models.CharField(max_length=1, null=True, blank=True)
    invoice_flag = models.CharField(max_length=1, null=True, blank=True, db_index=True)
    drug_schedule = models.CharField(max_length=1, null=True, blank=True)
    lot_div = models.CharField(max_length=1, null=True, blank=True)
    vat_percentage = models.CharField(null=True, blank=True)
    ddc_code = models.CharField(max_length=50, null=True, blank=True)
    supplier_code = models.CharField(max_length=50, null=True, blank=True)
    supplier_desc = models.CharField(max_length=100, null=True, blank=True)
    barcode_pack = models.CharField(max_length=100, null=True, blank=True)
    barcode_mrp = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.CharField(max_length=20, default="Active", db_index=True)
    created_by = models.CharField(max_length=100, null=True, blank=True)
    created_date = models.DateTimeField(default=timezone.now, db_index=True)
    modified_by = models.CharField(max_length=100, null=True, blank=True)
    modified_date = models.DateTimeField(default=timezone.now)  # Removed db_index=True
    old_item_code = models.CharField(max_length=100, null=True, blank=True)
    item_req_type = models.CharField(max_length=100, null=True, blank=True)
    item_status = models.CharField(max_length=100, null=True, blank=True, db_index=True)

    class Meta:
        db_table = 'sck_fct_item_master_new'
        indexes = [
            models.Index(fields=['item_code'], name='idx_item_code'),
            models.Index(fields=['country_code'], name='idx_country_code'),
            models.Index(fields=['item_category_code'], name='idx_item_category_code'),
            models.Index(fields=['sub_category_code'], name='idx_sub_category_code'),
            models.Index(fields=['organization_code'], name='idx_organization_code'),
            models.Index(fields=['brand_code'], name='idx_brand_code'),
            
            # Composite indexes for category, organization, and brand
            models.Index(fields=['item_category_code', 'item_category_desc'], name='idx_item_category'),
            models.Index(fields=['organization_code', 'organization_desc'], name='idx_organization'),
            models.Index(fields=['brand_code', 'brand_desc'], name='idx_brand'),

            # Partial match indexes using GIN
            GinIndex(fields=['item_desc'], name='idx_item_desc_trgm', opclasses=['gin_trgm_ops']),
            GinIndex(fields=['country_name'], name='idx_country_name_trgm', opclasses=['gin_trgm_ops']),
            GinIndex(fields=['item_category_desc'], name='idx_item_category_desc_trgm', opclasses=['gin_trgm_ops']),
            GinIndex(fields=['sub_category_desc'], name='idx_sub_category_desc_trgm', opclasses=['gin_trgm_ops']),
            GinIndex(fields=['organization_desc'], name='idx_organization_desc_trgm', opclasses=['gin_trgm_ops']),
            GinIndex(fields=['brand_desc'], name='idx_brand_desc_trgm', opclasses=['gin_trgm_ops']),
            
            # Full-text search indexes
            GinIndex(fields=['item_name'], name='idx_item_master_item_name_gin', opclasses=['tsvector_ops']),
            GinIndex(fields=['item_desc'], name='idx_item_master_item_desc_gin', opclasses=['tsvector_ops']),
            GinIndex(fields=['item_category_desc'], name='idx_item_category_gin', opclasses=['tsvector_ops']),
            GinIndex(fields=['organization_desc'], name='idx_organization_gin', opclasses=['tsvector_ops']),
            GinIndex(fields=['brand_desc'], name='idx_brand_gin', opclasses=['tsvector_ops']),
        ]


    def __str__(self):
        return f"{self.item_code} - {self.item_name}"

class SckRequestComment(models.Model):
    request_id = models.CharField(max_length=200, null=True, blank=True)
    request_type = models.CharField(max_length=200, null=True, blank=True)
    commented_by = models.CharField(max_length=200, null=True, blank=True)
    comment = models.TextField(null=True, blank=True)  # Using TextField for longer comments
    comment_datetimestap = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'sck_req_cmt'

class SckRequestStatus(models.Model):
    request_id = models.CharField(max_length=200, null=True, blank=True)
    request_type = models.CharField(max_length=200, null=True, blank=True)
    request_stage = models.CharField(max_length=200, null=True, blank=True)
    request_status = models.CharField(max_length=200, null=True, blank=True)
    approval_timestamp = models.DateTimeField(null=True, blank=True)
    created_by = models.CharField(max_length=200, null=True, blank=True)
    created_date = models.DateTimeField(default=timezone.now)
    request_type_category = models.CharField(max_length=200, null=True, blank=True)
    request_progress = models.CharField(max_length=200, null=True, blank=True)

    class Meta:
        # If you want to specify the exact table name and schema
        db_table = 'sck_request_status'


class DictionaryDefinition(models.Model):
    dict_seq_no = models.IntegerField(null=True, blank=True)  
    dict_code = models.CharField(max_length=255, null=True, blank=True) 
    dict_name = models.CharField(max_length=255, null=True, blank=True)  
    description = models.CharField(max_length=255, null=True, blank=True)  
    created_by = models.CharField(max_length=50, null=True, blank=True) 
    created_timestamp = models.DateTimeField(null=True, blank=True) 
    class Meta:
        db_table = 'sck_dict_definition'


class ItemModifyRequest(models.Model):
    request_id = models.CharField(max_length=200, null=True, blank=True)
    item_code = models.CharField(max_length=200, null=True, blank=True)
    field = models.CharField(max_length=200, null=True, blank=True)
    created_date = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'sck_item_modify_request'

class SavedSearch(models.Model):
    sck_saved_search_id = models.AutoField(primary_key=True)  # Changed from search_id
    user_id = models.CharField(max_length=100)
    search_name = models.CharField(max_length=255)
    search_description = models.TextField(blank=True)
    search_state = models.JSONField()
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'sck_saved_searches'


class ItemFavorite(models.Model):
    item_code = models.CharField(max_length=50, unique=True)
    user_id = models.CharField(max_length=100)
    sck_fav_id = models.AutoField(primary_key=True)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'sck_item_favorites'