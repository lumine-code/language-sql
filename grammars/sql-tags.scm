; Capture DDL objects, never SELECT's table/function references.
(create_table (object_reference) @name) @definition.table
(create_view (object_reference) @name) @definition.view
(create_function (object_reference) @name
  (#is-not? test.typeAt "previousNamedSibling keyword_returns")) @definition.function
(create_procedure (object_reference) @name) @definition.function
(create_index column: (identifier) @name) @definition.constant
(create_type (object_reference) @name) @definition.type
(create_schema (identifier) @name
  (#is-not? test.typeAt "previousNamedSibling keyword_authorization")) @definition.module
(column_definition name: (identifier) @name) @definition.field
