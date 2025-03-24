# Instructions:

Make me a very modern and sexy front end web page that uses ONLY:

- HTML

- JavaScript

- CSS.

The title and company name "API Demo". Add graphics and a logo as per your creativity. Impress me!
Some resources for your consideration include https://21st.dev/?tab=components&sort=recommended as this site has some really cool design elements for pages. Again Impress me!!

## Screen Layout

- Header
  
  - Modern looking logo and tagline "API Demo"

- Body:
  
  - master container centered with shadown effect
  
  - nested container split 1 left : 3 right, where 1 is a nav menu to support the various API functions (Show all Customers, Add A Customer) and the 3 portion of the layout should house the grid and the data to support the operation

- Footer
  
  - Typical footer and copyright with dynamic date mm/dd/YYYY

## Use the API Backend

- Authorization = JWT Bearer

- Algorithm = HS256

- Secret = 123456
  
  ### Methods & Endpoints
  
  #### GET
  
  **Endpoint**= https://auto.cnxlab.us/webhook/v1/getAllCustomers

---

#### POST

**Endpoint**= https://auto.cnxlab.us/webhook/v1/addCustomer
 ﻿
**Body**: json example:
 {
 "id":4,
 "Name":"Blake Capitol, Inc.",
 "E-Mail":"capitol@bcinc.com",
 "PhoneNo":"555-666-8888"
 }

---

##### DELETE

**Endpoint **= https://auto.cnxlab.us/webhook/v1/deleteCustomer
 ﻿
 **Body**: json example:
 {
 "id":4
 }

---
