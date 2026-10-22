# Products audit — 2026-10-22

Products checked: 603. Rows in products-audit.csv: 912 (a product can have several issues).

| Issue | Products |
|---|---|
| no_image | 447 |
| code_like_name | 406 |
| duplicate_image | 27 |
| duplicate_name | 16 |
| price_in_details | 14 |
| internal_note | 2 |

## Prices (T18 — decision pending)

The API already sends `price_retail` for 602 of 603 products (currency: USD, IQD).
The website does not show them. Prices written inside descriptions are the `price_in_details` rows above.

## Category › subcategory pairs (check the naming)

- قسم البورسلين › 60*120 CM (1)
- قسم البورسلين › 60*60 CM (62)
- قسم البورسلين › المسابح (4)
- قسم البورسلين › مواد لاصقة (3)
- قسم البورسلين › — (125)
- قسم الصحيات › تصريفة شاور (48)
- قسم الصحيات › — (213)
- قسم الكهربائيات › بلك سويج (61)
- قسم الكهربائيات › — (60)
- قسم المرمر › — (20)
- — › — (6)

## Project names

- `livingroom-white`: «غرفة أستقبال بيضاء» — hamza on «است…» (should be «است»)
